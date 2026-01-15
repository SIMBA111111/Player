'use client'

import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";

import styles from './styles.module.scss'

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

  const handlePlayPause = () => {
    if (videoRef.current?.paused) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }

  const handleMouseMove = () => {
    setIsVisibleTools(true)
    clearTimeout(hideToolsTimer.current)
    hideToolsTimer.current = setTimeout(() => {setIsVisibleTools(false)}, 2000)
  }

  const handleMouseLeave = () => {
    clearTimeout(hideToolsTimer.current)
    setIsVisibleTools(false)
  }

  const handleMouseOver = () => {
    setIsVisibleTools(true)
  }

  console.log(hls.levels);
  

  return (
    <div className={isVisibleTools ? styles.playerContainer : styles.playerContainer_hidden} onMouseMove={() => {handleMouseMove()}} onMouseLeave={() => {handleMouseLeave()}} onMouseOver={()=>{handleMouseOver()}}>
      <video className={styles.video} id='video' ref={videoRef}></video>
      <button className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} onClick={() => {handlePlayPause()}}>PLAY</button>
    </div>    
  );
}
