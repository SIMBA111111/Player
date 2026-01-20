"use client"

import React, { RefObject, useEffect, useState } from 'react'
import { handleMouseClickSoundBtn, handleMuteOnClick } from '../lib/handlers'

import styles from './styles.module.scss'
import { getHHSStime } from '@/shared/utils/getHHSStime'

interface ISoundVolume {
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean;
    duration: number;
}  

export const SoundAndTimeVolume: React.FC<ISoundVolume> = ({videoRef, isVisibleTools, duration}) => {
    const [isVisibleSoundBar, setIsVisibleSoundBar] = useState<boolean>(false)
    const [currentVolume, setCurrentVolume] = useState<number>(50)
    const [isDraggingVolume, setIsDraggingVolume] = useState<boolean>(false)
    const [currentTime, setCurrentTime] = useState<number>(0) // ← Добавляем состояние для времени


    useEffect(() => {
        if (!videoRef.current) return

        const video = videoRef.current
        
        // Обработчик обновления времени
        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime)
        }
        
        // Подписываемся на событие timeupdate
        video.addEventListener('timeupdate', handleTimeUpdate)
        
        // Инициализируем начальное время
        setCurrentTime(video.currentTime)
        
        // Отписываемся при размонтировании
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
        }
    }, [videoRef])

    if(!videoRef.current) return 
    
    // const handleMouseOverSoundBtn = () => {
    //     setIsVisibleSoundBar(true)
    // }

    // const handleMouseLeaveSoundBtn = () => {
    //     setIsVisibleSoundBar(false)
    // }

    // const handleMouseClickSoundBtn = (e: any) => {
    //     const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
        
    //     if(!soundVolumeBackgroundBar || !videoRef.current) return 

    //     const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()

    //     const positionOfNewVolume = (e.clientX - positionOfSoundBar?.left) / positionOfSoundBar.width

    //     videoRef.current.volume = Math.trunc(positionOfNewVolume * 10) / 10

    //     setCurrentVolume(Math.trunc(positionOfNewVolume * 100))
    // }

    // const handleMouseDownSoundBtn = () => {
    //     setIsDraggingVolume(true)
    // }

    // const handleMouseMoveSoundBtn = (e: any) => {
    //     if(!isDraggingVolume) return

    //     const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
    //     const positionOfSoundBar = soundVolumeBackgroundBar?.getBoundingClientRect()
        
    //     if(!positionOfSoundBar) return

    //     const newCurrentVolume = (e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width * 100

    //     setCurrentVolume(newCurrentVolume)
    // }

    // const handleMouseUpSoundBtn = () => {
    //     setIsDraggingVolume(false)
    // }

    return (
        // <div className={isVisibleTools ? styles.soundVolume : styles.soundVolume_hidden}>
        <div className={styles.soundAndTimeContainer}>
            <div className={isVisibleSoundBar ? styles.soundContainer : styles.soundContainer_hidden} onMouseOver={(e: any) => handleMouseOverSoundBtn()} onMouseLeave={(e: any) => handleMouseLeaveSoundBtn()}>
                <button className={styles.soundBtn} onClick={(e: any) => handleMuteOnClick(videoRef, setCurrentVolume)}>
                    <img src="/images/png/sound.png" alt="" height={30}/>    
                </button> 
                <div id='soundVolumeBackground' className={isVisibleSoundBar ? styles.soundVolumeBackground : styles.soundVolumeBackground_hidden} 
                    onClick={(e: any) => handleMouseClickSoundBtn(e, videoRef, setCurrentVolume)}
                    onMouseMove={(e: any) => handleMouseMoveSoundBtn(e)}
                    onMouseDown={(e: any) => handleMouseDownSoundBtn()}
                    onMouseUp={(e: any) => handleMouseUpSoundBtn()}
                >
                    <div id='filledSoundBar' className={styles.soundVolumeFilled} style={{width: `${currentVolume}%`}}/>
                </div>
            </div>
            <div className={styles.indicateTime}>
                {videoRef.current?.currentTime ? getHHSStime(Math.trunc(videoRef.current.currentTime)) : '00:00'} / {getHHSStime(Math.trunc(duration))} 
            </div>
        </div>
    )
} 