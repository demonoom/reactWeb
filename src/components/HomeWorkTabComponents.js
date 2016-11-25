import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon, Button,Radio } from 'antd';
import HomeWorkTableComponents from './HomeWorkTableComponents';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import AssignHomeWorkComponents from './AssignHomeWorkComponents';




const TabPane = Tabs.TabPane;
//定义js函数，完成删除前的确认提示操作
function deleteConfirm() {
    var count =5;
    var rs = confirm("确定要删除这"+count+"条记录吗？");
}


var mt;
const HomeWorkTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent:0,
            currentTeachScheduleId:'',
            currentSubjectId:'',
            currentOptType:'',
            defaultActiveKey:'作业列表',
            activeKey:'作业列表',
            subjectParams:'',
            currentOpt:'checkHomeWorkList',
        };
    },

    getTeacherHomeWork(optContent){
        // alert("getTeacherHomeWork in tab:"+optContent);
        this.setState({currentOpt:'checkHomeWorkList',});
        this.setState({activeKey:'作业列表'});
        this.refs.homeWorkTable.getDoneHomeworkList(sessionStorage.getItem("ident"),1);
    },

    assignHomeWork(){
        this.setState({currentOpt:'assignHomeWork',});
        this.setState({activeKey:'布置作业'});
    },

    render() {

        var tabPanel;
        if(this.state.currentOpt=="checkHomeWorkList"){
            tabPanel = <TabPane tab="作业列表" key="作业列表">
                <HomeWorkTableComponents ref="homeWorkTable"/>
            </TabPane>;
        }else{
            tabPanel = <TabPane tab="布置作业" key="布置作业">
                <AssignHomeWorkComponents ref="assignHomeWorkCom"  callbackParent={this.getTeacherHomeWork}></AssignHomeWorkComponents>
            </TabPane>;
        }

        return (
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item ><Icon type="home" /></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">首页</Breadcrumb.Item>
                </Breadcrumb>
                <Tabs
                    hideAdd
                    animated="false"
                    onChange={this.onChange}
                    /*type="editable-card"     启用该属性，会使Tab上带有删除的图标*/
                    onEdit={this.onEdit}
                    ref = "mainTab"
                    activeKey={this.state.activeKey}
                    defaultActiveKey={this.state.defaultActiveKey}
                    tabBarExtraContent={<div className="ant-tabs-right"><Button type="primary" onClick={this.assignHomeWork} className="add_study">布置作业</Button></div>}
                >
                    {/*<TabPane tab="布置作业" key="布置作业">
                            <HomeWorkTableComponents ref="homeWorkTable"/>
                    </TabPane>*/}
                    {tabPanel}
                </Tabs>
            </div>
        );
    },
});

export default HomeWorkTabComponents;
