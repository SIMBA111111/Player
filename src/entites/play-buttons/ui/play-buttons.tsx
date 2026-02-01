'use client'

import { RefObject, useEffect } from "react"

import { handleRewind, handleForward } from "../lib/handlers"

import { usePlayerContext } from "../../../component"
import rewindIcon from '../../../assets/images/png/rewind10_Bold.png'
import frowardIcon from '../../../assets/images/png/forward10_Bold.png'
import playIcon from '../../../assets/images/png/play-btn.png'
import stopIcon from '../../../assets/images/png/stop-btn.png'

import styles from './styles.module.scss'


interface IPlayButtons {
    videoRef: RefObject<HTMLVideoElement | null>
    duration: number;
}   

export const PlayButtons: React.FC<IPlayButtons> = ({videoRef, duration}) => {
    const context = usePlayerContext();

    useEffect(() => {
        const handleReel = (e: KeyboardEvent) => {
            if(e.key === 'ArrowRight') { 
                handleForward(videoRef)
                context.setIsVisibleTools(true)
                if (context.hideToolsTimer.current) clearTimeout(context.hideToolsTimer.current)
                context.hideToolsTimer.current = setTimeout(() => context.setIsVisibleTools(false), 2000)
            }
            if(e.key === 'ArrowLeft') {
                handleRewind(videoRef)
                context.setIsVisibleTools(true)
                if (context.hideToolsTimer.current) clearTimeout(context.hideToolsTimer.current)
                context.hideToolsTimer.current = setTimeout(() => context.setIsVisibleTools(false), 2000)
            }
            if(e.key === ' ') {
                context.setIsPaused((prev: boolean) => !prev)
                context.setIsVisibleTools(true)
                if (context.hideToolsTimer.current) clearTimeout(context.hideToolsTimer.current)
                context.hideToolsTimer.current = setTimeout(() => context.setIsVisibleTools(false), 2000)
            }
        }

        document.addEventListener('keyup', handleReel)

        return () => {
            document.removeEventListener('keyup', handleReel)
        }
    }, [])

    if (!videoRef || !videoRef.current) {
        return (
            <div className={styles.toolsBtns}>
                <button disabled>Загрузка...</button>
            </div>
        )
    }

    return (
        <div className={styles.toolsBtns}>
            {/* <div className={styles.plauBtnsWrap}> */}
            <button 
                className={styles.rewindBtn} 
                onClick={() => {
                    handleRewind(videoRef)
                }}
            >
                <img src={rewindIcon.src} alt="перемотать назад" height={30}/>
            </button>
            
            <button 
                className={styles.playBtnWrap} 
                onClick={() => {
                    context.setIsPaused((prev: boolean) => !prev)
                }}
            >
                {videoRef.current.paused ? 
                        <img className={styles.playBtn} src={playIcon.src} alt="кнопка плей" height={24} />
                    : 
                        <img className={styles.pauseBtn} src={stopIcon.src} alt="кнопка стоп" height={24} />
                }
            </button>
            
            <button 
                className={styles.forwardBtn} 
                onClick={() => {
                    handleForward(videoRef)
                }}
            >
                <img src={frowardIcon.src} alt="перемотать вперед" height={30}/>
            </button>
            {/* </div> */}
        </div>
    )
} 

