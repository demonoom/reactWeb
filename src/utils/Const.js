import { flattenDiagnosticMessageText } from "typescript";

/**
 * Created by devnote on 16-12-2.
 */
//导出常量
//分页规则中的每页记录数
export const PAGE_SIZE = 30;
export const CLOUD_CLASS_PAGE_SIZE = 20;
export const ALL_TOPIC = 0;
export const IS_DEBUG = false;   //是否是本地调试模式（true：使用本地测试地址；false：使用远程地址）
export const IS_LIVE_DEBUG = true;  //是否是直播调试模式（true：使用本地直播测试地址；false：使用本地webservice测试地址）
export const ONLY_TEACHER_TOPIC = 1;
export const TYPE_TEACHER = "TEAC";
export const FLOW_OPTSOURCE_USER = "0";
export const FLOW_OPTSOURCE_MANAGER = "1";
export const TO_TYPE = 4;
//部门主管审批时,选定的部门主管级别为直接指定具体的某一级别
export const FLOW_APPROVAL_ONE_LEVEL = 0;
//部门主管审批时,选定的部门主管级别为从当前主管开始直到选定的某一级别
export const FLOW_APPROVAL_UNTIL_LEVEL = 1;
//本环节的审批方式(依次审批)
export const FLOW_CURRENT_APPROVAL_TYPE_NEXT = "next";
//本环节的审批方式(会签)
export const FLOW_CURRENT_APPROVAL_TYPE_ALL = "all";
//本环节的审批方式(或签)
export const FLOW_CURRENT_APPROVAL_TYPE_ONE = "one";
export const SMALL_IMG = 'size=100x100';
export const MIDDLE_IMG = 'size=300x300';
export const LARGE_IMG = 'size=500x500';
//webService请求的版本号
export const WEB_VERSION = "1.10";
//本地课堂消息类型
export const MESSAGE_TO_TYPE_ONlINE_CLASS = "3";
//filterOption  17只显示图片，-17只不显示图片 课堂中从蚁盘选择的文件筛选
export const ANT_CLOUD_FILTER_OPTION = 17;
export const ANT_CLOUD_FILTER_OPTION_IMG = -17;
//音频题目权限开放账号集合，其中23836和54208为系统测试用户账号
export const AUDIO_SUBJECT_ALLOWED = ["134770", "134755", "135359", "135872", "135001", "135302", "135303", "135304", "135244", "135167", "23836", "54208"];
//ar标签权限 马小康权限：ar标签 ar上传
export const AR_TAG_ALLOWED = ["28905", "23836", "54208"];
//ar上传权限 其余人：ar上传
export const AR_UPLOAD_ALLOWED = ["67951", "67940", "67985", "67938", "67937", "64435", "48079", "32527", "31951",
                    "9324", "31920", "31873", "31750", "28912", "28905", "28904", "22366", "22354", "4103", "5221",
                    "12063", "24761", "126013", "4298", "32526", "23836", "54208"];
export const QUESTION_DETAIL_URL = "http://jiaoxue.maaee.com:8091/#/questionDetil";
export const LOCAL_CLASS_ROOM_URL = IS_DEBUG ? "http://localhost:8090/#/localClassRoom" : "http://jiaoxue.maaee.com:8989/#/localClassRoom";
//ar上传权限 AR教材的schoolId
export const AR_SCHOOL_ARRAY = [7];

