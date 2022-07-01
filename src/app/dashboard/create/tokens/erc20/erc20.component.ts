import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-erc20',
  templateUrl: './erc20.component.html',
  styleUrls: ['./erc20.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Erc20Component {

  createTokenForm = new FormGroup({
    tokenName: new FormControl(''),
    tokenSupply: new FormControl(''),
    tokenSymbol: new FormControl(''),
    tokenAlias: new FormControl('')
  })

  constructor() { }

}
