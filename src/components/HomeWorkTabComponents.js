import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Button} from 'antd';
import HomeWorkTableComponents from './HomeWorkTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import AssignHomeWorkComponents from './AssignHomeWorkComponents';


const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count = 5;
    var rs = confirm("确定要删除这" + count + "条记录吗？");
}


const HomeWorkTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent: 0,
            currentTeachScheduleId: '',
            currentSubjectId: '',
            currentOptType: '',
            defaultActiveKey: '作业列表',
            activeKey: '作业列表',
            subjectParams: '',
            currentOpt: 'checkHomeWorkList',
            isNewPage: false,
        };
    },

    getTeacherHomeWork(){
        this.setState({activeKey: '作业列表', currentOpt: 'checkHomeWorkList',});
        this.refs.homeWorkTable.getDoneHomeworkList(sessionStorage.getItem("ident"), 1);
    },

    assignHomeWork(){
        this.setState({activeKey: '布置作业', currentOpt: 'assignHomeWork'});
        this.refs.assignHomeWorkCom.getInitialState();
    },

    changeToolbar(){
        this.setState({activeKey: '作业详情'});
    },

    render() {

        var tabPanel;
        let returnBtn = 'btn1';
        var toolbar;
        if (this.state.currentOpt == "checkHomeWorkList") {
            tabPanel = <HomeWorkTableComponents ref="homeWorkTable" onSearchClick={this.changeToolbar}/>;
            if (this.state.activeKey != "作业详情") {
                returnBtn = 'btn2'
            } else {
                tabPanel = <AssignHomeWorkComponents ref="assignHomeWorkCom" params={this.state.isNewPage}
                                                     callbackParent={this.getTeacherHomeWork}/>;
            }
            toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
                <div className={returnBtn}>
                    <span className="btn1 ant-tabs-right"><button onClick={this.getTeacherHomeWork}><Icon type="left"/></button></span>
                    <span className="btn2 talk_ant_btn1"><button className="ant-btn ant-btn-primary add_study"
                                                                 onClick={this.assignHomeWork}>布置作业</button></span>
                </div>
            </h3>;
        } else {
            tabPanel = <AssignHomeWorkComponents ref="assignHomeWorkCom" params={this.state.isNewPage}
                                                 callbackParent={this.getTeacherHomeWork}/>;
            toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
                <div className={returnBtn}>
                    <span className="btn1 ant-tabs-right"><button onClick={this.getTeacherHomeWork}><Icon type="left"/></button></span>
                </div>
            </h3>;
        }

        return (
            <div>
                {toolbar}
                <div className="favorite_scroll">{tabPanel}</div>
            </div>
        );
    },
});

export default HomeWorkTabComponents;
