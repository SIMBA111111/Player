import { RefObject } from "react";

export interface ISettingsButtons {
    videoRef: RefObject<HTMLVideoElement>;
}

export type ModalType = 'settings' | 'quality' | 'speed' | null;