import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core'
import { DOCUMENT } from '@angular/common'

@Component({
  selector: 'app-google-translate',
  templateUrl: './google-translate.component.html',
  styleUrls: ['./google-translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GoogleTranslateComponent implements OnInit {
  private readonly translateElementScriptID = 'ga-translate-element'
  private readonly translateScriptID = 'ga-translate-script'

  constructor(@Inject(DOCUMENT) private doc: any) {}

  ngOnInit() {
    const head = this.doc.getElementsByTagName('head')[0]

    if (!this.doc.getElementById(this.translateElementScriptID)) {
      const s1 = this.doc.createElement('script')
      s1.id = this.translateElementScriptID
      s1.innerHTML = `
      function googleTranslateElementInit() {
        new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL, autoDisplay: false}, 'google_translate_element');
      }`
      head.appendChild(s1)
    }

    this.doc.getElementById(this.translateScriptID)?.remove()
    this.doc.getElementById('goog-gt-tt')?.remove()
    Array.from(this.doc.getElementsByClassName('goog-te-spinner-pos')).forEach(
      (el: any) => el?.remove()
    )
    Array.from(this.doc.getElementsByClassName('goog-te-menu-frame')).forEach(
      (el: any) => el?.remove()
    )
    const s2 = this.doc.createElement('script')
    s2.id = this.translateScriptID
    s2.async = true
    s2.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`
    head.appendChild(s2)
  }
}
