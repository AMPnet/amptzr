import { ChangeDetectionStrategy, Component } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqComponent {
  questionCategories: QuestionCategory[] = [
    {
      categoryName: 'BASIC TERMS',
      items: [
        {
          question: 'What is a token?',
          answer:
            'Crypto tokens are a type of cryptocurrency that represents an asset or specific use and resides' +
            ' on their blockchain. Tokens can be used for investment purposes, to store value, or to make purchases.',
        },
        {
          question: 'What is a crypto wallet?',
          answer:
            'A cryptocurrency wallet is a device, physical medium, program or a service which stores the' +
            ' public and/or private keys for cryptocurrency transactions. In addition to this basic function of' +
            ' storing the keys, a cryptocurrency wallet more often also offers the functionality of encrypting' +
            ' and/or signing information.',
        },
        {
          question: 'What is USDC?',
          answer:
            'USD Coin (USDC) is a type of cryptocurrency that is referred to as a stablecoin. You can always' +
            ' redeem 1 USD Coin for US$1.00, giving it a stable price.',
        },
      ],
    },
    {
      categoryName: 'WALLET AND INVESTING',
      items: [
        {
          question: 'What do I need to do before investing?',
          answer:
            'First, read the project description carefully and check the attached documents. If you consider' +
            ' the project is legitimate and attractive for investment, log in to the platform within which you will' +
            ' be conducted through the onboarding process.',
        },
        {
          question: 'What does the onboarding process mean?',
          answer:
            'This means that you have to go through the KYC (Know Your Customer) process, so please prepare' +
            ' official documentation from your country, such as an ID card, passport or driver’s license. You will' +
            ' also need to create your wallet within the platform, or connect an existing one (Metamask) to the' +
            ' platform.',
        },
        {
          question: 'Can I invest directly from my bank account - with fiat?',
          answer:
            'You must have a blockchain wallet that will have USDC. Within the platform, you will buy USDC with' +
            ' fiat currency, after which you will be shown the balance on your wallet with which you can invest in' +
            ' the project.',
        },
        {
          question: 'Does the platform hold my funds?',
          answer:
            'No, we just detect your blockchain wallet address and present its balance. You are the sole owner' +
            ' of your USDC. When you invest in a project and the campaign is finalized, the funds allocated to that' +
            ' project go to the campaign owner.',
        },
        {
          question: 'What happens with my funds, if the project is not funded?',
          answer:
            'In short - all funds will be returned to your wallet. You just need to go to the Orders screen' +
            ' and click on cancel investment button and the funds will be refunded to your wallet.',
        },
        {
          question: 'Can I cancel my investments? ',
          answer:
            'As long as the campaign is in the funding process you can cancel it at any time. When the minimum' +
            ' target amount is reached and the project owner finalizes his campaign, then all the funds from the' +
            ' investors are transferred to the campaign owner.',
        },
      ],
    },
    {
      categoryName: 'TRANSACTIONS',
      items: [
        {
          question: 'What countries do you support?',
          answer:
            '170+ countries and territories. For this we use a third party service provider called Ramp' +
            " Network. For more information click <a href='https://support.ramp.network/en/article/what-count" +
            "ries-do-you-support-1ua7sn1/' target='_blank' rel='noopener noreferrer' class='underline'>here</a>.",
        },
        {
          question: 'What are your payment options?',
          answer:
            'For this we use a third party service provider called Ramp Network. For more information click' +
            " <a href='https://support.ramp.network/en/article/what-are-your-payment-options-15vji5a/'" +
            " target='_blank' rel='noopener noreferrer' class='underline'>here</a>.",
        },
        {
          question: 'How long does it take to settle the transaction?',
          answer:
            'For this we use a third party service provider called Ramp Network. For more information click' +
            " <a href='https://support.ramp.network/en/article/how-long-does-it-take-to-settle-the-transaction-cq" +
            "ux2a/' target='_blank' rel='noopener noreferrer' class='underline'>here</a>.",
        },
        {
          question: 'How much does the transaction fee cost?',
          answer:
            'For this we use a third party service provider called Ramp Network. For more information click' +
            " <a href='https://support.ramp.network/en/article/what-are-your-fees-1atf5lv/' target='_blank'" +
            " rel='noopener noreferrer' class='underline'>here</a>.",
        },
        {
          question:
            'What if I need some other troubleshooting with transactions?',
          answer:
            "For more information click <a href='https://support.ramp.network/en/category/troubleshooting-" +
            "1yc8pkt/' target='_blank' rel='noopener noreferrer' class='underline'>here</a>.",
        },
      ],
    },
  ]
  selectedCategory$ = new BehaviorSubject<QuestionCategory>(
    this.questionCategories[0]
  )

  constructor() {}

  selectCategory(
    category: QuestionCategory,
    currentEl: HTMLElement,
    parentEl: HTMLElement
  ) {
    this.selectedCategory$.next(category)
    parentEl.scrollTo({ left: currentEl.offsetLeft - parentEl.offsetLeft })
  }
}

interface Question {
  question: string
  answer: string
}

interface QuestionCategory {
  categoryName: string
  items: Question[]
}
