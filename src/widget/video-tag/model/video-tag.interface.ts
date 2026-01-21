import { HlsEventEmitter } from "hls.js";
import { RefObject } from "react";

export interface IFragment{
    start: number;
    end: number;
    title: string
}

export interface IVideoTag {
    hls: HlsEventEmitter
    duration: number
    videoRef: RefObject<HTMLVideoElement | null>
    fragments: IFragment[]
}

export interface IVideoTagHandlers {
    hideToolsTimer: RefObject<any>
    setIsVisibleTools: (isVisible: boolean) => void
}