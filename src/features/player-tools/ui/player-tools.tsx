'use client'

import { useEffect, useState } from "react";
import { handlePlayPause } from "../lib/handlers";
import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'

export const PlayerTools: React.FC<IPlayerTools> = ({hls, duration, videoRef, isVisibleTools, setIsVisibleTools}) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const time = video.currentTime;
            setCurrentTime(time);
            
            if (duration && duration > 0) {
                const newProgress = (time / duration) * 100;
                setProgress(newProgress);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [videoRef, hls, duration]);
    

    return (
        <div className={styles.toolsContainer}>
            <button className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} onClick={() => {handlePlayPause(videoRef, hls)}}>PLAY</button>
            {isVisibleTools && <div className={styles.progressContainer}>
                <div className={styles.progress} style={{width: `${progress}%`}}></div>
            </div>}
        </div>
    )
}