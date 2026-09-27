<script setup lang="ts" generic="T">
// A miscrit picker: an ARIA combobox, because a datalist cannot show the avatars. The page decides what a query
// lists (search) and draws each option (#option slot); this owns the keyboard, pointer and ARIA wiring.
const props = withDefaults(defineProps<{
  id: string
  search: (q: string) => T[]
  placeholder?: string
  describedby?: string
  emptyText?: string
  inputClass?: string
  listLabel?: string
}>(), {
  placeholder: '',
  describedby: undefined,
  emptyText: 'No miscrit by that name.',
  inputClass: 'h-11 w-full rounded-xl border border-line bg-card px-3 text-base placeholder:text-fog',
  listLabel: 'Miscrits',
})
const text = defineModel<string>({ default: '' })
const emit = defineEmits<{
  choose: [item: T]
  // Every time the list opens or refilters, for a live count.
  list: [items: T[]]
  // The native change event: the typed text was committed (blur or Enter with no option active).
  commit: [text: string]
}>()
defineSlots<{
  option(p: { item: T, index: number, active: boolean }): unknown
  // Shown above the options, beside the listbox and describing the input while open (a note on how they are ranked).
  note(p: { items: T[] }): unknown
}>()

const input = ref<HTMLInputElement>()
const listEl = ref<HTMLUListElement>()
const open = ref(false)
const matches = shallowRef<T[]>([]) as Ref<T[]>
const active = ref(-1)
const optId = (i: number) => `${props.id}-opt-${i}`
const slots = useSlots()
const noteId = computed(() => `${props.id}-note`)
const describedBy = computed(() => [props.describedby, open.value && slots.note && noteId.value].filter(Boolean).join(' ') || undefined)

function openList(q = text.value) {
  matches.value = props.search(q)
  active.value = -1
  open.value = true
  emit('list', matches.value)
}
function closeList() {
  open.value = false
  active.value = -1
}
function setActive(i: number) {
  active.value = i
  nextTick(() => document.getElementById(optId(i))?.scrollIntoView({ block: 'nearest' }))
}
function choose(i: number) {
  const item = matches.value[i]
  if (item === undefined) return
  closeList()
  emit('choose', item)
}

function onKeydown(e: KeyboardEvent) {
  const n = matches.value.length
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    if (!open.value) {
      openList()
      if (matches.value.length) setActive(e.key === 'ArrowDown' ? 0 : matches.value.length - 1)
      return
    }
    if (n) setActive(e.key === 'ArrowDown' ? (active.value + 1) % n : (active.value - 1 + n) % n)
  }
  else if (e.key === 'Enter' && open.value && active.value >= 0) {
    e.preventDefault()
    choose(active.value)
  }
  else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    closeList()
  }
}
function onInput(e: Event) {
  // Search the field's own value: a parent-bound model only updates once the parent re-renders.
  const q = (e.target as HTMLInputElement).value
  text.value = q
  openList(q)
}
function onPointermove(i: number) {
  if (i !== active.value) active.value = i
}

defineExpose({ focus: () => input.value?.focus(), openList, closeList })
</script>

<template>
  <div class="relative min-w-0 flex-1">
    <input
      :id="id" ref="input" :value="text" type="text" :placeholder="placeholder" spellcheck="false" autocomplete="off"
      role="combobox" aria-autocomplete="list" :aria-expanded="open" :aria-controls="`${id}-list`"
      :aria-activedescendant="open && active >= 0 ? optId(active) : undefined" :aria-describedby="describedBy"
      :class="inputClass"
      @input="onInput" @keydown="onKeydown" @click="!open && openList()" @blur="closeList"
      @change="emit('commit', text)"
    >
    <!-- pointerdown keeps focus in the input while a pointer picks, so blur does not close the list first. The note
         sits beside the listbox, not in it, since a listbox holds only options. -->
    <div
      v-show="open" :id="`${id}-popup`"
      class="combo-list absolute inset-x-0 top-full z-20 mt-1 max-h-80 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-card p-1 shadow-[0_12px_32px_-12px_rgb(var(--shade)/.35)]"
      @pointerdown.prevent
    >
      <div v-if="$slots.note" :id="noteId"><slot name="note" :items="matches" /></div>
      <ul :id="`${id}-list`" ref="listEl" role="listbox" :aria-label="listLabel">
        <template v-if="matches.length">
          <li
            v-for="(item, i) in matches" :id="optId(i)" :key="i" role="option" :aria-selected="i === active"
            class="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5"
            @click="choose(i)" @pointermove="onPointermove(i)"
          >
            <slot name="option" :item="item" :index="i" :active="i === active" />
          </li>
        </template>
        <li v-else role="option" aria-disabled="true" aria-selected="false" class="px-3 py-2.5 text-sm text-fog">{{ emptyText }}</li>
      </ul>
    </div>
  </div>
</template>
