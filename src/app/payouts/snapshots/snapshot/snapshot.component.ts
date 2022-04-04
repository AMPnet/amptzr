import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-snapshot',
  templateUrl: './snapshot.component.html',
  styleUrls: ['./snapshot.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnapshotComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
