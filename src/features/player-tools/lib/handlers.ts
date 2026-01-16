import { HlsEventEmitter } from "hls.js"
import { RefObject } from "react"
import { getHHSStime } from "../utils/getHHSStime"

export const handlePlayPause = (videoRef: RefObject<HTMLVideoElement | null>) => {
  if (videoRef.current?.paused) {
    videoRef.current?.play()
  } else {
    videoRef.current?.pause()
  }
}

export const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>, duration: number, setProgress: any, videoRef: RefObject<any>, progressContainerRef: RefObject<any>, debounceRef: RefObject<any>) => {
    console.log('handleProgressClick');
    
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


export const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, setIsDragging: any) => {
    console.log('handleMouseDown');
    
    e.preventDefault();
    setIsDragging(true);
};


export const handleDocumentMouseMove = (e: MouseEvent, duration: number, setProgress: any, videoRef: RefObject<any>, progressContainerRef: RefObject<any>, debounceRef: RefObject<any>) => {
    console.log('handleDocumentMouseMove');
    
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

export const handleDocumentMouseUp = (e: MouseEvent, setIsDragging: any, videoRef: RefObject<any>, duration: number, progressContainerRef: RefObject<any>) => {
    console.log('handleDocumentMouseUp');

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
    // videoRef.current?.play()

};

export const handleForward = (videoRef: RefObject<any>, setProgress: any, duration: number) => {
    if(videoRef.current) {
        const newTime = videoRef.current?.currentTime + 2
        videoRef.current.currentTime = newTime
        setProgress(newTime / duration * 100) 
    }
}

export  const handleRewind = (videoRef: RefObject<any>, setProgress: any, duration: number) => {
        if(videoRef.current) {
        const newTime = videoRef.current?.currentTime - 2
        videoRef.current.currentTime = newTime
        setProgress(newTime / duration * 100) 
    }
}

export const handleMouseOverOnProgressBar = (e: any, videoRef: RefObject<any>, duration: number, progressContainerRef: RefObject<any>, setHoverTime: any) => {
    const progressBar = document.getElementById('progressBar')

      const handleProgressBarMouseMove = (e: any) => {
        if (!videoRef.current || !duration || !progressContainerRef.current) return;
        
        const progressContainer = progressContainerRef.current;
        const rect = progressContainer.getBoundingClientRect();
        
        // Вычисляем позицию относительно прогресс-бара
        const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
        const clickPercentage = clickPosition / rect.width;
        
        const newTime = clickPercentage * duration;
        
        console.log('newTime - ', getHHSStime(Math.trunc(newTime) ));
        setHoverTime(newTime)

        // Обновляем preview
        // setProgress(newProgress);
    };

    progressBar?.addEventListener('mousemove', (e: any) => { handleProgressBarMouseMove(e) })
}