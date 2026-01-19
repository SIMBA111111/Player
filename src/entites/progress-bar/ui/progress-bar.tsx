'use client'

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { getHHSStime } from "@/shared/utils/getHHSStime"

import { handleDocumentMouseMove, handleDocumentMouseUp, handleMouseDown, handleMouseOverOnProgressBar, handleProgressClick } from "../lib/handlers"

import styles from './styles.module.scss'

interface IProgressBar {
    duration: number;
    videoRef: RefObject<any>;
    // hoverTime: number;
    // setHoverTime: (time: number) => void;
    progress: number;
    setProgress: (progress: number) => void;
    isVisibleTools: boolean;
}

interface IBufferedFragment {
    start: number;
    end: number;
}

export const ProgressBar: React.FC<IProgressBar> = ({duration, videoRef, progress, setProgress, isVisibleTools}) => {
    const [hoverTime, setHoverTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [bufferedFragments, setBufferedFragments] = useState<IBufferedFragment[]>([]);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<any>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleDocumentMouseMove(e, duration, setProgress, setHoverTime, videoRef, progressContainerRef, debounceRef);
    }, [duration, videoRef]);

    const handleMouseUp = useCallback((e: MouseEvent) => {
        handleDocumentMouseUp(e, setHoverTime, setIsDragging, videoRef, duration, progressContainerRef);
    }, [duration, videoRef]);

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

    useEffect(() => {
        if (!videoRef?.current) return;
        
        const videoElement = videoRef.current;
        
        const updateBufferedRanges = () => {
            const fragments: IBufferedFragment[] = [];
            
            // Собираем все буферизированные фрагменты
            for (let index = 0; index < videoElement.buffered.length; index++) {
                fragments.push({
                    start: videoElement.buffered.start(index),
                    end: videoElement.buffered.end(index)
                });
            }
            
            setBufferedFragments(fragments);
        };
        
        // Initial update
        updateBufferedRanges();
        
        videoElement.addEventListener('progress', updateBufferedRanges);
        videoElement.addEventListener('loadeddata', updateBufferedRanges);
        
        return () => {
            videoElement.removeEventListener('progress', updateBufferedRanges);
            videoElement.removeEventListener('loadeddata', updateBufferedRanges);
        };
    }, [videoRef]);

    return (
        <>
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
                onMouseMove={(e: any)=> {handleMouseOverOnProgressBar(e, videoRef, duration, progressContainerRef, setHoverTime)}}

            >
                {bufferedFragments.map((fragment, index) => {
                    const startPercent = (fragment.start / duration) * 100;
                    const widthPercent = ((fragment.end - fragment.start) / duration) * 100;
                    
                    return (
                        <div 
                            key={index}
                            className={styles.progressBuffered}
                            style={{
                                left: `${startPercent}%`,
                                width: `${widthPercent}%`,
                                position: 'absolute',
                            }}
                        ></div>
                    );
                })}
                <div className={styles.progressBackground}></div>
                <div 
                    className={styles.progressFilled}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </>
    )
}