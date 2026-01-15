import { HlsEventEmitter } from "hls.js";
import { RefObject } from "react";

export interface IPlayerTools {
    hls: HlsEventEmitter
    duration: number
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean
    setIsVisibleTools: (isVisible: boolean) => void
}