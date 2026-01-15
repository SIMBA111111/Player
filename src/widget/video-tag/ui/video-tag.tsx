import { PlayerTools } from "@/features/player-tools/ui/player-tools"
import { VideoTagHandlers } from "../lib/handlers"
import { IVideoTag } from "../model/video-tag.interface"
import styles from './styles.module.scss'

export const VideoTag: React.FC<IVideoTag> = ({hls, duration, hideToolsTimer, videoRef, isVisibleTools, setIsVisibleTools}) => {
    
    const {handleMouseMove, handleMouseLeave, handleMouseOver} = VideoTagHandlers(hideToolsTimer, setIsVisibleTools)

    return (
        <div className={isVisibleTools ? styles.playerContainer : styles.playerContainer_hidden} onMouseMove={() => {handleMouseMove()}} onMouseLeave={() => {handleMouseLeave()}} onMouseOver={()=>{handleMouseOver()}}>
            <video className={styles.video} id='video' ref={videoRef}></video>
            <PlayerTools hls={hls} duration={duration} videoRef={videoRef} isVisibleTools={isVisibleTools} setIsVisibleTools={setIsVisibleTools}/>
        </div>  
    )
}