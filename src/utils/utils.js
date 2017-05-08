/**
 * Created by madapeng on 17-4-8.
 */
export function getLocalTime(nS) {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
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