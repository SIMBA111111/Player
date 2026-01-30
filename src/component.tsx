'use client'

import Hls from "hls.js";
import { createContext, RefObject, useCallback, useContext, useEffect, useRef, useState } from "react";

import { VideoTag } from "./widget/video-tag/ui/video-tag";
import React from "react";
import { IFragment } from "@/widget/video-tag/model/video-tag.interface";

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

interface IPlayer {
    playlistUrl: string
    duration: number
    fragments: IFragment[]
}

export const Player: React.FC<IPlayer> = ({playlistUrl, duration, fragments}) => {

  const videoRef = useRef<HTMLVideoElement>(null)
  
  const hls = new Hls({startLevel: -1, maxBufferLength: 10, lowLatencyMode: false, maxBufferSize: 10 * 1000 * 1000,
    maxMaxBufferLength: 60, 
    // debug: true
  })
  
  useEffect(() =>{
    if (Hls.isSupported() && videoRef.current) {
      console.log('playlistUrl ======= ', playlistUrl);
      
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

  hls.on(Hls.Events.LEVEL_SWITCHED, () => {
    console.log('Обновлено качество: ', hls.currentLevel);
    
  })

  hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
  console.log('SUBTITLE_TRACKS_UPDATED:', data.subtitleTracks);
});

hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (event, data) => {
  console.log('SUBTITLE_TRACK_SWITCH:', data);
});

hls.on(Hls.Events.ERROR, (event, data) => {
  console.error('HLS ERROR:', data);
});

  return (
    <PlayerProvider videoRef={videoRef} hls={hls}>
      <VideoTag duration={duration} videoRef={videoRef} fragments={fragments}/>
    </PlayerProvider>
  );
}
