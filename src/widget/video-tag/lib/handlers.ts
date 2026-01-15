import { IVideoTagHandlers } from "../model/video-tag.interface"
import { RefObject } from "react";

export const VideoTagHandlers = (
    hideToolsTimer: RefObject<NodeJS.Timeout | null>,
    setIsVisibleTools: (visible: boolean) => void
) => {
    
    const handleMouseMove = () => {
        setIsVisibleTools(true);
        if (hideToolsTimer.current) {
            clearTimeout(hideToolsTimer.current);
        }
        hideToolsTimer.current = setTimeout(() => {
            setIsVisibleTools(false);
        }, 2000);
    };

    const handleMouseLeave = () => {
        if (hideToolsTimer.current) {
            clearTimeout(hideToolsTimer.current);
        }
        setIsVisibleTools(false);
    };

    const handleMouseOver = () => {
        setIsVisibleTools(true);
    };

    const handlePlayPause = (videoRef: RefObject<HTMLVideoElement | null>) => {
      if (videoRef.current?.paused) {
        videoRef.current?.play()
      } else {
        videoRef.current?.pause()
      }
    }

    return {
        handleMouseMove,
        handleMouseLeave,
        handleMouseOver,
        handlePlayPause
    };
};