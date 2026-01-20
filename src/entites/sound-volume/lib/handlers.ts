import { RefObject } from "react"

// Клик на иконку для мьюта/анмьюта
export const handleMuteOnClick = (
    videoRef: RefObject<HTMLVideoElement | null>, 
    setCurrentVolume: (volume: number) => void
) => {
    if (!videoRef.current) return

    if (videoRef.current.muted || videoRef.current.volume === 0) {
        videoRef.current.muted = false
        videoRef.current.volume = 1
        setCurrentVolume(100)
    } else {
        videoRef.current.muted = true
        setCurrentVolume(0)
    }
}

// Клик на звуковую панель для установки громкости
export const handleMouseClickSoundBtn = (
    e: React.MouseEvent, 
    videoRef: RefObject<HTMLVideoElement | null>, 
    setCurrentVolume: (volume: number) => void
) => {
    const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
    
    if (!soundVolumeBackgroundBar || !videoRef.current) return 

    const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()
    const positionOfNewVolume = (e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width
    const newVolume = Math.max(0, Math.min(1, positionOfNewVolume))

    videoRef.current.volume = newVolume
    setCurrentVolume(newVolume * 100)
}

// Начало перетаскивания
export const handleMouseDownSoundBtn = (
    setIsDraggingVolume: (isDragging: boolean) => void
) => {
    setIsDraggingVolume(true)
}

// Конец перетаскивания
export const handleMouseUpSoundBtn = (
    setIsDraggingVolume: (isDragging: boolean) => void
) => {
    setIsDraggingVolume(false)
}

// Перемещение при перетаскивании
export const handleMouseMoveSoundBtn = (
    e: React.MouseEvent, 
    isDraggingVolume: boolean, 
    setCurrentVolume: (volume: number) => void,
    videoRef: RefObject<HTMLVideoElement | null>
) => {
    if (!isDraggingVolume || !videoRef.current) return

    const soundVolumeBackgroundBar = document.getElementById('soundVolumeBackground')
    if (!soundVolumeBackgroundBar) return

    const positionOfSoundBar = soundVolumeBackgroundBar.getBoundingClientRect()
    const newVolume = (e.clientX - positionOfSoundBar.left) / positionOfSoundBar.width
    const clampedVolume = Math.max(0, Math.min(1, newVolume))

    videoRef.current.volume = clampedVolume
    setCurrentVolume(clampedVolume * 100)
}