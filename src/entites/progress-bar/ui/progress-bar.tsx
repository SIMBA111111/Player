'use client'

import { JSX, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { usePlayerContext } from "@/app/page";
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
    progress: number;
    setProgress: (progress: number) => void;
    isVisibleTools: boolean;
    fragments: IFragment[];
}

interface IBufferedFragment {
    start: number;
    end: number;
}

interface IFragmentGradient {
    id: string;
    startPercent: number;
    widthPercent: number;
    gradient: string; // CSS gradient строка
}

export const ProgressBar: React.FC<IProgressBar> = ({
    duration, 
    videoRef, 
    progress, 
    setProgress, 
    isVisibleTools, 
    fragments,
}) => {
    const [hoverTime, setHoverTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [bufferedFragments, setBufferedFragments] = useState<IBufferedFragment[]>([]);
    const [dragTime, setDragTime] = useState<number | null>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const context = usePlayerContext();

    // Создаем градиенты для каждого фрагмента
// Альтернативный, более простой подход
const fragmentGradients = useMemo((): IFragmentGradient[] => {
    const currentTime = isDragging && dragTime !== null 
        ? dragTime 
        : videoRef.current?.currentTime || 0;
    
    const GAP_PERCENT = 0.1;
    
    return fragments.map((fragment, index) => {
        const fragmentDuration = fragment.end - fragment.start;
        
        // Вычисляем позиции в процентах
        let startPercent = 0;
        for (let i = 0; i < index; i++) {
            const prevFragment = fragments[i];
            const prevDuration = prevFragment.end - prevFragment.start;
            startPercent += (prevDuration / duration) * 100 + GAP_PERCENT;
        }
        
        const widthPercent = (fragmentDuration / duration) * 100;
        
        // Вычисляем прогресс внутри фрагмента (0-100%)
        let progressPercent = 0;
        if (currentTime >= fragment.end) {
            progressPercent = 100;
        } else if (currentTime > fragment.start) {
            progressPercent = ((currentTime - fragment.start) / fragmentDuration) * 100;
        }
        
        // Собираем буферизированные части
        const bufferStops: Array<{start: number, end: number}> = [];
        bufferedFragments.forEach(buffered => {
            const overlapStart = Math.max(fragment.start, buffered.start);
            const overlapEnd = Math.min(fragment.end, buffered.end);
            
            if (overlapStart < overlapEnd) {
                const bufferStartPercent = ((overlapStart - fragment.start) / fragmentDuration) * 100;
                const bufferEndPercent = ((overlapEnd - fragment.start) / fragmentDuration) * 100;
                
                // Только буфер после текущего времени
                if (bufferEndPercent > progressPercent) {
                    bufferStops.push({
                        start: Math.max(bufferStartPercent, progressPercent),
                        end: bufferEndPercent
                    });
                }
            }
        });
        
        // Создаем массив цветовых переходов
        // Для корректного отображения нужно строить градиент с учетом всех точек
        const colorStops: Array<{pos: number, color: string}> = [];
        
        // Добавляем ключевые точки
        colorStops.push({pos: 0, color: '#1e90ff'}); // начало прогресса
        
        if (progressPercent > 0) {
            colorStops.push({pos: progressPercent, color: '#1e90ff'}); // конец прогресса
        }
        
        // После прогресса - буфер или фон
        bufferStops.forEach(buffer => {
            if (buffer.start >= progressPercent) {
                colorStops.push({pos: buffer.start, color: '#666'}); // начало буфера
                colorStops.push({pos: buffer.end, color: '#666'}); // конец буфера
            }
        });
        
        // Сортируем по позиции
        colorStops.sort((a, b) => a.pos - b.pos);
        
        // Добавляем фон там, где нет прогресса и буфера
        const finalStops: string[] = [];
        let lastPos = 0;
        
        colorStops.forEach((stop, i) => {
            // Добавляем фон между стопами
            if (stop.pos > lastPos) {
                finalStops.push(`#444 ${lastPos}%`);
                finalStops.push(`#444 ${stop.pos}%`);
            }
            
            // Добавляем цвет стопа
            finalStops.push(`${stop.color} ${stop.pos}%`);
            
            // Если следующий стоп другого цвета, добавляем переход
            if (i < colorStops.length - 1 && colorStops[i + 1].pos > stop.pos) {
                finalStops.push(`${stop.color} ${stop.pos}%`);
                finalStops.push(`${stop.color} ${colorStops[i + 1].pos}%`);
            }
            
            lastPos = stop.pos;
        });
        
        // Добавляем фон до конца
        if (lastPos < 100) {
            finalStops.push(`#444 ${lastPos}%`);
            finalStops.push(`#444 100%`);
        }
        
        // Удаляем дубликаты
        const uniqueStops = finalStops.filter((stop, index, array) => 
            array.indexOf(stop) === index
        );
        
        const gradient = `linear-gradient(to right, ${uniqueStops.join(', ')})`;
        
        return {
            id: `fragment-${index}`,
            startPercent,
            widthPercent,
            gradient
        };
    });
}, [
    fragments, 
    duration, 
    isDragging, 
    dragTime, 
    videoRef, 
    bufferedFragments,
    progress
]);

    // Создаем список div'ов фрагментов
    const fragmentElements = useMemo(() => {
        const elements: JSX.Element[] = [];
        
        fragmentGradients.forEach((fragment) => {
            elements.push(
                <div 
                    key={fragment.id}
                    className={styles.fragment}
                    style={{
                        left: `${fragment.startPercent}%`,
                        width: `${fragment.widthPercent}%`,
                        background: fragment.gradient,
                        position: 'absolute',
                        height: '100%',
                        borderRadius: '2px'
                    }}
                />
            );
        });
        
        return elements;
    }, [fragmentGradients]);

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
            if (!progressContainerRef.current || !videoRef.current || !duration || !context.hls) return;
            
            const rect = progressContainerRef.current.getBoundingClientRect();
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = clickPosition / rect.width;
            const newTime = clickPercentage * duration;
            
            console.log(`Seeking to: ${newTime.toFixed(2)}s`);
            
            videoRef.current.currentTime = newTime;
            
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
                {/* Фон для промежутков */}
                <div className={styles.background} />
                
                {/* Фрагменты прогресса - КАЖДЫЙ ОДИН DIV С ГРАДИЕНТОМ */}
                {fragmentElements}
            </div>
        </>
    );
};