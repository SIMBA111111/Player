'use client'

import { useRef, useState } from "react"

import { PlayerTools } from "../../../features/player-tools/ui/player-tools"
import { usePlayerContext } from "../../../component"
import { VideoTagHandlers } from "../lib/handlers"
import { IVideoTag } from "../model/video-tag.interface"

import styles from './styles.module.scss'


export const VideoTag: React.FC<IVideoTag> = ({duration, videoRef, fragments, isLiveStream}) => {
    const context = usePlayerContext();

    const {handleMouseMove, handleMouseLeave} = 
        VideoTagHandlers(context.hideToolsTimer, context.setIsVisibleTools)

    return (
        <div 
            id="playerContainer" 
            className={context.isVisibleTools ? styles.playerContainer : styles.playerContainer_hidden} 
            onClick={() => {context.setIsPaused(prev => !prev)}} 
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <video className={styles.video} id='video' ref={videoRef}></video>
            <PlayerTools 
                duration={duration} 
                videoRef={videoRef} 
                isVisibleTools={context.isVisibleTools} 
                fragments={fragments}
            />
        </div>  
    )
}