'use client'

import Hls from "hls.js";
import { createContext, RefObject, useCallback, useContext, useEffect, useRef, useState } from "react";

import { VideoTag } from "@/widget/video-tag/ui/video-tag";
import React from "react";

interface IPlayerContext {
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  hls: Hls
}

export const playerContext = createContext<IPlayerContext | null>(null);

interface PlayerProviderProps {
  children: React.ReactNode;
  videoRef: RefObject<HTMLVideoElement | null>
  hls: Hls
}

const PlayerProvider: React.FC<PlayerProviderProps> = ({ children, videoRef, hls }) => {
  const [isPaused, setIsPaused] = useState<boolean>(true);

  if (isPaused) {
    videoRef?.current?.pause()
  } else {
    videoRef?.current?.play()
  }

  const value: IPlayerContext = {
    isPaused,
    setIsPaused,
    hls
  };

  return (
    <playerContext.Provider value={value}>
      {children}
    </playerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(playerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
};

const VIDEODATA = {
  // url: '/videos/hls_output/output.m3u8',
  // duration: 4.766,
  
  
  // url: '/videos/sound/sound1440p.m3u8',
  // duration: 9.633,
  
  
  // url: '/videos/test3/master-playlist.m3u8',
  // duration: 42.333,
  
  
  url: '/videos/long-video/longVideo.m3u8',
  duration: 552.333,
  fragments: [
    {
      start: 0.000,
      end: 22.517,
      title: 'Вступление'
    },
    {
      start: 22.517,
      end: 45.033,
      title: 'Проблематизация темы'
    },
    {
      start: 45.033,
      end: 67.550,
      title: 'Представление эксперта'
    },
    {
      start: 67.550,
      end: 90.066,
      title: 'Ожидания от просмотра'
    },
    {
      start: 90.066,
      end: 112.583,
      title: 'Исторический контекст'
    },
    {
      start: 112.583,
      end: 135.099,
      title: 'Ключевые термины'
    },
    {
      start: 135.099,
      end: 157.616,
      title: 'Основная теория'
    },
    {
      start: 157.616,
      end: 180.132,
      title: 'Практический пример 1'
    },
    {
      start: 180.132,
      end: 202.649,
      title: 'Разбор кейса'
    },
    {
      start: 202.649,
      end: 225.165,
      title: 'Типичные ошибки'
    },
    {
      start: 225.165,
      end: 247.682,
      title: 'Методика решения'
    },
    {
      start: 247.682,
      end: 270.198,
      title: 'Инструменты анализа'
    },
    {
      start: 270.198,
      end: 292.715,
      title: 'Практический пример 2'
    },
    {
      start: 292.715,
      end: 315.231,
      title: 'Сравнительный анализ'
    },
    {
      start: 315.231,
      end: 337.748,
      title: 'Нюансы реализации'
    },
    {
      start: 337.748,
      end: 360.264,
      title: 'Вопросы внедрения'
    },
    {
      start: 360.264,
      end: 382.781,
      title: 'Измерение результатов'
    },
    {
      start: 382.781,
      end: 405.297,
      title: 'Оптимизация процесса'
    },
    {
      start: 405.297,
      end: 427.814,
      title: 'Дополнительные ресурсы'
    },
    {
      start: 427.814,
      end: 450.330,
      title: 'Частые вопросы'
    },
    {
      start: 450.330,
      end: 472.847,
      title: 'Рекомендации эксперта'
    },
    {
      start: 472.847,
      end: 495.363,
      title: 'Дальнейшие шаги'
    },
    {
      start: 495.363,
      end: 517.880,
      title: 'Итоги и выводы'
    },
    {
      start: 517.880,
      end: 540.396,
      title: 'Заключительные слова'
    },
    {
      start: 540.396,
      end: 552.333,
      title: 'Финальные титры'
    }
  ]


  // url: '/videos/test2/outTest2.m3u8',
  // duration: 85.333,
  // fragments : [
  //   {
  //     start: 0.000,
  //     end: 5.000,
  //     title: 'не начало'
  //   },
  //   {
  //     start: 5.000,
  //     end: 10.000,
  //     title: 'не начало'
  //   },
  //   {
  //     start: 10.000,
  //     end: 12.00,
  //     title: 'не начало'
  //   },
  //   {
  //     start: 12.000,
  //     end: 15.000,
  //     title: 'не начало'
  //   },
  //   {
  //     start: 15.000,
  //     end: 40.000,
  //     title: 'не начало'
  //   },
  //   {
  //     start: 40.000,
  //     end: 70.000,
  //     title: 'экспозиция'
  //   },
  //   {
  //     start: 70.000,
  //     end: 75.000,
  //     title: 'контент'
  //   },
  //   {
  //     start: 75.000,
  //     end: 85.333,
  //     title: 'концовка'
  //   },
  // ]


  // url: '/videos/test4/master-playlist.m3u8',
  // duration: 9.585,
  // fragments : [
  //   {
  //     start: 0.000,
  //     end: 2.000,
  //     title: 'не начало не начало не начало не начало не начало не начало не начало не начало не начало не начало не начало не начало не начало не начало'
  //   },
  //   {
  //     start: 2.000,
  //     end: 4.000,
  //     title: 'экспозиция'
  //   },
  //   {
  //     start: 4.000,
  //     end: 7.000,
  //     title: 'контент'
  //   },
  //   {
  //     start: 7.000,
  //     end: 9.585,
  //     title: 'концовка'
  //   },
  // ]
}

export default function Home() {

  const videoRef = useRef<HTMLVideoElement>(null)
  
  const hls = new Hls({startLevel: -1, maxBufferLength: 1, lowLatencyMode: false, maxBufferSize: 10 * 1000 * 1000,
    maxMaxBufferLength: 60,
  })

  
  
  useEffect(() =>{
    if (Hls.isSupported() && videoRef.current) {
      hls.loadSource(VIDEODATA.url)
      hls.attachMedia(videoRef.current)
      
    }

    // return (
    //   hls.destroy()
    // )
  }, [])
    
  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    console.log('video тэг и hls сбиндились');
  });

  hls.on(Hls.Events.MEDIA_ENDED, (event, data) => {
    console.log('ПОТОК ЗАКОНЧИЛСЯ! (HLS ended)');
  });

  hls.on(Hls.Events.BUFFERED_TO_END, () => {
    console.log('буферезировано поллностью c уровнем: ', hls.currentLevel );
  })

  hls.on(Hls.Events.BUFFER_APPENDED, () => {
    console.log('чанк добавлен');
  })

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    const levels = hls.levels
    console.log('Доступные уровни качества:', levels)
    
    levels.forEach((level, index) => {
      console.log(`${index}: ${level.height}p, ${Math.round(level.bitrate/1000)}kbps`)
    })
    
    // Автоматически выбрать максимальное качество (2K если есть)
    const maxQualityIndex = levels.length - 1
    const highestQuality = levels[maxQualityIndex]

    hls.currentLevel = maxQualityIndex

    // if (highestQuality.height >= 1440) {
    //   console.log(`2K качество доступно: ${highestQuality.height}p`)
    //   hls.currentLevel = maxQualityIndex
    // }
  })

  hls.on(Hls.Events.LEVEL_SWITCHED, () => {
    console.log('Обновлено качество: ', hls.currentLevel);
    
  })

  return (
    <PlayerProvider videoRef={videoRef} hls={hls}>
      <VideoTag hls={hls} duration={VIDEODATA.duration} videoRef={videoRef} fragments={VIDEODATA.fragments}/>
      <div style={{
        width: '100%',
        height: '20px',
        backgroundImage: 'linear-gradient(to right, red 33.3%, blue 33.3%, blue 66.6%, green 66.6%)'
      }}></div>
    </PlayerProvider>
  );
}
