import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button} from 'antd';
import TestTimeLineComponents from './TestTimeLineComponents';
import AssignTestComponents from './AssignTestComponents';
import TestAnalysisComponents from './TestAnalysisComponents';


const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count = 5;
    var rs = confirm("确定要删除这" + count + "条记录吗？");
}


const TestListComponents = React.createClass({

    getInitialState() {
        return {
            currentOpt:'testTimeLine'
        };
    },

    getTestList(){
        this.setState({activeKey: '我的考试', currentOpt: 'testTimeLine',});
        var initPageNo=1;
        this.refs.testTimeLineComponents.getExms(initPageNo);
    },

    assignTest(){
        this.setState({activeKey: '布置试卷', currentOpt: 'assignTest'});
    },

    testAnalysis(examId){
        console.log("tongji:"+examId);
        this.setState({activeKey: '试卷统计', currentOpt: 'testAnalysis',"examId":examId});
    },

    changeToolbar(){
        this.setState({activeKey: '作业详情', currentOpt: 'subjectList'});
    },

    render() {

        var tabPanel;
        let returnBtn = '';
        let assignExamsBtn = <span className="btn2 talk_ant_btn1"><button className="ant-btn ant-btn-primary add_study" onClick={this.assignTest}>布置试卷</button></span>;
        var toolbar;
        var leftBtn;
        if (this.state.currentOpt == "testTimeLine") {
            returnBtn = '';
            leftBtn="";
            tabPanel = <TestTimeLineComponents ref="assignTest" onTestClick={this.testAnalysis}/>;
        } else if (this.state.currentOpt == "assignTest"){
            returnBtn = 'btn1';
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getTestList}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <AssignTestComponents ref="assignTestComponents" callbackParent={this.getTestList}/>;
        }else if (this.state.currentOpt == "testAnalysis"){
            returnBtn = 'btn1';
            leftBtn = <span className="btn1 ant-tabs-right"><button onClick={this.getTestList}
                                                                    className="affix_bottom_tc"><Icon
                type="left"/></button></span>;
            tabPanel = <TestAnalysisComponents ref="testAnalysisComponents" exmId={this.state.examId}/>;
        }
        toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
            <div className={returnBtn}>
                {leftBtn}
                {assignExamsBtn}
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
