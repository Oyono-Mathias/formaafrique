'use client';

import type { Course, Module, Video } from './types';

/**
 * Contexte requis pour formater une entité pour l'embedding.
 */
interface EmbeddingContext {
  course: Pick<Course, 'title' | 'keywords' | 'summary'>;
  module?: Pick<Module, 'title' | 'summary'>;
}

/**
 * Formate le texte d'une vidéo pour l'embedding.
 * @param video L'objet vidéo.
 * @param context Le contexte contenant les informations de la formation et du module.
 * @returns La chaîne de caractères formatée.
 */
function formatVideoForEmbedding(video: Video, context: EmbeddingContext): string {
  const formationTitle = context.course.title;
  const moduleTitle = context.module?.title;
  const videoTitle = video.title;
  const duration = video.duration ? `${video.duration} secondes` : 'Durée non spécifiée';
  const keywords = (context.course.keywords || []).join(', ');

  return `${formationTitle} — ${moduleTitle} — Vidéo: ${videoTitle}. Durée: ${duration}. Mots-clés: ${keywords}.`;
}

/**
 * Formate le texte d'un module pour l'embedding.
 * @param module L'objet module.
 * @param context Le contexte contenant les informations de la formation.
 * @param videoCount Le nombre de vidéos dans le module.
 * @returns La chaîne de caractères formatée.
 */
function formatModuleForEmbedding(module: Module, context: EmbeddingContext, videoCount: number): string {
  const formationTitle = context.course.title;
  const moduleTitle = module.title;
  const summary = module.summary;

  return `${formationTitle} — Module: ${moduleTitle}. Résumé: ${summary}. Contient ${videoCount} vidéo(s).`;
}

/**
 * Formate le texte d'une formation pour l'embedding.
 * @param course L'objet formation.
 * @returns La chaîne de caractères formatée.
 */
function formatCourseForEmbedding(course: Course): string {
  const formationTitle = course.title;
  const summary = course.summary;
  const keywords = (course.keywords || []).join(', ');

  return `${formationTitle}. Résumé: ${summary}. Mots clés: ${keywords}.`;
}

type Entity =
  | { type: 'video'; data: Video; context: Required<EmbeddingContext>; videoCount?: never }
  | { type: 'module'; data: Module; context: EmbeddingContext; videoCount: number }
  | { type: 'course'; data: Course; context?: never; videoCount?: never };

/**
 * Fonction principale pour formater le texte d'une entité avant de générer un embedding.
 * @param entity Un objet contenant le type de l'entité, ses données et le contexte nécessaire.
 * @returns Une chaîne de caractères normalisée prête pour l'embedding.
 */
export function formatForEmbedding(entity: Entity): string {
  switch (entity.type) {
    case 'video':
      return formatVideoForEmbedding(entity.data, entity.context);
    case 'module':
      return formatModuleForEmbedding(entity.data, entity.context, entity.videoCount);
    case 'course':
      return formatCourseForEmbedding(entity.data);
    default:
      console.warn('Type d\'entité non reconnu pour le formatage d\'embedding.');
      return '';
  }
}
