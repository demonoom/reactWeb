import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';

var examsArray=[];
var TimeLineItemArray=[];
const TestTimeLineComponents = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
        };
    },

    componentDidMount(){
        var _this = this;
        var initPageNo = 1;
        _this.getExms(initPageNo);
    },

    /**
     * 获取此用户所对应的考试列表
     * @param pageNo
     */
    getExms(pageNo){
        var _this = this;
        var param = {
            "method": 'getExms',
            "ident": _this.state.ident,
            "pageNo": pageNo,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                examsArray.splice(0);
                TimeLineItemArray.splice(0);
                response.forEach(function (e) {
                    var id = e.id;
                    var paper = e.paper;
                    var paperTitle = paper.title;
                    var clazz = e.clazz;
                    var clazzName = clazz.name;
                    var grade = clazz.grade;
                    var gradeName = grade.name;
                    var startTime = e.startTime;
                    var endTime = e.endTime;
                    var teacher = e.teacher;
                    var course = teacher.course;
                    var courseName = course.name;
                    var showClass = gradeName+clazzName;
                    var examDay = formatYMD(startTime);
                    var examStartTime = formatHM(startTime);
                    var examEndTime = formatHM(endTime);
                    var showExamTime = examStartTime+"-"+examEndTime;
                    console.log(examDay+"\t"+courseName+"\t"+showClass+"\t"+showExamTime+"\t"+paperTitle);
                    _this.buildExamsArray(examDay,courseName,showClass,showExamTime,paperTitle,id);
                });
                //examsArray = _this.timeLineDataSort(examsArray);
                _this.buildTimeLineItem();
                var pager = ret.pager;
                _this.setState({totalCount: parseInt(pager.rsCount)});
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    buildExamsArray(examDay,courseName,showClass,showExamTime,paperTitle,id){
        var everyExamJson={"id":id,"courseName":courseName,"showClass":showClass,"showExamTime":showExamTime,"paperTitle":paperTitle};
        var eveyDayJson = {"examDay":examDay,"examJson":[everyExamJson]};
        var isExist = false;
        for(var i=0;i<examsArray.length;i++){
            var eveyDayJsonInArray = examsArray[i];
            //此处需要判断是否存在同一天的数据,
            // 如果存在,则获取出examJson数组,并将创建的everyExamJson push到该数组中
            if(eveyDayJsonInArray.examDay == examDay ){
                eveyDayJsonInArray.examJson.push(everyExamJson);
                isExist = true;
                break;
            }
        }
        //如果不存在同一天的数据,则直接如现在的构建数据
        if(!isExist){
            examsArray.push(eveyDayJson);
        }
    },

    checkTheSameDayIsExists(examDay){
        var eveyDayJsonForReturn = null;
        for(var i=0;i<examsArray.length;i++){
            var eveyDayJson = examsArray[i];
            if(eveyDayJson.examDay == examDay ){
                eveyDayJsonForReturn = eveyDayJson;
                break;
            }
        }
        return eveyDayJsonForReturn;
    },
    
    buildTimeLineItem(){
        var _this = this;
        examsArray.forEach(function (eveyDayJson) {
            var currentItemSubDivArray=[];
            eveyDayJson.examJson.forEach(function (examJsonArray) {
                var currentItemSubDiv = <div onClick={_this.showExamDetail.bind(_this,examJsonArray.id)}>
                    <p>{examJsonArray.paperTitle}</p>
                    <p>班级:{examJsonArray.showClass}</p>
                    <p>时间:{examJsonArray.showExamTime}</p>
                </div>;
                currentItemSubDivArray.push(currentItemSubDiv);
            })
            var timeLineItemObj= <Timeline.Item>
                <p>{eveyDayJson.examDay}</p>
                {currentItemSubDivArray}
            </Timeline.Item>;
            TimeLineItemArray.push(timeLineItemObj);
        })
        _this.setState({TimeLineItemArray});
    },

    showExamDetail(examId){
        console.log("showExamDetail"+examId);
    },

    timeLineDataSort(array){
        var i = 0,
            len = array.length,
            j, d;
        for (; i < len; i++) {
            for (j = 0; j < len; j++) {
                var date1=new Date(array[i].examDay)
                var date2=new Date(array[j].examDay)
                if (date1 < date2) {
                    d = array[j];
                    array[j] = array[i];
                    array[i] = d;
                }
            }
        }
        return array;
    },

    render() {
        return (
            <div style={{overflow:scroll}}>
                <Timeline pending={<a href="#">See more</a>}>
                    {this.state.TimeLineItemArray}
                </Timeline>
            </div>
        );
    },
});

export default TestTimeLineComponents;
