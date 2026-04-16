import { useNavigate } from 'react-router-dom';

/**
 * 콘텐츠 상세 페이지 네비게이션을 위한 공통 커스텀 훅
 */
const useContentNavigation = () => {
  const navigate = useNavigate();

  const goToDetail = (mediaType, id) => {
    if (!mediaType || !id) {
      console.warn('Navigation failed: mediaType and id are required.', { mediaType, id });
      return;
    }
    navigate(`/detail/${mediaType}/${id}`);
  };

  return { goToDetail };
};

export default useContentNavigation;
