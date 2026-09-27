import type { InjectionKey, Ref } from 'vue'
import type { ListedMiscrit } from './useMiscritList'

/** What the field guide's detail route needs from the list it opens over. */
export interface FieldGuide {
  /** The filtered list, so the detail can step through what the grid shows. */
  shown: Ref<ListedMiscrit[]>
  step: (dir: -1 | 1, fromButton?: boolean) => void
  close: (animate: boolean) => void
  /** Opens the dialog, once the detail has rendered something to focus. */
  shownDetail: () => void
  announce: (text: string) => void
}

const KEY: InjectionKey<FieldGuide> = Symbol('field-guide')

export const provideFieldGuide = (guide: FieldGuide) => provide(KEY, guide)
export const useFieldGuide = () => inject(KEY)!
