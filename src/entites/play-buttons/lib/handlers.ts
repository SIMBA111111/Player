import { RefObject } from "react"

export const handleForward = (videoRef: RefObject<HTMLVideoElement | null>, setProgress: (progres: number) => void, duration: number, context: any) => {
    if(videoRef.current) {
        const newTime = videoRef.current?.currentTime + 2
        videoRef.current.currentTime = newTime
        setProgress(newTime / duration * 100) 
    }
}

export const handleRewind = (videoRef: RefObject<HTMLVideoElement | null>, setProgress: (progres: number) => void, duration: number, context: any) => {
        if(videoRef.current) {
        const newTime = videoRef.current?.currentTime - 2
        videoRef.current.currentTime = newTime

        setProgress(newTime / duration * 100) 
    }
}