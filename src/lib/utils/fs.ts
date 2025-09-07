export type ImageFile = {
  handle: FileSystemFileHandle;
  name: string;
  type: string;
  size: number;
};

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/bmp'
]);

export async function pickImageDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!('showDirectoryPicker' in window)) {
    alert('Your browser does not support folder selection (File System Access API).\nUse Chrome/Edge on desktop.');
    return null;
  }
  try {
    // @ts-ignore - types exist in lib.dom but may be partial in TS config
    const dir = await window.showDirectoryPicker({ mode: 'read' });
    return dir as FileSystemDirectoryHandle;
  } catch (e) {
    return null;
  }
}

export async function listImages(dir: FileSystemDirectoryHandle): Promise<ImageFile[]> {
  const out: ImageFile[] = [];
  // @ts-ignore async iterator is supported
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file') continue;
    try {
      const file = await handle.getFile();
      if (IMAGE_TYPES.has(file.type)) {
        out.push({ handle, name: file.name, type: file.type, size: file.size });
      }
    } catch {
      // skip unreadable files
    }
  }
  // Stable sort by name for deterministic layout
  out.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  return out;
}

export async function openFileFromHandle(handle: FileSystemFileHandle): Promise<File> {
  return await handle.getFile();
}

