'use client'

import { useEffect, useState, useRef } from "react";
import { handlePlayPause } from "../lib/handlers";
import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'

export const PlayerTools: React.FC<IPlayerTools> = ({
    hls, 
    duration, 
    videoRef, 
    isVisibleTools, 
    setIsVisibleTools
}) => {
    const [progress, setProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
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

    // Эффект для подписки на события мыши на document при перетаскивании
    useEffect(() => {
        if (!isDragging) return;

        const handleDocumentMouseMove = (e: MouseEvent) => {
            videoRef.current?.pause()
            clearTimeout(debounceRef.current)

            debounceRef.current = setTimeout(() => {

                if (!videoRef.current || !duration || !progressContainerRef.current) return;
                
                const progressContainer = progressContainerRef.current;
                const rect = progressContainer.getBoundingClientRect();
                
                // Вычисляем позицию относительно прогресс-бара
                const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
                const clickPercentage = clickPosition / rect.width;
                
                const newProgress = clickPercentage * 100;
                
                // Обновляем preview
                setProgress(newProgress);

            }, 5)
        };

        const handleDocumentMouseUp = (e: MouseEvent) => {
            if (!videoRef.current || !duration || !progressContainerRef.current) return;
            
            const progressContainer = progressContainerRef.current;
            const rect = progressContainer.getBoundingClientRect();
            
            const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
            const clickPercentage = clickPosition / rect.width;
            
            const newTime = clickPercentage * duration;
            
            // Перематываем видео
            videoRef.current.currentTime = newTime;
            
            // Для HLS
            // if (hls && videoRef.current.paused) {
            //     hls.startLoad(newTime);
            // }
            
            setIsDragging(false);
            videoRef.current?.play()

        };

        // Подписываемся на события мыши на всем документе
        document.addEventListener('mousemove', handleDocumentMouseMove, {passive: true});
        document.addEventListener('mouseup', handleDocumentMouseUp, {passive: true});

        return () => {
            document.removeEventListener('mousemove', handleDocumentMouseMove);
            document.removeEventListener('mouseup', handleDocumentMouseUp);
        };
    }, [isDragging, videoRef, duration]);

    // Обработчик клика по прогресс-бару для перемотки
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !duration || !progressContainerRef.current) return;

        const progressContainer = progressContainerRef.current;
        const rect = progressContainer.getBoundingClientRect();
        
        const clickPosition = e.clientX - rect.left;
        const containerWidth = rect.width;
        const clickPercentage = clickPosition / containerWidth;
        
        const newTime = clickPercentage * duration;
        
        videoRef.current.currentTime = newTime;
        
        const newProgress = clickPercentage * 100;
        setProgress(newProgress);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    return (
        <div className={styles.toolsContainer}>            
            <div 
                ref={progressContainerRef}
                className={isVisibleTools ? styles.progressContainer : styles.progressContainer_hidden}
                onClick={handleProgressClick}
                onMouseDown={handleMouseDown}
            >
                {/* Фоновый слой прогресс-бара */}
                <div className={styles.progressBackground}></div>
                
                {/* Заполненная часть прогресс-бара */}
                <div 
                    className={styles.progressFilled}
                    style={{ width: `${progress}%` }}
                ></div>
                
                {/* Ползунок (видим при наведении) */}
                {/* <div 
                    className={styles.progressThumb}
                    style={{ left: `${progress + 1.5}%` }}
                ></div> */}
            </div>
            <button 
                className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} 
                onClick={() => handlePlayPause(videoRef)}
            >
                {videoRef.current?.paused ? "▶" : "⏸"}
            </button>
        </div>
    );
};