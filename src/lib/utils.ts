import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { PlaceHolderImages } from "./placeholder-images";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url?: string) {
  if (url?.startsWith('data:image')) {
    return { imageUrl: url, imageHint: 'custom image' };
  }
  const placeholder = PlaceHolderImages.find((p) => p.id === url);
  if (placeholder) {
    return { imageUrl: placeholder.imageUrl, imageHint: placeholder.imageHint };
  }
  // Fallback for not found or undefined url
  return { imageUrl: 'https://placehold.co/80x80', imageHint: 'placeholder' };
}

/** Picks one of the 4 bundled placeholder images (1-4) for a new team or player. */
export function randomPlaceholderIndex() {
  return (crypto.getRandomValues(new Uint8Array(1))[0] % 4) + 1;
}
