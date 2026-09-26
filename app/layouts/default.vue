<script setup lang="ts">
const route = useRoute()

// Each page is a chapter of the guidebook; its headings take the chapter colour.
useHead({ htmlAttrs: { 'data-chapter': () => route.meta.chapter ?? 'field' } })

// The site bar sticks. Its height places the field guide's sticky filters under it, and --stick-h keeps
// scrolled-to focus and jump targets clear of whatever is stuck at the top.
let watcher: ResizeObserver | undefined
function measure() {
  const root = document.documentElement
  const bar = document.getElementById('site-bar')
  const filters = document.getElementById('filters')
  const b = bar?.offsetHeight ?? 0
  const f = filters && getComputedStyle(filters).position === 'sticky' ? filters.offsetHeight : 0
  root.style.setProperty('--bar-h', `${b}px`)
  root.style.setProperty('--stick-h', `${b + f}px`)
}
function observe() {
  watcher?.disconnect()
  watcher = new ResizeObserver(measure)
  for (const id of ['site-bar', 'filters']) {
    const el = document.getElementById(id)
    if (el) watcher.observe(el)
  }
  measure()
}

onMounted(() => {
  observe()
  addEventListener('resize', measure)
})
watch(() => route.path, () => nextTick(observe))
onBeforeUnmount(() => {
  watcher?.disconnect()
  removeEventListener('resize', measure)
})
</script>

<template>
  <div>
    <SiteBar />
    <slot />
  </div>
</template>
