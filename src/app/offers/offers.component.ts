import {ChangeDetectionStrategy, Component} from '@angular/core'
import {SessionQuery} from '../session/state/session.query'
import {SignerService} from '../shared/services/signer.service'
import {EMPTY, from, Observable} from 'rxjs'
import {catchError, concatMap, map, tap} from 'rxjs/operators'
import {utils} from 'ethers'
import {DialogService} from '../shared/services/dialog.service'
import {USDC__factory} from '../../../types/ethers-contracts'
import {TokenMappingService} from '../shared/services/token-mapping.service'
import {environment} from '../../environments/environment'

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersComponent {
  address$ = this.sessionQuery.address$

  offers: SingleOfferCardModel[] = []

  constructor(private sessionQuery: SessionQuery,
              private tokenMappingService: TokenMappingService,
              private signerService: SignerService,
              private dialogService: DialogService) {

    // SAMPLE, DELETE LATER
    this.offers = [
      {
        title: "Solar Farm Kadanovci",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        fundsRaised: 42500000,
        fundsRequired: 83300000,
        startDate: 0,
        endDate: 0,
        roi: "12%",
        minInvestment: 65000,
        titleImageSrc: "https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
      },
      {
        title: "Wind Farm Stupnik",
        shortDescription: "This is a small change, but a big move for us. 140 was an arbitrary choice based on the 160 character SMS limit. Proud of how thoughtful the team has been in solving a real problem people have when trying to tweet. And at the same time maintaining our brevity, speed, and essence!",
        fundsRaised: 42500000,
        fundsRequired: 83300000,
        startDate: 0,
        endDate: 0,
        roi: "12%",
        minInvestment: 65000,
        titleImageSrc: "https://www.afrik21.africa/wp-content/uploads/2019/06/shutterstock_275763713-2-800x400.jpg"
      }
    ]
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
    titleImageSrc: string
}
