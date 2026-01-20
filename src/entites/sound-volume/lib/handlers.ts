import { RefObject } from "react"

// клик на иконку для полного мьюта
export const handleMuteOnClick = (videoRef: RefObject<HTMLVideoElement | null>, setCurrentVolume: (newCurrentVolume: number) => void) => {
    if (!videoRef || !videoRef.current) return 

    videoRef.current.muted ? videoRef.current.volume = 1 : videoRef.current.volume = 0  
}

export const handleMouseOverSoundBtn = (setIsVisibleSoundBar: (isVisibleSoundBar: boolean) => void) => {
    setIsVisibleSoundBar(true)
}

export const handleMouseLeaveSoundBtn = (setIsVisibleSoundBar: (isVisibleSoundBar: boolean) => void, setIsDraggingVolume: (isDragging: boolean) => void) => {
    setIsVisibleSoundBar(false)
    setIsDraggingVolume(false)
}

export const handleMouseClickSoundBtn = (e: any, videoRef: RefObject<HTMLVideoElement>, setCurrentVolume: (newCurrentVolume: number) => void) => {
    const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
    
    if(!soundVolumeBackgroundBar || !videoRef.current) return 

    const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()

    const positionOfNewVolume = (e.clientX - positionOfSoundBar?.left) / positionOfSoundBar.width

    videoRef.current.volume = Math.trunc(positionOfNewVolume * 10) / 10

    setCurrentVolume(Math.trunc(positionOfNewVolume * 100))
}

export const handleMouseDownSoundBtn = (setIsDraggingVolume: (isDragging: boolean) => void) => {
    setIsDraggingVolume(true)
}

export const handleMouseMoveSoundBtn = (e: any, isDraggingVolume: boolean, setCurrentVolume: (newCurrentVolume: number) => void) => {
    if(!isDraggingVolume) return

    const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
    const positionOfSoundBar = soundVolumeBackgroundBar?.getBoundingClientRect()
    
    if(!positionOfSoundBar) return

    const newCurrentVolume = (e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width * 100

    setCurrentVolume(newCurrentVolume)
}

export const handleMouseUpSoundBtn = (setIsDraggingVolume: (isDragging: boolean) => void) => {
    setIsDraggingVolume(false)
}