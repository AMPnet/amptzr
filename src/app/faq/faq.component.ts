import {ChangeDetectionStrategy, Component} from '@angular/core'
import {BehaviorSubject} from "rxjs"

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  questionCategories: QuestionCategory[] = [
    {
      categoryName: "Common questions",
      items: [
        {
          question: "Will I get rich fast?",
          answer: "No.",
        },
        {
          question: "Is this the final version of this FAQ, will there be any actual questions here?",
          answer: "Of course these are not the actual questions, what are you thinking? The real questions will come" +
            " later.\n\nAlso, newlines are a thing that should be displayed correctly here.\nLike this, see?",
        },
      ],
    },
    {
      categoryName: "Stupid questions",
      items: [
        {
          question: "I accidentally posted my private key on Facebook, are my coins safe?",
          answer: "LOL, no.",
        },
        {
          question: "Can I ask a question?",
          answer: "Sure.",
        },
        {
          question: "I feel like I should be able to write a lot of text, but I mean really really REALLY a lot of" +
            " text, and that should be displayed correctly right? What if I don't write enough and then we will never" +
            " know if this blasted thing works or not, what if there is some kind of limit that should never be" +
            " reached when doing sopmething like this? I mean, it's going great so far, but can I go on writing" +
            " random crap like this, will I ever stop?",
          answer: "You misspelled 'sopmething', you idiot.",
        },
      ],
    },
    {
      categoryName: "Stupider questions",
      items: [
        {
          question: "What, there is only one question here?",
          answer: "Always has been.",
        },
      ],
    },
    {
      categoryName: "Meme questions",
      items: [
        {
          question: "When moon?",
          answer: "Go away.",
        },
        {
          question: "Can we get some Fs in the chat?",
          answer: "FFFFFFFFFFFF",
        },
        {
          question: "What is love?",
          answer: "What is love?\nOh baby, don't hurt me\nDon't hurt me\nNo more\nBaby, don't hurt me, don't hurt" +
            " me\nNo more\nWhat is love?\nYeah\nNo, I don't know why you're not fair\nI give you my love, but you" +
            " don't care\nSo what is right and what is wrong?\nGimme a sign\nWhat is love?\nOh baby, don't hurt" +
            " me\nDon't hurt me\nNo more\nWhat is love?\nOh baby, don't hurt me\nDon't hurt me\nNo more\nWhoa, whoa," +
            " oh\nWhoa, whoa, oh\nOh, I don't know, what can I do?\nWhat else can I say? It's up to you\nI know we're" +
            " one, just me and you\nI can't go on\nWhat is love?\nOh baby, don't hurt me\nDon't hurt me\nNo" +
            " more\nWhat is love?\nOh baby, don't hurt me\nDon't hurt me\nNo more\nWhoa, whoa, oh\nWhoa, whoa," +
            " oh\nWhat is love?\nWhat is love?\nWhat is love?\nOh baby, don't hurt me\nDon't hurt me\nNo" +
            " more\nDon't hurt me\nDon't hurt me\nI want no other, no other lover\nThis is our life, our time\nIf" +
            " we are together, I need you forever\nIs it love?\nWhat is love?\nOh baby, don't hurt me\nDon't hurt" +
            " me\nNo more\nWhat is love?\nOh baby, don't hurt me\nDon't hurt me\nNo more\nYeah, yeah\nWhoa, whoa," +
            " oh\nWhoa, whoa, oh\nWhat is love?\nOh baby, don't hurt me\nDon't hurt me\nNo more\nWhat is love?\nOh" +
            " baby, don't hurt me\nDon't hurt me\nNo more (whoa, whoa)\nOh baby, don't hurt me\nDon't hurt me\nNo" +
            " more (whoa, whoa)\nOh baby, don't hurt me\nDon't hurt me\nNo more\nWhat is love?",
        },
      ],
    },
  ]
  selectedCategory$ = new BehaviorSubject<QuestionCategory>(this.questionCategories[0])

  constructor() {
  }

  selectCategory(category: QuestionCategory) {
    this.selectedCategory$.next(category)
  }
}

interface Question {
  question: string,
  answer: string,
}

interface QuestionCategory {
  categoryName: string,
  items: Question[],
}
