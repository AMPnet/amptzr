import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'app-airdrop',
  templateUrl: './airdrop.component.html',
  styleUrls: ['./airdrop.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AirdropComponent {
  activeTab: Tab = Tab.ManageExisting
  TabType = Tab

  constructor() {}

  changeTab(tab: Tab) {
    this.activeTab = tab
  }
}

enum Tab {
  CreateNew,
  ManageExisting,
}
