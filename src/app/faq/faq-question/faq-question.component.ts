import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

@Component({
  selector: 'app-faq-question',
  templateUrl: './faq-question.component.html',
  styleUrls: ['./faq-question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqQuestionComponent {
  @Input() question!: string
  toggled = false

  constructor() {}

  toggle() {
    this.toggled = !this.toggled
  }
}
