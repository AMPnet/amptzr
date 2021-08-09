import {ChangeDetectionStrategy, Component, Input} from '@angular/core'
import {SingleOfferCardModel} from '../offers.component'

@Component({
  selector: 'app-offers-card-large',
  templateUrl: './offers-card-large.component.html',
  styleUrls: ['./offers-card-large.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersCardLargeComponent {
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
    display: 'large',
  }

  constructor() {
  }
}
