<template>
  <footer
    v-show="$nav.currentPage > 1 && $nav.currentPage < $nav.total"
    class="slide-footer"
  >
    <span class="footer-title">The Doctor Strange Approach</span>
    <span class="footer-page">{{ $nav.currentPage }} / {{ $nav.total }}</span>
  </footer>
</template>

<style scoped>
.slide-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1.5rem;
  font-size: 0.7rem;
  color: #6b7280;
  pointer-events: none;
  z-index: 100;
}

.footer-title {
  opacity: 0.6;
}

.footer-page {
  opacity: 0.6;
}
</style>
