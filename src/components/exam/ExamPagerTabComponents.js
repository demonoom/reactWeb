import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button, Radio} from 'antd';
import ExamPagerTableComponents from './ExamPagerTableComponents';
import CreateExamPagerComponents from './CreateExamPagerComponents';
import UpdateExamPagerComponents from './UpdateExamPagerComponents';


const TabPane = Tabs.TabPane;
const ExamPagerTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent: 0,
            isNewPage: false,
            subjectParams: '',
            currentOptType: '',
            currentSubjectId: '',
            activeKey: '试卷列表',
            defaultActiveKey: '试卷列表',
            currentOpt: 'examPagerList',
            currentTeachScheduleId: '',
            updateSubjectInfo: '',
        };
        this.createExam = this.createExam.bind(this);
        this.updateExam = this.updateExam.bind(this);
        this.getExamPagerList = this.getExamPagerList.bind(this);
    },

    componentWillMount(){


    },

    getExamPagerList(){
        this.setState({activeKey: '试卷列表', currentOpt: 'examPagerList' });
        this.refs.examPagerTable.getExamPagerList(sessionStorage.getItem("ident"),1);
    },

    createExam(){
        this.setState({activeKey: '组卷', currentOpt: 'createExamPager', isNewPage: true});
    },

    updateExam(subjectInfoJson){
        this.setState({activeKey: '修改试卷', currentOpt: 'updateExamPager', updateSubjectInfo: subjectInfoJson});
    },

    render() {

        var tabPanel;

        switch (this.state.currentOpt) {

            case 'examPagerList':
                    tabPanel = <TabPane tab="试卷列表" key="试卷列表">
                        <ExamPagerTableComponents ref="examPagerTable"   callBackParent={this.updateExam} />
                    </TabPane>;
                break;
            case 'createExamPager':
                tabPanel = <TabPane tab="组卷" key="组卷">
                    <CreateExamPagerComponents ref="createExamPagerComponents"
                                               callbackParent={this.getExamPagerList} />
                </TabPane>;
                break;
            case 'updateExamPager':
                tabPanel = <TabPane tab="修改试卷" key="修改试卷">
                    <UpdateExamPagerComponents ref="updateExamPagerComponents" params={this.state.updateSubjectInfo}
                                               callbackParent={this.getExamPagerList} />
                </TabPane>;
                break;

        }


            return (
                <div>
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item ><Icon type="home"/></Breadcrumb.Item>
                        <Breadcrumb.Item href="#/MainLayout">首页</Breadcrumb.Item>
                    </Breadcrumb>
                    <Tabs
                        hideAdd
                        onChange={this.onChange}
                        onEdit={this.onEdit}
                        ref="mainTab"
                        activeKey={this.state.activeKey}
                        defaultActiveKey={this.state.defaultActiveKey}
                        transitionName=""
                        tabBarExtraContent={<div className="ant-tabs-right"><Button type="primary"
                                                                                    onClick={this.createExam}
                                                                                    className="add_study">增加组卷</Button></div>}
                    >
                        {tabPanel}
                    </Tabs>
                </div>

            );



    },
});

export default ExamPagerTabComponents;
