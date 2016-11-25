import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon, Button,Radio } from 'antd';
import CourseWareComponents from './CourseWareComponents';
import SubjectTable from './SubjectTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import CourseWareUploadComponents from './CourseWareUploadComponents';
import SubjectUploadTabComponents from './SubjectUploadTabComponents';




const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count =5;
    var rs = confirm("确定要删除这"+count+"条记录吗？");
}


var mt;
let breadcrumbChildren;
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
            currentKnowledgeName:''
        };
    },
    getTeachPlans(optContent){
        //alert("main :"+teachScheduleId);
        var optContentArray = optContent.split("#");
        var teachScheduleId = optContentArray[0];
        var optType =optContentArray[1];
        var knowledgeName = optContentArray[2];
        var pageNo = 1;
        // alert("knowledgeName:"+knowledgeName);
        this.refs.courseWare.getTeachPlans(sessionStorage.getItem("ident"),teachScheduleId,optType,pageNo,knowledgeName);
        this.setState({currentOptType:optType});
        this.setState({currentTeachScheduleId:teachScheduleId});
        this.setState({currentKnowledgeName:knowledgeName});
        this.setState({activeKey:'课件'});
        this.setState({subjectParams:sessionStorage.getItem("ident")+"#"+teachScheduleId+"#"+1+"#"+optType});
    },

    onChange(activeKey) {
        if(activeKey=="题目"){
            this.setState({activeKey:'题目'});
            this.setState({subjectParams:sessionStorage.getItem("ident")+"#"+this.state.currentTeachScheduleId+"#"+1+"#"+this.state.currentOptType});
        }else{
            this.setState({activeKey:'课件'});
        }
    },

    showModal:function () {
        this.refs.useKnowledgeComponents.showModal();
    },
    //生成面包屑导航
    buildBreadcrumb:function (breadcrumbArray) {
        breadcrumbChildren = breadcrumbArray.map((e, i)=> {
            return <Breadcrumb.Item key={e.hrefText}><a href={e.hrefLink}>{e.hrefText}</a></Breadcrumb.Item>
        });
        this.setState({activeKey:'课件'});
        this.setState({breadcrumbArray:breadcrumbArray});
    },

    componentWillMount(){
        var breadcrumbArray = [{hrefLink:'#/MainLayout',hrefText:"首页"}];
        this.buildBreadcrumb(breadcrumbArray);
    },

    render() {

        var toolbarExtra;
        if(this.state.currentOptType==""){
            toolbarExtra = <div className="ant-tabs-right"></div>;
        }else if(this.state.currentOptType=="bySchedule"){
            /*toolbarExtra = <div className="ant-tabs-right"><span className="toobar"><Button type="" icon="delete" onClick={deleteConfirm}  ></Button></span></div>;*/
            toolbarExtra = <div className="ant-tabs-right"></div>;
        }else{
            /*toolbarExtra = <div className="ant-tabs-right"><Button type="" icon="share-alt" onClick={this.showModal}></Button><SubjectUploadTabComponents params={this.state.subjectParams}></SubjectUploadTabComponents><span className="toobar"><Button type="" icon="delete" onClick={deleteConfirm}  ></Button></span></div>;*/
            toolbarExtra = <div className="ant-tabs-right"><CourseWareUploadComponents params={this.state.subjectParams}></CourseWareUploadComponents><SubjectUploadTabComponents params={this.state.subjectParams}></SubjectUploadTabComponents></div>;
        }
        {/*toolbarExtra = <div className="ant-tabs-right"><CourseWareUploadComponents params={this.state.subjectParams}></CourseWareUploadComponents><SubjectUploadTabComponents params={this.state.subjectParams}></SubjectUploadTabComponents></div>;*/}
        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    {breadcrumbChildren}
                </Breadcrumb>
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
                    onEdit={this.onEdit}
                    ref = "mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={toolbarExtra}
                >
                    <TabPane tab="课件" key="课件"><CourseWareComponents ref="courseWare"/></TabPane>
                    <TabPane tab="题目" key="题目"><SubjectTable  ref="subTable" params={this.state.subjectParams}/></TabPane>
                </Tabs>
            </div>
        );
    },
});

export default MainTabComponents;
