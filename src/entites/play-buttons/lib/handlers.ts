import { RefObject } from "react"

export const handlePlayPause = (videoRef: RefObject<HTMLVideoElement | null>, setPaused: (paused: boolean) => void) => {
  if (videoRef.current?.paused) {
    videoRef.current?.play()
    setPaused(false)
  } else {
    videoRef.current?.pause()
    setPaused(true)
  }
}

export const handleForward = (videoRef: RefObject<HTMLVideoElement | null>, setProgress: (progres: number) => void, duration: number, context: any) => {
    if(videoRef.current) {
        const newTime = videoRef.current?.currentTime + 2
        context.hls.startLoad(newTime);
        videoRef.current.currentTime = newTime
        setProgress(newTime / duration * 100) 
    }
}

export const handleRewind = (videoRef: RefObject<HTMLVideoElement | null>, setProgress: (progres: number) => void, duration: number, context: any) => {
        if(videoRef.current) {
        const newTime = videoRef.current?.currentTime - 2
        context.hls.startLoad(newTime);
        videoRef.current.currentTime = newTime

        setProgress(newTime / duration * 100) 
    }
}