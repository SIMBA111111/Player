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

    // Единая функция для вычисления всех сегментов
    const progressSegments = useMemo(() => {
    const currentTime = isDragging && dragTime !== null 
        ? dragTime 
        : videoRef.current?.currentTime || 0;
    
    const GAP_PERCENT = 0.3;
    const segments: JSX.Element[] = [];
    
    // Предварительно вычисляем позиции всех фрагментов
    const fragmentPositions = fragments.map((fragment, index) => {
        const fragmentTime = fragment.end - fragment.start;
        const widthPercent = (fragmentTime / duration) * 100;
        
        // Вычисляем left позицию с учетом gap
        let leftPercent = 0;
        for (let i = 0; i < index; i++) {
            const prevFragmentTime = fragments[i].end - fragments[i].start;
            leftPercent += (prevFragmentTime / duration) * 100 + GAP_PERCENT;
        }
        
        return {
            ...fragment,
            index,
            widthPercent,
            leftPercent,
            time: fragmentTime
        };
    });

    // 1. Сначала добавляем все фоновые сегменты
    fragmentPositions.forEach(fragment => {
        segments.push(
            <div 
                key={`bg-${fragment.index}`} 
                className={`${styles.progressBackground} ${styles.progressFragment}`} 
                style={{
                    width: `${fragment.widthPercent}%`,
                    left: `${fragment.leftPercent}%`,
                    zIndex: 1
                }}
            />
        );
    });

    // 2. Обрабатываем каждый фрагмент: буфер + заполненная часть
    fragmentPositions.forEach(fragment => {
        const currentFragmentBuffers: {left: number, width: number}[] = [];
        
        // Собираем буферизированные участки для этого фрагмента
        bufferedFragments.forEach(buffered => {
            if (currentTime > fragment.end) return;
            
            const overlapStart = Math.max(fragment.start, buffered.start);
            const overlapEnd = Math.min(fragment.end, buffered.end);
            
            if (overlapStart < overlapEnd) {
                let widthPercent: number;
                let leftPercent: number;
                
                if (currentTime >= fragment.start && currentTime < fragment.end && overlapStart < currentTime) {
                    // Только часть после currentTime
                    const visualStart = Math.max(overlapStart, currentTime);
                    widthPercent = ((overlapEnd - visualStart) / fragment.time) * fragment.widthPercent;
                    leftPercent = fragment.leftPercent + ((visualStart - fragment.start) / fragment.time) * fragment.widthPercent;
                } else {
                    // Весь пересекающийся участок
                    widthPercent = ((overlapEnd - overlapStart) / fragment.time) * fragment.widthPercent;
                    leftPercent = fragment.leftPercent + ((overlapStart - fragment.start) / fragment.time) * fragment.widthPercent;
                }
                
                if (widthPercent > 0) {
                    currentFragmentBuffers.push({
                        left: leftPercent,
                        width: widthPercent
                    });
                }
            }
        });

        // Добавляем буферизированные части для этого фрагмента
        currentFragmentBuffers.forEach((buffer, bufferIndex) => {
            segments.push(
                <div 
                    key={`buffer-${fragment.index}-${bufferIndex}`}
                    className={`${styles.progressBuffered} ${styles.progressFragment}`}
                    style={{ 
                        width: `${buffer.width}%`,
                        left: `${buffer.left}%`,
                        zIndex: 2
                    }}
                />
            );
        });

        // 3. Добавляем заполненную часть для этого фрагмента
        if (currentTime >= fragment.start) {
            let filledWidthPercent = 0;
            
            if (currentTime <= fragment.end) {
                // Текущий фрагмент - заполняем частично
                const timeInFragment = currentTime - fragment.start;
                filledWidthPercent = (timeInFragment / fragment.time) * fragment.widthPercent;
            } else {
                // Фрагмент полностью пройден
                filledWidthPercent = fragment.widthPercent;
            }
            
            // Создаем один элемент для заполненной части
            if (filledWidthPercent > 0) {
                segments.push(
                    <div 
                        key={`filled-${fragment.index}`}
                        className={`${styles.progressFilled} ${styles.progressFragment}`}
                        style={{ 
                            width: `${filledWidthPercent}%`,
                            left: `${fragment.leftPercent}%`,
                            zIndex: 3
                        }}
                    />
                );
            }
        }
    });

    return segments;
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
                {progressSegments}
            </div>
        </>
    );
};