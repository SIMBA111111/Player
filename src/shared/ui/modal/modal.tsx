import { createContext, useContext, useState } from 'react';
import styles from './styles.module.scss'

interface IModalProvider {
    isOpened: boolean;
    setIsOpened: (el: boolean) => void;
    children: React.ReactNode;
} 
interface IModal {
    children?: React.ReactNode;
    title?: string;
    level: number;
} 

interface IModalContext {
    openedModal: string | undefined | null;
    setOpenedModal: (title: string | undefined | null) => void;
}

export const ModalContext = createContext<IModalContext | undefined | null>(undefined)

export const ModalProvider: React.FC<IModalProvider> = ({isOpened='settings', setIsOpened, children}) => {
    console.log('isOpened = ', isOpened);
    
    const [openedModal, setOpenedModal] = useState<string | null>()

    console.log('openedModal:::: ', openedModal);
    

    return (
        <div className={isOpened ? styles.modalContainer : styles.modalContainer_hidden}>
            <ModalContext.Provider value={{openedModal, setOpenedModal}}>
                {children}
            </ModalContext.Provider>
        </div>
    )
}

export const Modal: React.FC<IModal> = ({children, title, level}) => {
    const context = useContext(ModalContext)
    
    console.log('openedModal = ', context?.openedModal);
    
    return (
        <div className={context?.openedModal === title ? styles.wrappedModal : styles.wrappedModal_hidden}>
            <div className={styles.modalTitle} onClick={(e: any) => context?.setOpenedModal(title)}>{title}</div>
            {children}
        </div>
    )
}