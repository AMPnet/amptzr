import {Injectable} from '@angular/core'
import {HttpClient, HttpParams} from '@angular/common/http'
import {Observable} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {map} from "rxjs/operators"

@Injectable({
  providedIn: 'root',
})
export class LinkPreviewService {
  path = `${environment.backendURL}/api/link`

  constructor(private http: HttpClient) {
  }

  previewLink(url: string): Observable<LinkPreviewResponse> {
    const params = new HttpParams().set('url', url)
    return this.http.get<LinkPreviewResponse>(`${this.path}/preview`, {params: params}).pipe(
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
      })
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
