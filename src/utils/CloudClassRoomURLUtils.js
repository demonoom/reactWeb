/**
 * Created by devnote on 16-12-2.
 */
var isDebug=true;
var domain=isDebug?"192.168.1.12":"www.maaee.com";
var port = "8080";
var baseURL="http://"+domain+":"+port+"/elearning/";
//课程分页列表url
var courseListURL=baseURL+"course/list";
//添加课程url
var courseAddURL=baseURL+"course/add";
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
