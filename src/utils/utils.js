/**
 * Created by madapeng on 17-4-8.
 */
export function getLocalTime(nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear()+'年';
    var month = da.getMonth()+1+'月';
    var date = da.getDate()+'日';
    var hour = da.getHours()+":";
    var minutes = da.getMinutes()+":";
    var second = da.getSeconds();
    var ymdStr = [year,month,date].join('-');
    console.log(ymdStr+"---"+hour+minutes+second);
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
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
        console.log("当天");
        isToday=true;
    } else if (new Date(parseInt(str)) < new Date()){
        //之前
        console.log("以前的日期");
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