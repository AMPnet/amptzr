export function getWindow() {
  return typeof window !== 'undefined' ? (window as any) : {} as any
}
