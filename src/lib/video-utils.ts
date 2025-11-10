
type VideoPlatform = 'youtube' | 'drive' | 'other';

interface VideoDetails {
  platform: VideoPlatform;
  id: string | null;
  embedUrl: string;
  thumbnailUrl?: string;
}

/**
 * Analyse une URL de vidéo pour en extraire les détails, la plateforme, et les URLs d'intégration/miniature.
 * @param url L'URL originale de la vidéo.
 * @returns Un objet VideoDetails ou null si l'URL est invalide.
 */
export function getVideoDetails(url: string): VideoDetails | null {
  if (!url) return null;

  // --- YouTube ---
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      platform: 'youtube',
      id: videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`,
    };
  }

  // --- Google Drive ---
  const driveRegex = /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
  const driveMatch = url.match(driveRegex);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      platform: 'drive',
      id: fileId,
      // L'intégration directe est peu fiable. On passe par uc?export=view pour une tentative de lecture.
      // Le traitement réel se fera côté serveur pour copier le fichier.
      embedUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
      thumbnailUrl: undefined, // Sera généré par une Cloud Function
    };
  }
  
  // --- Autres URLs directes (ex: Firebase Storage, Vimeo Player) ---
  if (url.startsWith('https://') && (url.includes('.mp4') || url.includes('player.vimeo.com'))) {
      return {
          platform: 'other',
          id: null,
          embedUrl: url,
          thumbnailUrl: undefined, // Pourrait être ajouté manuellement
      }
  }

  return null;
}


/**
 * @deprecated Utiliser getVideoDetails pour une analyse complète.
 * Formate une URL de vidéo pour la rendre "embeddable".
 * @param url L'URL originale de la vidéo.
 * @returns L'URL formatée prête à être utilisée dans un lecteur.
 */
export function formatVideoUrl(url: string): string {
    const details = getVideoDetails(url);
    return details ? details.embedUrl : url;
}

/**
 * Pseudo-code pour un appel à une Cloud Function qui traiterait une vidéo Google Drive.
 * @param fileId L'ID du fichier Google Drive.
 * @param courseId L'ID du cours associé.
 * @param videoId L'ID du document vidéo dans Firestore.
 */
export async function processDriveVideo(fileId: string, courseId: string, videoId: string) {
    // Dans une vraie application, cet appel serait sécurisé et probablement
    // déclenché par un trigger Firestore plutôt que par un appel direct du client.
    const endpoint = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/processDriveVideo';
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${firebaseAuthToken}`
        },
        body: JSON.stringify({
            driveFileId: fileId,
            targetFirestorePath: `formations/${courseId}/videos/${videoId}`,
        }),
    });

    if (!response.ok) {
        throw new Error('Le traitement de la vidéo a échoué.');
    }

    return await response.json();
    /*
    Exemple de réponse de la fonction :
    {
        "status": "processing",
        "message": "La copie de la vidéo et la génération de la miniature ont été lancées."
    }
    L'URL finale (Firebase Storage) serait ensuite mise à jour dans le document Firestore par la fonction.
    */
}
