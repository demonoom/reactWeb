import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button} from 'antd';
import ExamPagerTableComponents from './ExamPagerTableComponents';
import CreateExamPagerComponents from './CreateExamPagerComponents';
import UpdateExamPagerComponents from './UpdateExamPagerComponents';
import UseKnowledgeComponents from '../UseKnowledgeComponents';


const TabPane = Tabs.TabPane;
const ExamPagerTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent: 0,
            subjectParams: '',
            currentOptType: '',
            currentSubjectId: '',
            activeKey: '试卷列表',
            defaultActiveKey: '试卷列表',
            currentOpt: 'examPagerList', // createExamPager , examPagerList
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
        this.setState({activeKey: '试卷列表', currentOpt: 'examPagerList'});
        this.refs.examPagerTable.getExamPagerList(sessionStorage.getItem("ident"), 1);
    },

    createExam(){
        this.setState({activeKey: '组卷', currentOpt: 'createExamPager'});
    },

    updateExam(subjectInfoJson){
        this.setState({activeKey: '修改试卷', currentOpt: 'updateExamPager', updateSubjectInfo: subjectInfoJson});
    },

    render() {

        var tabPanel;
        var secondBtn;
		var add_study;
        switch (this.state.currentOpt) {

            case 'examPagerList':
                tabPanel = <ExamPagerTableComponents ref="examPagerTable" callBackParent={this.updateExam}/>
                add_study = <Button type="primary" onClick={this.createExam} className="add_study">创建组卷</Button>
                break;

            case 'createExamPager':
                tabPanel = <CreateExamPagerComponents callbackParent={this.getExamPagerList}/>
                secondBtn = <Button onClick={this.getExamPagerList} ><Icon type="left"/></Button>
                break;
            case 'updateExamPager':
                tabPanel = <UpdateExamPagerComponents params={this.state.updateSubjectInfo} callbackParent={this.getExamPagerList}/>
                secondBtn = <Button  onClick={this.getExamPagerList} ><Icon type="left"/></Button>
                break;

        }


        return (
            <div>
                <h3 className="public—til—blue"><span className="ant-tabs-right">{secondBtn}</span><span>{this.state.activeKey}</span><span className="right_btn_new">{add_study}</span></h3>
                 <div className="favorite_scroll">{tabPanel}</div>
            </div>

        );


    },
});

export default ExamPagerTabComponents;
