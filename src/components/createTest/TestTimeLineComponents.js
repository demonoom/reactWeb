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
            pageNo:1,
        };
    },

    componentDidMount(){
        var _this = this;
        var initPageNo = 1;
        examsArray.splice(0);
        _this.getExms(_this.state.pageNo);
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
                if(response.length==0){
                    message.warning("没有更多的内容了!");
                }else{
                    TimeLineItemArray.splice(0);
                    response.forEach(function (e) {
                        var id = e.id;
                        var paper = e.paper;
                        var paperId = e.paperId;
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
                        _this.buildExamsArray(examDay,courseName,showClass,showExamTime,paperTitle,id,examStartTime,examEndTime,paperId,paper);
                    });
                    //examsArray = _this.timeLineDataSort(examsArray);
                    _this.buildTimeLineItem();
                    var pager = ret.pager;
                    _this.setState({totalCount: parseInt(pager.rsCount)});
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    buildExamsArray(examDay,courseName,showClass,showExamTime,paperTitle,id,examStartTime,examEndTime,paperId,paper){
        var everyExamJson={"id":id,"courseName":courseName,"showClass":showClass,"showExamTime":showExamTime,"paper":paper,"paperTitle":paperTitle,"paperId":paperId,"examStartTime":examStartTime,"examEndTime":examEndTime};
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
                var examStartTime= eveyDayJson.examDay+" "+examJsonArray.examStartTime;
                var examEndTime= eveyDayJson.examDay+" "+examJsonArray.examEndTime;
                var tipInfo="未开始";
                if(new Date(examEndTime) < new Date()){
                    tipInfo="已结束";
                }else if(new Date(examStartTime) > new Date()){
                    tipInfo="未开始";
                }else{
                    tipInfo="进行中";
                }
                var titleClassName;
                var contentClassName;
                switch (examJsonArray.courseName){
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
				<div className="time_content" onClick={_this.showExamDetail.bind(_this,examJsonArray.id,examJsonArray.paperId,tipInfo,examJsonArray.paper)}>
				<div className="triangle_right triangle_yellow"><span>{tipInfo}</span></div>
					<h2 className={titleClassName}>{examJsonArray.courseName}</h2>
					<div className={contentClassName}>
						<p className="headline">{examJsonArray.paperTitle}</p>
                    	<p>班级：{examJsonArray.showClass}</p>
                    	<p>时间：{examJsonArray.showExamTime}</p>
					</div> 
				</div>;
                currentItemSubDivArray.push(currentItemSubDiv);
            })
            var timeLineItemObj= <Timeline.Item>
                <p className="date_time">{eveyDayJson.examDay}</p>
                {currentItemSubDivArray}
            </Timeline.Item>;
            TimeLineItemArray.push(timeLineItemObj);
        })
        _this.setState({TimeLineItemArray});
    },

    showExamDetail(examId,paperId,tipInfo,paper){
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        console.log("showExamDetail"+examId+"\t"+paperId);
        if(loginUser.colUtype=="STUD"){
            // if(new Date(examEndTime) < new Date()){
            //     tipInfo="已结束";
            // }else if(new Date(examStartTime) > new Date()){
            //     tipInfo="未开始";
            // }else{
            //     tipInfo="进行中";
            // }
            this.props.onStudentClick(examId,paperId,tipInfo,paper);
        }else{
            this.props.onTestClick(examId,paperId);
        }
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

    getMoreExams(){
        var _this = this;
        var pageNo = _this.state.pageNo;
        pageNo=parseInt(pageNo)+1;
        _this.setState({pageNo});
        console.log("see more"+pageNo);
        _this.getExms(pageNo);
    },

    render() {
        return (
            <div className="exam_timeline">
                <Timeline pending={<a onClick={this.getMoreExams}>查看更多</a>}>
                    {this.state.TimeLineItemArray}
                </Timeline>
            </div>
        );
    },
});

export default TestTimeLineComponents;
