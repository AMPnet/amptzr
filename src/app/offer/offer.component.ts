import {ChangeDetectionStrategy, Component, NgZone, OnInit} from '@angular/core'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent implements OnInit {

  offer: OfferModel = {
    title: 'asd',
    publishedBy: '',
    shortDescription: 'ddd  ',
    documents: [],
    news: [],
    fundsCollected: 0,
    fundsRequired: 0,
    minInvestment: 0,
    maxInvestment: 0,
    content: ''
  }

  constructor(private ngZone: NgZone) {
  }

  async ngOnInit() {
    await this.fetchMockOffer()
  }

  printOffer() {
    console.log(this.offer)
  }

  async fetchMockOffer() {

    let fetchRes = await fetch("../../assets/mocks/mock-offer-content.html")
    let mockContent = await fetchRes.text()

    this.ngZone.run(() => {
      this.offer = {
        title: "Wind Farm Stupnik",
        publishedBy: "Golden Sparrow Equity",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        documents: [
          { title: "Building Permit", link: "https://google.com" },
          { title: "Corruption Permit", link: "https://google.com" }
        ],
        news: [
          { title: "New News about New News", link: "https://google.com" }
        ],
        fundsCollected: 12300000,
        fundsRequired: 25500000,
        minInvestment: 50000,
        maxInvestment: 2500000,
        content: mockContent
      }
    })
    
  }

}

interface OfferModel {
  title: string,
  publishedBy: string,
  shortDescription: string,
  content: string,
  fundsCollected: number,
  fundsRequired: number,
  minInvestment: number,
  maxInvestment: number,
  documents: OfferDocumentModel[],
  news: OfferNewsModel[]
}

interface OfferDocumentModel {
  title: string,
  link: string
}

interface OfferNewsModel {
  title: string, 
  link: string
}