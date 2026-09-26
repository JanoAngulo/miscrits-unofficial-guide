<script setup lang="ts">
// An image that tries each source in turn and hides itself when none loads.
const props = defineProps<{ sources: string[] }>()

const index = ref(0)
const el = ref<HTMLImageElement>()
const src = computed(() => props.sources[index.value])
const gone = computed(() => index.value >= props.sources.length)

watch(() => props.sources, () => { index.value = 0 })

const next = () => { index.value++ }

// A server-rendered image can fail before hydration attaches @error; catch that here.
onMounted(() => {
  const img = el.value
  if (img?.complete && img.naturalWidth === 0) next()
})
</script>

<template>
  <img ref="el" :src="src" :class="{ invisible: gone }" @error="next">
</template>
