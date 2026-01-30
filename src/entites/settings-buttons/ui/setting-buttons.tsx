'use client'

import { useEffect, useState } from 'react'

import { usePlayerContext } from '../../../component'
import { closeModal, enablePictureInPicture, goBack, handleChangeVideoSpeed, handleOpenFullScreen, openModal } from '../lib/handlers'
import { ISettingsButtons, ModalType } from '../models/settings-buttons.interface'

import settingIcon from '../../../assets/images/png/settings-icon.png'
import fullScreenOffIcon from '../../../assets/images/png/full-screen-off.png'
import fullScreenOnIcon from '../../../assets/images/png/full-screen-on.png'
import subtitleIcon from '../../../assets/images/png/subtitle.png'
import pictureInPictureIcon from '../../../assets/images/png/picture-in-picture.png'

import styles from './styles.module.scss'
import { Level } from 'hls.js'


export const SettingsButtons: React.FC<ISettingsButtons> = ({videoRef}) => {
    const [isFull, setIsFull] = useState<boolean>(false) 
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [modalHistory, setModalHistory] = useState<ModalType[]>([]);
    const context = usePlayerContext()

    useEffect(() => {

        const handleClickOutSide =(e: MouseEvent) => {
            const modal = document.getElementById('settingsWrapper')
            
            if(!modal?.contains(e.target as Node)) {
                closeModal(modalHistory, setModalHistory, setActiveModal)
            }
        }

        window.addEventListener('mousedown', handleClickOutSide)
        
        return () => {
            window.removeEventListener('mousedown', handleClickOutSide)
        }
    }, [videoRef])

    useEffect(() => {
        console.log('useEffect');

        const handlePressFtoFullScreen = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'f') {
                console.log('F');
                
                handleOpenFullScreen(setIsFull)
            }
        }

        document.addEventListener('keyup', handlePressFtoFullScreen)
    
        return () => {
            document.removeEventListener('keyup', handlePressFtoFullScreen)
        }
    }, [])

    const handleSpeed = (value: number) => {
        handleChangeVideoSpeed(videoRef, value)
        closeModal(modalHistory, setModalHistory, setActiveModal)
    }

    const handleChangeQualityLevel = (newQualityLevel: number) => {
        context.hls.currentLevel = newQualityLevel
        closeModal(modalHistory, setModalHistory, setActiveModal)
    }

    console.log('isFull = ', isFull);
    

    return (
        <div className={styles.settingsContainer}>
            <button className={styles.subtitle} onClick={(e: React.MouseEvent) => context.hls.subtitleDisplay ? context.hls.subtitleDisplay = false : context.hls.subtitleDisplay = true}>
                <img src={subtitleIcon.src} alt="субтитры" className={styles.subtitle__img} />
            </button>
            <button className={styles.subtitle} onClick={(e: React.MouseEvent) => enablePictureInPicture(videoRef)}>
                <img src={pictureInPictureIcon.src} alt="оконный режим" className={styles.subtitle__img} />
            </button>
            <div id='settingsWrapper' className={styles.settingsWrapper}>
                <button 
                    className={styles.settings} 
                    onClick={() => openModal('settings', setModalHistory, setActiveModal)}
                >
                    <img src={settingIcon.src} alt="" height={30}/>
                </button>
                
                {/* Основная модалка настроек */}
                {activeModal === 'settings' && (
                    <div className={styles.modal}>
                            <button className={styles.modalBtn} onClick={() => openModal('quality', setModalHistory, setActiveModal)}>
                                <div className={styles.modalBtnContainer}>
                                    <div>Quality</div>
                                    <div>{`${context.hls.levels[context.hls.currentLevel].height}p`}</div>
                                </div>
                            </button>
                            <button className={styles.modalBtn} onClick={() => openModal('speed', setModalHistory, setActiveModal)}>
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
                    <div className={styles.modal} onClick={() => goBack(modalHistory, setModalHistory, setActiveModal)}>
                        <h3 className={styles.modalHeader}>{'<'} Quality</h3>
                        {context.hls.levels.map((level: Level, index: number) => {
                            return (
                                <button className={styles.modalBtn} key={index} onClick={() => handleChangeQualityLevel(index)}>{level?.height}p</button>
                            )
                        })}
                    </div>
                )}
                
                {/* Вложенная модалка скорости */}
                {activeModal === 'speed' && (
                    <div className={styles.modal} onClick={() => goBack(modalHistory, setModalHistory, setActiveModal)}>
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
            <button className={styles.fullScreen} onClick={(e: React.MouseEvent) => handleOpenFullScreen(setIsFull)}>
                {isFull ? <img src={fullScreenOffIcon.src} className={styles.fullScreenImg} /> : <img src={fullScreenOnIcon.src} className={styles.fullScreenImg}/>}
            </button>
        </div>
    )
}