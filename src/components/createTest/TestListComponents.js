import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button} from 'antd';
import TestTimeLineComponents from './TestTimeLineComponents';
import AssignTestComponents from './AssignTestComponents';


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
        // this.refs.assignTestComponents.getInitialState();
    },

    changeToolbar(){
        this.setState({activeKey: '作业详情', currentOpt: 'subjectList'});
    },

    render() {

        var tabPanel;
        let returnBtn = 'btn1';
        let assignExamsBtn = <span className="btn2 talk_ant_btn1"><button className="ant-btn ant-btn-primary add_study" onClick={this.assignTest}>布置试卷</button></span>;
        var toolbar;
        if (this.state.currentOpt == "testTimeLine") {
            returnBtn = 'btn1'
            tabPanel = <TestTimeLineComponents ref="testTimeLineComponents"/>;
        } else {
            returnBtn = 'btn2'
            tabPanel = <AssignTestComponents ref="assignTestComponents" callbackParent={this.getTestList}/>;
        }
        toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
            <div className={returnBtn}>
                <span className="btn1 ant-tabs-right"><button onClick={this.getTeacherHomeWork}
                                                              className="affix_bottom_tc"><Icon
                    type="left"/></button></span>
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
