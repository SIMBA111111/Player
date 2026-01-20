import { HlsEventEmitter } from "hls.js";
import { RefObject } from "react";

export interface IVideoTag {
    hls: HlsEventEmitter
    duration: number
    videoRef: RefObject<HTMLVideoElement | null>
}

export interface IVideoTagHandlers {
    hideToolsTimer: RefObject<any>
    setIsVisibleTools: (isVisible: boolean) => void
}