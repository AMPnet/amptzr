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
      categoryName: "BASIC TERMS",
      items: [
        {
          question: "What is a token?",
          answer: "Crypto tokens are a type of cryptocurrency that represents an asset or specific use and resides" +
            " on their blockchain. Tokens can be used for investment purposes, to store value, or to make purchases."
        },
        {
          question: "What is a crypto wallet?",
          answer: "A cryptocurrency wallet is a device, physical medium, program or a service which stores the" +
            " public and/or private keys for cryptocurrency transactions. In addition to this basic function of" +
            " storing the keys, a cryptocurrency wallet more often also offers the functionality of encrypting" +
            " and/or signing information."
        },
        {
          question: "What is USDC?",
          answer: "USD Coin (USDC) is a type of cryptocurrency that is referred to as a stablecoin. You can always" +
            " redeem 1 USD Coin for US$1.00, giving it a stable price."
        },
      ]
    },
    {
      categoryName: "WALLET AND PIN",
      items: [
        {
          question: "Do I need to have a wallet to invest?",
          answer: "Yes."
        },
        {
          question: "How can I create a wallet?",
          answer: "Just follow the instructions during login and you will be prompted to create your wallet and PIN" +
            " for it. Before creating a wallet please read <a href='https://help.venly.io/en/article/what-is-a-pin-" +
            "2e4br3/' target='_blank' rel='noopener noreferrer' class='underline'>this</a> first."
        },
        {
          question: "What if I forgot the PIN for my wallet?",
          answer: "For this we use a third party service provider called Venly. You can find more information about" +
            " PIN recovery <a href='https://help.venly.io/en/article/i-forgot-my-pin-1hgc4ej/' target='_blank'" +
            " rel='noopener noreferrer' class='underline'>here</a>."
        },
      ]
    },
    {
      categoryName: "TRANSACTIONS",
      items: [
        {
          question: "What countries do you support?",
          answer: "170+ countries and territories. For this we use a third party service provider called Ramp" +
            " Network. For more information click <a href='https://support.ramp.network/en/article/what-count" +
            "ries-do-you-support-1ua7sn1/' target='_blank' rel='noopener noreferrer' class='underline'>here</a>."
        },
        {
          question: "What are your payment options?",
          answer: "For this we use a third party service provider called Ramp Network. For more information click" +
            " <a href='https://support.ramp.network/en/article/what-are-your-payment-options-15vji5a/'" +
            " target='_blank' rel='noopener noreferrer' class='underline'>here</a>."
        },
        {
          question: "How long does it take to settle the transaction?",
          answer: "For this we use a third party service provider called Ramp Network. For more information click" +
            " <a href='https://support.ramp.network/en/article/how-long-does-it-take-to-settle-the-transaction-cq" +
            "ux2a/' target='_blank' rel='noopener noreferrer' class='underline'>here</a>."
        },
        {
          question: "How much does the transaction fee cost?",
          answer: "For this we use a third party service provider called Ramp Network. For more information click" +
            " <a href='https://support.ramp.network/en/article/what-are-your-fees-1atf5lv/' target='_blank'" +
            " rel='noopener noreferrer' class='underline'>here</a>."
        },
        {
          question: "What if I need some other troubleshooting with transactions?",
          answer: "For more information click <a href='https://support.ramp.network/en/category/troubleshooting-" +
            "1yc8pkt/' target='_blank' rel='noopener noreferrer' class='underline'>here</a>."
        },
      ]
    }
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
