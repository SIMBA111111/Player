'use client'

import { useState } from "react";

import { ProgressBar } from '@/entites/progress-bar'
import { SettingsButtons } from "@/entites/settings-buttons";
import { PlayButtons } from "@/entites/play-buttons";
import { SoundAndTimeVolume } from "@/entites/sound-volume";

import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'

interface BufferedFragment {
    start: number;
    end: number;
}

export const PlayerTools: React.FC<IPlayerTools> = ({
    hls, 
    duration, 
    videoRef, 
    isVisibleTools, 
    setIsVisibleTools,
    fragments
}) => {
    const [progress, setProgress] = useState(0);

    return (
        <div className={styles.toolsContainer}>
            <div className={styles.toolsWrapper}
                onClick={(e) => e.stopPropagation()}
            >             

                <ProgressBar 
                    duration={duration}
                    videoRef={videoRef} 
                    progress={progress} 
                    setProgress={setProgress} 
                    isVisibleTools={isVisibleTools} 
                    fragments={fragments}    
                />

                {/* <div className={isVisibleTools ? styles.toolsBackground : styles.toolsBackground_hidden}></div> */}
                <div className={styles.toolsBackground}></div>
                
                <div className={styles.toolsArea}>

                    <PlayButtons videoRef={videoRef} duration={duration} isVisibleTools={isVisibleTools} setProgress={setProgress}/>

                    <SoundAndTimeVolume videoRef={videoRef} isVisibleTools={isVisibleTools} duration={duration}/>

                    <SettingsButtons videoRef={videoRef} isVisibleTools={isVisibleTools} hls={hls}/>
                </div>
            </div>
        </div>
    );
};