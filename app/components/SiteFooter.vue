<template>
  <footer class="border-t border-ink/10">
    <div class="mx-auto flex max-w-7xl items-start gap-3 px-4 py-6 text-sm text-fog sm:px-6">
      <FallbackImg
        :sources="['/assets/brand/miscripedia-book.png', 'https://www.worldofmiscrits.com/images/e2f02115-cde2-4c0a-9fc6-45779d695c8d.png']"
        alt="" width="51" height="56" class="h-10 w-auto shrink-0"
      />
      <div>
        <p><span class="font-display text-ink" style="font-weight:700">Miscripedia</span> is an unofficial fan guide, not affiliated with the Miscrits game.</p>
        <p class="mt-1">Miscrit data and art come from <a href="https://www.worldofmiscrits.com/" class="font-bold text-moss underline decoration-moss/40 underline-offset-4">worldofmiscrits.com</a>.</p>
      </div>
    </div>
  </footer>
</template>
