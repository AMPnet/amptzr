import {ChangeDetectionStrategy, Component, NgZone, OnInit} from '@angular/core'
import { BehaviorSubject, Observable, Subject } from 'rxjs'

@Component({
  selector: 'app-offer',
  templateUrl: './offer.component.html',
  styleUrls: ['./offer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferComponent implements OnInit {

  offer = new BehaviorSubject<OfferModel>({
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
    startDate: 0,
    endDate: 0,
    roi: "11%",
    content: "mockContent"
  })
  offer$ = this.offer.asObservable()

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

    this.offer.next({
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
      startDate: 0,
      endDate: 0,
      roi: "11%",
      content: mockContent
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
  startDate: number,
  endDate: number,
  roi: string,
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