/**
 * Created by devnote on 16-12-2.
 */
//导出常量
//分页规则中的每页记录数
export const PAGE_SIZE = 30;
export const ALL_TOPIC = 0;
export const ONLY_TEACHER_TOPIC = 1;
export function getPageSize() {
    return PAGE_SIZE;
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
export function isEmpty(content){
    if (content == null || content == "null" || content == "" || typeof(content) == "undefined") {
        return true;
    } else {
        return false;
    }
}