import { NgModule } from '@angular/core'
import { QuillModule } from 'ngx-quill'

@NgModule({
  imports: [
    QuillModule.forRoot({
      formats: [
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'code-block',
        'header',
        'list',
        'script',
        'indent',
        'direction',
        'align',
        'link',
        'image',
        'video',
      ],
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          // [{'size': ['small', false, 'large', 'huge']}], // disable font size changes
          [{ header: [1, 2, false] }],
          // [{'color': []}, {'background': []}], // disable color and background changes
          // [{'font': ['']}], // disable font style changes
          [{ align: [] }],
          ['clean'],
          ['link', 'image', 'video'],
        ],
      },
    }),
  ],
  exports: [QuillModule],
})
export class AppQuillModule {}
