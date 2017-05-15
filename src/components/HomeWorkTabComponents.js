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
        let returnBtn =  'btn1';
        if (this.state.currentOpt == "checkHomeWorkList") {
            tabPanel = <HomeWorkTableComponents ref="homeWorkTable" onSearchClick={this.changeToolbar}/>;
<<<<<<< HEAD
            if(this.state.activeKey!="作业详情"){
                returnBtn ='btn2'
=======
            if(this.state.activeKey=="作业详情"){
                returnBtn = <span className="ant-tabs-right"><Button onClick={this.getTeacherHomeWork} ><Icon type="left" /></Button></span>;
            }else{
                returnBtn = <span className="talk_ant_btn1"><Button type="primary" onClick={this.assignHomeWork} className="add_study">布置作业</Button></span>;
>>>>>>> bf2ee54f5bb93ac34c8a71ca7dc4687bfaedb71e
            }
        } else {
            tabPanel = <AssignHomeWorkComponents ref="assignHomeWorkCom" params={this.state.isNewPage}
                                                 callbackParent={this.getTeacherHomeWork}/>;
<<<<<<< HEAD

=======
            returnBtn = <span className="ant-tabs-right"><Button onClick={this.getTeacherHomeWork} ><Icon type="left" /></Button></span>;
>>>>>>> bf2ee54f5bb93ac34c8a71ca7dc4687bfaedb71e
        }

        return (
            <div>
<<<<<<< HEAD
                <h3 className={returnBtn + " public—til—blue"}>{this.state.activeKey}
                    <button className="btn1"  onClick={this.getTeacherHomeWork} ><Icon type="left" /></button>
                    <button className="btn2"  onClick={this.assignHomeWork} >布置作业</button>
                </h3>
=======
                <h3 className="public—til—blue">{returnBtn}{this.state.activeKey}{returnBtn2}</h3>
>>>>>>> bf2ee54f5bb93ac34c8a71ca7dc4687bfaedb71e
                 <div className="favorite_scroll">{tabPanel}</div>
            </div>
        );
    },
});

export default HomeWorkTabComponents;
