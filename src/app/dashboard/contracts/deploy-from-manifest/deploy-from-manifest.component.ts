import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { tap } from 'rxjs'
import { ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'

@Component({
  selector: 'app-deploy-from-manifest',
  templateUrl: './deploy-from-manifest.component.html',
  styleUrls: ['./deploy-from-manifest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeployFromManifestComponent {

    contract$ = this.manifestService.getByID(this.route.snapshot.params.contractID)
        .pipe(tap((res) => console.log(res)))

    constructor(private manifestService: ContractManifestService,
        private route: ActivatedRoute) {}

}

