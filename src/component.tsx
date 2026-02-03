'use client'

import Hls from "hls.js";
import { createContext, Dispatch, RefObject, SetStateAction, useCallback, useContext, useEffect, useRef, useState } from "react";

import { VideoTag } from "./widget/video-tag/ui/video-tag";
import React from "react";
import { IFragment } from "@/widget/video-tag/model/video-tag.interface";

interface IPlayerContext {
  isPaused: boolean;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  hls: Hls
  hideToolsTimer: RefObject<NodeJS.Timeout | null>
  isVisibleTools: boolean,
  setIsVisibleTools: Dispatch<SetStateAction<boolean>>
  isLiveStream: boolean
  isLiveStreamEnded: boolean,
}

export const playerContext = createContext<IPlayerContext | null>(null);

interface PlayerProviderProps {
  children: React.ReactNode;
  videoRef: RefObject<HTMLVideoElement | null>
  hls: Hls
  isLiveStream: boolean
  isLiveStreamEnded: boolean
}

const PlayerProvider: React.FC<PlayerProviderProps> = ({ children, videoRef, hls, isLiveStream, isLiveStreamEnded }) => {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isVisibleTools, setIsVisibleTools] = useState<boolean>(false)
  const hideToolsTimer = useRef<NodeJS.Timeout>(null)
  if (isPaused) {
    videoRef?.current?.pause()
  } else {
    videoRef?.current?.play()
  }
  

  const value: IPlayerContext = {
    isPaused,
    setIsPaused,
    hls,
    hideToolsTimer,
    isVisibleTools,
    setIsVisibleTools,
    isLiveStream,
    isLiveStreamEnded,
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

interface IPlayer {
    playlistUrl: string
    duration: number
    fragments?: IFragment[]
    isLiveStream?: boolean
}

export const Player: React.FC<IPlayer> = ({playlistUrl, duration, fragments, isLiveStream = false}) => {

  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLiveStreamEnded, setIsLiveStreamEnded] = useState<boolean>(false)
  
  const hls = new Hls({startLevel: -1,
    maxBufferLength: 10,
    lowLatencyMode: false,
    maxMaxBufferLength: 60, 
    liveSyncDurationCount: 3,
    liveDurationInfinity: true,
    autoStartLoad: true,
    enableWorker: true
    // debug: true
  })
  
  useEffect(() =>{
    if (Hls.isSupported() && videoRef.current) {
      
      hls.loadSource(playlistUrl)
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
    console.log('hls.subtitleDisplay: ', hls.subtitleDisplay );
  })

  // hls.on(Hls.Events.BUFFER_APPENDED, () => {
  //   console.log('чанк добавлен');
  //   console.log('hls.allSubtitleTracks: ', hls.allSubtitleTracks );
  //   console.log('hls.subtitleTracks: ', hls.subtitleTracks );

  // })

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

  // hls.on(Hls.Events.LEVEL_SWITCHED, () => {
  //   console.log('Обновлено качество: ', hls.currentLevel);
    
  // })

//   hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
//   console.log('SUBTITLE_TRACKS_UPDATED:', data.subtitleTracks);
// });

// hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
//   console.log('SUBTITLE_TRACK_SWITCH:', data);
// });

  hls.on(Hls.Events.ERROR, (event, data) => {
    if (typeof data.response?.data === 'string' && data.response.data.includes('#EXT-X-ENDLIST')) {
      console.log('Стрим закончился');
      setIsLiveStreamEnded(true)
    } else {
      console.error('HLS ERROR:', data);
    }
  });

  return (
    <PlayerProvider videoRef={videoRef} hls={hls} isLiveStream={isLiveStream} isLiveStreamEnded={isLiveStreamEnded}>
      <VideoTag duration={duration} videoRef={videoRef} fragments={fragments} isLiveStream={isLiveStream}/>
    </PlayerProvider>
  );
}
