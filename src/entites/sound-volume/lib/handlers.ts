import { RefObject } from "react"

export const handleMuteOnClick = (videoRef: RefObject<HTMLVideoElement | null>) => {
    if (!videoRef || !videoRef.current) return 

    videoRef.current.muted ? videoRef.current.volume = 1 : videoRef.current.volume = 0  
}