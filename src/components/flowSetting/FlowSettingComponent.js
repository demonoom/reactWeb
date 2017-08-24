import React, { PropTypes } from 'react';
import {Button,Icon,message,Modal,Collapse,Input,Row,Col,Select} from 'antd';
import CreateFlowComponent from './CreateFlowComponent';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
const Panel = Collapse.Panel;
const Option = Select.Option;
const confirm = Modal.confirm;

const FlowSettingComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            createNewFlowModalVisible:false,
            createFlowGroupModalVisible:false,
            editFlowGroupModalVisible:false,
            flowCollpseArray:[],
            flowGroupName:'',   //流程分组的名称
            flowGroupId:"-1",
            openCollapseKey:[],
        };
    },

    componentDidMount(){
        this.getFlowGroup();
    },

    componentWillReceiveProps(nextProps){
    },

    /**
     * 获取流程分组及其分组下的流程列表
     */
    getFlowGroup(){
        var collapsePanelArray = [];
        var openCollapseKey =[];
        for(var i=0;i<3;i++){
            var flowObjArray=[];
            for(var j=0;j<2;j++){
                var flowId = j;
                var flowObj = <div style={{display:'inline-flex'}}>
                    <div>
                        <Icon type="logout" /><span>请假{j}</span>
                    </div>
                    <div>
                        <a onClick={this.stopFlow.bind(this,j)}>停用</a>  <p></p>
                        <a onClick={this.removeFlow.bind(this,j)}>移动到</a>
                    </div>
                </div>;
                flowObjArray.push(flowObj);
            }
            var flowGroupId = i;
            var flowGroupName = "出勤休假"+i;
            var flowCount = 2;
            var headerDiv=<div>
                <span>{flowGroupName}({flowCount})</span>
                <Button onClick={this.showEditGroupModal.bind(this,Event,flowGroupId,flowGroupName)}>编辑</Button>
            </div>;
            var collapsePanel = <Panel header={headerDiv} key={flowGroupId}>
                {flowObjArray}
            </Panel>;
            openCollapseKey.push(flowGroupId+"");
            collapsePanelArray.push(collapsePanel);
        }
        this.setState({collapsePanelArray,openCollapseKey});
    },

    /**
     * 显示编辑分组名称的窗口
     */
    showEditGroupModal(e,flowGroupId,flowGroupName){
        this.setState({editFlowGroupModalVisible:true,"editFlowGroupId":flowGroupId,"flowGroupName":flowGroupName});
        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * 创建新的流程
     */
    createNewFlow(){
        this.setState({"createNewFlowModalVisible":true,"isChangeStep":false,stepDirect:''});
    },
    /**
     * 切换页面流程的下一步/上一步
     * @param direct
     */
    changeStep(direct){
        if(direct=="next"){
            var canBeNext = this.refs.createFlowComponent.canBeNextStep();
            if(canBeNext==false){
                message.error("请先设置流程审批的表单");
                return;
            }
        }
        this.setState({"stepDirect":direct,"isChangeStep":true});
        this.refs.createFlowComponent.changeStep(direct);
    },

    createNewFlowModalHandleCancel(){
        this.refs.createFlowComponent.changeStep("pre");
        this.refs.createFlowComponent.initCreatePage();
        this.setState({"createNewFlowModalVisible":false,"isChangeStep":false,stepDirect:''});
    },

    /**
     * 保存流程
     */
    saveFlow(){

    },

    /**
     * 创建流程分组
     */
    createNewFlowGroup(){
        this.setState({createFlowGroupModalVisible:true});
    },

    /**
     * 停用指定的流程
     */
    stopFlow(flowId){
        console.log(flowId);
        var _this = this;
        confirm({
            title: '确定要停用该流程?',
            transitionName:"",  //禁用modal的动画效果
            onOk() {
                console.log('OK');
                //_this.suspendFlow(flowId);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    },

    /**
     * 停用流程(挂起流程定义)
     */
    suspendFlow(flowId){
        let _this = this;
        var param = {
            "method": 'suspendFlow',
            "operateUserId": _this.state.loginUser.colUid,
            "flowId":flowId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("流程已停用");
                    this.getFlowGroup();
                }
                _this.createFlowGroupModalHandleCancel();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 移动指定的流程到新的分组
     */
    removeFlow(flowId){
        console.log(flowId);
        this.setState({"moveFlowModalVisible":true,"moveFlowId":flowId});
    },

    /**
     * 关闭新建分组的窗口
     */
    createFlowGroupModalHandleCancel(){
        this.setState({createFlowGroupModalVisible:false});
    },

    /**
     * 新建流程分组
     */
    createFlowGroup(){
        let _this = this;
        var param = {
            "method": 'createFlowGroup',
            "operateUserId": _this.state.loginUser.colUid,
            "flowGroupName":_this.state.flowGroupName
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("分组创建成功");
                    this.getFlowGroup();
                }
                _this.createFlowGroupModalHandleCancel();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 编辑流程分组的名称
     */
    editFlowGroup(){
        let _this = this;
        var param = {
            "method": 'editFlowGroup',
            "operateUserId": _this.state.loginUser.colUid,
            "flowGroupId": _this.state.editFlowGroupId,
            "flowGroupName":_this.state.flowGroupName
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("分组编辑成功");
                    this.getFlowGroup();
                }
                _this.editFlowGroupModalHandleCancel();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 新建流程分组时,分组名称改变的响应函数
     */
    flowGroupNameChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var flowGroupName = target.value;
        this.setState({flowGroupName});
    },

    /**
     * 编辑分组名称窗口关闭响应
     */
    editFlowGroupModalHandleCancel(){
        this.setState({editFlowGroupModalVisible:false});
    },

    /**
     * 审批流程分组列表改变的响应函数
     * @param value
     */
    flowGroupChange(value) {
        console.log(`selected ${value}`);
        this.setState({flowGroupId:value});
    },

    /**
     * 关闭流程移动分组窗口
     */
    moveFlowModalHandleCancel(){
        this.setState({"moveFlowModalVisible":false});
    },

    /**
     * 移动流程到目标分组
     */
    moveFlowToGroup(){
        let _this = this;
        if(isEmpty(_this.state.flowGroupId) || _this.state.flowGroupId==-1){
            message.error("请选择流程的目标分组");
            return;
        }
        var param = {
            "method": 'moveFlowToGroup',
            "operateUserId": _this.state.loginUser.colUid,
            "flowId": _this.state.moveFlowId,
            "flowGroupId": _this.state.flowGroupId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    message.success("流程移动分组成功");
                    this.getFlowGroup();
                }
                _this.moveFlowModalHandleCancel();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        var saveButtons;
        if(isEmpty(this.state.stepDirect) || this.state.stepDirect=="pre"){
            saveButtons=[
                <Button onClick={this.changeStep.bind(this,"next")}>下一步</Button>,
                <Button onClick={this.createNewFlowModalHandleCancel}>关闭</Button>
            ];
        }else if(this.state.stepDirect=="next"){
            saveButtons=[
                <Button onClick={this.changeStep.bind(this,"pre")}>上一步</Button>,
                <Button onClick={this.saveFlow.bind(this,"save")}>提交</Button>,
                <Button onClick={this.createNewFlowModalHandleCancel}>关闭</Button>
            ];
        }



        return (
            <div>
                <div>
                    <Button onClick={this.createNewFlowGroup}>新建分组</Button>
                    <Button onClick={this.createNewFlow}>创建新审批</Button>
                </div>

                <div>
                    <Collapse bordered={false} defaultActiveKey={this.state.openCollapseKey} activeKey={this.state.openCollapseKey}>
                        {this.state.collapsePanelArray}
                    </Collapse>
                </div>

                <Modal title="创建新审批" visible={this.state.createNewFlowModalVisible}
                       onCancel={this.createNewFlowModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={saveButtons}
                       width="700px"
                >
                    <div className="space">
                        <CreateFlowComponent ref="createFlowComponent" onSaveOk={this.courseAddOk}></CreateFlowComponent>
                    </div>
                </Modal>

                <Modal title="新建分组" visible={this.state.createFlowGroupModalVisible}
                       onCancel={this.createFlowGroupModalHandleCancel}
                       onOk={this.createFlowGroup}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="400px"
                >
                    <Row>
                        <Col span={4}>
                            分组名称:
                        </Col>
                        <Col span={20}>
                            <Input value={this.state.flowGroupName} onChange={this.flowGroupNameChange}/>
                        </Col>
                    </Row>
                </Modal>

                <Modal title="编辑分组" visible={this.state.editFlowGroupModalVisible}
                       onCancel={this.editFlowGroupModalHandleCancel}
                       onOk={this.editFlowGroup}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="400px"
                >
                    <Row>
                        <Col span={4}>
                            分组名称:
                        </Col>
                        <Col span={20}>
                            <Input value={this.state.flowGroupName} onChange={this.flowGroupNameChange}/>
                        </Col>
                    </Row>
                </Modal>

                <Modal title="移动到" visible={this.state.moveFlowModalVisible}
                       onCancel={this.moveFlowModalHandleCancel}
                       onOk={this.moveFlowToGroup}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="400px"
                >
                    <Row>
                        <Col span={4}>
                            分组名称:
                        </Col>
                        <Col span={20}>
                            <Select defaultValue={this.state.flowGroupId} value={this.state.flowGroupId} style={{ width: 240 }} onChange={this.flowGroupChange}>
                                <Option value="-1">请选择分组</Option>
                                <Option value="1">出勤休假</Option>
                                <Option value="2">外出</Option>
                                <Option value="3">费用报销</Option>
                                <Option value="4">其他</Option>
                            </Select>
                        </Col>
                    </Row>
                </Modal>

            </div>
        );
    }
});

export default FlowSettingComponent;
