import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { SignerStore } from './signer.store';

@Injectable({ providedIn: 'root' })
export class SignerService {

  constructor(private signerStore: SignerStore, private http: HttpClient) {
  }


}
