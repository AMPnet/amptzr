// Required to fix the issue with quill and google translate:
// Source: https://github.com/quilljs/quill/issues/2286#issuecomment-882705135
export function quillMods(quill: any) {
  const updateScroll = quill.scroll.update.bind(quill.scroll)
  quill.scroll.update = (mutations: any, context: any) => {
    if (!quill.isEnabled()) {
      return
    }
    updateScroll(mutations, context)
  }
  const scrollEnable = quill.scroll.enable.bind(quill.scroll)
  quill.scroll.enable = (enabled = true) => {
    quill.container.classList.toggle('notranslate', enabled)
    scrollEnable(enabled)
  }
  quill.container.classList.toggle('notranslate', quill.isEnabled())
}
