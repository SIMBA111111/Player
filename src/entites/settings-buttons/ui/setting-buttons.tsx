'use client'

import { RefObject, useContext, useState } from 'react'

import { Modal, ModalProvider } from '@/shared/ui'
import { ModalContext } from '@/shared/ui/modal/modal'

import { handleChangeVideoSpeed } from '../lib/handlers'

import styles from './styles.module.scss'
interface ISettingsButtons {
    videoRef: RefObject<any>;
    isVisibleTools: boolean;
}

type ModalType = 'settings' | 'quality' | 'speed' | null;

export const SettingsButtons: React.FC<ISettingsButtons> = ({videoRef, isVisibleTools}) => {
    const [settingsIsOpened, setSettingsIsOpened] = useState<boolean>(false) 
    const [isFull, setisFull] = useState<boolean>(false) 
    const [qualityIsOpened, setQualityIsOpened] = useState<boolean>(false) 

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalHistory, setModalHistory] = useState<ModalType[]>([]); // Для вложенности
    
    const openModal = (title: ModalType) => {
        if (title) {
            setModalHistory(prev => [...prev, activeModal]); // Сохраняем историю
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

    return (
        // <div className={isVisibleTools ? styles.settingsContainer : styles.settingsContainer_hidden}>
        <div className={styles.settingsContainer}>
            <div className={styles.settingsWrapper}>
                {/* Кнопка открытия */}
                <button 
                    className={styles.settings} 
                    onClick={() => openModal('settings')}
                >
                    settings
                </button>
                
                {/* Основная модалка настроек */}
                {activeModal === 'settings' && (
                    <div className={styles.modal} style={{ zIndex: 1000 }}>
                        <h3>Settings</h3>
                        <button onClick={() => openModal('quality')}>Quality</button>
                        <button onClick={() => openModal('speed')}>Speed</button>
                        <button onClick={closeModal}>Close</button>
                    </div>
                )}
                
                {/* Вложенная модалка качества */}
                {activeModal === 'quality' && (
                    <div className={styles.nestedModal} style={{ zIndex: 1010 }}>
                        <h4>Quality</h4>
                        <div>high</div>
                        <div>mid</div>
                        <div>low</div>
                        <button onClick={goBack}>Back to Settings</button>
                        <button onClick={closeModal}>Close All</button>
                    </div>
                )}
                
                {/* Вложенная модалка скорости */}
                {activeModal === 'speed' && (
                    <div className={styles.nestedModal} style={{ zIndex: 1010 }}>
                        <h4>Speed</h4>
                        <div onClick={()=> handleSpeed(0.25)}>0.25</div>
                        <div onClick={()=> handleSpeed(0.5)}>0.5</div>
                        <div onClick={()=> handleSpeed(1)}>1</div>
                        <div onClick={()=> handleSpeed(1.5)}>1.5</div>
                        <div onClick={()=> handleSpeed(2)}>2</div>
                        <button onClick={goBack}>Back to Settings</button>
                        <button onClick={closeModal}>Close All</button>
                    </div>
                )}
            </div>
            <button className={styles.fullScreen} onClick={(e: any) => handleOpenFullScreen()}>
                full screen
            </button>
        </div>
    )
}