import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {message, Timeline} from 'antd';
import {doWebService} from '../../WebServiceHelper'
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';

var examsArray = [];
var TimeLineItemArray = [];

/**
 * 本地课堂组件
 */
const JobStatistics = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
        };
    },

    componentDidMount() {
        this.initPage();
    },

    initPage() {
        examsArray.splice(0);
        this.getUserHomeworkInfoList()
    },

    getUserHomeworkInfoList() {
        var _this = this;
        var param = {
            "method": "getUserHomeworkInfoList",
            "ident": _this.state.loginUser.colUid,
            "pageNo": 1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (response.length == 0) {
                        message.warning("没有更多的内容了!");
                    } else {
                        examsArray.splice(0);
                        TimeLineItemArray.splice(0);
                        response.forEach(function (e) {
                            var colCid = e.colCid;
                            var colClazzId = e.colClazzId;
                            var clazzName = e.clazzName;
                            var colCourse = e.colCourse;
                            var useDate = formatYMD(e.useDate);
                            var hcount = e.hcount
                            _this.buildExamsArray(colCid, colClazzId, clazzName, colCourse, useDate, hcount);
                        });
                        _this.buildTimeLineItem();
                        var pager = ret.pager;
                        _this.setState({totalCount: parseInt(pager.rsCount)});
                    }
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildExamsArray(colCid, colClazzId, clazzName, colCourse, useDate, hcount) {
        var everyExamJson = {
            "id": colCid,
            "courseName": clazzName,
            "colClazzId": colClazzId,
            "colCourse": colCourse,
            "useDate": useDate,
            "hcount": hcount
        };
        var eveyDayJson = {"examDay": useDate, "examJson": [everyExamJson]};
        var isExist = false;
        for (var i = 0; i < examsArray.length; i++) {
            var eveyDayJsonInArray = examsArray[i];
            //此处需要判断是否存在同一天的数据,
            // 如果存在,则获取出examJson数组,并将创建的everyExamJson push到该数组中
            if (eveyDayJsonInArray.useDate == useDate) {
                eveyDayJsonInArray.examJson.push(everyExamJson);
                isExist = true;
                break;
            }
        }
        //如果不存在同一天的数据,则直接如现在的构建数据
        if (!isExist) {
            examsArray.push(eveyDayJson);
        }
    },

    buildTimeLineItem() {
        var _this = this;
        examsArray.forEach(function (eveyDayJson) {
            console.log(eveyDayJson);
            var currentItemSubDivArray = [];
            eveyDayJson.examJson.forEach(function (examJsonArray) {
                console.log(examJsonArray);
                debugger
                var titleClassName;
                var contentClassName;
                switch (examJsonArray.courseName) {
                    case "数学":
                        titleClassName = "title maths";
                        contentClassName = "description maths";
                        break;
                    case "语文":
                        titleClassName = "title Chinese";
                        contentClassName = "description Chinese";
                        break;
                    case "英语":
                        titleClassName = "title English";
                        contentClassName = "description English";
                        break;
                    default:
                        titleClassName = "title book_other";
                        contentClassName = "description book_other";
                        break;
                }
                var currentItemSubDiv =
                    <div className="time_content" onClick={() => {
                        console.log(1)
                    }}>
                        <h2 className={titleClassName}>{examJsonArray.courseName}</h2>
                        <div className={contentClassName}>
                            <p className="headline">{examJsonArray.hcount + '道题'}</p>
                            <p>班级：{examJsonArray.courseName}</p>
                            <p>时间：{examJsonArray.useDate}</p>
                        </div>
                    </div>;
                currentItemSubDivArray.push(currentItemSubDiv);
            })
            var timeLineItemObj = <Timeline.Item>
                <p className="date_time">{eveyDayJson.examDay}</p>
                {currentItemSubDivArray}
            </Timeline.Item>;
            TimeLineItemArray.push(timeLineItemObj);
        })
        _this.setState({TimeLineItemArray});
    },

    getMoreExams() {

    },

    render() {

        return (
            <div className="exam_timeline">
                <Timeline pending={<a onClick={this.getMoreExams}>查看更多</a>}>
                    {this.state.TimeLineItemArray}
                </Timeline>
            </div>
        );
    }
});

export default JobStatistics;
