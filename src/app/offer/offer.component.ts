import {ChangeDetectionStrategy, Component} from '@angular/core'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent {
  constructor() {
  }
}

interface OfferModel {
  title: string,
  publishedBy: string,
  shortDescription: string,
  content: string,
  fundsCollected: string,
  fundsRequired: string,

}

interface OfferDocumentModel {
  title: string,
  link: string
}

interface OfferNewsModel {
  title: string, 
  link: string
}