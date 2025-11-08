/**
 * Formate une URL de vidéo pour la rendre "embeddable", qu'elle provienne de YouTube, Google Drive ou d'une autre source.
 * @param url L'URL originale de la vidéo.
 * @returns L'URL formatée prête à être utilisée dans un lecteur.
 */
export function formatVideoUrl(url: string): string {
  if (!url) return '';

  // YouTube:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // -> https://www.youtube.com/embed/VIDEO_ID
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Google Drive:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // -> https://drive.google.com/uc?export=download&id=FILE_ID
  const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }

  // Pour Firebase Storage ou d'autres liens directs, l'URL est déjà utilisable.
  return url;
}
