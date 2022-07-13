import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

@Component({
  selector: 'app-third-party-integrations-overview',
  templateUrl: './third-party-integrations-overview.component.html',
  styleUrls: ['./third-party-integrations-overview.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyIntegrationsOverviewComponent {
  thirdPartyIntegrationsForm = new FormGroup({
    rampNetwork: new FormControl(''),
    magicLink: new FormControl(''),
  })

  constructor() {}
}
