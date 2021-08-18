import {Injectable} from '@angular/core'
import {Observable, of} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {catchError, map} from "rxjs/operators"
import {BackendHttpClient} from "./backend-http-client.service"

@Injectable({
  providedIn: 'root',
})
export class LinkPreviewService {
  path = `${environment.backendURL}/api/link`

  constructor(private http: BackendHttpClient) {
  }

  previewLink(url: string): Observable<LinkPreviewResponse> {
    return this.http.get<LinkPreviewResponse>(`${this.path}/preview`, {url: url}, true).pipe(
      map((response) => {
        if (response.open_graph?.image?.url) {
          return {
            url: response.url,
            open_graph: {
              ...response.open_graph,
              image: {
                ...response.open_graph.image,
                url: response.open_graph.image.url.replace(/&amp;/, '&')
              }
            }
          }
        }
        return response
      }),
      catchError(() => of({url: url})),
    )
  }
}

export interface LinkPreviewResponse {
  url: string;
  open_graph?: OpenGraphResponse;
}

export interface OpenGraphResponse {
  title?: string;
  description?: string;
  image?: ImagePreviewResponse;
}

export interface ImagePreviewResponse {
  url?: string;
  height?: string;
  width?: string;
}
