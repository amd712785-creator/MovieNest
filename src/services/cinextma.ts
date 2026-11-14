export interface CinextmaPlayer {
  title: string;
  source: string;
  recommended?: boolean;
  fast?: boolean;
  ads?: boolean;
  resumable?: boolean;
}

/**
 * Generates CINEXTMA movie player sources for a given TMDB movie ID
 */
export const getCinextmaMoviePlayers = (id: string | number, startAt?: number): CinextmaPlayer[] => {
  return [
    {
      title: 'VidLink (Fast)',
      source: `https://vidlink.pro/movie/${id}?player=jw&primaryColor=ef4444&secondaryColor=a2a2a2&iconColor=eefdec&autoplay=false&startAt=${startAt || ''}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: 'VidSrc Embed (Server 3)',
      source: `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&autoplay=1`,
      recommended: true,
      fast: true,
      resumable: true,
    },
    {
      title: 'VidKing',
      source: `https://www.vidking.net/embed/movie/${id}?color=ef4444&autoplay=false`,
      recommended: true,
      fast: true,
      resumable: true,
    },
    {
      title: 'Embed.su',
      source: `https://embed.su/embed/movie/${id}`,
      fast: true,
      ads: true,
    },
    {
      title: 'SuperEmbed',
      source: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
      fast: true,
      ads: true,
    },
    {
      title: 'AutoEmbed',
      source: `https://player.autoembed.cc/embed/movie/${id}`,
      fast: true,
      ads: true,
    },
    {
      title: 'VidSrc HD',
      source: `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`,
      recommended: true,
      fast: true,
      ads: true,
    },
    {
      title: 'VidSrc Direct',
      source: `https://vidsrc.xyz/embed/movie/${id}`,
      ads: true,
    },
    {
      title: 'FilmKu',
      source: `https://filmku.stream/embed/${id}`,
      ads: true,
    },
    {
      title: 'NontonGo',
      source: `https://www.nontongo.win/embed/movie/${id}`,
      ads: true,
    },
    {
      title: '2Embed',
      source: `https://www.2embed.cc/embed/${id}`,
      ads: true,
    },
    {
      title: 'MoviesAPI',
      source: `https://moviesapi.club/movie/${id}`,
      ads: true,
    },
  ];
};

/**
 * Generates CINEXTMA TV show player sources for a given TMDB ID, season, and episode
 */
export const getCinextmaTvPlayers = (
  id: string | number,
  season: number,
  episode: number,
  startAt?: number
): CinextmaPlayer[] => {
  return [
    {
      title: 'VidLink (Fast)',
      source: `https://vidlink.pro/tv/${id}/${season}/${episode}?player=jw&primaryColor=ef4444&secondaryColor=a2a2a2&iconColor=eefdec&autoplay=false&startAt=${startAt || ''}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: 'VidSrc Embed (Server 3)',
      source: `https://vidsrc-embed.ru/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&autoplay=1`,
      recommended: true,
      fast: true,
      resumable: true,
    },
    {
      title: 'VidKing',
      source: `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=ef4444&autoplay=false`,
      recommended: true,
      fast: true,
      resumable: true,
    },
    {
      title: 'Embed.su',
      source: `https://embed.su/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
    },
    {
      title: 'SuperEmbed',
      source: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
      fast: true,
      ads: true,
    },
    {
      title: 'AutoEmbed',
      source: `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
    },
    {
      title: 'VidSrc HD',
      source: `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`,
      recommended: true,
      fast: true,
      ads: true,
    },
    {
      title: 'VidSrc Direct',
      source: `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`,
      ads: true,
    },
    {
      title: 'FilmKu',
      source: `https://filmku.stream/embed/series?tmdb=${id}&sea=${season}&epi=${episode}`,
      ads: true,
    },
    {
      title: 'NontonGo',
      source: `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
      ads: true,
    },
    {
      title: '2Embed',
      source: `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
      ads: true,
    },
    {
      title: 'MoviesAPI',
      source: `https://moviesapi.club/tv/${id}-${season}-${episode}`,
      ads: true,
    },
  ];
};
