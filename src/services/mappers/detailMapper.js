import { getProviderById } from '../../constants/providers';
import { getTagsFromGenreIds } from '../../constants/genres';
import { normalizeImageUrl } from '../normalizers/contentNormalizer';

export const mapContentDetail = (raw, mediaType) => {
  if (!raw) return null;

  // 1. 공통 필드 정규화
  const title = raw.title || raw.name || raw.original_title || raw.original_name || '제목 없음';
  const releaseDate = raw.release_date || raw.first_air_date || '-';
  
  // 2. 런타임 처리
  let runtime = 0;
  if (mediaType === 'movie') {
    runtime = raw.runtime || 0;
  } else {
    runtime = (raw.episode_run_time && raw.episode_run_time[0]) || 0;
  }

  // 3. 출연진 및 감독
  const cast = raw.credits?.cast?.slice(0, 6).map(c => c.name) || [];
  const director = raw.credits?.crew?.find(c => c.job === 'Director')?.name || 
                   raw.created_by?.[0]?.name || 
                   '정보 없음';

  // 4. OTT 서비스 (Watch Providers)
  const krData = raw['watch/providers']?.results?.KR;
  const krProvidersRaw = krData?.flatrate || [];

  const providers = krProvidersRaw
    .map(p => {
      const meta = getProviderById(p.provider_id);
      if (!meta) return null;
      
      return {
        id: meta.id,
        name: meta.label,
        logo: meta.logo,
        link: meta.homeLink // 서비스 홈페이지로 직접 연결
      };
    })
    .filter(Boolean);

  if (providers.length === 0) return null;

  // 5. 비슷한 콘텐츠 (Enriched)
  const similarItems = (raw.similar?.results || [])
    .map(item => {
      const sProviders = (item['watch/providers']?.results?.KR?.flatrate || [])
        .map(p => getProviderById(p.provider_id))
        .filter(Boolean);

      if (sProviders.length === 0) return null;

      return {
        id: item.id.toString(),
        mediaType: item.media_type || mediaType,
        title: item.title || item.name,
        image: normalizeImageUrl(item.poster_path, 'w500'),
        tags: getTagsFromGenreIds(item.genre_ids),
        providers: sProviders.map(p => ({
          id: p.id,
          name: p.label,
          logo: p.logo
        }))
      };
    })
    .filter(Boolean);

  return {
    id: raw.id.toString(),
    mediaType,
    title,
    releaseDate,
    runtime: runtime > 0 ? `${runtime}분` : '정보 없음',
    description: raw.overview || '상세 정보가 곧 업데이트될 예정입니다.',
    poster: normalizeImageUrl(raw.poster_path, 'w500'),
    backdrop: normalizeImageUrl(raw.backdrop_path, 'original'),
    genres: (raw.genres?.map(g => g.name) || []).filter(name => name && name !== '정보 없음'),
    credits: {
      director,
      cast: cast.join(', ')
    },
    providers,
    similarContent: similarItems
  };
};
