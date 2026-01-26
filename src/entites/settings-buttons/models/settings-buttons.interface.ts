import { RefObject } from "react";

export interface ISettingsButtons {
    videoRef: RefObject<any>;
}

export type ModalType = 'settings' | 'quality' | 'speed' | null;