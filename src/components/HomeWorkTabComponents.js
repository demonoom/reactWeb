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

    render() {

        var tabPanel;
        var returnBtn;
        if (this.state.currentOpt == "checkHomeWorkList") {
            tabPanel = <HomeWorkTableComponents ref="homeWorkTable"/>;
            returnBtn = <Button type="primary" onClick={this.assignHomeWork} className="add_study">布置作业</Button>;
        } else {
            tabPanel = <AssignHomeWorkComponents ref="assignHomeWorkCom" params={this.state.isNewPage}
                                                 callbackParent={this.getTeacherHomeWork}/>;
            returnBtn = <Button type="primary" onClick={this.getTeacherHomeWork} className="add_study">作业列表</Button>;
        }

        return (
            <div>
                <h3 className="public—til—blue">{this.state.activeKey}</h3>
                {returnBtn}
                {tabPanel}
            </div>
        );
    },
});

export default HomeWorkTabComponents;
