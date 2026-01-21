'use client'

import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import { getHHSStime } from "@/shared/utils/getHHSStime"
import { IFragment } from "@/widget/video-tag/model/video-tag.interface";

import { handleDocumentMouseMove, handleDocumentMouseUp, handleMouseDown, handleMouseOverOnProgressBar, handleProgressClick } from "../lib/handlers"

import styles from './styles.module.scss'


interface IProgressBar {
    duration: number;
    videoRef: RefObject<any>;
    progress: number;
    setProgress: (progress: number) => void;
    isVisibleTools: boolean;
    setPaused: (paused: boolean) => void
    fragments: IFragment[]
}

interface IBufferedFragment {
    start: number;
    end: number;
}

export const ProgressBar: React.FC<IProgressBar> = ({duration, videoRef, progress, setProgress, isVisibleTools, setPaused, fragments}) => {
    const [hoverTime, setHoverTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [bufferedFragments, setBufferedFragments] = useState<IBufferedFragment[]>([]);
    const progressContainerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleDocumentMouseMove(e, duration, setProgress, setHoverTime, videoRef, progressContainerRef);
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

    const fragmentedProgressBar = () => {
        return fragments.map((fragment: IFragment, index: number) => {
            const fragmentTime = fragment.end - fragment.start
            const fragmentWight = fragmentTime * 100 / duration
            // console.log(`fragmentWight ${index + 1}: `, fragmentWight);

            return (
                <>
                <div key={index} className={styles.progressBackground} style={{width: `${fragmentWight}%`}}></div>
                {/* <div 
                    className={styles.progressFilled}
                    style={{ width: `${fragmentWight}%` }}
                ></div> */}
                {/* <div className={styles.progressFilledContainer}>
                    {fragmentWight > progress ?
                        <div 
                            className={styles.progressFilled}
                            style={{ width: `${fragmentWight}%` }}
                        >
                        </div> 
                        : 
                        <div 
                            className={styles.progressFilled}
                            style={{ width: `100%` }}
                        >
                        </div> 
                    }
                </div> */}
                </>
            )

        })
    }



    const fragmentedFilledBar = () => {
        var filled = 0
        return fragments.map((fragment: IFragment, index: number) => {
            const fragmentTime = fragment.end - fragment.start
            const fragmentWight = fragmentTime * 100 / duration
            // console.log(`fragmentWight ${index + 1}: `, fragmentWight);
            filled += fragmentWight
            return (
                <>
                {fragmentWight > progress ?
                    <div 
                        className={styles.progressFilled}
                        style={{ width: `${fragmentWight}%` }}
                    >
                    </div> 
                    : 
                    <div 
                        className={styles.progressFilled}
                        style={{ width: `${progress - filled}` }}
                    >
                    </div> 
                }
                </>
            )
        })
    }

    // fragmentedProgressBar()

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
                onClick={(e: any) => { handleProgressClick(e, duration, setProgress, videoRef, progressContainerRef) }}
                onMouseDown={(e: any) => { handleMouseDown(e, setIsDragging, setPaused) }}
                onMouseLeave={(e: any)=> {setHoverTime(0)}}
                onMouseMove={(e: any)=> {handleMouseOverOnProgressBar(e, videoRef, duration, progressContainerRef, setHoverTime)}}

            >
                {/* {bufferedFragments.map((fragment, index) => {
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
                })} */}
                {/* <div className={styles.progressBackground}></div> */}
                <div className={styles.progressBackgroundContainer}>
                    {fragmentedProgressBar()}
                </div>
                <div className={styles.progressBackgroundContainer}>
                    {fragmentedFilledBar()}
                </div>
                {/* <div 
                    className={styles.progressFilled}
                    style={{ width: `${progress}%` }}
                ></div> */}
            </div>
        </>
    )
}