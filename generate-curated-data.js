import fs from 'fs';
import path from 'path';

async function fetchTMDB(endpoint) {
  const API_KEY = process.env.VITE_TMDB_API_KEY;
  const res = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    headers: { Authorization: `Bearer ${API_KEY}`, accept: 'application/json' }
  });
  if (!res.ok) throw new Error('API failed');
  return res.json();
}

const getValidKRProviders = (watchData) => {
  const SUPPORTED_KR_PROVIDERS = [8, 356, 1883, 337, 1881];
  const krProviders = watchData?.results?.KR?.flatrate || [];
  return krProviders
    .filter(p => SUPPORTED_KR_PROVIDERS.includes(p.provider_id))
    .map(p => ({
      id: p.provider_id,
      name: p.provider_name.split(' ')[0],
      logo: `https://image.tmdb.org/t/p/w92${p.logo_path}`
    }));
};

const TMDB_GENRES = {
  10759: "액션", 16: "애니메이션", 35: "코미디", 80: "범죄", 
  99: "다큐", 18: "드라마", 10751: "가족", 10762: "키즈", 
  10764: "리얼리티", 10765: "SF/판타지", 9648: "미스터리",
  28: "액션", 12: "모험", 14: "판타지", 36: "역사", 27: "공포", 
  10402: "음악", 10749: "로맨스", 878: "SF", 53: "스릴러", 
  10752: "전쟁", 37: "서부"
};

const getTagsFromGenreIds = (genreIds) => {
  return (genreIds || []).map(id => TMDB_GENRES[id]).filter(Boolean).map(g => `# ${g}`).slice(0, 3);
};

async function searchMedia(query, type) {
  const res = await fetchTMDB(`/search/${type}?query=${encodeURIComponent(query)}&language=ko-KR`);
  if (res.results && res.results.length > 0) {
    return { id: res.results[0].id, type };
  }
  return null;
}

