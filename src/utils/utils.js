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
    if(minutes<10){
        minutes="0"+minutes;
    }
    var hmStr = hour+minutes;
    return hmStr;
}

export function getCurrentHM() {
    var currentDate = new Date();
    var hour = currentDate.getHours()+":";
    var minutes = currentDate.getMinutes();
    if(minutes<10){
        minutes="0"+minutes;
    }
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

export function bubbleSort(array){
    var i = 0,
        len = array.length,
        j, d;
    for (; i < len; i++) {
        for (j = 0; j < len; j++) {
            if (array[i] < array[j]) {
                d = array[j];
                array[j] = array[i];
                array[i] = d;
            }
        }
    }
    return array;
}

export function createUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}