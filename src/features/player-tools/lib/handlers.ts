import { RefObject } from "react"

export const handlePlayPause = (videoRef: RefObject<HTMLVideoElement | null>) => {
  if (videoRef.current?.paused) {
    videoRef.current?.play()
  } else {
    videoRef.current?.pause()
  }
}