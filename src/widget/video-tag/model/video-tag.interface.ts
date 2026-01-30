import Hls from "hls.js";
import { RefObject } from "react";

export interface IFragment{
    start: number;
    end: number;
    title: string
}

export interface IVideoTag {
    duration: number
    videoRef: RefObject<HTMLVideoElement | null>
    fragments: IFragment[]
}

export interface IVideoTagHandlers {
    setIsVisibleTools: (isVisible: boolean) => void
}