import {Component, Optional, Renderer2} from '@angular/core'
import {BehaviorSubject, EMPTY, from, interval, Observable, Subject, timer} from 'rxjs'
import {catchError, filter, switchMap, take, takeUntil, tap} from 'rxjs/operators'
import {MESSAGES} from '@veriff/incontext-sdk'
import {DecisionStatus, State, VeriffService, VeriffSession} from './veriff.service'
import {Router} from '@angular/router'
import {BackendUserService} from '../../shared/services/backend/backend-user.service'
import {DialogService} from '../../shared/services/dialog.service'
import {BackendHttpClient} from '../../shared/services/backend/backend-http-client.service'
import {MatDialogRef} from '@angular/material/dialog'

@Component({
  selector: 'app-veriff',
  templateUrl: './veriff.component.html',
  styleUrls: ['./veriff.component.css'],
})
export class VeriffComponent {
  decisionStatus = DecisionStatus

  session$: Observable<VeriffSession>
  private sessionSubject = new BehaviorSubject<void>(undefined)

  approved$: Observable<void>
  private approvedSubject = new Subject<void>()

  constructor(private renderer2: Renderer2,
              private router: Router,
              private userService: BackendUserService,
              private dialogService: DialogService,
              private http: BackendHttpClient,
              private veriffService: VeriffService,
              @Optional() private dialogRef: MatDialogRef<VeriffComponent>) {
    this.session$ = this.sessionSubject.asObservable().pipe(
      switchMap(() => this.veriffService.getSession()),
      tap(session => {
        if (this.decisionPending(session)) {
          timer(5000).pipe(tap(() => this.sessionSubject.next())).subscribe()
        }
      }),
      tap(session => {
        if (session.decision?.status === DecisionStatus.APPROVED) {
          this.approvedSubject.next()
        }
      }),
    )

    this.approved$ = this.approvedSubject.asObservable().pipe(
      switchMap(() =>
        interval(1000).pipe(
          takeUntil(this.userService.getUser().pipe(filter(user => user.kyc_completed))),
        ),
      ),
      take(1),
      switchMap(() => this.dialogService.success('User data has been successfully verified.')),
      catchError(() => {
        this.dialogRef.close(false)
        return EMPTY
      }),
      switchMap(() => {
        this.dialogRef.close(true)
        return EMPTY
      }),
    )
  }

  startVerification(verification_url: string): () => Observable<unknown> {
    return () => this.createVeriffFrame(verification_url).pipe(
      tap(msg => {
        if (msg === MESSAGES.FINISHED) {
          this.sessionSubject.next()
        }
      }),
    )
  }

  createVeriffFrame(verification_url: string): Observable<MESSAGES> {
    return from(import('@veriff/incontext-sdk')).pipe(
      switchMap(sdk => new Observable<MESSAGES>(subscriber => {
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
      })),
    )
  }

  decisionPending(session: VeriffSession) {
    return session.state === State.SUBMITTED && session.decision === null
  }

  showDecision(session: VeriffSession) {
    return !!session.decision?.status
  }
}
