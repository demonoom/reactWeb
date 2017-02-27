import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon, Button,Radio } from 'antd';
import ExamPagerTableComponents from './ExamPagerTableComponents';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import CreateExamPagerComponents from './CreateExamPagerComponents';
import UpdateExamPagerComponents from './UpdateExamPagerComponents';


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
            updateSubjectInfo:'',
        };
    },

    getExamPagerList(){
        this.setState({currentOpt:'examPagerList',});
        this.setState({activeKey:'试卷列表'});
        this.refs.examPagerTable.getExamPagerList(sessionStorage.getItem("ident"),1);
    },

    createExamPager(){
        this.setState({currentOpt:'createExamPager',});
        this.setState({activeKey:'组卷',isNewPage:true});
        if(this.refs.createExamPagerComponents!=null && typeof (this.refs.createExamPagerComponents)!="undefined"){
          this.refs.createExamPagerComponents.getInitialState();
        }
    },
    /**
     * 获取单个试卷的信息，用来完成试卷信息的修改操作
     * 需要切换视图到试卷修改页面
     * @param key
     */
    getExamPagerInfo(subjectInfoJson){
        this.setState({currentOpt:'updateExamPager',"updateSubjectInfo":subjectInfoJson});
        this.setState({activeKey:'修改试卷'});
    },

    render() {

        var tabPanel;
        if(this.state.currentOpt=="examPagerList"){
            tabPanel = <TabPane tab="试卷列表" key="试卷列表">
                <ExamPagerTableComponents ref="examPagerTable" callBackParent={this.getExamPagerInfo} />
            </TabPane>;
        }else if(this.state.currentOpt=="createExamPager"){
            tabPanel = <TabPane tab="组卷" key="组卷">
                <CreateExamPagerComponents ref="createExamPagerComponents" callbackParent={this.getExamPagerList}></CreateExamPagerComponents>
            </TabPane>;
        }else if(this.state.currentOpt=="updateExamPager"){
            tabPanel = <TabPane tab="修改试卷" key="修改试卷">
                <UpdateExamPagerComponents ref="updateExamPagerComponents" params={this.state.updateSubjectInfo}  callbackParent={this.getExamPagerList}></UpdateExamPagerComponents>
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
                    tabBarExtraContent={<div className="ant-tabs-right"><Button type="primary" onClick={this.createExamPager} className="add_study">组卷</Button></div>}
                >
                    {tabPanel}
                </Tabs>
            </div>
        );
    },
});

export default ExamPagerTabComponents;
