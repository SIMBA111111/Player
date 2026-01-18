'use client'

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import { VideoTag } from "@/widget/video-tag/ui/video-tag";

const VIDEODATA = {
  url: '/videos/test2/outTest2.m3u8',
  duration: 85.333,
}

export default function Home() {
  const [isVisibleTools, setIsVisibleTools] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hideToolsTimer = useRef<any>(null)
  
  const hls = new Hls()
  

  // console.log('hls.bufferedToEnd = ', hls.bufferedToEnd);
  // console.log('hls.bufferingEnabled = ', hls.bufferingEnabled);
  // console.log('hls.maxBufferLength = ', hls.maxBufferLength);
  // console.log('hls.mainForwardBufferInfo = ', hls.mainForwardBufferInfo);
  console.log('videoRef.current?.buffered = ', videoRef.current?.buffered);
  

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
    console.log('буферезировано');
  })

  hls.on(Hls.Events.BUFFER_APPENDED, () => {
    console.log('чанк добавлен');
  })

  return (
    <VideoTag hls={hls} duration={VIDEODATA.duration} videoRef={videoRef} hideToolsTimer={hideToolsTimer} isVisibleTools={isVisibleTools} setIsVisibleTools={setIsVisibleTools}/>
  );
}
