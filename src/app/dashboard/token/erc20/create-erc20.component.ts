import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { BehaviorSubject } from 'rxjs'


@Component({
  selector: 'app-erc20',
  templateUrl: './create-erc20.component.html',
  styleUrls: ['./create-erc20.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateErc20Component {

  createTokenForm = new FormGroup({
    tokenName: new FormControl(''),
    tokenSupply: new FormControl(''),
    tokenSymbol: new FormControl(''),
    tokenAlias: new FormControl('')
  })

  checkSelected$ = new BehaviorSubject<boolean>(false)

  constructor() { }

  onCheckChange(event: any) {
    this.checkSelected$.next(!this.checkSelected$.value)
  }

}
