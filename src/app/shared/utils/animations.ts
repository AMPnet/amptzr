import { animate, style, transition, trigger } from "@angular/animations"

export const easeInOutAnimation = [
    trigger(
      'inOutAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('0.3s', 
                    style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({  opacity: 1 }),
            animate('0s', 
                    style({  opacity: 0 }))
          ]
        )
      ]
    )
  ]

  export const heightGrowAnimation = [
    trigger(
      'heightGrowAnimation', 
      [
        transition(
          ':enter', 
          [
            style({ opacity: 0 }),
            animate('0.3s', 
                    style({ opacity: 1 }))
          ]
        ),
        transition(
          ':leave', 
          [
            style({  opacity: 1 }),
            animate('0s', 
                    style({  opacity: 0 }))
          ]
        )
      ]
    )
  ]