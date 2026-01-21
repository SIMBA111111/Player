'use client'

import { useRef, useState } from "react"

import { PlayerTools } from "@/features/player-tools/ui/player-tools"

import { VideoTagHandlers } from "../lib/handlers"
import { IVideoTag } from "../model/video-tag.interface"

import styles from './styles.module.scss'


export const VideoTag: React.FC<IVideoTag> = ({hls, duration, videoRef, fragments}) => {
    const [isVisibleTools, setIsVisibleTools] = useState(false)
    const [paused, setPaused] = useState<boolean>(true)
    const hideToolsTimer = useRef<any>(null)
    
    if (paused) {
        videoRef?.current?.pause() 
    }

    const {handleMouseMove, handleMouseLeave, handleMouseOver, handlePlayPause} = VideoTagHandlers(hideToolsTimer, setIsVisibleTools)

    return (
        <div id="playerContainer" className={isVisibleTools ? styles.playerContainer : styles.playerContainer_hidden} onClick={() => {handlePlayPause(videoRef, setPaused)}} onMouseMove={() => {handleMouseMove()}} onMouseLeave={() => {handleMouseLeave()}} onMouseOver={()=>{handleMouseOver()}}>
        {/* <div id="playerContainer" className={styles.playerContainer} onClick={() => {handlePlayPause(videoRef)}} onMouseMove={() => {handleMouseMove()}} onMouseLeave={() => {handleMouseLeave()}} onMouseOver={()=>{handleMouseOver()}}> */}
            <video className={styles.video} id='video' ref={videoRef}></video>
            <PlayerTools 
                hls={hls}
                duration={duration} 
                videoRef={videoRef} 
                isVisibleTools={isVisibleTools} 
                setIsVisibleTools={setIsVisibleTools} 
                paused={paused} 
                setPaused={setPaused}
                fragments={fragments}
                />
        </div>  
    )
}