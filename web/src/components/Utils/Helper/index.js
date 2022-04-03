export const getDurationBySeconds = (duration_in_seconds) => {
    if(duration_in_seconds === undefined)
        return 'N/A'

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

export const getUtcDate = (date_in_string) => {
    var date = new Date(date_in_string) 
    return date.toUTCString()
}