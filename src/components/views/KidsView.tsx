import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Search,
  Tv,
  Film,
  Star,
  Play,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Smile,
  Heart,
  Zap,
  Flame,
  Volume2,
  Layers,
  X,
  Check,
  ShieldCheck,
  Clapperboard,
  AlertCircle,
} from 'lucide-react';
import { MediaCard } from '../media/MediaCard';
import { MediaItem, AnimeListItem, AnimeDetails, AnimeEpisodeItem } from '../../types';
import { searchMedia, discoverMedia } from '../../services/tmdb';
import {
  getKidsContent,
  addToWatchlist,
  removeFromWatchlist,
  getUserWatchlist,
  isMediaInWatchlist,
} from '../../services/firestore';
import { useAuth } from '../../context/AuthContext';
import { DORAEMON_HINDI_SHOW, DORAEMON_HINDI_MOVIES } from '../../data/doraemonHindi';
import {
  getAnimeSeries,
  getAnimeMovies,
  searchAnime,
  getAnimeInfo,
} from '../../services/anime';
import { AnimePlayer } from '../anime/AnimePlayer';

interface KidsViewProps {
  onSelectMedia: (item: MediaItem) => void;
  onWatchMedia: (item: MediaItem) => void;
  onRequireAuth: () => void;
}

// Subsections inside Kids
type KidsSubSection = 'cartoons' | 'anime';

// Cartoon Category Chips
const CARTOON_CATEGORIES = [
  { id: 'All', label: 'All Cartoons', icon: Sparkles, color: 'from-amber-400 to-orange-500' },
  { id: 'Doraemon', label: 'Doraemon (Hindi)', icon: Smile, color: 'from-cyan-400 to-blue-500' },
  { id: 'Shinchan', label: 'Shinchan', icon: Zap, color: 'from-yellow-400 to-amber-500' },
  { id: 'Tom and Jerry', label: 'Tom & Jerry', icon: Heart, color: 'from-rose-400 to-red-500' },
  { id: 'Pokémon', label: 'Pokémon', icon: Zap, color: 'from-amber-300 to-yellow-500' },
  { id: 'Motu Patlu', label: 'Motu Patlu', icon: Smile, color: 'from-orange-400 to-red-500' },
  { id: 'Chhota Bheem', label: 'Chhota Bheem', icon: Sparkles, color: 'from-emerald-400 to-teal-500' },
  { id: 'Oggy and the Cockroaches', label: 'Oggy & Cockroaches', icon: Smile, color: 'from-purple-400 to-indigo-500' },
  { id: 'Ben 10', label: 'Ben 10', icon: Zap, color: 'from-green-400 to-emerald-600' },
  { id: 'Other Cartoons', label: 'Other Cartoons', icon: Tv, color: 'from-blue-400 to-indigo-600' },
];

