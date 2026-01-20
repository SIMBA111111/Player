"use client"

import React, { RefObject, useState } from 'react'
import { handleMuteOnClick } from '../lib/handlers'

import styles from './styles.module.scss'

interface ISoundVolume {
    videoRef: RefObject<HTMLVideoElement | null>
    isVisibleTools: boolean;
}  

export const SoundVolume: React.FC<ISoundVolume> = ({videoRef, isVisibleTools}) => {
    const [isVisibleSoundBar, setIsVisibleSoundBar] = useState<boolean>(false)


    const handleMouseOverSoundBtn = () => {
        setIsVisibleSoundBar(true)
    }

    return (
        // <div className={isVisibleTools ? styles.soundVolume : styles.soundVolume_hidden}>
        <div className={styles.soundContainer} onMouseOver={(e: any) => handleMouseOverSoundBtn()}>
            <button className={styles.soundBtn} onClick={(e: any) => handleMuteOnClick(videoRef)}>
                <img src="/images/png/sound.png" alt="" height={30}/>    
            </button> 
            <div className={styles.soundVolumeBackground}></div>
        </div>
    )
} 