const THEMES_TO_BUILD = [
  {
    id: "theme-summer", title: "🌿 여름 정주행 모음집 🌿", author: "BUFF 큐레이션 팀", authorType: "official",
    queries: [{q:"갯마을 차차차", t:"tv"}, {q:"그 해 우리는", t:"tv"}, {q:"커피프린스 1호점", t:"tv"}, {q:"여름방학", t:"tv"}, {q:"스물다섯 스물하나", t:"tv"}, {q:"동백꽃 필 무렵", t:"tv"}, {q:"슬기로운 의사생활", t:"tv"}, {q:"어쩌다 발견한 하루", t:"tv"}, {q:"호텔 델루나", t:"tv"}, {q:"나의 아저씨", t:"tv"}]
  },
  {
    id: "theme-action", title: "🎬 액션 쾌감! 실패 없는 정주행 리스트", author: "BUFF 정주행러", authorType: "user",
    queries: [{q:"범죄도시", t:"movie"}, {q:"무빙", t:"tv"}, {q:"베테랑", t:"movie"}, {q:"마이 네임", t:"tv"}, {q:"택시운전사", t:"movie"}, {q:"D.P.", t:"tv"}, {q:"극한직업", t:"movie"}, {q:"비밀의 숲", t:"tv"}, {q:"오징어 게임", t:"tv"}, {q:"빈센조", t:"tv"}]
  },
  {
    id: "theme-romance", title: "💖 설렘 주의! 로맨틱 정주행", author: "사랑꾼 큐레이터", authorType: "user",
    queries: [{q:"눈물의 여왕", t:"tv"}, {q:"사랑의 불시착", t:"tv"}, {q:"태양의 후예", t:"tv"}, {q:"도깨비", t:"tv"}, {q:"선재 업고 튀어", t:"tv"}, {q:"사내맞선", t:"tv"}, {q:"킹더랜드", t:"tv"}, {q:"별에서 온 그대", t:"tv"}, {q:"김비서가 왜 그럴까", t:"tv"}, {q:"쌈, 마이웨이", t:"tv"}]
  },
  {
    id: "theme-thriller", title: "🕵️‍♂️ 한 치 앞도 모르는 미스터리/스릴러", author: "BUFF 오피셜", authorType: "official",
    queries: [{q:"시그널", t:"tv"}, {q:"괴물", t:"tv"}, {q:"마우스", t:"tv"}, {q:"악의 마음을 읽는 자들", t:"tv"}, {q:"비밀의 숲", t:"tv"}, {q:"보이스", t:"tv"}, {q:"손 the guest", t:"tv"}, {q:"지옥", t:"tv"}, {q:"스위트홈", t:"tv"}, {q:"킹덤", t:"tv"}]
  },
  {
    id: "theme-classic", title: "🎞 다시 봐도 명작, 인생 영화 컬렉션", author: "영화 비평가", authorType: "user",
    queries: [{q:"기생충", t:"movie"}, {q:"올드보이", t:"movie"}, {q:"살인의 추억", t:"movie"}, {q:"타짜", t:"movie"}, {q:"신세계", t:"movie"}, {q:"변호인", t:"movie"}, {q:"국제시장", t:"movie"}, {q:"명량", t:"movie"}, {q:"광해, 왕이 된 남자", t:"movie"}, {q:"괴물", t:"movie"}]
  },
  {
    id: "theme-animation", title: "🧸 동심 소환! 어른이들을 위한 애니메이션", author: "BUFF 키즈", authorType: "official",
    queries: [{q:"뽀롱뽀롱 뽀로로", t:"tv"}, {q:"신비아파트", t:"tv"}, {q:"라바", t:"tv"}, {q:"안녕 자두야", t:"tv"}, {q:"꼬마버스 타요", t:"tv"}, {q:"검정고무신", t:"tv"}, {q:"마당을 나온 암탉", t:"movie"}, {q:"터닝메카드", t:"tv"}, {q:"로보카 폴리", t:"tv"}, {q:"짱구는 못말려", t:"tv"}]
  },
  {
    id: "theme-sf", title: "🌌 미지의 세계로! SF & 판타지 대작", author: "BUFF 공식 에디터", authorType: "official",
    queries: [{q:"외계+인 1부", t:"movie"}, {q:"승리호", t:"movie"}, {q:"설국열차", t:"movie"}, {q:"환혼", t:"tv"}, {q:"경이로운 소문", t:"tv"}, {q:"아스달 연대기", t:"tv"}, {q:"지옥", t:"tv"}, {q:"고요의 바다", t:"tv"}, {q:"마녀", t:"movie"}, {q:"신과함께-죄와 벌", t:"movie"}]
  },
  {
    id: "theme-docu", title: "🌍 현실이 더 영화 같은 다큐멘터리", author: "지식 큐레이터", authorType: "user",
    queries: [{q:"나는 신이다", t:"tv"}, {q:"다큐멘터리 3일", t:"tv"}, {q:"님아, 그 강을 건너지 마오", t:"movie"}, {q:"워낭소리", t:"movie"}, {q:"그것이 알고싶다", t:"tv"}, {q:"피지컬: 100", t:"tv"}, {q:"노무현입니다", t:"movie"}, {q:"울지마 톤즈", t:"movie"}, {q:"PD수첩", t:"tv"}, {q:"동물농장", t:"tv"}]
  },
  {
    id: "theme-comedy", title: "🤣 웃음 보장! 배꼽 잡는 코미디 모음", author: "BUFF 꿀잼봇", authorType: "official",
    queries: [{q:"으라차차 와이키키", t:"tv"}, {q:"하이킥! 짧은 다리의 역습", t:"tv"}, {q:"지붕 뚫고 하이킥", t:"tv"}, {q:"순풍산부인과", t:"tv"}, {q:"신서유기", t:"tv"}, {q:"런닝맨", t:"tv"}, {q:"무한도전", t:"tv"}, {q:"극한직업", t:"movie"}, {q:"럭키", t:"movie"}, {q:"아는 형님", t:"tv"}]
  },
  {
    id: "theme-horror", title: "👻 잠 못 드는 밤, 오싹한 공포/스릴러", author: "공포 마니아", authorType: "user",
    queries: [{q:"곡성", t:"movie"}, {q:"부산행", t:"movie"}, {q:"곤지암", t:"movie"}, {q:"장화, 홍련", t:"movie"}, {q:"악마를 보았다", t:"movie"}, {q:"여고괴담", t:"movie"}, {q:"알포인트", t:"movie"}, {q:"사바하", t:"movie"}, {q:"검은 사제들", t:"movie"}, {q:"기담", t:"movie"}]
  }
];

async function run() {
  const list = [];
  for (const theme of THEMES_TO_BUILD) {
    const items = [];
    for (const q of theme.queries) {
      const media = await searchMedia(q.q, q.t);
      if (media) {
        try {
          const details = await fetchTMDB(`/${media.type}/${media.id}?language=ko-KR&append_to_response=watch/providers`);
          if (details.poster_path) {
            items.push({
              id: media.id.toString(),
              title: details.name || details.title,
              mediaType: media.type,
              image: `https://image.tmdb.org/t/p/w500${details.poster_path}`,
              tags: getTagsFromGenreIds(details.genres?.map(g => g.id)),
              providers: getValidKRProviders(details['watch/providers'])
            });
          }
        } catch(e) {}
      }
    }
    list.push({
      id: theme.id,
      title: theme.title,
      author: theme.author,
      authorType: theme.authorType,
      updatedAt: new Date().toISOString(),
      items
    });
    console.log(`Generated theme: ${theme.title} (${items.length} items)`);
  }

  const output = {
    code: 200,
    status: "success",
    message: "success",
    meta: { updatedAt: new Date().toISOString(), totalCount: list.length },
    data: { list }
  };

  fs.writeFileSync(path.join(process.cwd(), 'public', 'data', 'theme-collections.json'), JSON.stringify(output, null, 2));
  console.log('Successfully generated all 10 curated theme-collections.json!');
}

run();
