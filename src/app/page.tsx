'use client'

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import { VideoTag } from "@/widget/video-tag/ui/video-tag";

export default function Home() {
  const [isVisibleTools, setIsVisibleTools] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const hideToolsTimer = useRef<any>(null)
  
  const hls = new Hls()
  useEffect(() =>{
    if (Hls.isSupported() && videoRef.current) {
      hls.loadSource('/videos/output.m3u8')
      hls.attachMedia(videoRef.current)
    }
  }, [])
  

  hls.on(Hls.Events.MEDIA_ATTACHED, function () {
    console.log('video and hls.js are now bound together !');
  });

  return (
    <VideoTag videoRef={videoRef} hideToolsTimer={hideToolsTimer} isVisibleTools={isVisibleTools} setIsVisibleTools={setIsVisibleTools}/>
  );
}
