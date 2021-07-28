import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {SessionQuery} from '../session/state/session.query'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  address$ = this.sessionQuery.address$

  offers = new BehaviorSubject<SingleOfferCardModel[]>([])
  offers$ = this.offers.asObservable()

  constructor(private sessionQuery: SessionQuery) {

    // SAMPLE, DELETE LATER
    this.offers.next([
      {
        title: "Solar Farm Zagreb",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        fundsRaised: 425000,
        fundsRequired: 833000,
        startDate: 0,
        endDate: 0,
        roi: "12%",
        minInvestment: 650,
        titleImageSrc: "https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
        display: "large"
      },
      {
        title: "Wind Farm Stupnik",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        fundsRaised: 833000,
        fundsRequired: 833000,
        startDate: 0,
        endDate: 0,
        roi: "12%",
        minInvestment: 650,
        titleImageSrc: "https://www.afrik21.africa/wp-content/uploads/2019/06/shutterstock_275763713-2-800x400.jpg",
        display: "small"
      },
      {
        title: "Yacht Charter in Murter, Croatia",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        fundsRaised: 310000,
        fundsRequired: 400000,
        startDate: 0,
        endDate: 0,
        roi: "6,5%",
        minInvestment: 50,
        titleImageSrc: "https://marinanovi.hr/wp-content/uploads/2020/12/152-1024x575.jpg",
        display: "small"
      },
      {
        title: "Fairmont Kea Lani, Maui Resort Renewal",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        fundsRaised: 400000,
        fundsRequired: 400000,
        startDate: 0,
        endDate: 0,
        roi: "12%",
        minInvestment: 200,
        titleImageSrc: "https://media.kempinski.com/1139/kempinski-hotel-adriatic-luxury-pool-area-at-daytime.jpg;width=1905;height=794;mode=crop;anchor=middlecenter;autorotate=true;quality=85;scale=both;progressive=true;encoder=freeimage;format=jpg",
        display: "large"
      },
    ])
  }

}

export interface SingleOfferCardModel {
  title: string
  shortDescription: string
  fundsRaised: number
  fundsRequired: number
  startDate: number
  endDate: number
  roi: string
  minInvestment: number
  titleImageSrc: string,
  display: 'large' | 'small'
}
