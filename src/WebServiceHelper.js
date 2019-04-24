/**
 * Created by devnote on 16-12-2.
 */
import {IS_DEBUG, WEB_VERSION} from './utils/Const';
import {IS_LIVE_DEBUG} from './utils/Const';
//导出常量
const REMOTE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
const LOCAL_URL = "http://192.168.50.119:9006/Excoord_ApiServer/webservice";
const LOCAL_URL_LIVE = "http://192.168.50.119:9006/Excoord_ApiServer/webservice";
const WEBSERVICE_URL = IS_DEBUG ? (IS_LIVE_DEBUG ? LOCAL_URL_LIVE : LOCAL_URL) : REMOTE_URL;
console.log("WEBSERVICE_URL:" + WEBSERVICE_URL);

export function doWebService(data, listener) {
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
        );
    }
    /*$.post(WEBSERVICE_URL, {
        params: data
    }, function (result, status) {
        if (status == "success") {
            listener.onResponse(result);
        } else {
            listener.onError(result);
        }
    }, "json");*/
    $.ajax({
        type: "post",
        url: WEBSERVICE_URL,
        data: {params: data},
        dataType: "json",
        beforeSend: function (XMLHttpRequest) {
            XMLHttpRequest.setRequestHeader("accessUser", sessionStorage.getItem("ident"));
            XMLHttpRequest.setRequestHeader("machine", localStorage.getItem("machineId"));
            XMLHttpRequest.setRequestHeader("machineType", "web");
            XMLHttpRequest.setRequestHeader("version", WEB_VERSION);
        },
        // headers: {
        //     "accessUser": sessionStorage.getItem("ident"),
        //     "machine": localStorage.getItem("machineId"),
        //     "machineType":"web",
        //     "version": "1.01"
        // },
        success: function (result) {
            listener.onResponse(result);
        }, error: function (error) {
            listener.onError(result);
        }
    });
}
