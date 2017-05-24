/**
 * Created by madapeng on 17-4-8.
 */
export function getLocalTime(nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth()+1;
    var date = da.getDate();
    var hour = da.getHours()+":";
    var minutes = da.getMinutes()+":";
    var sencond = da.getSeconds();
    var dayStr = [year,month,date].join('-');
    var dateStr = dayStr +" "+ hour + minutes+sencond;
    return dateStr;
    // return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
}

export function formatYMD(nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth()+1;
    var date = da.getDate();
    var ymdStr = [year,month,date].join('-');
    return ymdStr;
}

export function formatMD(nS) {
    var da = new Date(parseInt(nS));
    var month = da.getMonth()+1;
    var date = da.getDate();
    var mdStr = [month,date].join('-');
    return mdStr;
}

export function formatHM(nS) {
    var da = new Date(parseInt(nS));
    var hour = da.getHours()+":";
    var minutes = da.getMinutes();
    var hmStr = hour+minutes;
    console.log(hmStr);
    return hmStr;
}

export function isToday(str) {
    var isToday=false;
    if (new Date(parseInt(str)).toDateString() === new Date().toDateString()) {
        //今天
        isToday=true;
    } else if (new Date(parseInt(str)) < new Date()){
        //之前
        isToday=false;
    }
    return isToday;
}

export function showLargeImg(e) {
    var target = e.target;
    if (navigator.userAgent.indexOf("Chrome") > -1) {
        target = e.currentTarget;
    } else {
        target = e.target;
    }
    $.openPhotoGallery(target)
}