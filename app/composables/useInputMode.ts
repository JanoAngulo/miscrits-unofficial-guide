// How the last action came in. The layout listens and mirrors it on <html data-input>, so CSS can drop
// transitions after a key (nothing animates on a keyboard action) and a script can skip its choreography.
// Null until the first action, so nothing keyed to either mode plays on first paint.
export type InputMode = 'pointer' | 'key'

export const useInputMode = () => useState<InputMode | null>('input-mode', () => null)
