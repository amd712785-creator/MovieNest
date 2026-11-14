import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCcw,
  Maximize2,
  AlertCircle,
  Server,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { recordWatchHistory, logViewEvent } from '../../services/firestore';
import { reportPlaybackFailure } from '../../services/tmdb';
import {
  getCinextmaMoviePlayers,
  getCinextmaTvPlayers,
  CinextmaPlayer,
} from '../../services/cinextma';

interface VideoPlayerProps {
  mediaType: 'movie' | 'tv';
  tmdbId: number | string;
  title: string;
  posterPath?: string | null;
  season?: number;
  episode?: number;
  maxEpisodes?: number;
  onEpisodeChange?: (season: number, episode: number) => void;
  server1Base?: string;
  server2Base?: string;
  server3Base?: string;
  customStreamUrl?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaType,
  tmdbId,
  title,
  posterPath,
  season = 1,
  episode = 1,
  maxEpisodes = 1,
  onEpisodeChange,
  server1Base = 'https://cinesrc.st/embed',
  server2Base = 'https://vidsrc.to/embed',
  server3Base = 'https://vidsrc-embed.ru/embed',
  customStreamUrl,
}) => {
  const { user } = useAuth();

  // Main Streaming System Selector initialized from User Preferences
  const [activeSystem, setActiveSystem] = useState<'cinextma' | 'legacy' | 'server3'>(() => {
    try {
      const p = JSON.parse(localStorage.getItem('movienest_app_preferences') || '{}');
      return p.defaultServer || 'cinextma';
    } catch (e) {
      return 'cinextma';
    }
  });

  // CINEXTMA sub-source selection index
  const [cinextmaSourceIndex, setCinextmaSourceIndex] = useState(0);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // CINEXTMA player list for current title
  const cinextmaPlayers: CinextmaPlayer[] = useMemo(() => {
    if (mediaType === 'movie') {
      return getCinextmaMoviePlayers(tmdbId);
    } else {
      return getCinextmaTvPlayers(tmdbId, season, episode);
    }
  }, [mediaType, tmdbId, season, episode]);

  const isDoraemon = useMemo(() => {
    const idStr = String(tmdbId).toLowerCase();
    const titleStr = (title || '').toLowerCase();
    return idStr === '33895' || idStr.includes('doraemon') || titleStr.includes('doraemon');
  }, [tmdbId, title]);

  // Current active embed or direct video URL
  const currentUrl = useMemo(() => {
    if (customStreamUrl && customStreamUrl.trim()) {
      return customStreamUrl.trim();
    }
    if (activeSystem === 'cinextma') {
      const selectedPlayer = cinextmaPlayers[cinextmaSourceIndex] || cinextmaPlayers[0];
      return selectedPlayer?.source || `https://vidlink.pro/movie/${tmdbId}`;
    } else {
      if (mediaType === 'movie') {
        return `https://cinesrc.st/embed/movie/${tmdbId}`;
      } else {
        return `https://cinesrc.st/embed/tv/${tmdbId}?s=${season}&e=${episode}`;
      }
    }
  }, [customStreamUrl, activeSystem, mediaType, tmdbId, season, episode, cinextmaPlayers, cinextmaSourceIndex]);

  const isDirectVideo = useMemo(() => {
    if (!currentUrl) return false;
    const lower = currentUrl.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.mkv') || lower.includes('.webm') || lower.includes('.m3u8');
  }, [currentUrl]);

  // Record watch history and analytics event
  useEffect(() => {
    setIframeLoaded(false);
    setLoadError(null);

    if (user) {
      const historyItem: any = {
        userId: user.uid,
        mediaId: String(tmdbId),
        mediaType,
        title,
        posterPath: posterPath || null,
      };
      if (mediaType === 'tv') {
        historyItem.season = typeof season === 'number' ? season : 1;
        historyItem.episode = typeof episode === 'number' ? episode : 1;
      }

      recordWatchHistory(historyItem);

      logViewEvent({
        mediaId: String(tmdbId),
        mediaType,
        title,
        userId: user.uid,
      });
    }

    const errorTimer = setTimeout(() => {
      if (!iframeLoaded) {
        // Safe watchdog
      }
    }, 20000);

    return () => clearTimeout(errorTimer);
  }, [mediaType, tmdbId, season, episode, activeSystem, cinextmaSourceIndex]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoadError(null);
  };

  const handleIframeError = () => {
    const systemName =
      activeSystem === 'cinextma'
        ? `Server 1 (CINEXTMA - ${cinextmaPlayers[cinextmaSourceIndex]?.title || 'Source'})`
        : 'Server 2 (Existing MovieNest Streaming)';
    const reason = `Unable to connect to ${systemName}. Provider might be restricted or network blocked.`;
    setLoadError(reason);
    reportPlaybackFailure({
      tmdbId,
      title,
      reason,
    });
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.warn('Fullscreen request failed:', err);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handlePrevEpisode = () => {
    if (mediaType === 'tv' && episode > 1 && onEpisodeChange) {
      onEpisodeChange(season, episode - 1);
    }
  };

  const handleNextEpisode = () => {
    if (mediaType === 'tv' && onEpisodeChange && episode < maxEpisodes) {
      onEpisodeChange(season, episode + 1);
    }
  };

  const reloadIframe = () => {
    setLoadError(null);
    setIframeLoaded(false);
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Top Main Server Selector Bar with iOS 26 Liquid Glass */}
      <div className="flex flex-wrap items-center justify-between gap-3 ios-glass p-3 rounded-2xl border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex flex-wrap items-center space-x-2.5">
          <Server className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-neutral-300">Streaming Server:</span>

          {isDoraemon ? (
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-orange-500/25 to-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Dedicated Doraemon GitHub Source (r1d3x6/Doraemon-hindi)</span>
            </div>
          ) : (
            <div className="flex ios-glass rounded-xl p-0.5 border border-white/10">
              {/* Server 1: CINEXTMA (Default) */}
              <button
                onClick={() => {
                  setActiveSystem('cinextma');
                  setCinextmaSourceIndex(0);
                  setLoadError(null);
                  setIframeLoaded(false);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center gap-1.5 ${
                  activeSystem === 'cinextma'
                    ? 'ios-pill-active text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Server 1 (CINEXTMA)</span>
              </button>

              {/* Server 2: Existing MovieNest Streaming */}
              <button
                onClick={() => {
                  setActiveSystem('legacy');
                  setLoadError(null);
                  setIframeLoaded(false);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition active:scale-95 flex items-center gap-1.5 ${
                  activeSystem === 'legacy'
                    ? 'ios-pill-active text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Server 2 (Existing System)</span>
              </button>
            </div>
          )}
        </div>

        {/* TV Series Season & Episode Controls */}
        {mediaType === 'tv' && onEpisodeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-neutral-300 font-medium px-2 py-0.5 rounded-full ios-glass border border-white/10">
              Season {season} • Episode {episode}
            </span>
            <button
              onClick={handlePrevEpisode}
              disabled={episode <= 1}
              className="p-1.5 rounded-lg ios-glass border border-white/10 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95"
              title="Previous Episode"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextEpisode}
              disabled={episode >= maxEpisodes}
              className="p-1.5 rounded-lg ios-glass border border-white/10 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition active:scale-95"
              title="Next Episode"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Player Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={reloadIframe}
            className="p-1.5 px-2.5 rounded-xl ios-glass hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 text-xs flex items-center gap-1.5 transition active:scale-95"
            title="Reload Video Player"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 px-3 rounded-xl ios-glass-btn-secondary text-neutral-200 hover:text-white text-xs flex items-center gap-1.5 transition active:scale-95 font-medium"
            title="Open in dedicated player tab"
          >
            <ExternalLink className="w-3.5 h-3.5 text-neutral-300" />
            <span className="hidden sm:inline">Pop-out</span>
          </a>
        </div>
      </div>

      {/* CINEXTMA Sub-Source Selector Bar (active when Server 1 CINEXTMA is selected and not Doraemon) */}
      {activeSystem === 'cinextma' && !isDoraemon && (
        <div className="ios-glass p-2.5 rounded-2xl border border-white/15 space-y-2 shadow-md">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              CINEXTMA Engines:
            </span>
            <span className="text-[10px] text-neutral-400">
              Active Source: <strong className="text-white">{cinextmaPlayers[cinextmaSourceIndex]?.title}</strong>
            </span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {cinextmaPlayers.map((player, idx) => {
              const isSelected = cinextmaSourceIndex === idx;
              return (
                <button
                  key={player.title}
                  onClick={() => {
                    setCinextmaSourceIndex(idx);
                    setLoadError(null);
                    setIframeLoaded(false);
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-md border border-white/20'
                      : 'ios-glass text-neutral-300 border border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {player.recommended && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  <span>{player.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Responsive Player Frame */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.85)] group"
      >
        {/* Video Player Element */}
        {isDirectVideo ? (
          <video
            key={currentUrl}
            src={currentUrl}
            controls
            autoPlay
            poster={posterPath || undefined}
            className="w-full h-full object-contain relative z-10 bg-black"
            onLoadedData={handleIframeLoad}
            onError={handleIframeError}
          />
        ) : (
          <iframe
            ref={iframeRef}
            key={`${activeSystem}_${cinextmaSourceIndex}_${mediaType}_${tmdbId}_${season}_${episode}_${currentUrl}`}
            src={currentUrl}
            title={`${title} Video Player`}
            className="w-full h-full border-0 relative z-10"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            loading="eager"
            referrerPolicy="origin"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}

        {/* Loading Indicator */}
        {!iframeLoaded && !loadError && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-semibold text-neutral-300 border border-white/10 pointer-events-none">
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            <span>
              Connecting{' '}
              {isDoraemon
                ? 'Dedicated Doraemon GitHub Source (r1d3x6/Doraemon-hindi)'
                : activeSystem === 'cinextma'
                ? `Server 1 (CINEXTMA ${cinextmaPlayers[cinextmaSourceIndex]?.title})`
                : 'Server 2 (MovieNest System)'}
              ...
            </span>
          </div>
        )}

        {/* Error Fallback Overlay */}
        {loadError && (
          <div className="absolute inset-0 bg-black/95 p-6 flex flex-col items-center justify-center text-center z-30 space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mb-1" />
            <div>
              <h4 className="text-base font-bold text-white mb-1">Streaming Handshake Failed</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">{loadError}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!isDoraemon && activeSystem === 'cinextma' ? (
                <>
                  {cinextmaSourceIndex < cinextmaPlayers.length - 1 ? (
                    <button
                      onClick={() => {
                        setCinextmaSourceIndex((prev) => prev + 1);
                        setLoadError(null);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-semibold rounded-xl transition shadow-md"
                    >
                      Try Next CINEXTMA Engine
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      setActiveSystem('legacy');
                      setLoadError(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Switch to Server 2 (Existing System)
                  </button>
                </>
              ) : !isDoraemon ? (
                <button
                  onClick={() => {
                    setActiveSystem('cinextma');
                    setCinextmaSourceIndex(0);
                    setLoadError(null);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white text-xs font-semibold rounded-xl transition shadow-md"
                >
                  Switch to Server 1 (CINEXTMA)
                </button>
              ) : null}
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Tab</span>
              </a>
              <button
                onClick={reloadIframe}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Hover Fullscreen Action Button */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFullscreen}
            className="p-2.5 rounded-full ios-glass hover:bg-white/20 border border-white/20 text-white shadow-lg transition active:scale-90"
            title="Fullscreen Mode"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isDoraemon ? 'bg-amber-400 animate-pulse' : activeSystem === 'cinextma' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          Active Engine:{' '}
          {isDoraemon
            ? 'Dedicated Doraemon GitHub Source (r1d3x6/Doraemon-hindi)'
            : activeSystem === 'cinextma'
            ? `Server 1 (CINEXTMA - ${cinextmaPlayers[cinextmaSourceIndex]?.title})`
            : 'Server 2 (MovieNest Existing System)'}
        </span>
        <span className="font-mono text-neutral-400">
          TMDB #{tmdbId} {mediaType === 'tv' && `(S${season}:E${episode})`}
        </span>
      </div>
    </div>
  );
};
