'use client'

import { useState } from "react";

import { ProgressBar } from '../../../entites/progress-bar'
import { SettingsButtons } from "../../../entites/settings-buttons";
import { PlayButtons } from "../../../entites/play-buttons";
import { SoundAndTimeVolume } from "../../../entites/sound-volume";
import { IFragment } from "../../../widget/video-tag/model/video-tag.interface";

import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'


export const PlayerTools: React.FC<IPlayerTools> = ({
    duration, 
    videoRef, 
    isVisibleTools, 
    fragments
}) => {
    const currentTime = videoRef.current?.currentTime

    const handleGetCurrentFragment = () => {
        return fragments?.find((fragment: IFragment) => fragment.start < currentTime && currentTime < fragment.end )
    }

    return (
        <div className={isVisibleTools ? styles.toolsContainer : styles.toolsContainer_hidden}>
            <div className={styles.toolsWrapper}
                onClick={(e) => e.stopPropagation()}
            >             
                <ProgressBar 
                    duration={duration}
                    videoRef={videoRef} 
                    fragments={fragments}
                />

                <div className={styles.toolsBackground}></div>
                
                <div className={styles.toolsArea}>

                    <PlayButtons videoRef={videoRef} duration={duration}/>

                    <SoundAndTimeVolume videoRef={videoRef} duration={duration} fragmentTitle={handleGetCurrentFragment()?.title}/>

                    <SettingsButtons videoRef={videoRef}/>
                </div>
            </div>
        </div>
    );
};