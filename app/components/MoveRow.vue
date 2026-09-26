<script setup lang="ts">
import type { Move } from '#shared/types/miscrit'

// A ruled row, not a card: the learn order rides on the icon, the kind follows the name,
// and the enchant bonus closes the facts line instead of taking one of its own.
const props = defineProps<{ move: Move, n: number }>()
const facts = computed(() => moveFacts(props.move))
</script>

<template>
  <li class="move">
    <span class="move-icon">
      <!-- Move icons are the game's own, picked by what the move does (see abilityIcon). -->
      <FallbackImg
        v-if="move.icon"
        :sources="[`/assets/abilities/${move.icon}.png`, `https://www.worldofmiscrits.com/${move.icon}.png`]"
        alt="" width="32" height="32" loading="lazy" class="h-8 w-8 shrink-0"
      />
      <ElementIcon v-else :element="move.element" class="h-8 w-8" />
      <span class="move-no"><span class="sr-only">Move </span>{{ n }}</span>
    </span>
    <div class="min-w-0">
      <h4 class="flex flex-wrap items-baseline gap-x-2"><span class="font-display text-base leading-snug">{{ move.name }}</span><span class="text-xs text-fog">{{ moveKind(move) }}</span></h4>
      <p class="mt-0.5 text-sm leading-snug">{{ move.desc }}</p>
      <ul v-if="facts.length || move.enchant_desc" class="mt-2 flex flex-wrap gap-1" aria-label="Move facts">
        <li v-for="(f, i) in facts" :key="i" class="fact" :class="{ 'fact-key': f.key }">{{ f.text }}</li>
        <li v-if="move.enchant_desc" class="fact fact-enchant">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 20l-2.2-6.6L3 11l6.8-2.4z" /></svg><span class="font-normal">Enchanted</span> {{ move.enchant_desc }}
        </li>
      </ul>
    </div>
  </li>
</template>
