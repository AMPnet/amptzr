import { Component, Optional, Renderer2 } from '@angular/core'
import { BehaviorSubject, from, Observable, timer } from 'rxjs'
import { map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { MESSAGES } from '@veriff/incontext-sdk'
import {
  DecisionStatus,
  State,
  VeriffService,
  VeriffSession,
} from './veriff.service'
import { BackendUserService } from '../../shared/services/backend/backend-user.service'
import { DialogService } from '../../shared/services/dialog.service'
import { BackendHttpClient } from '../../shared/services/backend/backend-http-client.service'
import { MatDialogRef } from '@angular/material/dialog'
import { RouterService } from '../../shared/services/router.service'

@Component({
  selector: 'app-veriff',
  templateUrl: './veriff.component.html',
  styleUrls: ['./veriff.component.css'],
})
export class VeriffComponent {
  decisionStatus = DecisionStatus

  session$: Observable<VeriffSession>
  private sessionSubject = new BehaviorSubject<void>(undefined)

  decisionPending$: Observable<boolean>
  decisionAvailable$: Observable<boolean>
  isVerificationStartable$: Observable<boolean>

  constructor(
    private renderer2: Renderer2,
    private router: RouterService,
    private userService: BackendUserService,
    private dialogService: DialogService,
    private http: BackendHttpClient,
    private veriffService: VeriffService,
    @Optional() private dialogRef: MatDialogRef<VeriffComponent>
  ) {
    this.session$ = this.sessionSubject.asObservable().pipe(
      switchMap(() => this.veriffService.getSession()),
      tap((session) => {
        if (this.decisionPending(session)) {
          timer(5000)
            .pipe(tap(() => this.sessionSubject.next()))
            .subscribe()
        }
      }),
      tap((session) => {
        if (session.decision?.status === DecisionStatus.APPROVED) {
          this.dialogRef.close(true)
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.decisionPending$ = this.session$.pipe(
      map((session) => this.decisionPending(session))
    )

    this.decisionAvailable$ = this.session$.pipe(
      map((session) => !!session.decision?.status)
    )

    this.isVerificationStartable$ = this.session$.pipe(
      map(
        (session) =>
          [State.STARTED, State.CREATED].includes(session.state) ||
          [
            DecisionStatus.RESUBMISSION_REQUESTED,
            DecisionStatus.DECLINED,
          ].includes(session.decision?.status!)
      )
    )
  }

  startVerification(verification_url: string): () => Observable<unknown> {
    return () =>
      this.createVeriffFrame(verification_url).pipe(
        tap((msg) => {
          if (msg === MESSAGES.FINISHED) {
            this.sessionSubject.next()
          }
        })
      )
  }

  createVeriffFrame(verification_url: string): Observable<MESSAGES> {
    return from(import('@veriff/incontext-sdk')).pipe(
      switchMap(
        (sdk) =>
          new Observable<MESSAGES>((subscriber) => {
            const veriffFrame = sdk.createVeriffFrame({
              url: verification_url,
              onEvent: (msg: MESSAGES) => {
                subscriber.next(msg)

                switch (msg) {
                  case MESSAGES.STARTED:
                    break
                  case MESSAGES.FINISHED:
                    subscriber.complete()
                    break
                  case MESSAGES.CANCELED:
                    veriffFrame.close()
                    subscriber.complete()
                    break
                }
              },
            })
          })
      )
    )
  }

  private decisionPending(session: VeriffSession): boolean {
    return session.state === State.SUBMITTED && session.decision === null
  }
}
