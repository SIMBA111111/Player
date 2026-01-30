'use client'

import { JSX, RefObject, useEffect, useMemo, useRef, useState } from "react";

import { usePlayerContext } from "../../../component";
import { getHHSStime } from "../../../shared/utils/getHHSStime";
import { IFragment } from "../../../widget/video-tag/model/video-tag.interface";

import {
    getProgressBarFragments,
    handleClick,
    handleMouseDown,
    handleMouseOver, 
} from "../lib/handlers";

import styles from './styles.module.scss';

interface IProgressBar {
    duration: number;
    videoRef: RefObject<HTMLVideoElement>;
    fragments: IFragment[];
}

interface IBufferedFragment {
    start: number;
    end: number;
}

export const ProgressBar: React.FC<IProgressBar> = ({
    duration, 
    videoRef, 
    fragments,
}) => {
    const [hoverTime, setHoverTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [bufferedFragments, setBufferedFragments] = useState<IBufferedFragment[]>([]);
    const [currentVideoTime, setCurrentVideoTime] = useState(0); // Локальное состояние для времени
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number>(0); // Ref для requestAnimationFrame
    const context = usePlayerContext();

    // Оптимизированный таймер для обновления времени
    useEffect(() => {
        const video = videoRef.current;
        if (!video || isDragging) return;

        const updateTime = () => {
            setCurrentVideoTime(video.currentTime);
            animationFrameRef.current = requestAnimationFrame(updateTime);
        };

        // Запускаем обновление через requestAnimationFrame для плавности
        animationFrameRef.current = requestAnimationFrame(updateTime);
        
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [videoRef, duration, isDragging]);


    // Оптимизированный хендлер для перетаскивания
    useEffect(() => {
        if (!isDragging) return;

        let isUpdating = false;
        
        const handleMouseMoveWrapper = (e: MouseEvent) => {
            if (!progressContainerRef.current || !duration || isUpdating) return;
            
            isUpdating = true;
            
            // Используем requestAnimationFrame для плавного обновления
            requestAnimationFrame(() => {
                const rect = progressContainerRef.current!.getBoundingClientRect();
                const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
                const clickPercentage = (clickPosition / rect.width);
                const newTime = clickPercentage * duration;
                
                // Обновляем локальное состояние
                setCurrentVideoTime(newTime);
                videoRef.current!.currentTime = newTime;
                
                setHoverTime(newTime);
                
                const timeHoverPosition = document.getElementById('timeHover');
                if (timeHoverPosition) {
                    timeHoverPosition.style.left = `${clickPosition}px`;
                }
                
                isUpdating = false;
            });
        };

        const handleMouseUpWrapper = (e: MouseEvent) => {
            if (!progressContainerRef.current || !videoRef.current || !duration) return;
            
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = (clickPosition / rect.width);
            const newTime = clickPercentage * duration;
            
            // Финальное обновление
            videoRef.current.currentTime = newTime;
            setCurrentVideoTime(newTime);
            
            setHoverTime(0);
            setIsDragging(false);
            
            // Восстанавливаем таймер обновления
            context.setIsPaused(false);
        };

        // Ставим видео на паузу при начале перетаскивания
        context.setIsPaused(true);

        const playerContainer = document.getElementById('playerContainer')

        if(!playerContainer) return
        
        playerContainer.addEventListener('mousemove', handleMouseMoveWrapper, {passive: true});
        playerContainer.addEventListener('mouseup', handleMouseUpWrapper, {passive: true});

        return () => {
            playerContainer.removeEventListener('mousemove', handleMouseMoveWrapper);
            playerContainer.removeEventListener('mouseup', handleMouseUpWrapper);
            context.setIsPaused(false);
        };
    }, [isDragging, duration, videoRef, context]);

    // Обновляем буфер
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
                    left: `${(hoverTime / duration) * 100}%`,
                    display: hoverTime ? 'block' : 'none'
                }}
            >
                {getHHSStime(Math.trunc(hoverTime))}
            </div>
            <div 
                id="progressBar"
                ref={progressContainerRef}
                className={styles.progressContainer}
                onClick={(e: React.MouseEvent) => handleClick(e, isDragging, duration, progressContainerRef, videoRef, setCurrentVideoTime)}
                onMouseDown={(e: React.MouseEvent) => { 
                    handleMouseDown(e, setIsDragging);
                }}
                onMouseLeave={() => {
                    if (!isDragging) {
                        setHoverTime(0);
                    }
                }}
                onMouseMove={(e: React.MouseEvent) => handleMouseOver(e, isDragging, duration, progressContainerRef, setHoverTime)}
            >
                {/* Фрагменты прогресса */}
                <div className={styles.fragmentsContainer}>
                    {getProgressBarFragments({duration, fragments,bufferedFragments, currentVideoTime })}
                </div>
            </div>
        </>
    );
};