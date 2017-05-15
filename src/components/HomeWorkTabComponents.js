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
        if (this.state.currentOpt == "checkHomeWorkList") {
            tabPanel = <HomeWorkTableComponents ref="homeWorkTable" onSearchClick={this.changeToolbar}/>;
            if (this.state.activeKey != "作业详情") {
                returnBtn = 'btn2'
            } else {
                tabPanel = <AssignHomeWorkComponents ref="assignHomeWorkCom" params={this.state.isNewPage} callbackParent={this.getTeacherHomeWork}/>;
            }

            return (
                <div>
                    <h3 className={returnBtn + " public—til—blue"}>{this.state.activeKey}
                        <button className="btn1" onClick={this.getTeacherHomeWork}><Icon type="left"/></button>
                        <button className="btn2" onClick={this.assignHomeWork}>布置作业</button>
                    </h3>
                    <div className="favorite_scroll">{tabPanel}</div>
                </div>
            );
        }
    }
});

export default HomeWorkTabComponents;
