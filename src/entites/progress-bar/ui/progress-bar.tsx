'use client'

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getHHSStime } from "@/shared/utils/getHHSStime"
import { IFragment } from "@/widget/video-tag/model/video-tag.interface";

import {
    handleMouseDown, handleMouseOverOnProgressBar, handleProgressClick } from "../lib/handlers"

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

export const ProgressBar: React.FC<IProgressBar> = ({duration, videoRef, progress, setProgress, isVisibleTools, fragments}) => {
    const [hoverTime, setHoverTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [bufferedFragments, setBufferedFragments] = useState<IBufferedFragment[]>([]);
    const [dragTime, setDragTime] = useState<number | null>(null); // Новое состояние для времени при перетаскивании
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const context = usePlayerContext();

    // const handleMouseMove = useCallback((e: MouseEvent) => {
    //     handleDocumentMouseMove(e, duration, setProgress, setHoverTime, videoRef, progressContainerRef);
    // }, [duration, videoRef]);

    // const handleMouseUp = useCallback((e: MouseEvent) => {
    //     handleDocumentMouseUp(e, setHoverTime, setIsDragging, videoRef, duration, progressContainerRef);
    // }, [duration, videoRef]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            if (duration > 0 && !isDragging) { // Не обновляем при перетаскивании
                const currentProgress = (video.currentTime / duration) * 100;
                setProgress(currentProgress);
                setDragTime(null); // Сбрасываем dragTime при обычном воспроизведении
            }
        };

        video.addEventListener('timeupdate', updateProgress);
        
        return () => {
            video.removeEventListener('timeupdate', updateProgress);
        };
    }, [videoRef, duration, isDragging]);

    // Эффект для подписки на события мыши на document при перетаскивании
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMoveWrapper = (e: MouseEvent) => {
            if (!progressContainerRef.current || !duration) return;
            
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = clickPosition / rect.width;
            
            const newTime = clickPercentage * duration;
            
            // при перетаскивании мотаем видео
            videoRef.current.currentTime = newTime
            
            context.setIsPaused(true)
            
            // Обновляем время перетаскивания
            setDragTime(newTime);
            
            const newProgress = clickPercentage * 100;
            setProgress(newProgress);
            setHoverTime(newTime);
            
            // Обновляем позицию подсказки
            const timeHoverPosition = document.getElementById('timeHover');
            if (timeHoverPosition && timeHoverPosition.style) {
                timeHoverPosition.style.left = `${clickPosition}px`;
            }
        };

        const handleMouseUpWrapper = (e: MouseEvent) => {
            if (!progressContainerRef.current || !videoRef.current || !duration) return;
            
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = clickPosition / rect.width;
            
            const newTime = clickPercentage * duration;
            
            // Перематываем видео
            videoRef.current.currentTime = newTime;

            // если до клика или перетаскивания была пауза - также ставим паузу. Если был плэй - продолжаем
            // однако, при перетаскивании всегда ставится пауза, соответсвенно, после перетаскивания всегда будет оставаться пазуа
            videoRef.current.paused ? context.setIsPaused(true) : context.setIsPaused(false) 

            
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
    }, [isDragging, duration, videoRef]);

    useEffect(() => {
        if (!videoRef?.current) return;
        
        const videoElement = videoRef.current;
        
        const updateBufferedRanges = (e: any) => {
            
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
        // updateBufferedRanges();
        
        videoElement.addEventListener('progress', updateBufferedRanges);
        videoElement.addEventListener('loadeddata', updateBufferedRanges);
        
        return () => {
            videoElement.removeEventListener('progress', updateBufferedRanges);
            videoElement.removeEventListener('loadeddata', updateBufferedRanges);
        };
    }, [videoRef]);

    const fragmentedProgressBar = useMemo(() => {
        return fragments.map((fragment: IFragment, index: number) => {
            const fragmentTime = fragment.end - fragment.start
            const fragmentWidth = fragmentTime * 100 / duration

            return (
                <div 
                    key={index} 
                    className={styles.progressBackground} 
                    style={{width: `${fragmentWidth.toFixed(4)}%`}}
                />
            )
        })
    }, [fragments, duration])

    // Используем dragTime при перетаскивании, иначе currentTime видео
    const fragmentedFilledBar = useMemo(() => {
        // Используем dragTime при перетаскивании
        const currentTime = isDragging && dragTime !== null 
            ? dragTime 
            : videoRef.current?.currentTime || 0;
        
        const result = [];
        
        for (let i = 0; i < fragments.length; i++) {
            const fragment = fragments[i];
            const fragmentTime = fragment.end - fragment.start;
            const fragmentWidthPercent = (fragmentTime / duration) * 100;
            // const fragmentStartPercent = (fragment.start / duration) * 100;
            
            if (currentTime < fragment.start) {
                // Если не дошли до этого фрагмента, прерываем
                break;
            }
            
            if (currentTime <= fragment.end) {
                // Текущий фрагмент - заполняем частично
                const timeInFragment = currentTime - fragment.start;
                const fillPercent = (timeInFragment / fragmentTime) * fragmentWidthPercent;
                
                result.push(
                    <div 
                        key={`filled-${i}`}
                        className={styles.progressFilled}
                        style={{ 
                            width: `${fillPercent}%`,
                            // left: `${fragmentStartPercent}%`,
                            // position: 'absolute'
                        }}
                    />
                );
                // После нахождения текущего фрагмента прерываем цикл
                break;
            } else {
                // Фрагмент полностью пройден
                result.push(
                    <div 
                        key={`filled-${i}`}
                        className={styles.progressFilled}
                        style={{ 
                            width: `${fragmentWidthPercent}%`,
                            // left: `${fragmentStartPercent}%`,
                            // position: 'absolute'
                        }}
                    />
                );
                // Продолжаем цикл для следующих пройденных фрагментов
            }
        }
        
        return result;
    }, [videoRef, progress, isDragging, dragTime, fragments, duration]) // Добавили isDragging и dragTime в зависимости


    // просчитываем буферизированные фрагменты
    const bufferedFragmentsBar = useMemo(() => {
        // Используем dragTime при перетаскивании
        const currentTime = isDragging && dragTime !== null 
            ? dragTime 
            : videoRef.current?.currentTime || 0;
        
        const result = [];
        
        for (let i = 0; i < fragments.length; i++) {
            const fragment = fragments[i];
            const fragmentTime = fragment.end - fragment.start;
            const fragmentWidthPercent = (fragmentTime / duration) * 100;
            const fragmentStartPercent = (fragment.start / duration) * 100;
            
            // Если фрагмент уже полностью пройден, пропускаем
            if (currentTime > fragment.end) {
                continue;
            }
            
            // Находим текущий или будущий фрагмент
            if (currentTime >= fragment.start && currentTime < fragment.end) {
                // Текущий фрагмент - заполняем от текущей позиции до конца фрагмента
                
                // Время от текущей позиции до конца фрагмента
                const timeRemainingInFragment = fragment.end - currentTime;
                
                // Процент фрагмента, который осталось заполнить
                const fillPercent = (timeRemainingInFragment / fragmentTime) * fragmentWidthPercent;
                
                // Позиция начала заливки (относительно всего прогрессбара)
                const startPercent = ((currentTime - fragment.start) / fragmentTime) * fragmentWidthPercent;
                
                result.push(
                    <div 
                        key={`buffered-${i}`}
                        className={styles.progressBuffered}
                        style={{ 
                            width: `${fillPercent}%`,
                            left: `${fragmentStartPercent + startPercent}%`,
                            position: 'absolute'
                        }}
                    />
                );
                 // Прерываем, так как нашли текущий фрагмент
            }
            
            // Если фрагмент еще не начался
            if (currentTime < fragment.start) {
                // Закрашиваем весь фрагмент
                result.push(
                    <div 
                        key={`buffered-${i}`}
                        className={styles.progressBuffered}
                        style={{ 
                            width: `${fragmentWidthPercent}%`,
                            left: `${fragmentStartPercent}%`,
                            position: 'absolute'
                        }}
                    />
                );
            }
        }
        
        return result;
    }, [videoRef, isDragging, dragTime, fragments, duration, progress]);


    console.log('setBufferedFragments = ', bufferedFragments);
    

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
                    if (!isDragging) { // Игнорируем клик, если было перетаскивание
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
                <div className={styles.progressBackgroundContainer}>
                    {fragmentedProgressBar}
                </div>
                <div className={styles.progressFilledContainer}>
                    {fragmentedFilledBar}
                </div>
                <div className={styles.progressFilledContainer}>
                    {bufferedFragmentsBar}
                </div>
            </div>
        </>
    )
}