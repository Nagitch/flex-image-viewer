<script lang="ts">
  import { options, type ViewerOptions } from "$lib/stores/options";
  import { get } from "svelte/store";

  let local: ViewerOptions = get(options);
  function apply() {
    // Normalize numeric inputs
    local.gap = Math.max(0, Math.round(local.gap));
    local.minWidth = Math.max(32, Math.round(local.minWidth));
    local.maxWidth = Math.max(local.minWidth, Math.round(local.maxWidth));
    local.concurrentDecode = Math.max(1, Math.min(16, Math.round(local.concurrentDecode)));
    options.set({ ...local });
  }
</script>

<style>
  .panel {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 8px 12px;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px dashed color-mix(in oklab, currentColor 20%, transparent);
    background: color-mix(in oklab, Canvas 92%, currentColor 8%);
  }
  .panel label { opacity: 0.85; }
  .row { display: contents; }
  input[type="number"] { width: 100px; }
  .actions { grid-column: 1 / -1; display: flex; gap: 8px; }
  button { padding: 6px 12px; }
  .hint { grid-column: 1 / -1; font-size: 12px; opacity: 0.75; }
  .switch { display: inline-flex; gap: 6px; align-items: center; }
  .right { justify-self: start; }
  .grow { flex: 1; }
  .compact { font-size: 12px; opacity: 0.8; }
  @media (max-width: 900px) {
    .panel { grid-template-columns: 1fr 1fr; }
  }
  details { grid-column: 1 / -1; }
  summary { cursor: pointer; }
  .inline { display: inline-block; margin-left: 6px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  .tight { display: inline-flex; align-items: center; gap: 12px; }
  .tight input[type="number"] { width: 84px; }
  .tight label { opacity: 0.85; }
  .right-row { grid-column: 1 / -1; display: flex; gap: 16px; flex-wrap: wrap; }
  .sep { height: 1px; background: color-mix(in oklab, currentColor 20%, transparent); grid-column: 1 / -1; }
  .note { font-size: 12px; opacity: 0.7; }
  kbd { border: 1px solid color-mix(in oklab, currentColor 30%, transparent); border-bottom-width: 2px; padding: 0 4px; border-radius: 4px; font-family: ui-monospace, monospace; }
  .small { font-size: 12px; opacity: .85; }
  .nowrap { white-space: nowrap; }
</style>

<div class="panel">
  <div class="right-row">
    <div class="tight">
      <label>Gap</label>
      <input type="number" bind:value={local.gap} min="0" max="64" step="1" on:change={apply}>
    </div>
    <div class="tight">
      <label>Min width</label>
      <input type="number" bind:value={local.minWidth} min="32" max={local.maxWidth} step="8" on:change={apply}>
    </div>
    <div class="tight">
      <label>Max width</label>
      <input type="number" bind:value={local.maxWidth} min={local.minWidth} max="2048" step="8" on:change={apply}>
    </div>
    <div class="tight">
      <label class="switch">
        <input type="checkbox" bind:checked={local.enlargeSmall} on:change={apply}>
        <span>Enlarge small images</span>
      </label>
    </div>
    <div class="tight">
      <label>Concurrent decode</label>
      <input type="number" bind:value={local.concurrentDecode} min="1" max="16" step="1" on:change={apply}>
    </div>
    <div class="grow"></div>
    <div class="small nowrap">Press <kbd>F</kbd> to choose a folder</div>
  </div>
</div>

