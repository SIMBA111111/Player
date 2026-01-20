'use client'

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import { VideoTag } from "@/widget/video-tag/ui/video-tag";

const VIDEODATA = {
  url: '/videos/test3/master-playlist.m3u8',
  duration: 42.333,
}

export default function Home() {

  const videoRef = useRef<HTMLVideoElement>(null)
  
  const hls = new Hls({startLevel: 2})

  hls.startLevel = 2
  
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
    console.log('Доступные уровни качества:')
    
    levels.forEach((level, index) => {
      console.log(`${index}: ${level.height}p, ${Math.round(level.bitrate/1000)}kbps`)
    })
    
    // Автоматически выбрать максимальное качество (2K если есть)
    const maxQualityIndex = levels.length - 1
    const highestQuality = levels[maxQualityIndex]

    hls.currentLevel = 2

    // if (highestQuality.height >= 1440) {
    //   console.log(`2K качество доступно: ${highestQuality.height}p`)
    //   hls.currentLevel = maxQualityIndex
    // }
  })

  return (
    <VideoTag hls={hls} duration={VIDEODATA.duration} videoRef={videoRef}/>
  );
}
