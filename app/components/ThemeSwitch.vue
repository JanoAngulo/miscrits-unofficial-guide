<script setup lang="ts">
// Theme: dark unless light is picked. The pick is shared by every page and every open tab.
const colorMode = useColorMode()

// The server renders dark; which button is pressed is only known once the stored pick is read.
const mounted = ref(false)
const pressed = (theme: string) => mounted.value && colorMode.value === theme

// A theme change repaints in one frame, with the colour transitions held off.
function snap(change: () => void) {
  const root = document.documentElement
  root.classList.add('theme-snap')
  change()
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-snap')))
}

function pick(theme: 'light' | 'dark') {
  snap(() => { colorMode.preference = theme })
}

function onStorage(e: StorageEvent) {
  if (e.key === 'miscripedia.theme') pick(e.newValue === 'light' ? 'light' : 'dark')
}

onMounted(() => {
  snap(() => { mounted.value = true })
  addEventListener('storage', onStorage)
})
onBeforeUnmount(() => removeEventListener('storage', onStorage))
</script>

<template>
  <div role="group" aria-label="Theme" class="ml-auto flex rounded-full border border-line p-px md:justify-self-end">
    <button type="button" :aria-pressed="pressed('light')" class="theme-btn press inline-flex h-9 w-11 items-center justify-center gap-1.5 rounded-full font-bold text-fog lg:h-8 lg:w-auto lg:px-2.5" @click="pick('light')">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></svg>
      <span class="max-lg:sr-only">Light</span>
    </button>
    <button type="button" :aria-pressed="pressed('dark')" class="theme-btn press inline-flex h-9 w-11 items-center justify-center gap-1.5 rounded-full font-bold text-fog lg:h-8 lg:w-auto lg:px-2.5" @click="pick('dark')">
      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" /></svg>
      <span class="max-lg:sr-only">Dark</span>
    </button>
  </div>
</template>
