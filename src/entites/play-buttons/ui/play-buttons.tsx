'use client'

import { RefObject } from "react"

import { handleRewind, handleForward } from "../lib/handlers"

import { usePlayerContext } from "@/component"

import styles from './styles.module.scss'


interface IPlayButtons {
    videoRef: RefObject<HTMLVideoElement | null>
    duration: number;
}   

export const PlayButtons: React.FC<IPlayButtons> = ({videoRef, duration}) => {
    const context = usePlayerContext();

    if (!videoRef || !videoRef.current) {
        return (
            <div className={styles.toolsBtns}>
                <button disabled>Загрузка...</button>
            </div>
        )
    }

    return (
        <div className={styles.toolsBtns}>
            <button 
                className={styles.rewindBtn} 
                onClick={(e: any) => {
                    handleRewind(videoRef, duration, context)
                }}
            >
                <img src="/images/png/forward10_Bold.png" alt="" height={30}/>
            </button>
            
            <button 
                className={styles.playBtnWrap} 
                onClick={(e: any) => {
                    context.setIsPaused((prev: boolean) => !prev)
                }}
            >
                {videoRef.current.paused ? 
                        <img className={styles.playBtn} src="/images/png/play-btn.png" alt="" height={24} />
                    : 
                        <img className={styles.pauseBtn} src="/images/png/stop-btn.png" alt="" height={24} />
                }
            </button>
            
            <button 
                className={styles.forwardBtn} 
                onClick={(e: any) => {
                    handleForward(videoRef, duration, context)
                }}
            >
                <img src="/images/png/rewind10_Bold.png" alt="" height={30}/>
            </button>
        </div>
    )
} 

