export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  media_type?: 'movie' | 'tv';
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface Episode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  vote_average: number;
  runtime?: number;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string;
  episodes?: Episode[];
}

export interface MediaDetails extends MediaItem {
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  status?: string;
  tagline?: string;
  credits?: {
    cast: CastMember[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: VideoTrailer[];
  };
  similar?: {
    results: MediaItem[];
  };
  recommendations?: {
    results: MediaItem[];
  };
  reviews?: {
    results: {
      id: string;
      author: string;
      content: string;
      created_at: string;
      url: string;
    }[];
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  isVIP: boolean;
  vipExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseDate?: string;
  addedAt: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  season?: number;
  episode?: number;
  watchedAt: string;
}

export interface UserReview {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhoto?: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  mediaTitle: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface VIPPlan {
  id: string;
  name: string;
  durationDays: number;
  priceBDT: number;
  badge?: string;
  features: string[];
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  bKashNumber: string;
  trxId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface LiveTvChannel {
  id: string;
  name: string;
  country: string;
  countryName?: string;
  countryFlag?: string;
  category: string;
  logo: string;
  streamUrl: string;
  quality?: string | null;
}

export interface IptvDiagnostics {
  channelsApiStatus: number;
  streamsApiStatus: number;
  logosApiStatus: number;
  countriesApiStatus: number;
  categoriesApiStatus: number;
  totalChannelRecords: number;
  totalStreamRecords: number;
  totalLogoRecords: number;
  matchedChannelCount: number;
  channelsWithPlayableFormat: number;
  failedRequestsCount: number;
  lastUpdated: string;
  errors: string[];
  endpointUrls: {
    channels: string;
    streams: string;
    logos: string;
    countries: string;
    categories: string;
    playlist: string;
  };
}

export interface LiveTvFavorite {
  id?: string;
  userId: string;
  channelId: string;
  name: string;
  logo: string;
  country: string;
  category: string;
}

export interface ViewEvent {
  id?: string;
  mediaId: string;
  mediaType: 'movie' | 'tv' | 'channel';
  title: string;
  userId?: string;
  timestamp: string;
}

export interface AdminSettings {
  paymentNumber: string;
  server1BaseUrl: string;
  server2BaseUrl: string;
  server3BaseUrl?: string;
  adPlacements: {
    enabled: boolean;
    publisherId: string;
    headerSlotId?: string;
    playerBottomSlotId?: string;
    sidebarSlotId?: string;
  };
  announcementNotice?: string;
  plans?: VIPPlan[];
}

// ----------------- WATCH PROVIDERS (JUSTWATCH) ----------------- //

export interface WatchProviderItem {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface CountryWatchProviders {
  link?: string;
  flatrate?: WatchProviderItem[];
  rent?: WatchProviderItem[];
  buy?: WatchProviderItem[];
  free?: WatchProviderItem[];
  ads?: WatchProviderItem[];
}

export interface WatchProvidersResponse {
  id: number;
  attribution: string;
  results: Record<string, CountryWatchProviders>;
}

// ----------------- HINDI MOVIES & PLAYBACK ----------------- //

export type HindiCategoryKey =
  | 'latest'
  | 'popular'
  | 'trending'
  | 'top_rated'
  | 'classic'
  | 'action'
  | 'comedy'
  | 'romance'
  | 'thriller'
  | 'drama';

export interface HindiMovieItem extends MediaItem {
  original_language: string;
  customPlaybackUrl?: string;
  isAuthorizedPlayback?: boolean;
}

export interface HindiPlaybackConfig {
  server1Enabled: boolean;
  server2Enabled: boolean;
  server3Enabled?: boolean;
  licensedOnlyMode: boolean;
  customStreams: Record<string, { streamUrl: string; label: string }>;
}

export interface FailedPlaybackLog {
  id: string;
  tmdbId: number | string;
  title: string;
  reason: string;
  timestamp: string;
  resolved?: boolean;
}

export interface HindiCatalogStatus {
  totalMovies: number;
  lastSyncTime: string | null;
  pagesImported: number;
  categoryCounts: Record<string, number>;
  activePlaybackSources: {
    server1Enabled: boolean;
    server2Enabled: boolean;
    server3Enabled?: boolean;
    licensedOnlyMode: boolean;
    customStreamsCount: number;
  };
  failedPlaybackCount: number;
}

export interface AppPreferences {
  // Playback Settings
  defaultServer: 'cinextma' | 'legacy' | 'server3';
  autoPlay: boolean;
  autoNextEpisode: boolean;
  defaultQuality: 'Auto' | '480p' | '720p' | '1080p';
  subtitleLanguage: 'Off' | 'English' | 'Spanish' | 'Hindi' | 'Bengali' | 'French';
  playbackSpeed: number;

  // Appearance Settings
  themeMode: 'dark' | 'light' | 'system';
  themeColor: 'red' | 'cyan' | 'gold' | 'emerald' | 'purple';
  appAnimations: boolean;

  // Notifications
  newMovieAlerts: boolean;
  newEpisodeAlerts: boolean;
  liveTvAlerts: boolean;
  promotionalNotifications: boolean;

  // Privacy & Security
  historyPrivacy: 'private' | 'recommendations';

  // Storage & Data
  dataSaver: boolean;
  autoImageLoading: boolean;
  wifiOnlyDownloads: boolean;
}

export interface KidsContentItem {
  id?: string;
  title: string;
  mediaType: 'movie' | 'tv';
  category: string;
  tmdbId?: number | string;
  posterPath?: string;
  backdropPath?: string;
  overview?: string;
  voteAverage?: number;
  releaseDate?: string;
  customStreamUrl?: string;
  createdAt?: string;
}

// ----------------- DEDICATED ANIME INTEGRATION ----------------- //

export interface AnimeListItem {
  anime_id: string;
  title: string;
  poster: string;
  seasonText?: string;
  episodeText?: string;
  year?: string;
  rating?: string;
  media_type: 'tv' | 'movie';
  hasHindiDub?: boolean;
}

export interface AnimeEpisodeItem {
  episode_number: number;
  season_number: number;
  title: string;
  image: string;
  href?: string;
}

export interface AnimeDetails {
  anime_id: string;
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  genres: string[];
  year: string;
  rating: string;
  media_type: 'tv' | 'movie';
  languages: string[];
  totalSeasons: number;
  seasons: number[];
  totalEpisodes: number;
  episodes: AnimeEpisodeItem[];
}

export interface AnimeStreamSource {
  serverName: string;
  language: string;
  embedUrl: string;
  isDefault?: boolean;
  isM3U8?: boolean;
}

export interface AnimeStreamResponse {
  success: boolean;
  animeId: string;
  season: number;
  episode: number;
  isMovie: boolean;
  provider: string;
  totalServers: number;
  streams: AnimeStreamSource[];
}
