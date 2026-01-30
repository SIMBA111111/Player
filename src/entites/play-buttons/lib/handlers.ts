import { RefObject } from "react"

export const handleForward = (videoRef: RefObject<HTMLVideoElement | null>) => {
    if(videoRef.current) {
        const newTime = videoRef.current?.currentTime + 2
        videoRef.current.currentTime = newTime
    }
}

export const handleRewind = (videoRef: RefObject<HTMLVideoElement | null>) => {
        if(videoRef.current) {
        const newTime = videoRef.current?.currentTime - 2
        videoRef.current.currentTime = newTime
    }
}