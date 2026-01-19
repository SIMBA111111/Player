import { RefObject } from "react";

export const handleChangeVideoSpeed = (videoRef: RefObject<any>, value: number) => {
    if(!videoRef || !videoRef.current) return

    videoRef.current.playbackRate = value 
}