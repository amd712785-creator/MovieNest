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
  Volume2,
  Film,
  CheckCircle2,
} from 'lucide-react';
import Hls from 'hls.js';
import { useAuth } from '../../context/AuthContext';
import { recordWatchHistory, logViewEvent } from '../../services/firestore';
import { getAnimeStreams } from '../../services/anime';
import { AnimeStreamSource } from '../../types';

interface AnimePlayerProps {
  animeId: string;
  title: string;
  poster: string;
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  isMovie?: boolean;
  onEpisodeChange?: (season: number, episode: number) => void;
  onClose?: () => void;
}

export const AnimePlayer: React.FC<AnimePlayerProps> = ({
  animeId,
  title,
  poster,
  season = 1,
  episode = 1,
  totalEpisodes = 1,
  isMovie = false,
  onEpisodeChange,
  onClose,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState<AnimeStreamSource[]>([]);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Fetch streams whenever animeId, season, episode, or isMovie changes
  useEffect(() => {
    let isCancelled = false;

    async function loadStreams() {
      setLoading(true);
      setLoadError(null);
      setVideoReady(false);
      setIframeLoaded(false);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      try {
        const res = await getAnimeStreams(animeId, season, episode, isMovie);
        if (isCancelled) return;

        if (res && res.streams && res.streams.length > 0) {
          setStreams(res.streams);
          setSelectedServerIndex(0);
        } else {
          setStreams([]);
          setLoadError('No streaming servers currently available for this episode.');
        }
      } catch (err: any) {
        if (!isCancelled) {
          setLoadError(err.message || 'Failed to load anime streaming server');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadStreams();

    // Log watch history
    if (user) {
      recordWatchHistory({
        userId: user.uid,
        mediaId: `anime-${animeId}`,
        mediaType: isMovie ? 'movie' : 'tv',
        title: isMovie ? title : `${title} - S${season} E${episode}`,
        posterPath: poster || null,
        season: isMovie ? undefined : season,
        episode: isMovie ? undefined : episode,
      }).catch(console.warn);

      logViewEvent({
        mediaId: `anime-${animeId}`,
        mediaType: isMovie ? 'movie' : 'tv',
        title: isMovie ? title : `${title} - S${season} E${episode}`,
        userId: user.uid,
      }).catch(console.warn);
    }

    return () => {
      isCancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [animeId, season, episode, isMovie, title, poster, user]);

  const activeStream = useMemo(() => {
    return streams[selectedServerIndex] || null;
  }, [streams, selectedServerIndex]);

  // Handle Video/HLS Playback
  useEffect(() => {
    if (!activeStream || !activeStream.isM3U8 || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = activeStream.embedUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setVideoReady(true);
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setLoadError('Fatal playback error. Please try another server.');
              hls.destroy();
              break;
          }
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch(() => {});
        setVideoReady(true);
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeStream]);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(console.error);
      } else {
        document.exitFullscreen().catch(console.error);
      }
    }
  };

  const handleReload = () => {
    setIframeLoaded(false);
    setVideoReady(false);
    if (activeStream?.isM3U8 && videoRef.current) {
        videoRef.current.load();
    } else if (iframeRef.current) {
      const src = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = src;
      }, 100);
    }
  };

  const handleNextEpisode = () => {
    if (onEpisodeChange && episode < totalEpisodes) {
      onEpisodeChange(season, episode + 1);
    }
  };

  const handlePrevEpisode = () => {
    if (onEpisodeChange && episode > 1) {
      onEpisodeChange(season, episode - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Anime Provider Top Bar */}
      <div className="ios-glass-elevated rounded-2xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide">
                Zenshin Anime Player
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-rose-500/20 text-rose-300 border border-rose-400/30">
                PROD READY
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {activeStream?.serverName || 'Selecting optimal source...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          {activeStream && (
            <a
              href={activeStream.embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main Video Viewport Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group"
      >
        {/* Loading Spinner */}
        {(loading || (!iframeLoaded && !videoReady && !loadError && activeStream)) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md gap-3">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-sm font-bold text-white tracking-wide">
              Connecting to Anime Source...
            </p>
          </div>
        )}

        {/* Error State */}
        {loadError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/90 backdrop-blur-md space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-500" />
            <p className="text-xs text-neutral-400">{loadError}</p>
            <button
              onClick={handleReload}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white transition"
            >
              Retry Stream
            </button>
          </div>
        )}

        {/* Player: Video vs Iframe */}
        {activeStream && !loadError && (
          activeStream.isM3U8 ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              crossOrigin="anonymous"
              playsInline
              poster={poster}
            />
          ) : (
            <iframe
              ref={iframeRef}
              src={activeStream.embedUrl}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />
          )
        )}
      </div>

      {/* Servers Selector */}
      {streams.length > 1 && (
        <div className="flex flex-wrap gap-2">
            {streams.map((s, idx) => (
                <button
                    key={idx}
                    onClick={() => setSelectedServerIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition ${
                        selectedServerIndex === idx
                            ? 'bg-red-600 text-white'
                            : 'bg-white/5 text-neutral-400 hover:text-white'
                    }`}
                >
                    {s.serverName}
                </button>
            ))}
        </div>
      )}

      {/* Episode Navigation */}
      {!isMovie && totalEpisodes > 1 && (
        <div className="ios-glass-elevated rounded-2xl p-3 border border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handlePrevEpisode}
            disabled={episode <= 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition disabled:opacity-30 bg-white/[0.08] hover:bg-white/[0.15] text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-bold text-white">
              Episode {episode} / {totalEpisodes}
            </span>
          </div>

          <button
            onClick={handleNextEpisode}
            disabled={episode >= totalEpisodes}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition disabled:opacity-30 bg-red-600 hover:brightness-110 text-white"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

