/**
 * Created by devnote on 16-12-2.
 */
var isDebug = true;
var domain = isDebug ? "192.168.50.15:8888" : "www.maaee.com";
// var domain=isDebug?"172.20.10.10:8080":"www.maaee.com";
var liveDomain = isDebug ? "192.168.1.34:8080" : "www.maaee.com";

var webserviceURL = "http://" + domain + "/elearning/elearningControl/";
export const TEACH_LIVE_URL = "https://" + liveDomain + "/Excoord_PhoneService/elearningClass/teacherElearningLive/";

export function doWebService_CloudClassRoom(data, listener) {
    var pro = document.getElementById("pro");
    //进度条的宽度，用来模拟进度条的进度
    var width = 0;
    //计时器对象，通过计时器对象，完成定时的进度条刷新
    var timer;
    var requestCount = 0;
    if (pro != null) {
        //每次访问设定初始值
        pro.style.width = "0%";
        //设置显示状态为显示
        pro.style.display = 'block';
        //开启定时器
        timer = setInterval(
            () => {
                //定时器每隔一定毫秒时间宽度+20
                width += 1;
                requestCount++;
                //在后台结果未返回前，即使计时器计算的宽度大于了100，也将进度条控制在100以内（此处设置了95），以表现未走完的状态
                if (width >= 100 || requestCount > 1000) {
                    pro.style.width = "100%";
                    pro.style.display = 'none';
                    //清除定时器
                    clearInterval(timer);
                }
                //设置进度条的宽度
                pro.style.width = width + "%";
            },
            8
        );
    }
    $.post(webserviceURL, {
        params: data
    }, function (result, status) {
        if (status == "success") {
            listener.onResponse(result);
        } else {
            listener.onError(result);
        }
    }, "json");
}