export const KidsView: React.FC<KidsViewProps> = ({
  onSelectMedia,
  onWatchMedia,
  onRequireAuth,
}) => {
  const { user } = useAuth();

  // 1. Primary Kids Section Selector: Cartoons vs Anime
  const [activeSection, setActiveSection] = useState<KidsSubSection>('cartoons');

  // ==========================================
  // CARTOONS STATE (Existing Kids Content)
  // ==========================================
  const [selectedCartoonCategory, setSelectedCartoonCategory] = useState<string>('All');
  const [cartoonMediaTypeFilter, setCartoonMediaTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [cartoonSearchQuery, setCartoonSearchQuery] = useState('');
  const [cartoonItems, setCartoonItems] = useState<MediaItem[]>([]);
  const [cartoonLoading, setCartoonLoading] = useState(true);
  const [cartoonPage, setCartoonPage] = useState(1);
  const [cartoonTotalPages, setCartoonTotalPages] = useState(1);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  // ==========================================
  // ANIME STATE (Zenshin / Anilist API Integration)
  // ==========================================
  type AnimeFilter = 'all' | 'hindi' | 'series' | 'movies';
  const [animeFilter, setAnimeFilter] = useState<AnimeFilter>('all');
  const [animeSearchQuery, setAnimeSearchQuery] = useState('');
  const [appliedAnimeSearch, setAppliedAnimeSearch] = useState('');
  const [animeItems, setAnimeItems] = useState<AnimeListItem[]>([]);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [animeError, setAnimeError] = useState<string | null>(null);
  const [animePage, setAnimePage] = useState(1);
  const [animeTotalPages, setAnimeTotalPages] = useState(1);

  // Anime Details / Playback Modal inside Kids
  const [selectedAnime, setSelectedAnime] = useState<AnimeListItem | null>(null);
  const [animeDetails, setAnimeDetails] = useState<AnimeDetails | null>(null);
  const [loadingAnimeDetails, setLoadingAnimeDetails] = useState(false);
  const [animeDetailsError, setAnimeDetailsError] = useState<string | null>(null);
  const [isAnimePlaying, setIsAnimePlaying] = useState(false);
  const [animeActiveSeason, setAnimeActiveSeason] = useState(1);
  const [animeActiveEpisode, setAnimeActiveEpisode] = useState(1);
  const [animeInWatchlist, setAnimeInWatchlist] = useState(false);
  const [animeWatchlistLoading, setAnimeWatchlistLoading] = useState(false);

  // Load User Watchlist for Cartoons
  useEffect(() => {
    if (user) {
      getUserWatchlist(user.uid).then((items) => {
        setWatchlistIds(new Set(items.map((i) => `${i.mediaType}_${i.mediaId}`)));
      }).catch(console.warn);
    }
  }, [user]);

  // ==========================================
  // LOAD CARTOONS DATA
  // ==========================================
  useEffect(() => {
    if (activeSection !== 'cartoons') return;

    let mounted = true;
    setCartoonLoading(true);

    const loadKidsData = async () => {
      try {
        let results: MediaItem[] = [];

        // Check custom Firestore Kids items
        const customFirestoreItems = await getKidsContent(selectedCartoonCategory).catch(() => []);
        const mappedCustom: MediaItem[] = customFirestoreItems.map((c: any) => ({
          id: c.tmdbId ? Number(c.tmdbId) : Math.abs(hashCode(c.id || c.title)),
          title: c.title,
          name: c.title,
          overview: c.overview || 'Kids animated cartoon show',
          poster_path: c.posterPath || c.poster_path || null,
          backdrop_path: c.backdropPath || null,
          vote_average: c.voteAverage || 9.0,
          vote_count: 500,
          media_type: c.mediaType || 'tv',
          release_date: c.releaseDate || '2022-01-01',
        }));

        if (selectedCartoonCategory === 'Doraemon') {
          // Dedicated Hindi Doraemon show and Hindi Doraemon movies
          const hindiDoraemonItems: MediaItem[] = [
            DORAEMON_HINDI_SHOW as any,
            ...(DORAEMON_HINDI_MOVIES as any[]),
            ...mappedCustom,
          ];
          results = hindiDoraemonItems;
          setCartoonTotalPages(1);
        } else if (cartoonSearchQuery.trim()) {
          const lowerQ = cartoonSearchQuery.trim().toLowerCase();
          const res = await searchMedia(cartoonSearchQuery.trim(), 'multi', cartoonPage);
          let tmdbResults = (res.results || []).map((item: any) => ({
            ...item,
            media_type: item.media_type || 'tv',
          }));

          if (lowerQ.includes('doraemon')) {
            tmdbResults = tmdbResults.filter(
              (i: any) => !i.name?.toLowerCase().includes('doraemon') && !i.title?.toLowerCase().includes('doraemon')
            );
            results = [DORAEMON_HINDI_SHOW as any, ...(DORAEMON_HINDI_MOVIES as any[]), ...mappedCustom, ...tmdbResults];
          } else {
            results = [...mappedCustom, ...tmdbResults];
          }
        } else if (selectedCartoonCategory === 'All') {
          const movieData = await discoverMedia('movie', {
            with_genres: '16,10751',
            sort_by: 'popularity.desc',
            page: cartoonPage,
          });
          const tvData = await discoverMedia('tv', {
            with_genres: '16,10751',
            sort_by: 'popularity.desc',
            page: cartoonPage,
          });

          let movies = (movieData.results || []).map((m: any) => ({ ...m, media_type: 'movie' }));
          let tvs = (tvData.results || []).map((t: any) => ({ ...t, media_type: 'tv' }));

          // Filter out English Doraemon
          tvs = tvs.filter((t: any) => !t.name?.toLowerCase().includes('doraemon'));
          movies = movies.filter((m: any) => !m.title?.toLowerCase().includes('doraemon'));

          const combined: MediaItem[] = [];
          const maxLen = Math.max(movies.length, tvs.length);
          for (let i = 0; i < maxLen; i++) {
            if (tvs[i]) combined.push(tvs[i]);
            if (movies[i]) combined.push(movies[i]);
          }

          results = [DORAEMON_HINDI_SHOW as any, ...mappedCustom, ...combined];
          setCartoonTotalPages(Math.min(tvData.total_pages || 10, 30));
        } else {
          const res = await searchMedia(selectedCartoonCategory, 'multi', cartoonPage);
          const categoryResults = (res.results || []).map((item: any) => ({
            ...item,
            media_type: item.media_type || 'tv',
          }));
          results = [...mappedCustom, ...categoryResults];
          setCartoonTotalPages(Math.min(res.total_pages || 5, 20));
        }

        if (!mounted) return;

        let filtered = results;
        if (cartoonMediaTypeFilter === 'movie') {
          filtered = results.filter((i) => i.media_type === 'movie');
        } else if (cartoonMediaTypeFilter === 'tv') {
          filtered = results.filter((i) => i.media_type === 'tv');
        }

        const seen = new Set();
        const unique = filtered.filter((i) => {
          if (!i.id || seen.has(i.id)) return false;
          seen.add(i.id);
          return true;
        });

        setCartoonItems(unique);
      } catch (err) {
        console.error('Error fetching kids content:', err);
      } finally {
        if (mounted) setCartoonLoading(false);
      }
    };

    loadKidsData();

    return () => {
      mounted = false;
    };
  }, [activeSection, selectedCartoonCategory, cartoonSearchQuery, cartoonMediaTypeFilter, cartoonPage]);

  // Cartoon Watchlist toggle
  const handleToggleCartoonWatchlist = async (item: MediaItem) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    const type = item.media_type || 'tv';
    const key = `${type}_${item.id}`;
    const inList = watchlistIds.has(key);

    try {
      if (inList) {
        await removeFromWatchlist(user.uid, type, String(item.id));
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await addToWatchlist({
          userId: user.uid,
          mediaId: String(item.id),
          mediaType: type,
          title: item.title || item.name || 'Untitled',
          posterPath: item.poster_path,
          voteAverage: item.vote_average || 0,
          releaseDate: item.release_date || item.first_air_date,
        });
        setWatchlistIds((prev) => new Set(prev).add(key));
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
  };

  // ==========================================
  // LOAD ANIME DATA (Zenshin API)
  // ==========================================
  const loadAnimeData = useCallback(async () => {
    if (activeSection !== 'anime') return;

    setAnimeLoading(true);
    setAnimeError(null);

    try {
      if (appliedAnimeSearch.trim()) {
        const res = await searchAnime(appliedAnimeSearch.trim(), animePage);
        setAnimeItems(res.results);
        setAnimeTotalPages(res.totalPages);
      } else if (animeFilter === 'movies') {
        const res = await getAnimeMovies(animePage);
        setAnimeItems(res.results);
        setAnimeTotalPages(res.totalPages);
      } else {
        // 'all', 'hindi', or 'series'
        const res = await getAnimeSeries(animePage);
        setAnimeItems(res.results);
        setAnimeTotalPages(res.totalPages);
      }
    } catch (err: any) {
      console.error('Failed to load anime list:', err);
      setAnimeError(err.message || 'Unable to connect to Anime API network. Please try again.');
    } finally {
      setAnimeLoading(false);
    }
  }, [activeSection, appliedAnimeSearch, animeFilter, animePage]);

  useEffect(() => {
    loadAnimeData();
  }, [loadAnimeData]);

  const handleAnimeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAnimePage(1);
    setAppliedAnimeSearch(animeSearchQuery.trim());
  };

  const handleClearAnimeSearch = () => {
    setAnimeSearchQuery('');
    setAppliedAnimeSearch('');
    setAnimePage(1);
  };

  // Open Anime Details in Modal
  const handleOpenAnimeDetails = async (item: AnimeListItem, autoPlay = false) => {
    setSelectedAnime(item);
    setIsAnimePlaying(autoPlay);
    setAnimeActiveSeason(1);
    setAnimeActiveEpisode(1);
    setLoadingAnimeDetails(true);
    setAnimeDetailsError(null);

    if (user) {
      isMediaInWatchlist(user.uid, item.media_type, `anime-${item.anime_id}`).then(setAnimeInWatchlist);
    }

    try {
      const details = await getAnimeInfo(item.anime_id, item.media_type === 'movie');
      if (details) {
        setAnimeDetails(details);
        if (details.seasons && details.seasons.length > 0) {
          setAnimeActiveSeason(details.seasons[0]);
        }
      } else {
        setAnimeDetailsError('Could not load episode details for this anime.');
      }
    } catch (err: any) {
      setAnimeDetailsError(err.message || 'Error fetching anime details');
    } finally {
      setLoadingAnimeDetails(false);
    }
  };

  const handleCloseAnimeModal = () => {
    setSelectedAnime(null);
    setAnimeDetails(null);
    setIsAnimePlaying(false);
  };

  // Toggle Watchlist for Anime
  const handleToggleAnimeWatchlist = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!selectedAnime) return;

    setAnimeWatchlistLoading(true);
    const mediaId = `anime-${selectedAnime.anime_id}`;

    try {
      if (animeInWatchlist) {
        await removeFromWatchlist(user.uid, selectedAnime.media_type, mediaId);
        setAnimeInWatchlist(false);
      } else {
        await addToWatchlist({
          userId: user.uid,
          mediaId,
          mediaType: selectedAnime.media_type,
          title: selectedAnime.title,
          posterPath: selectedAnime.poster,
          voteAverage: parseFloat(selectedAnime.rating || '8.8'),
        });
        setAnimeInWatchlist(true);
      }
    } catch (err) {
      console.error('Anime watchlist error:', err);
    } finally {
      setAnimeWatchlistLoading(false);
    }
  };

  // Episodes for active season
  const currentAnimeEpisodes: AnimeEpisodeItem[] = animeDetails?.episodes
    ? animeDetails.episodes.filter((ep) => ep.season_number === animeActiveSeason)
    : [];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* =========================================================================
          TOP KIDS CATEGORY HEADER WITH BEAUTIFUL CARTOONS / ANIME SEGMENTED SELECTOR
          ========================================================================= */}
      <div className="flex flex-col items-center justify-center gap-3">
        {/* iOS 26 Liquid Glass Segmented Switcher */}
        <div className="inline-flex p-1.5 rounded-2xl ios-glass-elevated border border-white/20 backdrop-blur-2xl bg-[#080911]/85 shadow-[0_16px_45px_rgba(0,0,0,0.7)]">
          <button
            onClick={() => setActiveSection('cartoons')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 ${
              activeSection === 'cartoons'
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black shadow-[0_4px_20px_rgba(245,158,11,0.45)]'
                : 'text-neutral-300 hover:text-white hover:bg-white/[0.07]'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Cartoons</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/20 text-black">
              Kids Shows
            </span>
          </button>

          <button
            onClick={() => setActiveSection('anime')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-95 ${
              activeSection === 'anime'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white shadow-[0_4px_24px_rgba(239,68,68,0.5)] border border-rose-400/40'
                : 'text-neutral-300 hover:text-white hover:bg-white/[0.07]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Anime</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40 shadow-xs">
              Zenshin Hub
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: CARTOONS
          ========================================================================= */}
      {activeSection === 'cartoons' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Kids Hero Banner with Colorful Liquid Glass Styling */}
          <div className="relative rounded-3xl overflow-hidden ios-glass p-6 sm:p-8 border border-white/20 shadow-[0_16px_50px_rgba(245,158,11,0.25)] bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-indigo-950/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs font-black uppercase tracking-wider shadow-md">
                  <Sparkles className="w-3.5 h-3.5 fill-black" />
                  <span>Kids Cartoons & Animated Adventures</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  Watch Doraemon, Shinchan, Pokémon & Classic Cartoons!
                </h1>
                <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
                  Stream favorite kid-friendly cartoon shows with dedicated Hindi Doraemon episodes and high quality streaming.
                </p>
              </div>

              {/* Quick Category Badges */}
              <div className="flex flex-wrap gap-2 max-w-xs shrink-0">
                {['Doraemon', 'Shinchan', 'Tom & Jerry', 'Pokémon', 'Ben 10'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedCartoonCategory(tag === 'Tom & Jerry' ? 'Tom and Jerry' : tag);
                      setCartoonSearchQuery('');
                      setCartoonPage(1);
                    }}
                    className="px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-amber-400 hover:text-black text-white text-xs font-bold border border-white/15 backdrop-blur-md transition active:scale-95 shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls & Filter Bar */}
          <div className="ios-glass p-4 sm:p-5 rounded-3xl border border-white/15 space-y-4 shadow-lg">
            {/* Search Input & Media Type Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Doraemon, Shinchan, Pokémon, Tom & Jerry..."
                  value={cartoonSearchQuery}
                  onChange={(e) => {
                    setCartoonSearchQuery(e.target.value);
                    setCartoonPage(1);
                  }}
                  className="w-full bg-white/[0.06] border border-white/15 rounded-2xl px-4 py-2.5 pl-10 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400/80 focus:bg-white/[0.1] shadow-inner transition"
                />
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>

              {/* Filter Type Pills */}
              <div className="flex ios-glass rounded-2xl p-1 border border-white/10 self-start sm:self-auto shadow-inner">
                {[
                  { id: 'all', label: 'All Format' },
                  { id: 'tv', label: 'Cartoons / Shows' },
                  { id: 'movie', label: 'Movies' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCartoonMediaTypeFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95 ${
                      cartoonMediaTypeFilter === f.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold shadow-md'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Category Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {CARTOON_CATEGORIES.map((cat) => {
                const isSelected = selectedCartoonCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCartoonCategory(cat.id);
                      setCartoonSearchQuery('');
                      setCartoonPage(1);
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? `bg-gradient-to-r ${cat.color} text-black shadow-lg scale-105 border border-white/30`
                        : 'ios-glass text-neutral-300 border border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cartoons Grid Display */}
          {cartoonLoading ? (
            <div className="grid grid-cols-2 min-[440px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3 animate-ios-fade-up">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-2xl ios-skeleton border border-white/10" />
              ))}
            </div>
          ) : cartoonItems.length > 0 ? (
            <div className="grid grid-cols-2 min-[440px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3 animate-ios-fade-up">
              {cartoonItems.map((item) => (
                <MediaCard
                  key={`${item.media_type}_${item.id}`}
                  item={item}
                  mediaType={item.media_type || 'tv'}
                  onSelect={onSelectMedia}
                  onWatch={onWatchMedia}
                  onToggleWatchlist={handleToggleCartoonWatchlist}
                  isInWatchlist={watchlistIds.has(`${item.media_type || 'tv'}_${item.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 ios-glass rounded-3xl border border-white/10 text-neutral-400 space-y-3">
              <Smile className="w-12 h-12 text-amber-400" />
              <p className="text-sm font-bold text-white">
                No cartoon shows found matching "{cartoonSearchQuery || selectedCartoonCategory}"
              </p>
              <p className="text-xs text-neutral-400">
                Try selecting another category chip above or search for different cartoon titles.
              </p>
            </div>
          )}

          {/* Cartoons Pagination Controls */}
          {cartoonTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setCartoonPage((p) => Math.max(p - 1, 1))}
                disabled={cartoonPage <= 1}
                className="px-4 py-2 rounded-full ios-glass border border-white/15 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-neutral-400 font-medium px-3 py-1.5 rounded-full ios-glass border border-white/10">
                Page <span className="text-amber-400 font-bold">{cartoonPage}</span> of {cartoonTotalPages}
              </span>
              <button
                onClick={() => setCartoonPage((p) => Math.min(p + 1, cartoonTotalPages))}
                disabled={cartoonPage >= cartoonTotalPages}
                className="px-4 py-2 rounded-full ios-glass border border-white/15 text-xs font-semibold text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          SECTION 2: ANIME (Zenshin Anime Integration inside Kids)
          ========================================================================= */}
      {activeSection === 'anime' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Anime Hero Header Banner inside Kids */}
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-red-950/40 via-[#0d0e17] to-purple-950/30 p-6 sm:p-8 shadow-2xl">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/40 border border-red-400/40 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  ZENSHIN ANIME HUB
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-neutral-300 border border-white/10">
                  Global Library • High Speed Mirrors
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Production Ready API
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Stream Thousands of Anime Series & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">Movies Directly</span>
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Powered by Zenshin architecture. Access real-time updates from Anilist with direct high-quality streaming sources for all your favorite shows.
              </p>
            </div>
          </div>


          {/* Filter Tabs & Search Controls */}
          <div className="ios-glass-elevated rounded-2xl p-3 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 scrollbar-none">
              <button
                onClick={() => {
                  setAnimeFilter('all');
                  setAppliedAnimeSearch('');
                  setAnimePage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                  animeFilter === 'all' && !appliedAnimeSearch
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>All Anime</span>
              </button>

              <button
                onClick={() => {
                  setAnimeFilter('hindi');
                  setAppliedAnimeSearch('');
                  setAnimePage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                  animeFilter === 'hindi' && !appliedAnimeSearch
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>Hindi Dubbed</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 font-black">HOT</span>
              </button>

              <button
                onClick={() => {
                  setAnimeFilter('series');
                  setAppliedAnimeSearch('');
                  setAnimePage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                  animeFilter === 'series' && !appliedAnimeSearch
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Anime Series</span>
              </button>

              <button
                onClick={() => {
                  setAnimeFilter('movies');
                  setAppliedAnimeSearch('');
                  setAnimePage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                  animeFilter === 'movies' && !appliedAnimeSearch
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Anime Movies</span>
              </button>
            </div>

            {/* Anime Search Bar */}
            <form onSubmit={handleAnimeSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search Solo Leveling, Naruto, Pokémon..."
                value={animeSearchQuery}
                onChange={(e) => setAnimeSearchQuery(e.target.value)}
                className="w-full bg-white/[0.06] hover:bg-white/[0.09] text-xs text-white placeholder-neutral-400 pl-9 pr-8 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20 transition"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
              {animeSearchQuery && (
                <button
                  type="button"
                  onClick={handleClearAnimeSearch}
                  className="absolute right-2.5 top-2.5 p-0.5 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* Search notice */}
          {appliedAnimeSearch && (
            <div className="flex items-center justify-between text-xs text-neutral-300 px-1">
              <p>
                Showing anime results for: <strong className="text-white">"{appliedAnimeSearch}"</strong>
              </p>
              <button
                onClick={handleClearAnimeSearch}
                className="text-red-400 hover:text-red-300 font-semibold"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Anime Grid Content */}
          {animeLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
              <p className="text-sm font-semibold text-neutral-300">
                Fetching library from Anilist Cloud...
              </p>
            </div>
          ) : animeError ? (
            <div className="p-8 text-center rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Anime Source Connection</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">{animeError}</p>
              <button
                onClick={() => loadAnimeData()}
                className="px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition"
              >
                Retry Connection
              </button>
            </div>
          ) : animeItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Film className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Anime Found</h3>

              <p className="text-xs text-neutral-400">
                {appliedAnimeSearch
                  ? `No anime matching "${appliedAnimeSearch}". Try searching for another title.`
                  : 'No items currently available in this category.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 min-[440px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2.5 sm:gap-3">
              {animeItems.map((item) => (
                <div
                  key={item.anime_id}
                  onClick={() => handleOpenAnimeDetails(item)}
                  className="group relative cursor-pointer rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-red-500/40 hover:shadow-[0_12px_32px_rgba(239,68,68,0.25)] transition-all duration-300 flex flex-col active:scale-95"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-900">
                    <img
                      src={item.poster || '/placeholder-poster.png'}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600/90 text-white backdrop-blur-md shadow-md">
                        {item.media_type === 'movie' ? 'Movie' : 'Series'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>


                    {(item.seasonText || item.episodeText) && (
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md">
                        <span>{item.seasonText || 'Season 1'}</span>
                        <span className="text-amber-400">{item.episodeText}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h4>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {item.rating || '8.8'}
                      </span>
                      <span>{item.year || '2024'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Anime Pagination */}
          {animeTotalPages > 1 && !animeLoading && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setAnimePage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                disabled={animePage <= 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full ios-glass border border-white/15 text-xs font-bold transition active:scale-95 ${
                  animePage <= 1
                    ? 'opacity-40 cursor-not-allowed text-neutral-500'
                    : 'text-white hover:bg-white/[0.1]'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-mono font-bold text-neutral-300 px-3">
                Page {animePage} of {animeTotalPages}
              </span>

              <button
                onClick={() => {
                  setAnimePage((prev) => Math.min(prev + 1, animeTotalPages));
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                disabled={animePage >= animeTotalPages}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full ios-glass border border-white/15 text-xs font-bold transition active:scale-95 ${
                  animePage >= animeTotalPages
                    ? 'opacity-40 cursor-not-allowed text-neutral-500'
                    : 'text-white hover:bg-white/[0.1]'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          ANIME DETAIL & STREAMING MODAL (Isolated Dedicated Anime Provider)
          ========================================================================= */}
      {selectedAnime && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl ios-glass-elevated border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.9)] p-4 sm:p-6 space-y-6 scrollbar-thin">
            <button
              onClick={handleCloseAnimeModal}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {isAnimePlaying ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white">
                      {selectedAnime.media_type === 'movie' ? 'Anime Movie' : 'Anime Series'}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                      {animeDetails?.title || selectedAnime.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsAnimePlaying(false)}
                    className="text-xs text-neutral-400 hover:text-white font-medium"
                  >
                    View Info & Episodes
                  </button>
                </div>

                {/* Dedicated Anime Player - isolated from normal servers */}
                <AnimePlayer
                  animeId={selectedAnime.anime_id}
                  title={animeDetails?.title || selectedAnime.title}
                  poster={selectedAnime.poster}
                  season={animeActiveSeason}
                  episode={animeActiveEpisode}
                  totalEpisodes={currentAnimeEpisodes.length || 1}
                  isMovie={selectedAnime.media_type === 'movie'}
                  onEpisodeChange={(s, e) => {
                    setAnimeActiveSeason(s);
                    setAnimeActiveEpisode(e);
                  }}
                  onClose={() => setIsAnimePlaying(false)}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-36 sm:w-52 shrink-0 rounded-2xl overflow-hidden border border-white/15 shadow-xl mx-auto sm:mx-0">
                    <img
                      src={selectedAnime.poster}
                      alt={selectedAnime.title}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-3 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white">
                        {selectedAnime.media_type === 'movie' ? 'Anime Movie' : 'Anime Series'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        Hindi Dubbed Available
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-neutral-300">
                        {animeDetails?.year || selectedAnime.year || '2024'}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-3xl font-black text-white">
                      {animeDetails?.title || selectedAnime.title}
                    </h2>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {animeDetails?.rating || selectedAnime.rating || '8.8'} / 10
                      </span>
                      {selectedAnime.media_type !== 'movie' && (
                        <span>
                          {animeDetails?.totalEpisodes || currentAnimeEpisodes.length || 'Full'}{' '}
                          Episodes
                        </span>
                      )}
                    </div>

                    {animeDetails?.genres && (
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {animeDetails.genres.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white/[0.06] text-neutral-300 border border-white/10"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                      {animeDetails?.overview ||
                        'Experience this popular anime series with full high definition streaming and multi-language dubbed audio.'}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <button
                        onClick={() => setIsAnimePlaying(true)}
                        className="ios-glass-btn-primary px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Watch Now</span>
                      </button>

                      <button
                        onClick={handleToggleAnimeWatchlist}
                        disabled={animeWatchlistLoading}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition active:scale-95 ${
                          animeInWatchlist
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-white/[0.08] hover:bg-white/[0.14] text-neutral-200 border-white/10'
                        }`}
                      >
                        {animeInWatchlist ? (
                          <>
                            <Check className="w-4 h-4 text-red-400" />
                            <span>In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4" />
                            <span>Add to Watchlist</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Available Audio Languages */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
                    <Volume2 className="w-4 h-4 text-rose-400" />
                    <span>Supported Dubs & Subtitles for this Anime:</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 font-semibold">
                      Hindi (Dubbed)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 font-semibold">
                      English (Dubbed)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 font-semibold">
                      Japanese (Original Audio)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold">
                      Tamil & Telugu (Select Releases)
                    </span>
                  </div>
                </div>

                {/* Seasons & Episodes Section (Only for TV series) */}
                {selectedAnime.media_type !== 'movie' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-red-400" />
                        <span>Episodes List</span>
                      </h3>

                      {animeDetails?.seasons && animeDetails.seasons.length > 1 && (
                        <div className="flex gap-1.5">
                          {animeDetails.seasons.map((s) => (
                            <button
                              key={s}
                              onClick={() => setAnimeActiveSeason(s)}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold transition active:scale-95 ${
                                animeActiveSeason === s
                                  ? 'bg-red-600 text-white shadow-sm'
                                  : 'bg-white/[0.06] text-neutral-400 hover:text-white'
                              }`}
                            >
                              Season {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {loadingAnimeDetails ? (
                      <div className="py-10 text-center">
                        <Loader2 className="w-6 h-6 text-red-500 animate-spin mx-auto" />
                        <p className="text-xs text-neutral-400 mt-2">Loading episodes...</p>
                      </div>
                    ) : currentAnimeEpisodes.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                        {currentAnimeEpisodes.map((ep) => {
                          const isCurrent =
                            animeActiveSeason === ep.season_number &&
                            animeActiveEpisode === ep.episode_number;

                          return (
                            <button
                              key={`${ep.season_number}-${ep.episode_number}`}
                              onClick={() => {
                                setAnimeActiveSeason(ep.season_number);
                                setAnimeActiveEpisode(ep.episode_number);
                                setIsAnimePlaying(true);
                              }}
                              className={`p-2.5 rounded-xl text-left border transition active:scale-95 flex items-center gap-2.5 ${
                                isCurrent
                                  ? 'bg-red-600/30 border-red-500/60 text-white'
                                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-neutral-300'
                              }`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                                <Play className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold truncate">
                                  Ep {ep.episode_number}
                                </p>
                                <p className="text-[10px] text-neutral-400 truncate">
                                  {ep.title || `Episode ${ep.episode_number}`}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 py-4 text-center">
                        Click Watch Now to stream this episode directly.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper hash function for generating numeric IDs for custom entries
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}
