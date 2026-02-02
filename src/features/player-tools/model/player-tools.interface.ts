import { RefObject } from "react";
import Hls from "hls.js";

import { IFragment } from "../../../widget/video-tag/model/video-tag.interface";

export interface IPlayerTools {
    duration?: number
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean
    fragments?: IFragment[]
}