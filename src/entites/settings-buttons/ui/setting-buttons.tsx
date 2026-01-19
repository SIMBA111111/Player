'use client'

import { useContext, useState } from 'react'
import styles from './styles.module.scss'
import { Modal, ModalProvider } from '@/shared/ui'
import { ModalContext } from '@/shared/ui/modal/modal'

interface ISettingsButtons {

}

export const SettingsButtons: React.FC<ISettingsButtons> = () => {
    const [settingsIsOpened, setSettingsIsOpened] = useState<boolean>(false) 
    const [speedIsOpened, setSpeedIsOpened] = useState<boolean>(false) 
    const [qualityIsOpened, setQualityIsOpened] = useState<boolean>(false) 

    const modalContext = useContext(ModalContext)

    console.log('modalContext = ', modalContext);
    

    const handleOpenModal = () => {
        console.log('handleOpenModal');
        
        setSettingsIsOpened(prev => !prev)
        modalContext?.setOpenedModal('settings')
        console.log("        modalContext?.setOpenedModal('settings')");
    }

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.settingsWrapper}>
                <ModalProvider isOpened={settingsIsOpened} setIsOpened={setSettingsIsOpened}>
                    <Modal level={0} title='settings'>
                        <Modal title='quality' level={1}>
                            <div>high</div>
                            <div>mid</div>
                            <div>low</div>
                        </Modal>
                        <Modal title='speed' level={1}>
                            <div>0.25</div>
                            <div>0.5</div>
                            <div>1</div>
                            <div>1.5</div>
                        </Modal>
                    </Modal>
                </ModalProvider>
                <button 
                    className={styles.settings} 
                    onClick={() => handleOpenModal()}
                >
                    settings
                </button>
            </div>
            <button className={styles.fullScreen}>
                full screen
            </button>
        </div>
    )
}