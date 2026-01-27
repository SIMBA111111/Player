'use client'

import { RefObject, useRef, useState } from "react"

import { PlayerTools } from "@/features/player-tools/ui/player-tools"
import { usePlayerContext } from "@/component"

import { VideoTagHandlers } from "../lib/handlers"
import { IVideoTag } from "../model/video-tag.interface"

import styles from './styles.module.scss'


export const VideoTag: React.FC<IVideoTag> = ({hls, duration, videoRef, fragments}) => {
    const [isVisibleTools, setIsVisibleTools] = useState(false)
    const hideToolsTimer = useRef<any>(null)
    const context = usePlayerContext();

    const {handleMouseMove, handleMouseLeave} = 
        VideoTagHandlers(hideToolsTimer, setIsVisibleTools)

    return (
        <div 
            id="playerContainer" 
            className={isVisibleTools ? styles.playerContainer : styles.playerContainer_hidden} 
            onClick={() => {context.setIsPaused(prev => !prev)}} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <video className={styles.video} id='video' ref={videoRef}></video>
            <PlayerTools 
                duration={duration} 
                videoRef={videoRef} 
                isVisibleTools={isVisibleTools} 
                fragments={fragments}
            />
        </div>  
    )
}