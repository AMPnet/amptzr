import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'

@Component({
  selector: 'app-info-snippet',
  templateUrl: './info-snippet.component.html',
  styleUrls: ['./info-snippet.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoSnippetComponent {

  @Input() type: InfoSnippetType = "INFO"
  @Input() hasBorderAndBackground = true
  @Input() content: Content = { title: "", sections: [] }

  constructor() { }

}

export type InfoSnippetType = "INFO" | "WARNING" | "DANGER"

interface Content {
  title: string,
  sections: string[]
}
