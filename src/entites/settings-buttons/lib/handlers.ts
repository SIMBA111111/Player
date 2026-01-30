import { Dispatch, RefObject, SetStateAction } from "react";
import { ModalType } from "../models/settings-buttons.interface";
import Hls from "hls.js";

export const handleChangeVideoSpeed = (videoRef: RefObject<HTMLVideoElement>, value: number) => {
    if(!videoRef || !videoRef.current) return

    videoRef.current.playbackRate = value 
}

export const openModal = (newTitle: ModalType, setModalHistory: (newModalHistory: ModalType[] | ((prev: ModalType[]) => ModalType[])) => void, setActiveModal: (activeModal: ModalType) => void) => {
    if (newTitle) {
        setModalHistory((prev: ModalType[]) => [...prev, newTitle]);
        setActiveModal(newTitle);
    }
};

export const closeModal = (modalHistory: ModalType[], setModalHistory: (newModalHistory: ModalType[]) => void, setActiveModal: (activeModal: ModalType) => void) => {
        setModalHistory([]);
        setActiveModal(null);
};

export const goBack = (modalHistory: ModalType[], setModalHistory: (newModalHistory: ModalType[] | ((prev: ModalType[]) => ModalType[])) => void, setActiveModal: (activeModal: ModalType) => void) => {
    if (modalHistory.length > 0) {
        const previousModal = modalHistory[modalHistory.length - 2];
        setModalHistory(prev => prev.slice(0, -1));
        setActiveModal(previousModal);
    }
};

export const handleOpenFullScreen = (setIsFull: Dispatch<SetStateAction<boolean>>) => {
    const playerContainer = document.getElementById('playerContainer')
    
    setIsFull((prev: Boolean) => {
        if(prev) {
            document?.exitFullscreen()    
            return false
        } else {
            playerContainer?.requestFullscreen()
            return true
        }
    })
}

export const enablePictureInPicture = async(videoRef: RefObject<HTMLVideoElement>) => {
    if (document.pictureInPictureEnabled) {
        try {
        await videoRef.current.requestPictureInPicture();
        } catch (error) {
        console.error(error);
        }
    }
}