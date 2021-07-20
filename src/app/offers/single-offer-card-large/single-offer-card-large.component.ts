import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { SingleOfferCardModel } from '../offers.component'

@Component({
  selector: 'app-single-offer-card-large',
  templateUrl: './single-offer-card-large.component.html',
  styleUrls: ['./single-offer-card-large.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleOfferCardLargeComponent {

  @Input() offer: SingleOfferCardModel = {
    title: '',
    shortDescription: '',
    fundsRaised: 0,
    fundsRequired: 0,
    startDate: 0,
    endDate: 0,
    roi: '',
    minInvestment: 0,
    titleImageSrc: ''
  }

  constructor() { }

}
