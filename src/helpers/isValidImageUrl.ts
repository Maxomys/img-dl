const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];

export default function isValidImageUrl(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;
    if (!pathname) {
      return false;
    }
    const lowerCasePath = pathname.toLowerCase();
    return ALLOWED_IMAGE_EXTENSIONS.some((ext) => lowerCasePath.endsWith(ext));
  } catch (_) {
    return false;
  }
}
