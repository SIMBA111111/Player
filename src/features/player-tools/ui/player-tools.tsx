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
    const progressContainerRef = useRef<HTMLDivElement>(null);

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

    // Обработчик клика по прогресс-бару для перемотки
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !duration || !progressContainerRef.current) return;

        // Получаем позицию клика относительно прогресс-бара
        const progressContainer = progressContainerRef.current;
        const rect = progressContainer.getBoundingClientRect();

        console.log('rect = ', rect);
        console.log('e.clientX = ', e.clientX);
        
        
        // Вычисляем, куда кликнули (от 0 до 1)
        const clickPosition = e.clientX - rect.left;
        const containerWidth = rect.width;
        const clickPercentage = Math.min(Math.max(clickPosition / containerWidth, 0), 1);
        
        // Вычисляем новое время видео
        const newTime = clickPercentage * duration;
        
        // Перематываем видео
        videoRef.current.currentTime = newTime;
        
        // Обновляем прогресс
        const newProgress = clickPercentage * 100;
        setProgress(newProgress);
        
        // Для HLS может потребоваться перезагрузка
        // if (hls && videoRef.current.paused) {
        //     hls.startLoad(newTime);
        // }
    };

    // Обработчик перетаскивания (дополнительно)
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !videoRef.current || !duration) return;
        
        const progressContainer = progressContainerRef.current;
        if (!progressContainer) return;
        
        const rect = progressContainer.getBoundingClientRect();
        const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const clickPercentage = clickPosition / rect.width;
        
        const newTime = clickPercentage * duration;
        const newProgress = clickPercentage * 100;
        
        // Только обновляем preview при перетаскивании
        progressThumb.current = newProgress
        setProgress(newProgress);
        // Фактическую перемотку делаем в handleMouseUp
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging || !videoRef.current || !duration) return;
        
        const progressContainer = progressContainerRef.current;
        if (!progressContainer) return;
        
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
    };

    return (
        <div className={styles.toolsContainer}>
            <button 
                className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} 
                onClick={() => handlePlayPause(videoRef, hls)}
            >
                {videoRef.current?.paused ? "▶" : "⏸"}
            </button>
            
            <div 
                ref={progressContainerRef}
                className={styles.progressContainer}
                onClick={handleProgressClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={() => setIsDragging(false)}
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
        </div>
    );
};