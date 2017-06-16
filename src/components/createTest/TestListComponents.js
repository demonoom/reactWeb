import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button,message} from 'antd';
import TestTimeLineComponents from './TestTimeLineComponents';
import AssignTestComponents from './AssignTestComponents';
import TestAnalysisComponents from './TestAnalysisComponents';
import TestScoreRankingsComponents from './TestScoreRankingsComponents';
import TestQuestionStatisticsComponents from './TestQuestionStatisticsComponents';
import TestPushComponents from './TestPushComponents';
import TestCheckComponents from './TestCheckComponents';
import TestCheckStudentExmSubmitedResults from './TestCheckStudentExmSubmitedResults';
import TestAnswerComponents from './TestAnswerComponents';
import ConfirmModal from '../ConfirmModal';

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
        if(this.state.answerCardChangeTag==true){
            this.showConfirmModal();
        }else{
            this.turnToTestTimeLine();
        }
    },

    turnToTestTimeLine(){
        this.setState({activeKey: '我的考试', currentOpt: 'testTimeLine',});
        var initPageNo=1;
        if(typeof(this.refs.testTimeLineComponents)!="undefined" ){
            this.refs.testTimeLineComponents.initPage();
        }
    },

    submitAnswerCard(){
        this.refs.testAnswerComponents.submitAnswer();
        this.setState({"answerCardChangeTag":false});
        this.closeConfirmModal();
    },

    showConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal() {
        this.turnToTestTimeLine();
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    assignTest(){
        this.setState({activeKey: '布置试卷', currentOpt: 'assignTest'});
        if(typeof(this.refs.assignTestComponents)!="undefined" ){
            this.refs.assignTestComponents.initPage();
        }
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
        this.setState({activeKey: tipTitle, currentOpt: 'checkStudentExmSubmitedResults',"examId":exmId,"studentObj":userObj});
    },

    studentAnswerOrSeeResult(examId,paperId,tipInfo,paper){
        // this.setState({activeKey: '考试作答', currentOpt: 'testAnswer',"examId":examId,"paperId":paperId});
        switch(tipInfo){
            case "未开始":
                message.warning("该场考试还未开始!");
                break;
            case "已结束":
                var userObj = JSON.parse(sessionStorage.getItem("loginUser"));
                var tipTitle = userObj.userName+"同学试题答案";
                if(typeof(this.refs.testCheckStudentExmSubmitedResults)!="undefined" ){
                    this.refs.testCheckStudentExmSubmitedResults.getStudentExmSubmitedResults();
                }
                this.setState({activeKey: tipTitle, currentOpt: 'checkStudentExmSubmitedResults',"examId":examId,"studentObj":userObj});
                break;
            case "进行中":
                if(typeof(this.refs.testCheckStudentExmSubmitedResults)!="undefined" ){
                    this.refs.testCheckStudentExmSubmitedResults.getStudentExmSubmitedResults();
                }
                var studentObj = JSON.parse(sessionStorage.getItem("loginUser"));
                this.setState({activeKey: '考试作答', currentOpt: 'testAnswer',"examId":examId,"paperId":paperId,"paper":paper,"studentObj":studentObj});
                break;
        }
    },

    assignAnswerCardChangeTag(flag){
        this.setState({"answerCardChangeTag":flag});
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
            var userObj = JSON.parse(sessionStorage.getItem("loginUser"));
            if(userObj.colUtype=="STUD"){
                topButton = "";
            }else{
                topButton = assignExamsBtn;
            }
            tabPanel = <TestTimeLineComponents ref="testTimeLineComponents" onTestClick={this.testAnalysis}
                onStudentClick={this.studentAnswerOrSeeResult}/>;
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
                exmId={this.state.examId} paperId={this.state.paperId}
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
            if(typeof(this.state.studentObj)!="undefined" ){
                leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getTestList}
                                                                        className="affix_bottom_tc"><Icon
                    type="left"/></button></span>;
            }else{
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
            }
            returnBtn = 'btn1';
            topButton = "";

            tabPanel = <TestCheckStudentExmSubmitedResults  ref="testCheckStudentExmSubmitedResults"
                                                            exmId={this.state.examId}
                                                           studentObj={this.state.studentObj}
                                                           checkExamComeFrom={checkExamComeFrom}
                                            onCheckButtonClick={this.checkTest}

            />;
        }else if(this.state.currentOpt == "testAnswer"){
            //学生作答
            returnBtn = 'btn1';
            topButton = "";
            checkExamComeFrom="checkTest";
            // this.setState({"checkExamComeFrom":"checkTest"});
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getTestList}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestAnswerComponents exmId={this.state.examId} paper={this.state.paper}
                                            onAnswerCardChange={this.assignAnswerCardChangeTag}
                                             studentObj={this.state.studentObj}
                                             ref="testAnswerComponents"
                    ></TestAnswerComponents>;
        }

        toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
            <div className={returnBtn}>
                {leftBtn}
                {topButton}
            </div>
        </h3>;

        return (
            <div className="follow_my">
                {toolbar}
                <div className="favorite_scroll favorite_up">{tabPanel}</div>
                <ConfirmModal ref="confirmModal"
                              title="是否更改上次提交?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.submitAnswerCard}
                ></ConfirmModal>
            </div>
        );
    },
});

export default TestListComponents;
