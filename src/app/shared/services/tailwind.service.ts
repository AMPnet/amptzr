import {Injectable} from '@angular/core'
import {fromEvent} from 'rxjs'
import {debounceTime, distinctUntilChanged, map, startWith} from 'rxjs/operators'
import resolveConfig from 'tailwindcss/resolveConfig'
// @ts-ignore
import tailwindConfig from '../../../../tailwind.config.js'

@Injectable({
  providedIn: 'root',
})
export class TailwindService {
  readonly screens: { name: string, width: number }[] = []

  screenResize$ = fromEvent(window, 'resize').pipe(
    startWith(this.getScreen()),
    debounceTime(300),
    map(() => this.getScreen()),
    distinctUntilChanged(),
  )

  constructor() {
    const screens: { [breakpoint: string]: string } = (resolveConfig(tailwindConfig).theme.screens as any) || {}
    this.screens = Object.keys(screens)
      .map(key => ({
        name: key,
        width: Number(screens[key].replace('px', '')),
      }))
      .sort((s1, s2) => s1.width - s2.width)
  }

  getScreen(): string {
    if (this.screens.length === 0) return ''

    const windowWidth = window.innerWidth
    let screen = this.screens[0]
    for (let i = 1; i < this.screens.length; i++) {
      if (windowWidth < this.screens[i].width) break
      screen = this.screens[i]
    }

    return screen.name
  }
}
