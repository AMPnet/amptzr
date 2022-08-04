import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-deploy-from-manifest',
  templateUrl: './deploy-from-manifest.component.html',
  styleUrls: ['./deploy-from-manifest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeployFromManifestComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
