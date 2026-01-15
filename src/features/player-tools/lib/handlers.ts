import { HlsEventEmitter } from "hls.js"
import { RefObject } from "react"

export const handlePlayPause = (videoRef: RefObject<HTMLVideoElement | null>, hls: HlsEventEmitter) => {
    if (videoRef.current?.paused) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }