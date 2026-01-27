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
        }, 3000);
    };

    const handleMouseLeave = () => {
        if (hideToolsTimer.current) {
            clearTimeout(hideToolsTimer.current);
        }
        setIsVisibleTools(false);
    };

    return {
        handleMouseMove,
        handleMouseLeave,
    };
};