import { writable } from 'svelte/store';

export type ViewerOptions = {
  gap: number; // px between tiles
  minWidth: number; // min rendered width per item
  maxWidth: number; // max rendered width per item
  enlargeSmall: boolean; // allow upscaling beyond natural size
  concurrentDecode: number; // how many images to decode in parallel
};

export const defaultOptions: ViewerOptions = {
  gap: 8,
  minWidth: 160,
  maxWidth: 640,
  enlargeSmall: true,
  concurrentDecode: 6
};

export const options = writable<ViewerOptions>({ ...defaultOptions });

