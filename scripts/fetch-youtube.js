const fs = require('fs');
const path = require('path');
const { loadEnv, ensureEnv } = require('./lib/env-helper');
const { fetchYouTube, formatViewCount, isOriginalVariety } = require('./lib/youtube-helper');

// 1. 환경 변수 로드
loadEnv();

const { YOUTUBE_CONFIG } = require('./lib/config');

// API 키 체크 (없으면 스크립트 중단하되, fetch-recommends처럼 에러 메시지 출력)
const API_KEY = process.env.YOUTUBE_API_KEY;

// 채널 리스트 (뜬뜬, 십오야, TEO, 요정재형 등) config 연동
const CHANNELS = YOUTUBE_CONFIG.CHANNELS;

async function fetchYoutubeData() {
  console.log("=========================================");
  console.log("🚀 유튜브 오리지널 예능 데이터 수집 시작");
  console.log("=========================================\n");

  if (!API_KEY) {
    console.warn("⚠️ YOUTUBE_API_KEY가 설정되지 않았습니다. 수집을 취소합니다.");
    console.info(">> .env 파일에 YOUTUBE_API_KEY를 추가하신 후 다시 시도해 주세요.");
    return;
  }

  try {
    const videoList = [];
    
    // [New] 채널 상세 정보(프로필 이미지) 일괄 조회
    const channelIds = CHANNELS.map(c => c.id).join(',');
    const channelRes = await fetchYouTube(`/channels?part=snippet&id=${channelIds}`, API_KEY);
    const channelThumbMap = {};
    (channelRes.items || []).forEach(item => {
      channelThumbMap[item.id] = item.snippet.thumbnails?.default?.url;
    });

    for (const channel of CHANNELS) {
      console.log(`[Channel] '${channel.name}' 최신 영상 조회 중...`);
      
      // 1. 채널의 최신 동영상 검색 (충분한 후보군을 위해 SEARCH_DEPTH 만큼 조회)
      const searchUrl = `/search?part=snippet&channelId=${channel.id}&maxResults=${YOUTUBE_CONFIG.SEARCH_DEPTH}&order=date&type=video`;
      const searchRes = await fetchYouTube(searchUrl, API_KEY);
      
      const items = searchRes.items || [];
      const videoIds = items.map(i => i.id.videoId).join(',');

      // 2. 영상 상세 통계 조회 (조회수 및 영상 길이 등)
      // Shorts 필터링을 위해 contentDetails(duration) 추가
      const statsUrl = `/videos?part=snippet,statistics,contentDetails&id=${videoIds}`;
      const statsRes = await fetchYouTube(statsUrl, API_KEY);
      
      const detailedItems = statsRes.items || [];
      let channelVideoCount = 0;

      for (const item of detailedItems) {
        // 1. 채널당 최대 노출 수 제한 (다양성 확보)
        if (channelVideoCount >= YOUTUBE_CONFIG.MAX_VIDEOS_PER_CHANNEL) break;

        // 2. 제목 유사도/중복 체크 (완전 일치 또는 매우 유사한 제목 제외)
        const normalizedTitle = item.snippet.title.replace(/\s+/g, '').toLowerCase();
        const isDuplicate = videoList.some(v => 
          v.title.replace(/\s+/g, '').toLowerCase() === normalizedTitle
        );
        if (isDuplicate) continue;

        if (isOriginalVariety(item.snippet, item.contentDetails)) {
          videoList.push({
            videoId: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            channelName: channel.name,
            channelImage: channelThumbMap[channel.id] || null, // 채널 프로필 이미지 추가
            viewCount: formatViewCount(item.statistics?.viewCount),
            url: `https://www.youtube.com/watch?v=${item.id}`,
            publishedAt: item.snippet.publishedAt
          });
          channelVideoCount++;
        }
      }
    }

    // 최신순 정렬 후 상위 TOTAL_RESULT_COUNT개 선별
    const finalItems = videoList
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, YOUTUBE_CONFIG.TOTAL_RESULT_COUNT);

    console.log(`\n[Phase 3] ✅ 영상 선별 완료: 총 ${finalItems.length}개\n`);

    if (finalItems.length < 3) {
      throw new Error("수집된 예능 영상이 너무 적습니다.");
    }

    const finalJSON = {
      code: 200,
      status: "success",
      message: "success",
      meta: {
        updatedAt: new Date().toISOString(),
        totalCount: finalItems.length
      },
      data: {
        list: finalItems
      }
    };

    const outPath = path.resolve(__dirname, '../public/data/youtube.json');
    fs.writeFileSync(outPath, JSON.stringify(finalJSON, null, 2), 'utf8');
    
    console.log(`[Phase 4] 💾 성공적으로 저장되었습니다.\n>> PATH: ${outPath}`);

  } catch (err) {
    console.error("\n💥 [유튜브 수집 파이프라인 셧다운]");
    console.error("이유: " + err.message);
    process.exit(1);
  }
}

fetchYoutubeData();
