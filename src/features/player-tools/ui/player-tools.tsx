'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { handleDocumentMouseMove, handleDocumentMouseUp, handleForward, handleMouseDown, handleMouseOverOnProgressBar, handlePlayPause, handleProgressBarMouseMove, handleProgressClick, handleRewind } from "../lib/handlers";
import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'
import { getHHSStime } from "../utils/getHHSStime";

export const PlayerTools: React.FC<IPlayerTools> = ({
    hls, 
    duration, 
    videoRef, 
    isVisibleTools, 
    setIsVisibleTools
}) => {
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverTime, setHoverTime] = useState<number>(0);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<any>(null);

    // Обновление прогресса при изменении времени видео
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (duration > 0) {
                const currentProgress = (video.currentTime / duration) * 100;
                setProgress(currentProgress);
            }
        };

        video.addEventListener('timeupdate', updateProgress);
        
        return () => {
            video.removeEventListener('timeupdate', updateProgress);
        };
    }, [videoRef, duration]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleDocumentMouseMove(e, duration, setProgress, setHoverTime, videoRef, progressContainerRef, debounceRef);
    }, [duration, videoRef]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        handleDocumentMouseUp(e, setHoverTime, setIsDragging, videoRef, duration, progressContainerRef);
    }, [duration, videoRef]);

    // Эффект для подписки на события мыши на document при перетаскивании
    useEffect(() => {
        if (!isDragging) return;

        document.addEventListener('mousemove', handleMouseMove, {passive: true});
        document.addEventListener('mouseup', handleMouseUp, {passive: true});

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div className={styles.toolsContainer}>
            <div className={styles.toolsWrapper}
                onClick={(e) => e.stopPropagation()}
            >             

                <div id='timeHover' className={hoverTime ? styles.progressTimeHover : styles.progressTimeHover_hidden}>
                {/* <div id='timeHover' className={styles.progressTimeHover}> */}
                    {getHHSStime(Math.trunc(hoverTime))}
                </div>
                <div 
                    id="progressBar"
                    ref={progressContainerRef}
                    // className={isVisibleTools ? styles.progressContainer : styles.progressContainer_hidden}
                    className={styles.progressContainer}
                    onClick={(e: any) => { handleProgressClick(e, duration, setProgress, videoRef, progressContainerRef, debounceRef) }}
                    onMouseDown={(e: any) => { handleMouseDown(e, setIsDragging) }}
                    // onMouseOver={(e: any)=> {handleMouseOverOnProgressBar(e, videoRef, duration, progressContainerRef, setHoverTime)}}
                    onMouseLeave={(e: any)=> {setHoverTime(0)}}

                >
                    <div className={styles.progressBackground}></div>
                    <div 
                        className={styles.progressFilled}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
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
                    <div className={styles.indicateTime}>
                        {videoRef.current?.currentTime ? getHHSStime(Math.trunc(videoRef.current.currentTime)) : '00:00'}
                         / {getHHSStime(Math.trunc(duration))} 
                    </div>
                </div>
            </div>
        </div>
    );
};