var baseEmotionMap = new Map();
baseEmotionMap.set("[bexp_0001]", "baseEmotions/bexp_0001.png");
baseEmotionMap.set("[bexp_0002]", "baseEmotions/bexp_0002.png");
baseEmotionMap.set("[bexp_0003]", "baseEmotions/bexp_0003.png");
baseEmotionMap.set("[bexp_0004]", "baseEmotions/bexp_0004.png");
baseEmotionMap.set("[bexp_0005]", "baseEmotions/bexp_0005.png");
baseEmotionMap.set("[bexp_0006]", "baseEmotions/bexp_0006.png");
baseEmotionMap.set("[bexp_0007]", "baseEmotions/bexp_0007.png");
baseEmotionMap.set("[bexp_0008]", "baseEmotions/bexp_0008.png");
baseEmotionMap.set("[bexp_0009]", "baseEmotions/bexp_0009.png");
baseEmotionMap.set("[bexp_0010]", "baseEmotions/bexp_0010.png");
baseEmotionMap.set("[bexp_0011]", "baseEmotions/bexp_0011.png");
baseEmotionMap.set("[bexp_0012]", "baseEmotions/bexp_0012.png");
baseEmotionMap.set("[bexp_0013]", "baseEmotions/bexp_0013.png");
baseEmotionMap.set("[bexp_0014]", "baseEmotions/bexp_0014.png");
baseEmotionMap.set("[bexp_0015]", "baseEmotions/bexp_0015.png");
baseEmotionMap.set("[bexp_0016]", "baseEmotions/bexp_0016.png");
baseEmotionMap.set("[bexp_0017]", "baseEmotions/bexp_0017.png");
baseEmotionMap.set("[bexp_0018]", "baseEmotions/bexp_0018.png");
baseEmotionMap.set("[bexp_0019]", "baseEmotions/bexp_0019.png");
baseEmotionMap.set("[bexp_0020]", "baseEmotions/bexp_0020.png");
baseEmotionMap.set("[bexp_0021]", "baseEmotions/bexp_0021.png");
baseEmotionMap.set("[bexp_0022]", "baseEmotions/bexp_0022.png");
baseEmotionMap.set("[bexp_0023]", "baseEmotions/bexp_0023.png");
baseEmotionMap.set("[bexp_0024]", "baseEmotions/bexp_0024.png");
baseEmotionMap.set("[bexp_0025]", "baseEmotions/bexp_0025.png");
baseEmotionMap.set("[bexp_0026]", "baseEmotions/bexp_0026.png");
baseEmotionMap.set("[bexp_0027]", "baseEmotions/bexp_0027.png");
baseEmotionMap.set("[bexp_0028]", "baseEmotions/bexp_0028.png");
baseEmotionMap.set("[bexp_0029]", "baseEmotions/bexp_0029.png");
baseEmotionMap.set("[bexp_0030]", "baseEmotions/bexp_0030.png");

export function getPageSize() {
    return PAGE_SIZE;
}

export function getCloudClassPageSize() {
    return CLOUD_CLASS_PAGE_SIZE;
}

export function getAllTopic() {
    return ALL_TOPIC;
}

export function getOnlyTeacherTopic() {
    return ONLY_TEACHER_TOPIC;
}

/**
 * 将时间戳字符串转换为本地日期格式
 * @param nS 时间戳字符串
 * @returns {string} 转换后的本地日期格式
 */
export function getLocalTime(nS) {
    var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
    return newDate;
}

/**
 * 系统非空判断
 * @param content
 * @returns {boolean}
 */
export function isEmpty(content) {
    if (content == null || content == "null" || content == "" || typeof(content) == "undefined") {
        return true;
    } else {
        return false;
    }
}

/**
 * 网址验证
 * @param urlString
 * @returns {boolean}
 */
export function checkUrl(urlString) {
    if (urlString != "") {
        // var strRegex = "(((https?|ftp|file)://)|www.)[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*\\.[-a-zA-Z0-9+&@#/%=~_|]";
        var strRegex = "(http|ftp|https)://[a-zA-Z@0-9_.\\-]+(:\\d+)?(/[a-zA-Z0-9\\-_.#%]*)*(\\?[a-zA-Z0-9_]+=[a-zA-Z0-9_]+(&[a-zA-Z0-9_]+=[a-zA-Z0-9_]+)?)?";
        var reg = new RegExp(strRegex);
        if (!reg.test(urlString)) {
            return false;
        } else {
            return true;
        }
    }
}

export function getUrl(urlString) {
    var strRegex = "(http|ftp|https)://[a-zA-Z@0-9_.\\-]+(:\\d+)?(/[a-zA-Z0-9\\-_.#%]*)*(\\?[a-zA-Z0-9_]+=[a-zA-Z0-9_]+(&[a-zA-Z0-9_]+=[a-zA-Z0-9_]+)?)?";
    var reg = new RegExp(strRegex);
    if (urlString.match(reg) != null) {
        var str = urlString.split(urlString.match(reg)[0]);
        str.push(urlString.match(reg)[0]);
        return str;
    }
}

/**
 * 根据传入的表情名称，获取其所对应的表情图片名称
 * @param imgTextKey 表情名称，如[bexp_0001]
 * @returns {V} 返回表情文件名称，如baseEmotions/bexp_0030.png
 */
export function getImgName(imgTextKey) {
    return baseEmotionMap.get(imgTextKey)
}