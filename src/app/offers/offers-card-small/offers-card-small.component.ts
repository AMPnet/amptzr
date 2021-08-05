import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {SingleOfferCardModel} from '../offers.component'

@Component({
  selector: 'app-offers-card-small',
  templateUrl: './offers-card-small.component.html',
  styleUrls: ['./offers-card-small.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersCardSmallComponent {
  @Input() offer: SingleOfferCardModel = {
    title: '',
    shortDescription: '',
    fundsRaised: 0,
    fundsRequired: 0,
    startDate: 0,
    endDate: 0,
    roi: '',
    minInvestment: 0,
    titleImageSrc: '',
    display: 'small',
  }

  constructor() {
  }
}
