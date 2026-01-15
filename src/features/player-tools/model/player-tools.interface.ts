import { RefObject } from "react";

export interface IPlayerTools {
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean
    setIsVisibleTools: (isVisible: boolean) => void
}