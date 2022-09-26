import { Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-info-snippet',
  templateUrl: './info-snippet.component.html',
  styleUrls: ['./info-snippet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoSnippetComponent implements OnInit {

  @Input() type: InfoSnippetType = "INFO"
  @Input() hasBorderAndBackground = true
  @Input() content: Content = { title: "", sections: [] }
  @Input() hasRoundedCorners = true
  @Input() actionLinkButton: { title: string, href: string} | null = null
  @Input() hasInfoToggle = false

  sectionsOpenedSub = new BehaviorSubject(!this.hasInfoToggle)
  sectionsOpened$ = this.sectionsOpenedSub.asObservable()

  constructor() { }

  ngOnInit(): void {
    this.sectionsOpenedSub.next(!this.hasInfoToggle)
  }

  toggleSections() {
    this.sectionsOpenedSub.next(!this.sectionsOpenedSub.getValue())
  }

}

export type InfoSnippetType = "INFO" | "WARNING" | "DANGER"

interface Content {
  title: string,
  sections: string[]
}
