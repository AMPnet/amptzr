import {enableProdMode, ɵresetCompiledComponents} from '@angular/core'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

import {AppModule} from './app/app.module'
import {environment} from './environments/environment'
import {persistState} from '@datorama/akita'
import localeHr from '@angular/common/locales/hr'
import {registerLocaleData} from '@angular/common'

registerLocaleData(localeHr)

declare var module: any
if (module['hot']) {
  module['hot'].accept()
  module['hot'].dispose(() => ɵresetCompiledComponents())
}

if (environment.production) {
  enableProdMode()
}

export const preferencePersistStorage = persistState({
  include: ['preference'],
  key: 'preferenceStorage',
})
const providers = [{provide: 'persistStorage', useValue: preferencePersistStorage}]

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.error(err))
