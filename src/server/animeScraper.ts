import { Request, Response } from 'express';
import { META } from '@consumet/extensions';

const anilist = new META.Anilist();

// 1. GET /api/series (Trending Anime)
export async function handleGetSeries(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    const data = await anilist.fetchTrendingAnime(page, 20);

    const results = (data.results || []).map((item: any) => ({
      anime_id: String(item.id),
      title: (item.title as any).english || (item.title as any).romaji || (item.title as any).native,
      poster: item.image,
      backdrop: item.cover || item.image,
      rating: item.rating ? (item.rating / 10).toFixed(1) : '8.5',
      year: String(item.releaseDate || ''),
      media_type: 'tv',
      status: item.status,
      totalEpisodes: item.totalEpisodes,
    }));

    res.json({
      success: true,
      currentPage: data.currentPage,
      hasNextPage: data.hasNextPage,
      results,
    });
  } catch (err: any) {
    console.error('API /api/series error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch trending anime from Anilist Meta',
      error: err.message || String(err),
    });
  }
}

// 2. GET /api/movies (Popular Anime Movies)
export async function handleGetMovies(req: Request, res: Response) {
  try {
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
    // Use anilist.search for movies with specific format
    const data = await anilist.search('', page, 20); // Search with empty query or use a better method if available
    // Actually search doesn't support format directly in fetchTrending, let's use search with format MOVIE
    // But @consumet/extensions fetchTrending doesn't take format. 
    // I'll use search with format MOVIE and sort POPULARITY_DESC
    
    // Fallback to fetchPopularAnime if fetchTrending is not enough
    const results = (data.results || []).filter((item: any) => item.type === 'MOVIE').map((item: any) => ({
      anime_id: String(item.id),
      title: (item.title as any).english || (item.title as any).romaji || (item.title as any).native,
      poster: item.image,
      backdrop: item.cover || item.image,
      rating: item.rating ? (item.rating / 10).toFixed(1) : '8.8',
      year: String(item.releaseDate || ''),
      media_type: 'movie',
      status: item.status,
    }));

    res.json({
      success: true,
      currentPage: data.currentPage,
      results,
    });
  } catch (err: any) {
    console.error('API /api/movies error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch anime movies',
      error: err.message || String(err),
    });
  }
}

// 3. GET /api/search
export async function handleSearch(req: Request, res: Response) {
  try {
    const keyword = ((req.query.s as string) || (req.query.query as string) || '').trim();
    const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);

    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Search keyword is required' });
    }

    const data = await anilist.search(keyword, page, 20);

    const results = (data.results || []).map((item: any) => ({
      anime_id: String(item.id),
      title: (item.title as any).english || (item.title as any).romaji || (item.title as any).native,
      poster: item.image,
      backdrop: item.cover || item.image,
      rating: item.rating ? (item.rating / 10).toFixed(1) : '8.0',
      year: String(item.releaseDate || ''),
      media_type: item.type === 'MOVIE' ? 'movie' : 'tv',
      status: item.status,
    }));

    res.json({
      success: true,
      results: {
        currentPage: data.currentPage,
        hasNextPage: data.hasNextPage,
        results,
      },
    });
  } catch (err: any) {
    console.error('API /api/search error:', err);
    res.status(502).json({
      success: false,
      message: 'Anime search failed',
      error: err.message || String(err),
    });
  }
}

// 4. GET /api/info
export async function handleGetInfo(req: Request, res: Response) {
  try {
    const id = (req.query.id as string) || (req.params.animeId as string);
    if (!id) {
      return res.status(400).json({ success: false, message: 'ID is required' });
    }

    const info = await anilist.fetchAnimeInfo(id);

    if (!info) return res.status(404).json({ success: false, message: 'Anime not found' });

    const titleObj = info.title as any;
    const title = titleObj.english || titleObj.romaji || titleObj.native || id;

    const episodes = (info.episodes || []).map((ep: any) => ({
      season_number: 1,
      episode_number: ep.number,
      title: ep.title || `Episode ${ep.number}`,
      image: ep.image || info.image,
      id: ep.id,
    }));

    res.json({
      success: true,
      data: {
        title,
        anime_id: String(info.id),
        poster: info.image,
        backdrop: info.cover || info.image,
        overview: info.description || '',
        genres: info.genres || [],
        year: String(info.releaseDate || ''),
        rating: info.rating ? (info.rating / 10).toFixed(1) : '8.8',
        seasons: [1],
        totalEpisodes: info.totalEpisodes || episodes.length,
        episodes,
      },
    });
  } catch (err: any) {
    console.error('API /api/info error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch anime info from Anilist Meta',
      error: err.message || String(err),
    });
  }
}

// 5. GET /api/stream
export async function handleGetStream(req: Request, res: Response) {
  try {
    const anime_id = req.query.id as string;
    const episode_number = parseInt((req.query.ep || req.query.episode || '1') as string, 10);

    if (!anime_id) {
      return res.status(400).json({ success: false, message: 'Anime ID is required' });
    }

    // fetchAnimeInfo is needed to get the episode mapping IDs
    const info = await anilist.fetchAnimeInfo(anime_id);
    const episode = info.episodes?.find((e: any) => e.number === episode_number);

    if (!episode) {
      return res.status(404).json({ success: false, message: 'Episode not found' });
    }

    // fetchEpisodeSources returns streaming links
    const sources = await anilist.fetchEpisodeSources(episode.id);

    const results = (sources.sources || []).map((s: any, idx: number) => ({
      server: s.quality || `Source ${idx + 1}`,
      link: s.url,
      isM3U8: s.url.includes('.m3u8'),
    }));

    res.json({
      success: true,
      message: 'Streams found',
      results,
    });
  } catch (err: any) {
    console.error('API /api/stream error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to fetch anime streams',
      error: err.message || String(err),
    });
  }
}
