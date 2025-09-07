<script lang="ts">
  import OptionsPanel from '$lib/components/OptionsPanel.svelte';
  import ImageGrid from '$lib/components/ImageGrid.svelte';
  import { pickImageDirectory, listImages, type ImageFile } from '$lib/utils/fs';
  import { onMount } from 'svelte';

  let files: ImageFile[] = [];
  let folderName = '';

  async function chooseFolder() {
    const dir = await pickImageDirectory();
    if (!dir) return;
    files = await listImages(dir);
    folderName = (dir as any).name ?? 'Selected folder';
  }

  function keyHandler(e: KeyboardEvent) {
    if (e.key.toLowerCase() === 'f') {
      e.preventDefault();
      chooseFolder();
    }
  }
  onMount(() => {
    window.addEventListener('keydown', keyHandler);
    return () => window.removeEventListener('keydown', keyHandler);
  });
</script>

<style>
  .bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
  }
  .pick {
    padding: 6px 12px; border: 1px solid color-mix(in oklab, currentColor 30%, transparent); border-radius: 6px;
    background: color-mix(in oklab, Canvas 94%, currentColor 6%);
  }
  .name { opacity: 0.8; }
  .empty { padding: 24px; opacity: 0.8; }
  .viewer { height: calc(100% - 102px); }
  .count { font-size: 12px; opacity: 0.7; }
</style>

<OptionsPanel />

<div class="bar">
  <button class="pick" on:click={chooseFolder}>Choose folder… (F)</button>
  {#if folderName}
    <div class="name">{folderName}</div>
    <div class="count">({files.length} images)</div>
  {/if}
  {#if !files.length}
    <div class="empty">Pick a folder to start viewing images. This app runs entirely in your browser.</div>
  {/if}
  <div style="flex:1"></div>
</div>

{#if files.length}
  <div class="viewer">
    <ImageGrid {files} />
  </div>
{/if}

