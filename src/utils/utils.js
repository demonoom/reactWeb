import zh_CN from '../components/languages/zh_CN';
import en_US from '../components/languages/en_US';
import enUS from 'antd/lib/locale-provider/en_US';

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

export function getMsObj(){
    return window.ms;
}

export function formatNoSecond(nS) {
    var da = new Date(parseInt(nS));
    var year = da.getFullYear();
    var month = da.getMonth()+1;
    var date = da.getDate();
    var hour = da.getHours()+":";
    var minutes = da.getMinutes();
    if(month<=9){
        month = "0"+month;
    }
    if(date<=9){
        date = "0"+date;
    }
    if(da.getHours()<=9){
        hour = "0"+da.getHours()+":";
    }
    if(da.getMinutes()<=9){
        minutes = "0"+da.getMinutes();
    }
    var dayStr = [year,month,date].join('-');
    var dateStr = dayStr +" "+ hour + minutes;
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
    $.openPhotoGallery(target);
    var event = event||window.event;
    event.stopPropagation();
}

export function showNoomLargeImg(e) {
    $.openPhotoGallery(e);
    var event = event||window.event;
    event.stopPropagation();
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


/**
 * 系统非空判断
 * @param content
 * @returns {boolean}
 */
export function isEmpty(content){
    if (content == null || content == "null" || content == "" || typeof(content) == "undefined") {
        return true;
    } else {
        return false;
    }
}

/**
 * 根据长度截取先使用字符串，超长部分追加...
 * @param str 对象字符串
 * @param len 目标字节长度
 * @return 处理结果字符串
 */
export function cutString(str, len) {
    //length属性读出来的汉字长度为1
    if (str.length * 2 <= len) {
        return str;
    }
    var strlen = 0;
    var s = "";
    for (var i = 0; i < str.length; i++) {
        s = s + str.charAt(i);
        if (str.charCodeAt(i) > 128) {
            strlen = strlen + 2;
            if (strlen >= len) {
                return s.substring(0, s.length - 1) + "...";
            }
        } else {
            strlen = strlen + 1;
            if (strlen >= len) {
                return s.substring(0, s.length - 2) + "...";
            }
        }
    }
    return s;
}

export function showModal(modalStatus) {
    alert(modalStatus);
}

export function getMessageFromLanguage() {
    var lan = localStorage.getItem("language");
    switch (lan) {
        case 'en-US':
        case 'en':
            return en_US;
            break;
        case 'zh-CN':
        case 'zh':
            return zh_CN;
            break;
        default:
            return zh_CN;
            break;
    }
}

export function getLocalFromLanguage() {
    var lan = localStorage.getItem("language");
    switch (lan) {
        case 'en-US':
        case 'en':
            return 'en';
            break;
        case 'zh-CN':
        case 'zh':
            return 'zh';
            break;
        default:
            return 'zh';
            break;
    }
}

export function setLocalLanaguage(la) {
    var language = "en-US";
    if(la==true){
        language = "en-US";
    }else{
        language = "zh-CN";
    }
    localStorage.setItem("language", language);
}

/**
 * 验证是否是一个有效的日期格式
 * @param str
 * @returns {boolean}
 */
export function isDateTime(str)
{
    var re = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
    var result = re.test(str);
    return result;
}