import {ChangeDetectionStrategy, Component} from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioComponent {

  porfolioModel = new BehaviorSubject<PortfolioModel>({
    totalInvestment: 10000,
    unclaimedEarning: 0,
    items: [
      {
        name: "Wind Farm Stupnik",
        projectState: ProjectState.Finalized,
        fundsRaised: 60000,
        fundsNeeded: 60000,
        fundsInvested: 15000,
        fundsEarned: 250,
        startDate: 0,
        endDate: 0,
        imgSrc: "https://www.boskinac.com/assets/cms_image/cms_image_hotel_gallery_81_original.jpg"
      },
      {
        name: "Solar Farm Zagreb",
        projectState: ProjectState.InFunding,
        fundsRaised: 60000,
        fundsNeeded: 85000,
        fundsInvested: 15000,
        fundsEarned: 0,
        startDate: 0,
        endDate: 0,
        imgSrc: "https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
      },
      {
        name: "Geo Farm Lipik",
        projectState: ProjectState.Unsuccessful,
        fundsRaised: 45000,
        fundsNeeded: 60000,
        fundsInvested: 15000,
        fundsEarned: 250,
        startDate: 0,
        endDate: 0, 
        imgSrc: "https://www.afrik21.africa/wp-content/uploads/2019/06/shutterstock_275763713-2-800x400.jpg"
      },
      {
        name: "Farmaonica",
        projectState: ProjectState.Successful,
        fundsRaised: 45000,
        fundsNeeded: 60000,
        fundsInvested: 15000,
        fundsEarned: 250,
        startDate: 0,
        endDate: 0, 
        imgSrc: "https://marinanovi.hr/wp-content/uploads/2020/12/152-1024x575.jpg"
      },
    ]
  })
  porfolioModel$ = this.porfolioModel.asObservable()
  projectStateType = ProjectState
  isClaimButtonVisible$ = this.porfolioModel$.pipe(map((portfolio) => portfolio.unclaimedEarning > 0 ))

  constructor() { }
}

interface PortfolioModel {
  totalInvestment: number,
  unclaimedEarning: number,
  items: SinglePortfolioItemModel[]
}

interface SinglePortfolioItemModel {
  name: string,
  projectState: ProjectState,
  fundsRaised: number,
  fundsNeeded: number,
  fundsInvested: number,
  fundsEarned: number,
  endDate: number,
  startDate: number,
  imgSrc: string
}

export enum ProjectState {
  Finalized,
  Successful,
  Unsuccessful,
  InFunding
}
