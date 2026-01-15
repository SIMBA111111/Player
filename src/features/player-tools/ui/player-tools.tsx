import { handlePlayPause } from "../lib/handlers";
import { IPlayerTools } from "../model/player-tools.interface";

import styles from './styles.module.scss'

export const PlayerTools: React.FC<IPlayerTools> = ({videoRef, isVisibleTools, setIsVisibleTools}) => {
    return (
        <div>
            <button className={isVisibleTools ? styles.playBtn : styles.playBtn_hidden} onClick={() => {handlePlayPause(videoRef)}}>PLAY</button>
        </div>
    )
}