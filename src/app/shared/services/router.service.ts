import {Injectable} from '@angular/core'
import {NavigationExtras, Router} from '@angular/router'
import {IssuerPathPipe} from '../pipes/issuer-path.pipe'

@Injectable({
  providedIn: 'root',
})
export class RouterService {
  constructor(public router: Router,
              private issuerPathPipe: IssuerPathPipe) {
  }

  navigate(commands: any[], extras?: NavigationExtras): Promise<boolean> {
    return this.router.navigate([this.issuerPathPipe.transform(commands)], extras)
  }
}
