import { RefObject } from "react";

export interface IVideoTag {
    hideToolsTimer: RefObject<any>
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean
    setIsVisibleTools: (isVisible: boolean) => void
}

export interface IVideoTagHandlers {
    hideToolsTimer: RefObject<any>
    setIsVisibleTools: (isVisible: boolean) => void
}