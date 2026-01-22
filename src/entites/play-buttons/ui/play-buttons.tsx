'use client'

import { RefObject } from "react"

import { handleRewind, handleForward } from "../lib/handlers"

import { usePlayerContext } from "@/app/page"

import styles from './styles.module.scss'


interface IPlayButtons {
    videoRef: RefObject<HTMLVideoElement | null>
    duration: number;
    isVisibleTools: boolean
    setProgress: (progress: number) => void;
}   

export const PlayButtons: React.FC<IPlayButtons> = ({videoRef, duration, isVisibleTools, setProgress}) => {
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
                // className={isVisibleTools ? styles.rewindBtn : styles.rewindBtn_hidden} 
                className={styles.rewindBtn} 
                onClick={(e: any) => {
                    handleRewind(videoRef, setProgress, duration, context)
                }}
            >
                <img src="/images/png/forward10_Bold.png" alt="" height={30}/>
            </button>
            
            <button 
                // className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} 
                className={styles.playBtnWrap} 
                onClick={(e: any) => {
                    context.setIsPaused((prev: boolean) => !prev)
                }}
            >
                {videoRef.current.paused ? 
                    <div className={styles.playBtn}>
                        <img src="/images/png/play-btn.png" alt="" height={24} />
                    </div> 
                    : 
                    <div className={styles.pauseBtn}>
                        <img src="/images/png/stop-btn.png" alt="" height={24} />
                    </div>
                }
            </button>
            
            <button 
                // className={isVisibleTools ? styles.forwardBtn : styles.forwardBtn_hidden} 
                className={styles.forwardBtn} 
                onClick={(e: any) => {
                    handleForward(videoRef, setProgress, duration, context)
                }}
            >
                <img src="/images/png/rewind10_Bold.png" alt="" height={30}/>
            </button>
        </div>
    )
} 

