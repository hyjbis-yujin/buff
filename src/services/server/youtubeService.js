/**
 * Server-only YouTube Service
 * Handles collection and filtering of original variety show content.
 */
import { fetchYoutube } from './mediaFetcher.js';
import { YOUTUBE_CONFIG } from '../../constants/mediaConfig.js';

/**
 * Format view count for display
 */
export function formatViewCount(count) {
  if (!count) return '조회수 0회';
  const num = parseInt(count, 10);
  if (num >= 10000) {
    return `조회수 ${(num / 10000).toFixed(1)}만회`.replace('.0', '');
  }
  return `조회수 ${num}회`;
}

/**
 * ISO 8601 Duration (PT1H2M3S) parser
 */
function parsePTDuration(pt) {
  if (!pt) return 0;
  const match = pt.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0, 10);
  const m = parseInt(match[2] || 0, 10);
  const s = parseInt(match[3] || 0, 10);
  return h * 3600 + m * 60 + s;
}

/**
 * Filter for original variety shows (exclude shorts/teasers)
 */
export function isOriginalVariety(snippet, contentDetails) {
  const title = (snippet.title || '').toLowerCase();
  const desc = (snippet.description || '').toLowerCase();
  
  const blackList = YOUTUBE_CONFIG.BLACKLIST_KEYWORDS;
  const hasBlackList = blackList.some(k => title.includes(k.toLowerCase()) || desc.includes(k.toLowerCase()));
  if (hasBlackList) return false;

  if (contentDetails && contentDetails.duration) {
    const durationSeconds = parsePTDuration(contentDetails.duration);
    if (durationSeconds <= YOUTUBE_CONFIG.MIN_DURATION_SECONDS) {
      return false;
    }
  }
  
  return true;
}

/**
 * Core YouTube Data Collection Logic
 */
export async function getCuratedYoutubeList() {
  const videoList = [];
  
  // 1. Get channel profile images
  const channelIds = YOUTUBE_CONFIG.CHANNELS.map(c => c.id).join(',');
  const channelRes = await fetchYoutube(`/channels?part=snippet&id=${channelIds}`);
  const channelThumbMap = {};
  (channelRes.items || []).forEach(item => {
    channelThumbMap[item.id] = item.snippet.thumbnails?.default?.url;
  });

  // 2. Fetch videos per channel
  for (const channel of YOUTUBE_CONFIG.CHANNELS) {
    const searchRes = await fetchYoutube(`/search?part=snippet&channelId=${channel.id}&maxResults=${YOUTUBE_CONFIG.SEARCH_DEPTH}&order=date&type=video`);
    
    const items = searchRes.items || [];
    const videoIds = items.map(i => i.id.videoId).join(',');
    if (!videoIds) continue;

    const statsRes = await fetchYoutube(`/videos?part=snippet,statistics,contentDetails&id=${videoIds}`);
    
    const detailedItems = statsRes.items || [];
    let channelVideoCount = 0;

    for (const item of detailedItems) {
      if (channelVideoCount >= YOUTUBE_CONFIG.MAX_VIDEOS_PER_CHANNEL) break;

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
          channelImage: channelThumbMap[channel.id] || null,
          viewCount: formatViewCount(item.statistics?.viewCount),
          url: `https://www.youtube.com/watch?v=${item.id}`,
          publishedAt: item.snippet.publishedAt
        });
        channelVideoCount++;
      }
    }
  }

  return videoList
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, YOUTUBE_CONFIG.TOTAL_RESULT_COUNT);
}
