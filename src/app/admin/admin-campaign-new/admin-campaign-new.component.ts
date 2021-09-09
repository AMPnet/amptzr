import {ChangeDetectionStrategy, Component} from '@angular/core'
import {FormBuilder, FormGroup, Validators} from '@angular/forms'
import {PreferenceQuery} from '../../preference/state/preference.query'
import {getWindow} from '../../shared/utils/browser'
import {IssuerPathPipe} from '../../shared/pipes/issuer-path.pipe'
import {ReturnFrequencies} from 'types/ipfs/campaign'
import {ViewportScroller} from '@angular/common'

@Component({
  selector: 'app-admin-campaign-new',
  templateUrl: './admin-campaign-new.component.html',
  styleUrls: ['./admin-campaign-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCampaignNewComponent {
  assetInfo: AssetInfo = {name: 'INSERTED NAME'} // TODO
  creationStep: 1 | 2 = 2
  createForm1: FormGroup
  createForm2: FormGroup

  readonly ReturnFrequencies: ReturnFrequencies = ['monthly', 'quarterly', 'semi-annual', 'annual']
  readonly ReturnFrequencyNames = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'semi-annual': 'Semi-annualy',
    'annual': 'Annualy',
  }

  constructor(private viewportScroller: ViewportScroller,
              private preferenceQuery: PreferenceQuery,
              private issuerPathPipe: IssuerPathPipe,
              private fb: FormBuilder) {
    this.createForm1 = this.fb.group({
      name: ['', Validators.required],
      ansName: ['', Validators.required],
      hardCap: [0, Validators.required],
      softCap: [0, Validators.required],
      hardCapTokensPercentage: [0, Validators.required],
      hasMinAndMaxInvestment: [false, Validators.required],
      minInvestment: [{value: undefined, disabled: true}, Validators.required],
      maxInvestment: [{value: undefined, disabled: true}, Validators.required],
      isReturningProfitsToInvestors: [false, Validators.required],
      returnFrequency: [{value: undefined, disabled: true}, Validators.required],
      isReturnValueFixed: [false, Validators.required],
      returnFrom: [{value: undefined, disabled: true}, Validators.required],
      returnTo: [{value: undefined, disabled: true}, Validators.required],
      isIdVerificationRequired: [false, Validators.required],
    })

    this.createForm2 = this.fb.group({
      logo: [undefined, Validators.required],
    })
  }

  get campaignUrl() {
    return getWindow().location.origin + this.issuerPathPipe.transform(`/offers/`)
  }

  toggleMinAndMaxInvestmentControls(value: boolean) {
    if (value) {
      this.createForm1.controls.minInvestment.enable()
      this.createForm1.controls.maxInvestment.enable()
    } else {
      this.createForm1.controls.minInvestment.disable()
      this.createForm1.controls.maxInvestment.disable()
    }
  }

  toggleReturnFrequency(value: boolean) {
    if (value) {
      this.createForm1.controls.returnFrequency.enable()
      this.createForm1.controls.returnFrom.enable()

      if (!this.createForm1.value.isReturnValueFixed) {
        this.createForm1.controls.returnTo.enable()
      }
    } else {
      this.createForm1.controls.returnFrequency.disable()
      this.createForm1.controls.returnFrom.disable()
      this.createForm1.controls.returnTo.disable()
    }
  }

  toggleReturnTo(value: boolean) {
    if (!value && this.createForm1.value.isReturningProfitsToInvestors) {
      this.createForm1.controls.returnTo.enable()
    } else {
      this.createForm1.controls.returnTo.disable()
    }
  }

  nextCreationStep() {
    this.creationStep = 2
    this.viewportScroller.scrollToPosition([0, 0])
  }

  previousCreationStep() {
    this.creationStep = 1
    this.viewportScroller.scrollToPosition([0, 0])
  }
}

interface AssetInfo {
  // id: BigNumber;
  // contractAddress: string;
  // ansName: string;
  // ansId: BigNumber;
  // createdBy: string;
  // owner: string;
  // initialTokenSupply: BigNumber;
  // whitelistRequiredForRevenueClaim: boolean;
  // whitelistRequiredForLiquidationClaim: boolean;
  // assetApprovedByIssuer: boolean;
  // issuer: string;
  // apxRegistry: string;
  // info: string;
  name: string;
  // symbol: string;
  // totalAmountRaised: BigNumber;
  // totalTokensSold: BigNumber;
  // highestTokenSellPrice: BigNumber;
  // liquidated: boolean;
  // liquidationFundsTotal: BigNumber;
  // liquidationTimestamp: BigNumber;
  // liquidationFundsClaimed: BigNumber;
  // childChainManager: string;
}
