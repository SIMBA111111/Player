import { IFragment } from "@/widget/video-tag/model/video-tag.interface";
import { HlsEventEmitter } from "hls.js";
import { RefObject } from "react";

export interface IPlayerTools {
    hls: any
    duration: number
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean
    setIsVisibleTools: (isVisible: boolean) => void
    fragments: IFragment[]
}