import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
} from '@angular/core'
import { CrispService } from '../shared/services/crisp.service'

@Component({
  selector: 'app-app-layout',
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  constructor(@Inject(DOCUMENT) public crispService: CrispService) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const cssClassName = 'bg-scrolled'
    const classList = document.getElementById('navbarHolder')?.classList
    if (document.documentElement.scrollTop > 1) {
      if (!classList?.contains(cssClassName)) {
        classList?.add(cssClassName)
      }
    } else {
      if (classList?.contains(cssClassName)) {
        classList.remove(cssClassName)
      }
    }
  }
}
