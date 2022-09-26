import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent {
  activeTab = Tab.Payments
  TabType = Tab

  constructor() {}

  changeTab(tab: Tab) {
    this.activeTab = tab
  }
}

enum Tab {
  Payments,
  CreateNew,
}
