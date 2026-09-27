<script setup lang="ts">
const route = useRoute()

const PAGES = [
  { to: '/', chapter: 'field', short: 'Guide', long: 'Field guide' },
  { to: '/catch', chapter: 'catch', short: 'Catch', long: 'Catching' },
  { to: '/breed', chapter: 'breed', short: 'Breed', long: 'Breeding' },
  { to: '/teams', chapter: 'teams', short: 'Teams', long: 'Teams and PvP' },
  { to: '/relics', chapter: 'relics', short: 'Relics', long: 'Relics and bonus' },
]
</script>

<template>
  <header id="site-bar" class="sticky top-0 z-20 border-b border-ink/10 bg-paper/95 backdrop-blur">
    <!-- From 480px the tabs fit between logo and switch, so a landscape phone keeps one short row. -->
    <div class="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm min-[480px]:flex-nowrap sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-x-6 md:py-3">
      <NuxtLink to="/" class="brand flex min-h-11 items-center justify-self-start">
        <FallbackImg
          :sources="['/assets/brand/miscrits-logo.png', 'https://www.worldofmiscrits.com/images/d1b7b11f-e431-4c85-b851-dfa7b9407505.png']"
          alt="Miscripedia home" width="443" height="196" class="h-7 w-auto md:h-9"
        />
      </NuxtLink>
      <nav aria-label="Pages" class="order-last w-full min-[480px]:order-none min-[480px]:w-auto min-[480px]:flex-1">
        <ul class="grid grid-cols-5 gap-1 md:flex">
          <li v-for="p in PAGES" :key="p.to">
            <NuxtLink
              :to="p.to"
              class="nav-link flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-1 text-xs font-bold md:[@media(pointer:fine)]:min-h-0 md:flex-row md:gap-1.5 md:rounded-full md:px-3 md:py-1.5 md:text-sm"
              :class="{ press: route.path !== p.to }"
            >
              <span class="nav-dot" :style="{ background: `var(--chf-${p.chapter})` }" aria-hidden="true" />
              <span class="lg:hidden">{{ p.short }}</span><span class="hidden lg:inline">{{ p.long }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>
      <ThemeSwitch />
    </div>
  </header>
</template>
