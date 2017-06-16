import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button} from 'antd';
import TestTimeLineComponents from './TestTimeLineComponents';
import AssignTestComponents from './AssignTestComponents';
import TestAnalysisComponents from './TestAnalysisComponents';
import TestScoreRankingsComponents from './TestScoreRankingsComponents';
import TestQuestionStatisticsComponents from './TestQuestionStatisticsComponents';
import TestPushComponents from './TestPushComponents';
import TestCheckComponents from './TestCheckComponents';
import TestCheckStudentExmSubmitedResults from './TestCheckStudentExmSubmitedResults';

const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count = 5;
    var rs = confirm("确定要删除这" + count + "条记录吗？");
}

var checkExamComeFrom;
const TestListComponents = React.createClass({

    getInitialState() {
        return {
            currentOpt:'testTimeLine'
        };
    },

    getTestList(){
        this.setState({activeKey: '我的考试', currentOpt: 'testTimeLine',});
        var initPageNo=1;
        if(typeof(this.refs.testTimeLineComponents)!="undefined" ){
            this.refs.testTimeLineComponents.getExms(initPageNo);
        }
        //
    },

    assignTest(){
        this.setState({activeKey: '布置试卷', currentOpt: 'assignTest'});
    },

    testAnalysis(examId,paperId){
        console.log("tongji:"+examId+"\t"+paperId);
        this.setState({activeKey: '试卷统计', currentOpt: 'testAnalysis',"examId":examId,"paperId":paperId});
    },

    getExmScoreRankings(exmId){
        console.log("排名:"+exmId);
        this.setState({activeKey: '成绩排名', currentOpt: 'testScoreRankings',"examId":exmId});
    },

    getExmQuestionStatistics(exmId){
        this.setState({activeKey: '试卷详情', currentOpt: 'exmQuestionStatistics',"examId":exmId});
    },

    getExmPushByPaperId(paperId){
        this.setState({activeKey: '班级比较', currentOpt: 'exmPushByPaperId',"paperId":paperId});
    },

    checkTest(){
        this.setState({activeKey: '批改试卷', currentOpt: 'checkTest'});
    },

    getStudentExmSubmitedResults(exmId,userObj){
        var tipTitle = "批改"+userObj.userName+"同学的试卷";
        this.setState({activeKey: tipTitle, currentOpt: 'checkStudentExmSubmitedResults',"examId":exmId,"studentObj"：userObj});
    },

    render() {

        var tabPanel;
        let returnBtn = '';
        let topButton;
        let assignExamsBtn = <span className="btn2 talk_ant_btn1"><button className="ant-btn ant-btn-primary add_study" onClick={this.assignTest}>布置试卷</button></span>;
        let checkExamsBtn = <span className="btn2 talk_ant_btn1"><button className="ant-btn ant-btn-primary add_study" onClick={this.checkTest}>批改试卷</button></span>;
        var toolbar;
        var leftBtn;
        if (this.state.currentOpt == "testTimeLine") {
            //考试列表
            returnBtn = '';
            leftBtn="";
            topButton = assignExamsBtn;
            tabPanel = <TestTimeLineComponents ref="assignTest" onTestClick={this.testAnalysis}/>;
        } else if (this.state.currentOpt == "assignTest"){
            //布置考试
            returnBtn = 'btn1';
            topButton = "";
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getTestList}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <AssignTestComponents ref="assignTestComponents" callbackParent={this.getTestList}/>;
        }else if (this.state.currentOpt == "testAnalysis"){
            //考试的整体统计页面
            returnBtn = 'btn1';
            topButton = checkExamsBtn;
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getTestList}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestAnalysisComponents ref="testAnalysisComponents"
                exmId={this.state.examId} paperId={this.state.paperId}studentObj
                onSortedButtonClick={this.getExmScoreRankings}
                onExmQuestionStatisticsClick={this.getExmQuestionStatistics}
                onExmPushClick={this.getExmPushByPaperId}
            />;
        }else if(this.state.currentOpt == "testScoreRankings"){
            //成绩排名
            returnBtn = 'btn1';
            topButton = "";
            checkExamComeFrom="testScoreRankings";
            // this.setState({"checkExamComeFrom":"testScoreRankings"});
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.testAnalysis.bind(this,this.state.examId)}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestScoreRankingsComponents ref="testScoreRankingsComponents" exmId={this.state.examId}
                                                    onCheckButtonClick={this.getStudentExmSubmitedResults}
                                />;
        }else if(this.state.currentOpt == "exmQuestionStatistics"){
            //试卷详情
            returnBtn = 'btn1';
            topButton = "";
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.testAnalysis.bind(this,this.state.examId)}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestQuestionStatisticsComponents ref="testQuestionStatisticsComponents" exmId={this.state.examId}/>;
        }else if(this.state.currentOpt == "exmPushByPaperId"){
            //平行班比较
            returnBtn = 'btn1';
            topButton = "";
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.testAnalysis.bind(this,this.state.examId)}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestPushComponents ref="testQuestionStatisticsComponents" paperId={this.state.paperId}/>;
        }else if(this.state.currentOpt == "checkTest"){
            //待批改学生列表
            returnBtn = 'btn1';
            topButton = "";
            checkExamComeFrom="checkTest";
            // this.setState({"checkExamComeFrom":"checkTest"});
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.testAnalysis.bind(this,this.state.examId)}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestCheckComponents ref="testCheckComponents" exmId={this.state.examId}
                    onCheckButtonClick={this.getStudentExmSubmitedResults}
                />;
        }else if(this.state.currentOpt == "checkStudentExmSubmitedResults"){
            //批改xx同学的试卷
            // checkExamComeFrom="checkTest";
            if(typeof(checkExamComeFrom)!="undefined" ){
                if(checkExamComeFrom=="checkTest"){
                    leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.checkTest}
                                                                            className="affix_bottom_tc"><Icon
                        type="left"/></button></span>;
                }else{
                    leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getExmScoreRankings.bind(this,this.state.examId)}
                                                                            className="affix_bottom_tc"><Icon
                        type="left"/></button></span>;
                }
            }
            returnBtn = 'btn1';
            topButton = "";

            tabPanel = <TestCheckStudentExmSubmitedResults exmId={this.state.examId}
                                                           studentObj={this.state.studentObj}
                                                           checkExamComeFrom={checkExamComeFrom}
                                            onCheckButtonClick={this.checkTest}

            />;
        }

        toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
            <div className={returnBtn}>
                {leftBtn}
                {topButton}
            </div>
        </h3>;

        return (
            <div>
                {toolbar}
                <div className="favorite_scroll favorite_up">{tabPanel}</div>
            </div>
        );
    },
});

export default TestListComponents;
