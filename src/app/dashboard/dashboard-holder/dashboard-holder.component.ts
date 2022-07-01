import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dashboard-holder',
  templateUrl: './dashboard-holder.component.html',
  styleUrls: ['./dashboard-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHolderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
