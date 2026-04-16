// src/services/normalizers/contentNormalizer.js

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

/**
 * TMDB 이미지 경로를 풀 URL로 변환
 */
export const normalizeImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  const baseUrl = size === 'original' ? `${IMAGE_BASE_URL}original` : `${IMAGE_BASE_URL}${size}`;
  return `${baseUrl}${path}`;
};

/**
 * 개봉/방영 날짜 정규화
 */
export const normalizeDate = (dateString) => {
  return dateString || '-';
};

/**
 * 런타임 정규화
 */
export const normalizeRuntime = (minutes) => {
  return minutes > 0 ? `${minutes}분` : '정보 없음';
};
