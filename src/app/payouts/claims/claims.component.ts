import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
