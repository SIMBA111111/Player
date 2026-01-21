'use client'

import { RefObject, useContext, useEffect, useState } from 'react'

import { Modal, ModalProvider } from '@/shared/ui'
import { ModalContext } from '@/shared/ui/modal/modal'

import { handleChangeVideoSpeed } from '../lib/handlers'

import styles from './styles.module.scss'
interface ISettingsButtons {
    videoRef: RefObject<any>;
    isVisibleTools: boolean;
    hls: any
}

type ModalType = 'settings' | 'quality' | 'speed' | null;

export const SettingsButtons: React.FC<ISettingsButtons> = ({videoRef, isVisibleTools, hls}) => {
    const [isFull, setisFull] = useState<boolean>(false) 
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalHistory, setModalHistory] = useState<ModalType[]>([]);

    useEffect(() => {

        const handleClickOutSide =(e: MouseEvent) => {
            const modal = document.getElementById('settingsWrapper')
            
            console.log(modal?.contains(e.target as Node));
            

            if(!modal?.contains(e.target as Node)) {
                closeModal()
            }
        }

        window.addEventListener('mousedown', handleClickOutSide) 
    }, [videoRef])

    const openModal = (title: ModalType) => {
        if (title) {
            setModalHistory(prev => [...prev, activeModal]);
            setActiveModal(title);
        }
    };

    const closeModal = () => {
        if (modalHistory.length > 0) {
            // Возвращаемся к предыдущему состоянию
            const previousModal = modalHistory[modalHistory.length - 1];
            setModalHistory(prev => prev.slice(0, -1));
            setActiveModal(previousModal);
        } else {
            setActiveModal(null);
        }
    };
    
    const goBack = () => {
        if (modalHistory.length > 0) {
            const previousModal = modalHistory[modalHistory.length - 1];
            setModalHistory(prev => prev.slice(0, -1));
            setActiveModal(previousModal);
        }
    };

    const handleOpenFullScreen = () => {
        const playerContainer = document.getElementById('playerContainer')
        
        if (isFull) {
            document?.exitFullscreen()    
            setisFull(false)
            return ''          
        }
        playerContainer?.requestFullscreen()
        setisFull(true)
    }

    const handleSpeed = (value: number) => {
        handleChangeVideoSpeed(videoRef, value)
        closeModal()
    }

    const handleChangeQualityLevel = (index: number) => {
        console.log('index: ', index);
        hls.currentLevel = index
        closeModal()
        
    }

    return (
        // <div className={isVisibleTools ? styles.settingsContainer : styles.settingsContainer_hidden}>
        <div className={styles.settingsContainer}>
            <div id='settingsWrapper' className={styles.settingsWrapper}>
                <button 
                    className={styles.settings} 
                    onClick={() => openModal('settings')}
                >
                    <img src="/images/png/settings-icon.png" alt="" height={30}/>
                </button>
                
                {/* Основная модалка настроек */}
                {activeModal === 'settings' && (
                    <div className={styles.modal}>
                        {/* <h3 className={styles.modalHeader}>Settings</h3> */}
                            <button className={styles.modalBtn} onClick={() => openModal('quality')}>
                                <div className={styles.modalBtnContainer}>
                                    <div>Quality</div>
                                    <div>{`${hls.levels[hls.currentLevel].height}p`}</div>
                                </div>
                            </button>
                            <button className={styles.modalBtn} onClick={() => openModal('speed')}>
                                <div className={styles.modalBtnContainer}>
                                    <div className={styles.speedLabel}>Speed</div>
                                    <div className={styles.speedValue}>
                                        {videoRef.current.playbackRate}x
                                    </div>
                                </div>
                            </button>
                    </div>
                )}
                
                {/* Вложенная модалка качества */}
                {activeModal === 'quality' && (
                    <div className={styles.modal} onClick={goBack}>
                        <h3 className={styles.modalHeader}>{'<'} Quality</h3>
                        {hls.levels.map((level: any, index: number) => {
                            return (
                                <button className={styles.modalBtn} key={index} onClick={() => handleChangeQualityLevel(index)}>{level.height}p</button>
                            )
                        })}
                    </div>
                )}
                
                {/* Вложенная модалка скорости */}
                {activeModal === 'speed' && (
                    <div className={styles.modal} onClick={goBack}>
                        <h3 className={styles.modalHeader}>{'<'} Speed</h3>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(0.25)}>0.25x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(0.5)}>0.5x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(0.75)}>0.75x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(1)}>1x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(1.25)}>1.25x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(1.5)}>1.5x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(1.75)}>1.75x</button>
                        <button className={styles.modalBtn} onClick={()=> handleSpeed(2)}>2x</button>
                    </div>
                )}
            </div>
            <button className={styles.fullScreen} onClick={(e: any) => handleOpenFullScreen()}>
                full screen
            </button>
        </div>
    )
}