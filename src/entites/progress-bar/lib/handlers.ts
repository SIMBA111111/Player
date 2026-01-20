import { RefObject } from "react"

export const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>, duration: number, setProgress: any, videoRef: RefObject<any>, progressContainerRef: RefObject<any>) => {
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
    e.preventDefault();
    setIsDragging(true);
};


export const handleDocumentMouseMove = (e: MouseEvent, duration: number, setProgress: any, setTimeHover: any, videoRef: RefObject<any>, progressContainerRef: RefObject<any>) => {
    videoRef.current?.pause()

    if (!videoRef.current || !duration || !progressContainerRef.current) return;
    
    const timeHoverPosition = document.getElementById('timeHover')
    
    const progressContainer = progressContainerRef.current;
    const rect = progressContainer.getBoundingClientRect();
    
    // Вычисляем позицию относительно прогресс-бара
    const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    const clickPercentage = clickPosition / rect.width;
    
    if (timeHoverPosition && timeHoverPosition.style) {
        timeHoverPosition.style.left = `${String(clickPosition)}px`;
    }

    const newProgress = clickPercentage * 100;
    
    setTimeHover(clickPercentage * duration)
    setProgress(newProgress);
};

export const handleDocumentMouseUp = (e: MouseEvent, setTimeHover: any, setIsDragging: any, videoRef: RefObject<any>, duration: number, progressContainerRef: RefObject<any>) => {
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
    
    setTimeHover(0)
    
    setIsDragging(false);
    // videoRef.current?.play()

};

export const handleProgressBarMouseMove = (e: any, videoRef: RefObject<any>, duration: number, progressContainerRef: RefObject<any>, setHoverTime: any ) => {
    if (!videoRef.current || !duration || !progressContainerRef.current) return;
    
    const timeHoverPosition = document.getElementById('timeHover')
    
    const progressContainer = progressContainerRef.current;
    const rect = progressContainer.getBoundingClientRect();
    
    // Вычисляем позицию относительно прогресс-бара
    const clickPosition = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);

    const clickPercentage = clickPosition / rect.width;
    
    const newTime = clickPercentage * duration;

    if (timeHoverPosition && timeHoverPosition.style) {
        // console.log("&&&");
        timeHoverPosition.style.left = `${String(clickPosition)}px`;
    }
    
    // console.log('newTime - ', getHHSStime(Math.trunc(newTime) ));
    setHoverTime(newTime)

    // Обновляем preview
    // setProgress(newProgress);
};

export const handleMouseOverOnProgressBar = (e: any, videoRef: RefObject<any>, duration: number, progressContainerRef: RefObject<any>, setHoverTime: any) => {
    const progressBar = document.getElementById('progressBar')



    progressBar?.addEventListener('mousemove', (e: any) => { handleProgressBarMouseMove(e, videoRef, duration, progressContainerRef, setHoverTime) })
}