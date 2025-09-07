export type ItemMeta = {
  id: string;
  aspect: number; // width / height
  naturalWidth: number;
  naturalHeight: number;
};

export type LayoutOptions = {
  containerWidth: number;
  gap: number;
  minWidth: number;
  maxWidth: number;
  enlargeSmall: boolean;
};

export type PlacedItem = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  column: number;
};

export type MasonryLayout = {
  items: PlacedItem[];
  width: number;
  height: number;
  columns: number;
  columnWidth: number;
};

// Compute a column-based masonry layout by placing each item in the shortest column.
export function computeMasonryLayout(metas: ItemMeta[], opts: LayoutOptions): MasonryLayout {
  const { containerWidth, gap, minWidth, maxWidth, enlargeSmall } = opts;
  const innerWidth = Math.max(0, containerWidth);
  if (innerWidth <= 0) return { items: [], width: innerWidth, height: 0, columns: 1, columnWidth: innerWidth };

  // Determine column width by clamping between min and max
  // Start with an optimistic column count derived from minWidth
  let columns = Math.max(1, Math.floor((innerWidth + gap) / (minWidth + gap)));
  // Compute column width respecting maxWidth
  let columnWidth = Math.min(maxWidth, Math.floor((innerWidth - gap * (columns - 1)) / columns));
  if (columnWidth < minWidth) {
    columns = Math.max(1, columns - 1);
    columnWidth = Math.floor((innerWidth - gap * (columns - 1)) / columns);
  }

  const colHeights = Array(columns).fill(0) as number[];
  const colX = Array.from({ length: columns }, (_, i) => i * (columnWidth + gap));

  const placed: PlacedItem[] = [];
  for (const meta of metas) {
    const aspect = meta.aspect > 0 ? meta.aspect : 1;
    // Desired width is the columnWidth, but avoid upscaling if not allowed
    let renderWidth = columnWidth;
    if (!enlargeSmall && meta.naturalWidth > 0) {
      renderWidth = Math.min(renderWidth, meta.naturalWidth);
    }
    renderWidth = Math.max(minWidth, Math.min(maxWidth, renderWidth));
    const renderHeight = Math.round(renderWidth / aspect);

    // Choose shortest column
    let col = 0;
    let minH = colHeights[0];
    for (let i = 1; i < columns; i++) {
      if (colHeights[i] < minH) {
        minH = colHeights[i];
        col = i;
      }
    }

    const x = colX[col];
    const y = colHeights[col];
    placed.push({ id: meta.id, x, y, width: renderWidth, height: renderHeight, column: col });
    colHeights[col] += renderHeight + gap;
  }

  const height = colHeights.length ? Math.max(...colHeights) - gap : 0;
  return { items: placed, width: innerWidth, height: Math.max(0, height), columns, columnWidth };
}

