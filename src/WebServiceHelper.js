/**
 * Created by devnote on 16-12-2.
 */
//导出常量

 // export const WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
 export const WEBSERVICE_URL = "http://192.168.1.59:9006/Excoord_ApiServer/webservice";
// var requesting = false;

export function doWebService(data,listener) {
    // alert("==doWebService===");
    // if (requesting) {
    //     return;
    // }
    // requesting = true;
    //progressIncrease(0);
    //通过id获取进度条对象
    var pro = document.getElementById("pro");
    //进度条的宽度，用来模拟进度条的进度
    var width=0;
    //计时器对象，通过计时器对象，完成定时的进度条刷新
    var timer;
    var requestCount=0;
    var timerCount=0;
    if(pro!=null){
       timerCount = timerCount+1;
        //每次访问设定初始值
        pro.style.width="0%";
        //设置显示状态为显示
        pro.style.display='block';
        //开启定时器
        timer = setInterval(
            () => {
                //定时器每隔一定毫秒时间宽度+20
                width += 1;
                requestCount++;
                //在后台结果未返回前，即使计时器计算的宽度大于了100，也将进度条控制在100以内（此处设置了95），以表现未走完的状态
                /*if(requestCount>1000){
                    //设置请求次数，如果超时请求次数大于10次，则取消定时器，进度条隐藏
                    console.log("请求超时")
                    pro.style.width = "100%";
                    pro.style.display = 'none';
                    //清除定时器
                    clearInterval(timer);
                }*/
                if(width>=100 || requestCount>1000){
                  pro.style.width = "100%";
                  pro.style.display = 'none';
                  //清除定时器
                  clearInterval(timer);
                }
                // console.log("width====>"+width);
                //设置进度条的宽度
                pro.style.width=width+"%";
            },
            8
        );
    }
    $.post(WEBSERVICE_URL, {
        params : data
    }, function(result, status) {
        // requesting = false;
        /*if(pro!=null && timerCount>=3) {
            //数据请求结束，后台已返回后，进度条最终走完，宽度设置为100%，同时进度条隐藏
            pro.style.width = "100%";
            pro.style.display = 'none';
            //清除定时器
            //clearInterval(timer);
        }*/
        if (status == "success") {
            listener.onResponse(result);
        } else {
            listener.onError(result);
        }
    }, "json");
}
