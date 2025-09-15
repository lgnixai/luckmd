import React, { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Movie, Episode } from '../api-service';
import { apiService } from '../api-service';
import Hls from 'hls.js';

// 声明全局Plyr类型
declare global {
  interface Window {
    Plyr: any;
  }
}

// 动态加载Plyr CSS和JS
const loadPlyrAssets = () => {
  return new Promise<void>((resolve) => {
    // 检查是否已经加载
    if (window.Plyr && document.querySelector('link[href*="plyr.css"]')) {
      resolve();
      return;
    }

    // 加载CSS
    if (!document.querySelector('link[href*="plyr.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
      document.head.appendChild(link);
    }

    // 加载JS
    if (!window.Plyr) {
      const script = document.createElement('script');
      script.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
      script.onload = () => {
        console.log('✅ Plyr已加载');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Plyr加载失败');
        resolve(); // 即使失败也继续
      };
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
};

// 使用从api-service导入的Episode接口

interface MoviePlayerModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

// 模拟剧集数据
const mockEpisodes = [
  { id: 1, title: '第1集：开始的故事', episode_number: 1, duration: '45:30', is_current: true },
  { id: 2, title: '第2集：新的冒险', episode_number: 2, duration: '42:15' },
  { id: 3, title: '第3集：危机四伏', episode_number: 3, duration: '48:20' },
  { id: 4, title: '第4集：转折点', episode_number: 4, duration: '44:10' },
  { id: 5, title: '第5集：真相大白', episode_number: 5, duration: '46:35' },
  { id: 6, title: '第6集：新的开始', episode_number: 6, duration: '43:25' },
  { id: 7, title: '第7集：挑战升级', episode_number: 7, duration: '47:40' },
  { id: 8, title: '第8集：最终决战', episode_number: 8, duration: '50:15' },
];

export const MoviePlayerModal: React.FC<MoviePlayerModalProps> = ({
  movie,
  isOpen,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const plyrRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showEpisodeList, setShowEpisodeList] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载电影剧集数据和Plyr资源
  useEffect(() => {
    if (isOpen && movie) {
      // 先加载Plyr资源，再加载剧集数据
      loadPlyrAssets().then(() => {
        loadMovieEpisodes();
      });
    }
  }, [isOpen, movie]);

  // 清理HLS和Plyr实例
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (plyrRef.current) {
        plyrRef.current.destroy();
        plyrRef.current = null;
      }
    };
  }, []);

  // 确保video元素正确引用
  useEffect(() => {
    if (isOpen && videoRef.current) {
      console.log('✅ video元素已正确引用:', videoRef.current);
    } else if (isOpen && !videoRef.current) {
      console.warn('⚠️ video元素引用为空，等待渲染...');
    }
  }, [isOpen, currentEpisode]);

  // 加载HLS视频（使用HLS.js + Plyr）
  const loadHLSVideo = (url: string, retryCount = 0) => {
    console.log('🎬 开始加载HLS视频:', url, retryCount > 0 ? `(重试 ${retryCount})` : '');
    
    if (!videoRef.current) {
      if (retryCount < 3) {
        console.warn(`⚠️ videoRef.current 为空，${100 * (retryCount + 1)}ms后重试...`);
        setTimeout(() => {
          loadHLSVideo(url, retryCount + 1);
        }, 100 * (retryCount + 1));
        return;
      } else {
        console.error('❌ videoRef.current 为空，重试次数已达上限');
        setError('视频元素初始化失败，请刷新页面重试');
        return;
      }
    }

    const video = videoRef.current;
    console.log('✅ video元素已获取:', video);
    
    // 清理之前的实例
    if (hlsRef.current) {
      console.log('🧹 清理之前的HLS实例');
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (plyrRef.current) {
      console.log('🧹 清理之前的Plyr实例');
      plyrRef.current.destroy();
      plyrRef.current = null;
    }

    console.log('🔍 检查HLS支持:', Hls.isSupported());
    console.log('🔍 检查Plyr支持:', !!window.Plyr);
    console.log('🔍 检查Safari原生支持:', video.canPlayType('application/vnd.apple.mpegurl'));

    if (Hls.isSupported() && window.Plyr) {
      console.log('✅ 使用HLS.js + Plyr加载视频');
      
      // 创建HLS实例
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        debug: false,
        backBufferLength: 2000,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 5
      });
      
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('✅ HLS manifest parsed, ready to play');
        setError(null);
        
        // 创建Plyr播放器
        if (window.Plyr) {
          const plyr = new window.Plyr(video, {
            autoplay: false,
            controls: [
              'play-large',
              'play',
              'fast-forward',
              'progress',
              'current-time',
              'duration',
              'mute',
              'volume',
              'captions',
              'settings',
              'pip',
              'airplay',
              'fullscreen'
            ],
            settings: ['captions', 'quality', 'speed'],
            quality: {
              default: 720,
              options: [1080, 720, 480, 360]
            },
            speed: {
              selected: 1,
              options: [0.5, 0.75, 1, 1.25, 1.5, 2]
            }
          });
          
          plyrRef.current = plyr;
          
          // 监听播放器事件
          plyr.on('play', () => {
            console.log('▶️ 开始播放');
            setIsPlaying(true);
          });
          
          plyr.on('pause', () => {
            console.log('⏸️ 暂停播放');
            setIsPlaying(false);
          });
          
          plyr.on('error', (event: any) => {
            console.error('❌ Plyr播放器错误:', event);
            setError('播放器错误: ' + (event.detail || '未知错误'));
          });
          
          plyr.on('ready', () => {
            console.log('✅ Plyr播放器准备就绪');
            setLoading(false);
          });
        }
      });
      
      hls.on(Hls.Events.ERROR, (_, data) => {
        console.error('❌ HLS error:', data);
        if (data.fatal) {
          setError(`播放错误: ${data.details}`);
        }
      });
      
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('✅ Media attached to video element');
      });
      
      hls.on(Hls.Events.LEVEL_LOADED, () => {
        console.log('✅ Level loaded');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      console.log('✅ Safari原生支持HLS，直接设置src');
      video.src = url;
      video.load();
      
      // 为Safari创建Plyr播放器
      if (window.Plyr) {
        const plyr = new window.Plyr(video, {
          autoplay: false,
          controls: [
            'play-large',
            'play',
            'fast-forward',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'captions',
            'settings',
            'pip',
            'airplay',
            'fullscreen'
          ]
        });
        
        plyrRef.current = plyr;
        setError(null);
      }
    } else {
      console.error('❌ 浏览器不支持HLS视频播放或Plyr未加载');
      setError('您的浏览器不支持HLS视频播放或播放器组件未加载');
    }
  };

  // 加载剧集数据
  const loadMovieEpisodes = async () => {
    if (!movie) return;
    
    console.log('🎬 开始加载电影剧集数据，电影ID:', movie.id);
    setLoading(true);
    setError(null);
    
    try {
      console.log('📡 调用API获取电影详情...');
      const response = await apiService.getMovieWithEpisodes(movie.id);
      console.log('📡 API响应:', response);
      
      // 检查API响应格式 - 后端返回的是 {code: 0, message: 'success', data: {...}}
      if (response && response.data) {
        const movieData = response.data;
        console.log('✅ 电影数据获取成功:', movieData);
        console.log('📺 剧集数量:', movieData.episodes?.length || 0);
        
        setEpisodes(movieData.episodes || []);
        
        // 设置第一个剧集为当前播放
        if (movieData.episodes && movieData.episodes.length > 0) {
          const firstEpisode = movieData.episodes[0];
          console.log('🎯 设置第一个剧集:', firstEpisode);
          setCurrentEpisode(firstEpisode);
          // 延迟加载视频，确保组件已渲染
          setTimeout(() => {
            if (firstEpisode.play_url) {
              console.log('🎬 开始加载第一个剧集视频:', firstEpisode.play_url);
              loadHLSVideo(firstEpisode.play_url);
            } else {
              console.warn('⚠️ 第一个剧集没有播放地址');
            }
          }, 100);
        } else {
          console.warn('⚠️ 没有找到剧集数据');
        }
      } else {
        console.error('❌ API响应失败:', response);
        throw new Error('API响应失败');
      }
    } catch (err) {
      console.error('❌ 加载剧集失败:', err);
      setError('加载剧集失败，请稍后重试');
      
      // 使用模拟数据作为备选
      console.log('🔄 使用模拟数据作为备选');
      const mockEpisodesData = mockEpisodes.map((ep) => ({
        id: ep.id,
        movie_id: movie.id,
        episode: ep.episode_number.toString(),
        play_url: `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8`, // 使用真实的测试m3u8地址
        player_type: 'm3u8',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      setEpisodes(mockEpisodesData);
      setCurrentEpisode(mockEpisodesData[0]);
      
      // 尝试加载测试视频
      console.log('🎬 尝试加载测试视频');
      loadHLSVideo(mockEpisodesData[0].play_url);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !movie) return null;

  const handlePlayPause = () => {
    console.log('🎮 播放/暂停按钮点击，当前状态:', isPlaying);
    if (plyrRef.current) {
      if (isPlaying) {
        console.log('⏸️ 暂停视频');
        plyrRef.current.pause();
      } else {
        console.log('▶️ 播放视频');
        plyrRef.current.play();
      }
    } else if (videoRef.current) {
      // 备用方案：直接控制video元素
      if (isPlaying) {
        console.log('⏸️ 暂停视频（备用方案）');
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('▶️ 播放视频（备用方案）');
        videoRef.current.play().then(() => {
          console.log('✅ 视频播放成功');
          setIsPlaying(true);
        }).catch(err => {
          console.error('❌ 播放失败:', err);
          setError(`播放失败: ${err.message}`);
          setIsPlaying(false);
        });
      }
    } else {
      console.error('❌ 播放器未准备好，无法控制播放');
      setError('播放器未准备好，请稍后重试');
    }
  };

  const handleMuteToggle = () => {
    if (plyrRef.current) {
      plyrRef.current.muted = !isMuted;
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const handleEpisodeSelect = (episode: Episode) => {
    setCurrentEpisode(episode);
    setIsPlaying(false);
    setError(null);
    
    // 使用HLS加载视频
    if (episode.play_url) {
      loadHLSVideo(episode.play_url);
    }
  };

  const handleFullscreen = () => {
    if (plyrRef.current) {
      plyrRef.current.fullscreen.toggle();
    } else if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[75vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center">
              {movie.cover ? (
                <img 
                  src={movie.cover} 
                  alt={movie.name}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-gray-400 text-xs">无封面</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{movie.name}</h2>
              <p className="text-sm text-gray-600">
                {movie.year} • {movie.area} • {movie.category?.name}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 flex min-h-0">
          {/* 播放器区域 */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* 视频播放器 */}
            <div className="flex-1 bg-black relative group" style={{ aspectRatio: '16/9' }}>
              {loading ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <div className="text-center text-white">
                    {/* 美化的加载动画 */}
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                      <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-white/40 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <p className="text-xl font-medium mb-2">正在加载视频...</p>
                    <p className="text-white/70 text-sm">请稍候</p>
                  </div>
                </div>
              ) : error ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <div className="text-center text-white">
                    {/* 错误图标 */}
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <p className="text-xl font-medium text-red-400 mb-2">视频加载失败</p>
                    <p className="text-white/70 text-sm mb-4">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        setLoading(true);
                        if (currentEpisode) {
                          loadHLSVideo(currentEpisode.play_url);
                        }
                      }}
                      className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors duration-200"
                    >
                      重试
                    </button>
                  </div>
                </div>
              ) : currentEpisode ? (
                <div className="relative w-full h-full bg-black">
                  {/* 视频元素 */}
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    controls={false}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onLoadedData={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = isMuted;
                      }
                    }}
                    onError={(e) => {
                      console.error('Video error:', e);
                      setError('视频加载失败，请检查网络连接');
                    }}
                  >
                    您的浏览器不支持视频播放。
                  </video>
                  
                  {/* 播放前状态 - 居中播放按钮 */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={handlePlayPause}
                        className="group relative"
                      >
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                        {/* 外圈动画 */}
                        <div className="absolute inset-0 w-20 h-20 border-2 border-white/20 rounded-full animate-ping" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-lg">暂无播放源</p>
                  </div>
                </div>
              )}

              {/* 播放控制栏 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <div className="text-sm">
                      {currentEpisode ? `第${currentEpisode.episode}集` : ''}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEpisodeList(!showEpisodeList)}
                      className="text-white hover:bg-white/20"
                    >
                      <List className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 电影信息 */}
            <div className="p-3 border-t flex-shrink-0 max-h-[100px] overflow-y-auto">
              <div className="flex items-center space-x-4 mb-2">
                {movie.score && (
                  <Badge className="bg-yellow-500 text-white text-xs">
                    ⭐ {movie.score}
                  </Badge>
                )}
                {movie.director && (
                  <span className="text-xs text-gray-600">
                    导演: {movie.director}
                  </span>
                )}
                {movie.actor && (
                  <span className="text-xs text-gray-600">
                    主演: {movie.actor}
                  </span>
                )}
              </div>
              {movie.content && (
                <p className="text-xs text-gray-700 line-clamp-2">
                  {movie.content}
                </p>
              )}
            </div>
          </div>

          {/* 剧集列表 */}
          {showEpisodeList && (
            <div className="w-56 border-l bg-gray-50 flex-shrink-0">
              <div className="p-3 border-b flex-shrink-0">
                <h3 className="font-semibold text-sm">剧集列表</h3>
              </div>
              <ScrollArea className="flex-1 h-0">
                <div className="p-2 space-y-2 min-h-full">
                  {episodes.length > 0 ? (
                    episodes.map((episode) => (
                      <div
                        key={episode.id}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          episode.id === currentEpisode?.id
                            ? 'bg-red-100 border border-red-200'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleEpisodeSelect(episode)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              第{episode.episode}集
                            </p>
                            <p className="text-xs text-gray-500">
                              {episode.player_type || 'm3u8'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {episode.id === currentEpisode?.id && (
                              <Badge variant="secondary" className="text-xs">
                                当前
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">暂无剧集数据</p>
                    </div>
                  )}
                  {/* 添加一些空白内容确保可以滚动 */}
                  <div className="h-20"></div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoviePlayerModal;
