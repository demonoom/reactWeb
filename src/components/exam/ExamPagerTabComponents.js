import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon, Button,Radio } from 'antd';
import ExamPagerTableComponents from './ExamPagerTableComponents';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import CreateExamPagerComponents from './CreateExamPagerComponents';



const TabPane = Tabs.TabPane;
const ExamPagerTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent:0,
            currentTeachScheduleId:'',
            currentSubjectId:'',
            currentOptType:'',
            defaultActiveKey:'试卷列表',
            activeKey:'试卷列表',
            subjectParams:'',
            currentOpt:'examPagerList',
            isNewPage:false,
        };
    },

    getExamPagerList(){
        this.setState({currentOpt:'examPagerList',});
        this.setState({activeKey:'试卷列表'});
        this.refs.examPagerTable.getExamPagerList(sessionStorage.getItem("ident"),1);
    },

    assignHomeWork(){
        this.setState({currentOpt:'assignHomeWork',});
        this.setState({activeKey:'组卷',isNewPage:true});
        if(this.refs.createExamPagerComponents!=null && typeof (this.refs.createExamPagerComponents)!="undefined"){
          this.refs.createExamPagerComponents.getInitialState();
        }
    },

    render() {

        var tabPanel;
        if(this.state.currentOpt=="examPagerList"){
            tabPanel = <TabPane tab="试卷列表" key="试卷列表">
                <ExamPagerTableComponents ref="examPagerTable"/>
            </TabPane>;
        }else{
            tabPanel = <TabPane tab="组卷" key="组卷">
                <CreateExamPagerComponents ref="createExamPagerComponents" params={this.state.isNewPage}  callbackParent={this.getTeacherHomeWork}></CreateExamPagerComponents>
            </TabPane>;
        }

        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item ><Icon type="home" /></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">首页</Breadcrumb.Item>
                </Breadcrumb>
                <Tabs
                    hideAdd
                    onChange={this.onChange}
                    /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
                    onEdit={this.onEdit}
                    ref = "mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    transitionName=""  //禁用Tabs的动画效果
                    tabBarExtraContent={<div className="ant-tabs-right"><Button type="primary" onClick={this.assignHomeWork} className="add_study">组卷</Button></div>}
                >
                    {tabPanel}
                </Tabs>
            </div>
        );
    },
});

export default ExamPagerTabComponents;
