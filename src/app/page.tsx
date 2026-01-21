'use client'

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import { VideoTag } from "@/widget/video-tag/ui/video-tag";

const VIDEODATA = {
  // url: '/videos/hls_output/output.m3u8',
  // duration: 4.766,
  // url: '/videos/sound/sound1440p.m3u8',
  // duration: 9.633,
  // url: '/videos/test3/master-playlist.m3u8',
  // duration: 42.333,
  // url: '/videos/test2/outTest2.m3u8',
  // duration: 85.333,
  url: '/videos/test4/master-playlist.m3u8',
  duration: 9.585,
  fragments : [
    {
      start: 0.000,
      end: 2.000,
      title: 'не начало'
    },
    {
      start: 2.000,
      end: 4.000,
      title: 'экспозиция'
    },
    {
      start: 4.000,
      end: 7.000,
      title: 'контент'
    },
    {
      start: 7.000,
      end: 9.585,
      title: 'концовка'
    },
  ]
}

export default function Home() {

  const videoRef = useRef<HTMLVideoElement>(null)
  
  const hls = new Hls({startLevel: -1})

  // hls.startLevel = 2
  
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
    <VideoTag hls={hls} duration={VIDEODATA.duration} videoRef={videoRef} fragments={VIDEODATA.fragments}/>
  );
}
