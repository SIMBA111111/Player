export const getHHSStime = (duartion: number) => {
    if(duartion === 0) return `00:00`

    if(!duartion) return 

    if(duartion < 10) return `00:0${duartion}`
    if(duartion < 60) return `00:${duartion}`
    
    if(duartion === 60) return `01:00`

    if(duartion > 60) {
        var seconds = Math.trunc(duartion % 60)
        var minutes = Math.trunc(duartion / 60)
        var secondsFormatet
        var minutesFormatet

        if(seconds < 1) secondsFormatet = `00` 
        if(seconds < 10) secondsFormatet = `0${seconds}`
        if(seconds >= 10) secondsFormatet = `${seconds}`
         

        if(minutes === 1) minutesFormatet = `00` 
        if(minutes < 10) minutesFormatet = `0${minutes}` 
        if(minutes >= 10) minutesFormatet = `${minutes}` 

        return `${minutesFormatet}:${secondsFormatet}`         
    }
}