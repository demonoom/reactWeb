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

const StudyEvaluateTabComponents = React.createClass({

    getInitialState() {
        return {
            currentIdent:0,
            currentTeachScheduleId:'',
            currentSubjectId:'',
            currentOptType:'',
            defaultActiveKey:'学情分析',
            activeKey:'学情分析',
            subjectParams:'',
            currentPageLink:"http://www.maaee.com:80/Excoord_PhoneService/subjectReport/xueqingfenxi/" + sessionStorage.getItem("ident"),
        };
    },


    getStudyEvaluate(optContent){
        alert("学情");
        this.setState({currentOpt:'studyEvaluate',});
        this.setState({activeKey:'学情分析'});
        // this.refs.homeWorkTable.getDoneHomeworkList(sessionStorage.getItem("ident"),1);
    },

    render() {

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
                >
                    <TabPane tab="学情分析" key="学情分析">
                        <iframe src={this.state.currentPageLink} className="analyze_iframe"></iframe>
                    </TabPane>

                </Tabs>
            </div>
        );
    },
});

export default StudyEvaluateTabComponents;
