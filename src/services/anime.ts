import { AnimeListItem, AnimeDetails, AnimeStreamResponse, AnimeStreamSource } from '../types';

export async function getAnimeSeries(page: number = 1): Promise<{
  results: AnimeListItem[];
  currentPage: number;
  totalPages: number;
}> {
  try {
    const res = await fetch(`/api/series?page=${page}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API HTTP Error ${res.status}`);
    }
    const data = await res.json();
    return {
      results: data.results || [],
      currentPage: data.currentPage || page,
      totalPages: data.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error fetching anime series:', error);
    throw error;
  }
}

export async function getAnimeMovies(page: number = 1): Promise<{
  results: AnimeListItem[];
  currentPage: number;
  totalPages: number;
}> {
  try {
    const res = await fetch(`/api/movies?page=${page}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API HTTP Error ${res.status}`);
    }
    const data = await res.json();
    return {
      results: data.results || [],
      currentPage: data.currentPage || page,
      totalPages: data.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error fetching anime movies:', error);
    throw error;
  }
}

export async function searchAnime(
  query: string,
  page: number = 1
): Promise<{
  results: AnimeListItem[];
  currentPage: number;
  totalPages: number;
}> {
  try {
    const res = await fetch(`/api/search?s=${encodeURIComponent(query)}&page=${page}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API HTTP Error ${res.status}`);
    }
    const data = await res.json();
    const inner = data.results;
    return {
      results: inner?.results || [],
      currentPage: inner?.currentPage || page,
      totalPages: inner?.totalPages || 1,
    };
  } catch (error: any) {
    console.error('Error searching anime:', error);
    throw error;
  }
}

export async function getAnimeInfo(
  animeId: string,
  isMovie: boolean = false
): Promise<AnimeDetails | null> {
  try {
    const res = await fetch(`/api/info?id=${encodeURIComponent(animeId)}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API HTTP Error ${res.status}`);
    }
    const data = await res.json();
    if (!data.success || !data.data) return null;
    
    const info = data.data;
    return {
      ...info,
      media_type: isMovie ? 'movie' : 'tv',
      languages: info.languages || ['Japanese', 'English', 'Multi'],
    };
  } catch (error: any) {
    console.error('Error fetching anime info:', error);
    throw error;
  }
}

export async function getAnimeStreams(
  animeId: string,
  season: number = 1,
  episode: number = 1,
  isMovie: boolean = false
): Promise<AnimeStreamResponse | null> {
  try {
    const res = await fetch(`/api/stream?id=${encodeURIComponent(animeId)}&season=${season}&ep=${episode}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API HTTP Error ${res.status}`);
    }
    const data = await res.json();
    
    if (!data.results) return null;

    const streams: AnimeStreamSource[] = data.results.map((s: any, idx: number) => ({
      serverName: s.server || `Source ${idx + 1}`,
      language: 'Multi-Audio',
      embedUrl: s.link,
      isDefault: idx === 0,
      isM3U8: s.isM3U8,
    }));

    return {
      success: true,
      animeId,
      season,
      episode,
      isMovie,
      provider: 'Consumet/Zenshin',
      totalServers: streams.length,
      streams,
    };
  } catch (error: any) {
    console.error('Error fetching anime streams:', error);
    throw error;
  }
}

