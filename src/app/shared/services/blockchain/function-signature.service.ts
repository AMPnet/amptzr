import {Injectable} from '@angular/core'
import {Observable, of} from 'rxjs'
import {catchError, map, timeout} from 'rxjs/operators'
import {HttpClient} from '@angular/common/http'

@Injectable({
  providedIn: 'root',
})
export class FunctionSignatureService {
  constructor(private http: HttpClient) {
  }

  fromHex(data: string): Observable<string | undefined> {
    const code = data?.substring(0, 10)
    if (!code) return of(undefined)

    return this.http.get<SignatureList>(
      `https://www.4byte.directory/api/v1/signatures/?hex_signature=${code}`,
    ).pipe(
      timeout(3000),
      map(res => res.count > 0 ?
        FunctionSignatureService.sortById(res.results)[0].text_signature :
        undefined,
      ),
      catchError(() => of(undefined)),
    )
  }

  static sortById(results: SignatureResult[]): SignatureResult[] {
    return results.sort((a, b) => a.id - b.id)
  }
}

interface SignatureList {
  count: number;
  next?: any;
  previous?: any;
  results: SignatureResult[];
}

interface SignatureResult {
  id: number;
  created_at: Date;
  text_signature: string;
  hex_signature: string;
  bytes_signature: string;
}
