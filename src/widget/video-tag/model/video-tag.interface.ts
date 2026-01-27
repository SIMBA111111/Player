import Hls from "hls.js";
import { RefObject } from "react";

export interface IFragment{
    start: number;
    end: number;
    title: string
}

export interface IVideoTag {
    hls: Hls
    duration: number
    videoRef: RefObject<HTMLVideoElement | null>
    fragments: IFragment[]
}

export interface IVideoTagHandlers {
    hideToolsTimer: RefObject<any>
    setIsVisibleTools: (isVisible: boolean) => void
}