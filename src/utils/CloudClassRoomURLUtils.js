/**
 * Created by devnote on 16-12-2.
 */
var isDebug=true;
var domain=isDebug?"192.168.1.12:8080":"www.maaee.com";
var port = "8080";
var baseURL="http://"+domain+"/elearning/";
var webserviceURL="http://"+domain+"/elearning/elearningControl/";
//课程分页列表url
var courseListURL=baseURL+"course/list";
//添加课程url
var courseAddURL=baseURL+"course/add";
//更新课程url
var courseUpdateURL=baseURL+"course/update";
//根据用户id,获取课程详细
var findCourseByUserIdURL=baseURL+"course/findCourseByUserId";
//获取所有的年级
var findClass=baseURL+"courseType/findClass";
//获取所有的科目
var findSubject=baseURL+"courseType/findSubject";
//根据用户id获取所属团队
var findTeamByUserId=baseURL+"team/findTeamByUserId";
//根据用户id获取所在的团队,分页获取
var teamList=baseURL+"team/list";
//根据用户id获取所在的团队,分页获取
var teamList=baseURL+"team/list";
/**
 * 根据传入的参数值,获取不同的云课堂的restful url
 * @param content
 * @returns {boolean}
 */
export function getCloudClassRoomRequestURL(attachement){
    var returnUrl;
    switch(attachement){
        case "courseList":
            //课程分页列表url
            returnUrl = courseListURL;
            break;
        case "courseAdd":
            //课程分页列表url
            returnUrl = courseAddURL;
            break;
        case "courseUpdate":
            //课程分页列表url
            returnUrl = courseUpdateURL;
            break;
        case "findCourseByUserId":
            returnUrl = findCourseByUserIdURL;
            break;
        case "findClass":
            returnUrl = findClass;
            break;
        case "findSubject":
            returnUrl = findSubject;
            break;
        case "findTeamByUserId":
            returnUrl = findTeamByUserId;
            break;
        case "teamList":
            returnUrl = teamList;
            break;
    }
    return returnUrl;
}


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

/**
 * 完成向云课堂的ajax请求
 * @param url
 * @param propertyJson
 * @param callbackFunction
 */
export function cloudClassRoomRequestByAjax(url,propertyJson,requestType,callbackFunction){
    if(requestType=="POST"){
        $.ajax({
            "type": requestType,
            "url": url,
            "dataType": 'json',
            "data": JSON.stringify(propertyJson),
            "contentType": 'application/json',
            "success": function (ret) {
                console.log(ret);
                if (ret.meta.success == true) {
                    callbackFunction.onResponse(ret);
                } else {
                    callbackFunction.onError(ret.meta);
                }
            },
            "error":function (ret) {
                console.log(ret);
                callbackFunction.onError("服务器请求异常");
            }
        });
    }else{
        $.ajax({
            "type": requestType,
            "url": url,
            "dataType": 'json',
            "contentType": 'application/json',
            "success": function (ret) {
                console.log(ret);
                if (ret.meta.success == true) {
                    callbackFunction.onResponse(ret);
                } else {
                    callbackFunction.onError(ret.meta);
                }
            },
            "error":function (ret) {
                console.log(ret);
                callbackFunction.onError("服务器请求异常");
            }
        });
    }
}
