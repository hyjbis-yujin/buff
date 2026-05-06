/**
 * Utility to optimize TMDB image URLs based on viewport
 */
export const getOptimizedImageUrl = (originalUrl, mobileWidth = 768) => {
  // 방어 코드: URL이 없거나 undefined인 경우 빈 문자열 반환
  if (!originalUrl || originalUrl === 'undefined') return '';
  
  if (!originalUrl.includes('image.tmdb.org')) return originalUrl;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < mobileWidth;
  const targetSize = isMobile ? 'w342' : 'w500';

  // Replace size part in URL (e.g., /w500/ or /original/ to /w342/)
  return originalUrl.replace(/\/(w[0-9]+|original)\//, `/${targetSize}/`);
};
