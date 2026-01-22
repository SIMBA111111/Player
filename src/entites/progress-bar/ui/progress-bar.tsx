'use client'

import { JSX, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { getHHSStime } from "@/shared/utils/getHHSStime"
import { IFragment } from "@/widget/video-tag/model/video-tag.interface";
import {
    handleMouseDown, handleMouseOverOnProgressBar, handleProgressClick 
} from "../lib/handlers"
import styles from './styles.module.scss'
import { usePlayerContext } from "@/app/page";

interface IProgressBar {
    duration: number;
    videoRef: RefObject<any>;
    progress: number;
    setProgress: (progress: number) => void;
    isVisibleTools: boolean;
    fragments: IFragment[]
}

interface IBufferedFragment {
    start: number;
    end: number;
}

export const ProgressBar: React.FC<IProgressBar> = ({
    duration, 
    videoRef, 
    progress, 
    setProgress, 
    isVisibleTools, 
    fragments
}) => {
    const [hoverTime, setHoverTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [bufferedFragments, setBufferedFragments] = useState<IBufferedFragment[]>([]);
    const [dragTime, setDragTime] = useState<number | null>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const context = usePlayerContext();

    // Объединенные вычисления для всех сегментов прогресс-бара
    const progressSegments = useMemo(() => {
        const currentTime = isDragging && dragTime !== null 
            ? dragTime 
            : videoRef.current?.currentTime || 0;
        
        const backgroundSegments: JSX.Element[] = [];
        const filledSegments: JSX.Element[] = [];
        const bufferedSegments: JSX.Element[] = [];

        // Вычисляем gap в процентах (например, 1% от общей ширины)
        const GAP_PERCENT = 0.3; // небольшой gap в процентах

        // 1. Фоновые сегменты
        let accumulatedLeft = 0;
        fragments.forEach((fragment: IFragment, index: number) => {
            const fragmentTime = fragment.end - fragment.start;
            const fragmentWidthPercent = (fragmentTime / duration) * 100;

            backgroundSegments.push(
                <div 
                    key={`bg-${index}`} 
                    className={`${styles.progressBackground} ${styles.progressFragment}`} 
                    style={{
                        width: `${fragmentWidthPercent}%`,
                        left: `${accumulatedLeft}%`
                    }}
                />
            );

            // Увеличиваем накопленную позицию для следующего фрагмента
            accumulatedLeft += fragmentWidthPercent + GAP_PERCENT;
        });

        // 2. Заполненные (пройденные) сегменты
        accumulatedLeft = 0;
        for (let i = 0; i < fragments.length; i++) {
            const fragment = fragments[i];
            const fragmentTime = fragment.end - fragment.start;
            const fragmentWidthPercent = (fragmentTime / duration) * 100;
            
            if (currentTime < fragment.start) break;
            
            if (currentTime <= fragment.end) {
                // Текущий фрагмент - заполняем частично
                const timeInFragment = currentTime - fragment.start;
                const fillPercent = (timeInFragment / fragmentTime) * fragmentWidthPercent;
                
                filledSegments.push(
                    <div 
                        key={`filled-${i}`}
                        className={styles.progressFilled}
                        style={{ 
                            width: `${fillPercent}%`,
                            left: `${accumulatedLeft}%`
                        }}
                    />
                );
                break;
            } else {
                // Фрагмент полностью пройден
                filledSegments.push(
                    <div 
                        key={`filled-${i}`}
                        className={`${styles.progressFilled} ${styles.progressFragment}`}
                        style={{ 
                            width: `${fragmentWidthPercent}%`,
                            left: `${accumulatedLeft}%`
                        }}
                    />
                );
                accumulatedLeft += fragmentWidthPercent + GAP_PERCENT;
            }
        }

        // 3. Буферизированные сегменты
        for (let i = 0; i < bufferedFragments.length; i++) {
            const buffered = bufferedFragments[i];
            
            for (let j = 0; j < fragments.length; j++) {
                const fragment = fragments[j];
                
                // Пропускаем фрагменты позади текущего времени
                if (currentTime > fragment.end) continue;
                
                const overlapStart = Math.max(fragment.start, buffered.start);
                const overlapEnd = Math.min(fragment.end, buffered.end);
                
                if (overlapStart < overlapEnd) {
                    const fragmentTime = fragment.end - fragment.start;
                    const fragmentWidthPercent = (fragmentTime / duration) * 100;
                    
                    // Вычисляем позицию этого фрагмента с учетом gap
                    let fragmentLeftPercent = 0;
                    for (let k = 0; k < j; k++) {
                        const prevFragment = fragments[k];
                        const prevFragmentTime = prevFragment.end - prevFragment.start;
                        fragmentLeftPercent += (prevFragmentTime / duration) * 100 + GAP_PERCENT;
                    }
                    
                    let bufferedPercent: number;
                    let leftPosition: number;
                    
                    // Текущий фрагмент
                    if (currentTime >= fragment.start && currentTime < fragment.end && overlapStart < currentTime) {
                        const visualStart = Math.max(overlapStart, currentTime);
                        const bufferedWidth = ((overlapEnd - visualStart) / fragmentTime) * fragmentWidthPercent;
                        const currentPosInFragment = ((visualStart - fragment.start) / fragmentTime) * fragmentWidthPercent;
                        
                        bufferedPercent = bufferedWidth;
                        leftPosition = fragmentLeftPercent + currentPosInFragment;
                    } 
                    // Будущие фрагменты
                    else {
                        const bufferedWidth = ((overlapEnd - overlapStart) / fragmentTime) * fragmentWidthPercent;
                        const startInFragment = ((overlapStart - fragment.start) / fragmentTime) * fragmentWidthPercent;
                        
                        bufferedPercent = bufferedWidth;
                        leftPosition = fragmentLeftPercent + startInFragment;
                    }
                    
                    if (bufferedPercent > 0) {
                        bufferedSegments.push(
                            <div 
                                key={`buffered-${i}-${j}`}
                                className={`${styles.progressBuffered} ${styles.progressFragment}`}
                                style={{ 
                                    width: `${bufferedPercent}%`,
                                    left: `${leftPosition}%`
                                }}
                            />
                        );
                    }
                }
            }
        }

        return {
            backgroundSegments,
            filledSegments,
            bufferedSegments
        };
    }, [
        fragments, 
        duration, 
        isDragging, 
        dragTime, 
        videoRef, 
        bufferedFragments,
        progress
    ]);

    // ... остальной код без изменений
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (duration > 0 && !isDragging) {
                const currentProgress = (video.currentTime / duration) * 100;
                setProgress(currentProgress);
                setDragTime(null);
            }
        };

        video.addEventListener('timeupdate', updateProgress);
        
        return () => {
            video.removeEventListener('timeupdate', updateProgress);
        };
    }, [videoRef, duration, isDragging]);

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMoveWrapper = (e: MouseEvent) => {
            if (!progressContainerRef.current || !duration) return;
            
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = clickPosition / rect.width;
            const newTime = clickPercentage * duration;
            
            videoRef.current.currentTime = newTime;
            context.setIsPaused(true);
            
            setDragTime(newTime);
            setProgress(clickPercentage * 100);
            setHoverTime(newTime);
            
            const timeHoverPosition = document.getElementById('timeHover');
            if (timeHoverPosition) {
                timeHoverPosition.style.left = `${clickPosition}px`;
            }
        };

        const handleMouseUpWrapper = (e: MouseEvent) => {
            if (!progressContainerRef.current || !videoRef.current || !duration) return;
            
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = clickPosition / rect.width;
            const newTime = clickPercentage * duration;
            
            videoRef.current.currentTime = newTime;
            videoRef.current.paused ? context.setIsPaused(true) : context.setIsPaused(false);
            
            setHoverTime(0);
            setDragTime(null);
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleMouseMoveWrapper, {passive: true});
        document.addEventListener('mouseup', handleMouseUpWrapper, {passive: true});

        return () => {
            document.removeEventListener('mousemove', handleMouseMoveWrapper);
            document.removeEventListener('mouseup', handleMouseUpWrapper);
        };
    }, [isDragging, duration, videoRef, context]);

    useEffect(() => {
        if (!videoRef?.current) return;
        
        const videoElement = videoRef.current;
        
        const updateBufferedRanges = () => {
            const fragments: IBufferedFragment[] = [];
            
            for (let index = 0; index < videoElement.buffered.length; index++) {
                fragments.push({
                    start: videoElement.buffered.start(index),
                    end: videoElement.buffered.end(index)
                });
            }
            
            setBufferedFragments(fragments);
        };
        
        videoElement.addEventListener('progress', updateBufferedRanges);
        videoElement.addEventListener('loadeddata', updateBufferedRanges);
        
        return () => {
            videoElement.removeEventListener('progress', updateBufferedRanges);
            videoElement.removeEventListener('loadeddata', updateBufferedRanges);
        };
    }, [videoRef]);

    return (
        <>
            <div 
                id='timeHover' 
                className={hoverTime ? styles.progressTimeHover : styles.progressTimeHover_hidden}
                style={{ 
                    left: hoverTime ? `${(hoverTime / duration) * 100}%` : '0',
                    display: hoverTime ? 'block' : 'none'
                }}
            >
                {getHHSStime(Math.trunc(hoverTime))}
            </div>
            <div 
                id="progressBar"
                ref={progressContainerRef}
                className={styles.progressContainer}
                onClick={(e: any) => { 
                    if (!isDragging) {
                        handleProgressClick(e, duration, setProgress, videoRef, progressContainerRef);
                    }
                }}
                onMouseDown={(e: any) => { 
                    handleMouseDown(e, setIsDragging);
                }}
                onMouseLeave={() => {
                    if (!isDragging) {
                        setHoverTime(0);
                    }
                }}
                onMouseMove={(e: any) => {
                    if (!isDragging) {
                        handleMouseOverOnProgressBar(e, videoRef, duration, progressContainerRef, setHoverTime);
                    }
                }}
            >
                {/* Все элементы абсолютно позиционированы с одинаковым left */}
                {progressSegments.backgroundSegments}
                {progressSegments.bufferedSegments}
                {progressSegments.filledSegments}
            </div>
        </>
    );
};