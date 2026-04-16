// src/services/mappers/sharedMapper.js
import { getProviderById } from '../../constants/providers';
import { getTagsFromGenreIds } from '../../constants/genres';

/**
 * TMDB genres 객체 배열에서 태그 리스트 추출
 */
export const mapGenresToTags = (genres) => {
  return (genres?.map(g => g.name) || [])
    .filter(name => name && name !== '정보 없음')
    .map(name => `# ${name}`)
    .slice(0, 3);
};

/**
 * TMDB watch/providers 응답에서 한국 지원 OTT 리스트 추출
 */
export const mapProviders = (rawProviders) => {
  const krData = rawProviders?.results?.KR;
  const krDeepLink = krData?.link;
  
  return (krData?.flatrate || [])
    .map(p => {
      const meta = getProviderById(p.provider_id);
      if (!meta) return null;
      return {
        id: meta.id,
        name: meta.label,
        logo: meta.logo,
        link: krDeepLink || meta.homeLink
      };
    })
    .filter(Boolean);
};

/**
 * 장르 ID 리스트를 태그로 변환 (목록용)
 */
export const mapGenreIdsToTags = (genreIds) => {
  return getTagsFromGenreIds(genreIds);
};
