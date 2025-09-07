<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js')
        .catch((e) => console.warn('SW registration failed', e));
    }
  });
</script>

<style>
  :root {
    color-scheme: light dark;
  }
  html, body, #svelte {
    height: 100%;
  }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu, Cantarell, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  }
  .app {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid color-mix(in oklab, currentColor 20%, transparent);
  }
  main {
    flex: 1 1 auto;
    overflow: hidden;
  }
  .title {
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .spacer { flex: 1; }
</style>

<div class="app">
  <header>
    <div class="title">Flex Image Viewer</div>
    <div class="spacer"></div>
    <a href="/" aria-label="Home">🏠</a>
  </header>
  <main>
    <slot />
  </main>
</div>

