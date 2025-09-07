<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { options } from '$lib/stores/options';
  import type { ViewerOptions } from '$lib/stores/options';
  import type { ImageFile } from '$lib/utils/fs';
  import { openFileFromHandle } from '$lib/utils/fs';
  import { computeMasonryLayout, type ItemMeta, type MasonryLayout } from '$lib/utils/layout';
  import { tick } from 'svelte';

  export let files: ImageFile[] = [];

  let container: HTMLDivElement;
  let containerWidth = 0;
  let layout: MasonryLayout = { items: [], width: 0, height: 0, columns: 1, columnWidth: 0 };
  let metas: ItemMeta[] = [];
  let opts: ViewerOptions;
  const unsub = options.subscribe((v) => {
    opts = v;
    scheduleLayout();
  });

  onDestroy(unsub);

  // Visibility observer to lazy attach object URLs
  let io: IntersectionObserver;
  const visible = new Set<string>();
  const imgSrc = new Map<string, string>();

  // Concurrency-limited image dimension loader
  const pending: Array<() => Promise<void>> = [];
  let running = 0;
  let cancelled = false;
  function queue(task: () => Promise<void>) {
    pending.push(task);
    pump();
  }
  function pump() {
    while (running < (opts?.concurrentDecode ?? 4) && pending.length) {
      const task = pending.shift()!;
      running++;
      task().finally(() => {
        running--;
        if (!cancelled) pump();
      });
    }
  }

  async function buildMetas() {
    metas = [];
    cancelled = true; // cancel outstanding queue
    await tick();
    cancelled = false;
    running = 0; pending.length = 0; imgSrc.clear(); visible.clear();

    // seed metas with placeholder square to allow quick first layout
    metas = files.map((f, i) => ({ id: f.name + ':' + i, aspect: 1, naturalWidth: 0, naturalHeight: 0 }));
    scheduleLayout();

    // progressively refine with real dimensions
    files.forEach((f, i) => {
      queue(async () => {
        if (cancelled) return;
        try {
          const file = await openFileFromHandle(f.handle);
          const url = URL.createObjectURL(file);
          // use createImageBitmap for faster decode without DOM
          const bmp = await createImageBitmap(file);
          const w = bmp.width, h = bmp.height;
          bmp.close();
          metas[i] = { id: metas[i].id, aspect: Math.max(0.01, w / h), naturalWidth: w, naturalHeight: h };
          // keep url for later src assignment
          imgSrc.set(metas[i].id, url);
          scheduleLayout();
        } catch {
          // ignore broken images
        }
      });
    });
  }

  let raf = 0;
  function scheduleLayout() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!container) return;
      containerWidth = container.clientWidth;
      if (!opts) return;
      layout = computeMasonryLayout(metas, {
        containerWidth,
        gap: opts.gap,
        minWidth: opts.minWidth,
        maxWidth: opts.maxWidth,
        enlargeSmall: opts.enlargeSmall
      });
    });
  }

  let ro: ResizeObserver;
  onMount(() => {
    ro = new ResizeObserver(() => scheduleLayout());
    ro.observe(container);
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.id!;
        if (e.isIntersecting) visible.add(id); else visible.delete(id);
      }
    }, { root: container, rootMargin: '512px' });
    return () => {
      ro.disconnect();
      io.disconnect();
      cancelled = true;
      for (const [, url] of imgSrc) URL.revokeObjectURL(url);
      imgSrc.clear();
    };
  });

  $: if (files) buildMetas();
</script>

<style>
  .wrap {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    background: color-mix(in oklab, Canvas 96%, currentColor 4%);
  }
  .canvas {
    position: relative;
    margin: 0 auto;
  }
  .item {
    position: absolute;
    box-sizing: border-box;
    border-radius: 4px;
    overflow: hidden;
    background: color-mix(in oklab, Canvas 80%, currentColor 20%);
  }
  img { display: block; width: 100%; height: 100%; object-fit: contain; background: transparent; }
  .ph {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(45deg,
      color-mix(in oklab, currentColor 12%, transparent),
      color-mix(in oklab, currentColor 12%, transparent) 10px,
      transparent 10px, transparent 20px);
    opacity: 0.4;
  }
</style>

<div class="wrap" bind:this={container}>
  <div class="canvas" style={`width:${layout.width}px;height:${layout.height}px`}>
    {#each layout.items as it (it.id)}
      <div
        class="item"
        style={`left:${it.x}px;top:${it.y}px;width:${it.width}px;height:${it.height}px`}
        data-id={it.id}
        use:observe>
        {#if visible.has(it.id) && imgSrc.get(it.id)}
          <img alt={it.id} src={imgSrc.get(it.id)} loading="lazy" decoding="async" />
        {:else}
          <div class="ph" />
        {/if}
      </div>
    {/each}
  </div>
</div>

<script lang="ts">
  // action to hook intersection observer per item
  function observe(el: Element) {
    io.observe(el);
    return { destroy() { io.unobserve(el); } };
  }
</script>

