'use client'

import { useEffect, useState, useRef, useCallback } from "react";

import { ProgressBar } from '@/entites/progress-bar'

import { handleForward, handleMuteOnClick, handlePlayPause, handleRewind } from "../lib/handlers";
import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'
import { getHHSStime } from "@/shared/utils/getHHSStime";
import { SettingsButtons } from "@/entites/settings-buttons";

interface BufferedFragment {
    start: number;
    end: number;
}

export const PlayerTools: React.FC<IPlayerTools> = ({
    hls, 
    duration, 
    videoRef, 
    isVisibleTools, 
    setIsVisibleTools
}) => {
    const [progress, setProgress] = useState(0);

    return (
        <div className={styles.toolsContainer}>
            <div className={styles.toolsWrapper}
                onClick={(e) => e.stopPropagation()}
            >             

                <ProgressBar duration={duration} videoRef={videoRef} progress={progress} setProgress={setProgress} isVisibleTools={isVisibleTools}/>

                <div className={isVisibleTools ? styles.toolsBackground : styles.toolsBackground_hidden}></div>
                
                <div className={styles.toolsArea}>
                    <div className={styles.toolsBtns}>
                        <button 
                            // className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} 
                            // className={styles.playBtn} 
                            onClick={(e: any) => {
                                handleRewind(videoRef, setProgress, duration)
                            }}
                        >
                            назад на 2
                        </button>
                        
                        <button 
                            // className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} 
                            className={styles.playBtn} 
                            onClick={(e: any) => {
                                e.stopPropagation()
                                e.preventDefault()
                                handlePlayPause(videoRef)
                            }}
                        >
                            {videoRef.current?.paused ? "▶" : "⏸"}
                        </button>
                        
                        <button 
                            // className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} 
                            // className={styles.playBtn} 
                            onClick={(e: any) => {
                                handleForward(videoRef, setProgress, duration)
                            }}
                        >
                            вперед на 2
                        </button>
                    </div>

                    <div className={styles.soundVolume}>
                        <button onClick={(e: any) => handleMuteOnClick(videoRef)}>звук</button> 
                    </div>
                    <div className={styles.indicateTime}>
                        {videoRef.current?.currentTime ? getHHSStime(Math.trunc(videoRef.current.currentTime)) : '00:00'}
                         / {getHHSStime(Math.trunc(duration))} 
                    </div>
                    <SettingsButtons videoRef={videoRef}/>
                </div>
            </div>
        </div>
    );
};