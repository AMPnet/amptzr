import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router';
import { RouterService } from 'src/app/shared/services/router.service';

@Component({
  selector: 'app-dashboard-holder',
  templateUrl: './dashboard-holder.component.html',
  styleUrls: ['./dashboard-holder.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHolderComponent {

  navbarSelectedIndex = 0;

  constructor(private router: RouterService) { }

  sidebarItemClicked(index: number) {
    this.navbarSelectedIndex = index;
    this.changeRoute()
  }

  changeRoute() {
    if(this.navbarSelectedIndex === 3) {
      
    }
  }

  editIssuer() {
    this.router.navigate([`/admin/issuer/edit`])
  }

}
