import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core'
import {DOCUMENT} from '@angular/common'

@Component({
  selector: 'app-google-translate',
  templateUrl: './google-translate.component.html',
  styleUrls: ['./google-translate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GoogleTranslateComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private doc: any) {
  }

  ngOnInit(): void {
    const head = this.doc.getElementsByTagName('head')[0]

    const s1 = this.doc.createElement('script')
    s1.innerHTML = `
    function googleTranslateElementInit() {
      new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.HORIZONTAL}, 'google_translate_element');
    }
`
    head.appendChild(s1)

    const s2 = this.doc.createElement('script')
    s2.async = true
    s2.src = `//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`
    head.appendChild(s2)
  }
}
