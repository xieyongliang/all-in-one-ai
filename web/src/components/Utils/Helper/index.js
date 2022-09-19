import { store } from '../../../';
import { Action } from '../../../store/Actions';

export const getDurationBySeconds = (duration_in_seconds) => {
    if(isNaN(duration_in_seconds))
        return '-'

    var days    = Math.floor(duration_in_seconds / 86400);
    var hours   = Math.floor((duration_in_seconds % 86400) / 3600);
    var minutes = Math.floor(((duration_in_seconds % 86400) % 3600) / 60);
    var seconds = (((duration_in_seconds % 86400) % 3600) % 60);
    var duration = '';
    
    if(days !== 0)
        duration = `${parseInt(days)} days ${parseInt(hours)} hours ${parseInt(minutes)} minutes ${parseInt(seconds)} seconds`
    else if(hours !== 0)
        duration = `${parseInt(hours)} hours ${parseInt(minutes)} minutes ${parseInt(seconds)} seconds`
    else if(minutes !== 0)
        duration = `${parseInt(minutes)} minutes ${parseInt(seconds)} seconds`
    else
        duration = `${parseInt(seconds)} seconds`
    
    return duration    
}

export const getDurationByDates = (startTime, endTime) => {
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);

    var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
    return getDurationBySeconds(seconds)
}

export const getLocaleDate = (date_in_string) => {
    const userLocale =
    navigator.languages && navigator.languages.length
      ? navigator.languages[0]
      : navigator.language;

    var date = new Date(date_in_string) 
    return date.toLocaleString(userLocale)
}

export const logOutput = (type, content, time, error) => {
    if(time === undefined) 
        time = getLocaleDate(new Date());
    var message = {
        'type': type,
        'content': `[${time}] ${content}`
    }
    if(type === 'alert')
        alert(content)
    else
        store.dispatch({ type: Action.ADD_POPUP_MESSAGE, payload: {message : message}})
    if(error !== undefined)
        console.log(error)
}