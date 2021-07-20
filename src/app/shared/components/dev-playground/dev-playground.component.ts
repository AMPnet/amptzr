import {ChangeDetectionStrategy, Component} from '@angular/core'
import {Observable, Subject} from 'rxjs'
import {switchMap, tap} from 'rxjs/operators'
import {withStatus} from '../../utils/observables'
import {IpfsService} from '../../services/ipfs.service'

@Component({
  selector: 'app-dev-playground',
  templateUrl: './dev-playground.component.html',
  styleUrls: ['./dev-playground.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevPlaygroundComponent {
  contentSub = new Subject<string>()

  constructor(private ipfsService: IpfsService) {
  }

  upload(): Observable<unknown> {
    return this.ipfsService.addJSON({halo: 'theres'}).pipe(
      tap(res => {
        console.log(res)
        this.contentSub.next(res.path)
      }),
    )
  }

  content$ = this.contentSub.asObservable().pipe(
    switchMap(contentPath => withStatus(this.ipfsService.get(contentPath))),
  )
}
