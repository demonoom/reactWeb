import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon } from 'antd';
import { Menu, Dropdown } from 'antd';
import TeacherAllCourseWare from '../TeacherInfos/TeacherAllCourseWare';

const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count =5;
    var rs = confirm("确定要删除这"+count+"条记录吗？");
}

var mt;
let breadcrumbChildren;
var breadCrumbArray=[];
const MainTabComponents = React.createClass({

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
    getTeachPlans(optContent){
        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType =optContentArray[1];
        var knowledgeName = optContentArray[2];
        var pageNo = 1;
        this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),teachScheduleId,optType,pageNo,knowledgeName,this.state.dataFilter);
        this.setState({currentOptType:optType});
        this.setState({currentTeachScheduleId:teachScheduleId});
        this.setState({currentKnowledgeName:knowledgeName});
        this.setState({activeKey:'课件'});
        this.setState({subjectParams:sessionStorage.getItem("ident")+"#"+teachScheduleId+"#"+1+"#"+optType+"#"+knowledgeName+"#"+this.state.dataFilter});
    },

    render() {
        return (
            <div>
                {/*<Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    {breadcrumbChildren}
                </Breadcrumb>*/}
                <TeacherAllCourseWare ref="courseWare"/>
            </div>
        );
    },
});

export default MainTabComponents;
