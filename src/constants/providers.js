import netflixLogo from '../assets/brands/netflix.png';
import tvingLogo from '../assets/brands/tving.png';
import wavveLogo from '../assets/brands/wavve.png';
import disneyLogo from '../assets/brands/disneyplus.png';
import coupangLogo from '../assets/brands/coupangplay.png';

/**
 * 프로젝트 전체에서 사용하는 OTT 제공처(Provider) 정보의 Single Source of Truth
 */
export const PROVIDERS = {
  8: {
    id: 8,
    key: 'netflix',
    label: '넷플릭스',
    logo: netflixLogo,
    homeLink: 'https://www.netflix.com/kr/'
  },
  1883: {
    id: 1883,
    key: 'tving',
    label: '티빙',
    logo: tvingLogo,
    homeLink: 'https://www.tving.com/'
  },
  356: {
    id: 356,
    key: 'wavve',
    label: '웨이브',
    logo: wavveLogo,
    homeLink: 'https://www.wavve.com/'
  },
  337: {
    id: 337,
    key: 'disney',
    label: '디즈니+',
    logo: disneyLogo,
    homeLink: 'https://www.disneyplus.com/ko-kr'
  },
  1881: {
    id: 1881,
    key: 'coupang',
    label: '쿠팡플레이',
    logo: coupangLogo,
    homeLink: 'https://www.coupangplay.com/'
  }
};

/**
 * 유효한 Provider ID 목록
 */
export const SUPPORTED_PROVIDER_IDS = Object.keys(PROVIDERS).map(Number);

/**
 * ID 기반으로 Provider 정보 가져오기
 */
export const getProviderById = (id) => PROVIDERS[id] || null;

/**
 * Key (영문명) 기반으로 Provider 정보 가져오기
 */
export const getProviderByKey = (key) => {
  return Object.values(PROVIDERS).find(p => p.key === key) || null;
};
