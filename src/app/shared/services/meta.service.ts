import {Injectable} from '@angular/core'
import {Meta, Title} from '@angular/platform-browser'

@Injectable({
  providedIn: 'root',
})
export class MetaService {

  constructor(private meta: Meta,
              private title: Title) {
  }

  setMeta(data: MetaData) {
    this.title.setTitle(data.title)
    this.meta.addTag({property: 'og:title', content: data.title})
    this.meta.addTag({property: 'og:description', content: data.description})
    this.meta.addTag({property: 'og:image', content: data.imageURL})
    this.meta.addTag({property: 'og:url', content: data.contentURL})
    this.meta.addTag({name: 'twitter:card', content: 'summary_large_image'})
  }
}

interface MetaData {
  title: string,
  description: string,
  imageURL: string,
  contentURL: string,
}
