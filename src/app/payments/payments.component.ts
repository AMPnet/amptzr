import { Component, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent {
  constructor() {}
}
