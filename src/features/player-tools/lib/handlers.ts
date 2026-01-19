import { RefObject } from "react"

export const handlePlayPause = (videoRef: RefObject<HTMLVideoElement | null>) => {
  if (videoRef.current?.paused) {
    videoRef.current?.play()
  } else {
    videoRef.current?.pause()
  }
}

export const handleForward = (videoRef: RefObject<any>, setProgress: any, duration: number) => {
    if(videoRef.current) {
        const newTime = videoRef.current?.currentTime + 2
        videoRef.current.currentTime = newTime
        setProgress(newTime / duration * 100) 
    }
}

export const handleRewind = (videoRef: RefObject<any>, setProgress: any, duration: number) => {
        if(videoRef.current) {
        const newTime = videoRef.current?.currentTime - 2
        videoRef.current.currentTime = newTime
        setProgress(newTime / duration * 100) 
    }
}