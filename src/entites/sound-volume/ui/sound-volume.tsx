"use client"

import React, { RefObject, useEffect, useState } from 'react'

import { getHHSStime } from '@/shared/utils/getHHSStime'

import { 

    handleMouseClickSoundBtn, 
    handleMouseDownSoundBtn, 
    handleMouseUpSoundBtn, 
    handleMouseMoveSoundBtn, 
    handleMuteOnClick 
} from '../lib/handlers'

import styles from './styles.module.scss'


interface ISoundVolume {
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean;
    duration: number;
    fragmentTitle: string | undefined;
}  

export const SoundAndTimeVolume: React.FC<ISoundVolume> = ({videoRef, isVisibleTools, duration, fragmentTitle}) => {
    const [isVisibleSoundBar, setIsVisibleSoundBar] = useState<boolean>(false)
    const [currentVolume, setCurrentVolume] = useState<number>(50)
    const [isDraggingVolume, setIsDraggingVolume] = useState<boolean>(false)
    const [currentTime, setCurrentTime] = useState<number>(0)

    // Обновление времени видео
    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current
        
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)
        }
        
        video.addEventListener('timeupdate', handleTimeUpdate)
        setCurrentTime(video.currentTime)
        
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
        }
    }, [videoRef])

    // Глобальные обработчики для перетаскивания
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDraggingVolume) {
                setIsDraggingVolume(false)
            }
        }

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDraggingVolume && videoRef.current) {
                const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
                if (!soundVolumeBackgroundBar) return

                const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()
                
                let newCurrentVolume = ((e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width) * 100
                newCurrentVolume = Math.max(0, Math.min(100, newCurrentVolume))
                
                setCurrentVolume(newCurrentVolume)
                videoRef.current.volume = newCurrentVolume / 100
            }
        }

        window.addEventListener('mouseup', handleGlobalMouseUp)
        window.addEventListener('mousemove', handleGlobalMouseMove)

        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp)
            window.removeEventListener('mousemove', handleGlobalMouseMove)
        }
    }, [isDraggingVolume, videoRef])

    if(!videoRef.current) return null

    return (
        // <div className={isVisibleTools ? styles.soundAndTimeContainer : styles.soundAndTimeContainer_hidden}>
        <div className={styles.soundAndTimeContainer}>
            <div className={isVisibleSoundBar ? styles.soundContainer : styles.soundContainer_hidden} 
                onMouseEnter={() => setIsVisibleSoundBar(true)}
                onMouseLeave={() => {
                    if (!isDraggingVolume) {
                        setIsVisibleSoundBar(false)
                    }
                }}
            >
                <button 
                    className={styles.soundBtn} 
                    onClick={() => handleMuteOnClick(videoRef, setCurrentVolume)}
                >
                    <img src="/images/png/sound.png" alt="Sound" height={30}/>    
                </button> 
                
                <div 
                    id='soundVolumeBackground' 
                    className={isVisibleSoundBar ? styles.soundVolumeBackground : styles.soundVolumeBackground_hidden} 
                    onClick={(e) => handleMouseClickSoundBtn(e, videoRef, setCurrentVolume)}
                    onMouseDown={(e) => handleMouseDownSoundBtn(setIsDraggingVolume)}
                    onMouseUp={(e) => handleMouseUpSoundBtn(setIsDraggingVolume)}
                    onMouseMove={(e) => handleMouseMoveSoundBtn(e, isDraggingVolume, setCurrentVolume, videoRef)}
                >
                    <div 
                        id='filledSoundBar' 
                        className={styles.soundVolumeFilled} 
                        style={{width: `${currentVolume}%`}}
                    >
                        <div 
                            className={isVisibleSoundBar ? styles.pointer : styles.pointer_hidden}
                            onMouseDown={(e) => {
                                e.stopPropagation()
                                handleMouseDownSoundBtn(setIsDraggingVolume)
                            }}
                            onMouseUp={(e) => {
                                e.stopPropagation()
                                handleMouseUpSoundBtn(setIsDraggingVolume)
                            }}
                        ></div>
                    </div>
                </div>
            </div>
            
            <div className={isVisibleSoundBar ? styles.indicateTime : styles.indicateTime_narrowed}>
                {getHHSStime(Math.trunc(currentTime))} / {getHHSStime(Math.trunc(duration))} 
            </div>

            <div className={styles.fragmentTitle}>{fragmentTitle}</div>
        </div>
    )
}