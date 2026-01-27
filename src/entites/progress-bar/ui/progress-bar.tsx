'use client'

import { JSX, RefObject, useEffect, useMemo, useRef, useState } from "react";

import { usePlayerContext } from "@/component";
import { getHHSStime } from "@/shared/utils/getHHSStime";
import { IFragment } from "@/widget/video-tag/model/video-tag.interface";

import {
    handleMouseDown, 
    handleMouseOverOnProgressBar, 
    handleProgressClick 
} from "../lib/handlers";

import styles from './styles.module.scss';

interface IProgressBar {
    duration: number;
    videoRef: RefObject<any>;
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
    const [isDragging, setIsDragging] = useState(false);
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

    // Создаем фрагменты через useMemo с зависимостью от currentVideoTime
    const fragmentElements = useMemo(() => {
        if (!duration || fragments.length === 0) return [];
        
        const elements: JSX.Element[] = [];
        
        fragments.forEach((fragment, index) => {
            const fragmentStartPercent = (fragment.start / duration) * 100;
            const fragmentEndPercent = (fragment.end / duration) * 100;
            const fragmentWidthPercent = fragmentEndPercent - fragmentStartPercent;
            
            // Вычисляем прогресс внутри фрагмента (0-100%)
            let progressPercent = 0;
            if (currentVideoTime >= fragment.end) {
                progressPercent = 100;
            } else if (currentVideoTime > fragment.start) {
                progressPercent = ((currentVideoTime - fragment.start) / (fragment.end - fragment.start)) * 100;
            }
            
            // Собираем буферизированные части
            const bufferStops: Array<{start: number, end: number}> = [];
            bufferedFragments.forEach(buffered => {
                const overlapStart = Math.max(fragment.start, buffered.start);
                const overlapEnd = Math.min(fragment.end, buffered.end);
                
                if (overlapStart < overlapEnd) {
                    const bufferStartPercent = ((overlapStart - fragment.start) / (fragment.end - fragment.start)) * 100;
                    const bufferEndPercent = ((overlapEnd - fragment.start) / (fragment.end - fragment.start)) * 100;
                    
                    // Только буфер после текущего времени
                    if (bufferEndPercent > progressPercent) {
                        bufferStops.push({
                            start: Math.max(bufferStartPercent, progressPercent),
                            end: bufferEndPercent
                        });
                    }
                }
            });
            
            // Создаем градиент (упрощенная версия для производительности)
            const gradientStops: string[] = [];
            
            // Если есть прогресс
            if (progressPercent > 0) {
                gradientStops.push('#1e90ff 0%');
                gradientStops.push(`#1e90ff ${progressPercent}%`);
                gradientStops.push(`#444 ${progressPercent}%`);
            } else {
                gradientStops.push('#444 0%');
            }
            
            // Буферные зоны
            bufferStops.forEach(buffer => {
                gradientStops.push(`#666 ${buffer.start}%`);
                gradientStops.push(`#666 ${buffer.end}%`);
            });
            
            // Добавляем фон в конце
            const lastValue = gradientStops.length > 0 
                ? parseFloat(gradientStops[gradientStops.length - 1].split(' ')[1].replace('%', ''))
                : 0;
                
            if (lastValue < 100) {
                gradientStops.push(`#444 ${Math.max(lastValue, progressPercent)}%`);
                gradientStops.push(`#444 100%`);
            }
            
            const gradient = `linear-gradient(to right, ${gradientStops.join(', ')})`;
            
            elements.push(
                <div 
                    key={index}
                    className={styles.fragment}
                    style={{
                        left: `${fragmentStartPercent}%`,
                        width: `${fragmentWidthPercent}%`,
                        background: gradient,
                    }}
                />
            );
        });
        
        return elements;
    }, [fragments, duration, bufferedFragments, currentVideoTime]); // Зависим от currentVideoTime вместо progress

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
        
        document.addEventListener('mousemove', handleMouseMoveWrapper, {passive: true});
        document.addEventListener('mouseup', handleMouseUpWrapper, {passive: true});

        return () => {
            document.removeEventListener('mousemove', handleMouseMoveWrapper);
            document.removeEventListener('mouseup', handleMouseUpWrapper);
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

    // Упрощенные хендлеры для мыши
    const handleMouseOver = (e: React.MouseEvent) => {
        if (!isDragging && progressContainerRef.current && duration) {
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const newTime = (clickPosition / rect.width) * duration;
            setHoverTime(newTime);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (!isDragging && progressContainerRef.current && duration) {
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const newTime = (clickPosition / rect.width) * duration;
            
            videoRef.current!.currentTime = newTime;
            setCurrentVideoTime(newTime);
        }
    };

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
                onClick={handleClick}
                onMouseDown={(e: any) => { 
                    handleMouseDown(e, setIsDragging);
                }}
                onMouseLeave={() => {
                    if (!isDragging) {
                        setHoverTime(0);
                    }
                }}
                onMouseMove={handleMouseOver}
            >
                {/* Фрагменты прогресса */}
                <div className={styles.fragmentsContainer}>
                    {fragmentElements}
                </div>
            </div>
        </>
    );
};