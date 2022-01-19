import {Observable} from 'rxjs'
import {providers} from 'ethers'

export interface SignerLoginOpts {
  force?: boolean;
}

export type GetSignerOptions<S> = S extends Subsigner<infer Opts> ? Opts : never;

export interface Subsigner<O extends Record<any, any>> {
  login(opts: SignerLoginOpts | O): Observable<providers.JsonRpcSigner>;

  logout(): Observable<unknown>;
}
