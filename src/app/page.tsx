'use client'

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import { VideoTag } from "@/widget/video-tag/ui/video-tag";

const VIDEODATA = {
  url: '/videos/output.m3u8',
  duration: 7.388,
}

export default function Home() {
  const [isVisibleTools, setIsVisibleTools] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hideToolsTimer = useRef<any>(null)
  
  const hls = new Hls()

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

  return (
    <VideoTag hls={hls} duration={VIDEODATA.duration} videoRef={videoRef} hideToolsTimer={hideToolsTimer} isVisibleTools={isVisibleTools} setIsVisibleTools={setIsVisibleTools}/>
  );
}
