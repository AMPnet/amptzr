import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {SessionQuery} from '../session/state/session.query';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OffersComponent implements OnInit {
  address$ = this.sessionQuery.address$;

  constructor(private sessionQuery: SessionQuery) {
  }

  ngOnInit(): void {
  }

}
