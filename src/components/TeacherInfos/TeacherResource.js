import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon } from 'antd';
import { Menu, Dropdown } from 'antd';
import TeacherAllCourseWare from '../TeacherInfos/TeacherAllCourseWare';
import TeacherAllSubjects from '../TeacherInfos/TeacherAllSubjects';

const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count =5;
    var rs = confirm("确定要删除这"+count+"条记录吗？");
}

var mt;
let breadcrumbChildren;
var breadCrumbArray=[];
const TeacherResource = React.createClass({

    getInitialState() {
        return {
            currentIdent:0,
            currentTeachScheduleId:'',
            currentSubjectId:'',
            currentOptType:'',
            defaultActiveKey:'课件',
            activeKey:'课件',
            subjectParams:'',
            breadcrumbArray:[],
            currentKnowledgeName:'',
            dataFilter:'self',
            subjectDataFilter:'self',
            currentMenuChildrenCount:-1,
            toolbarExtenderDisplay:false
        };
    },
    getTeachPlans(){
        // this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),teachScheduleId,optType,pageNo,knowledgeName,this.state.dataFilter);
    },

    componentDidMount(){
        // alert("ttt"+this.props.resouceType);
    },

    render() {
        var mainComponent ;
        var breadMenuTip;
        if(this.props.resouceType=="getCourseWares"){
            mainComponent = <TeacherAllCourseWare ref="courseWare"/>;
            breadMenuTip="我的资源";
        }else if(this.props.resouceType=="getSubjects"){
            mainComponent = <TeacherAllSubjects ref="teacherAllSubjects"></TeacherAllSubjects>;
            breadMenuTip="我的题目";
        }
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span>个人中心</span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <span>{breadMenuTip}</span>
                    </Breadcrumb.Item>
                </Breadcrumb>
                {mainComponent}
            </div>
        );
    },
});

export default TeacherResource;
