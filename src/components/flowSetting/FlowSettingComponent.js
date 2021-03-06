import React, {PropTypes} from 'react';
import {Button, Icon, message, Modal, Collapse, Input, Row, Col, Select} from 'antd';
import CreateFlowComponent from './CreateFlowComponent';
import FlowDetailComponent from './FlowDetailComponent';
import ExportComponent from './ExportComponent';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
import {FLOW_OPTSOURCE_MANAGER} from '../../utils/Const';

const Panel = Collapse.Panel;
const Option = Select.Option;
const confirm = Modal.confirm;

const FlowSettingComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            createNewFlowModalVisible: false,
            createFlowGroupModalVisible: false,
            editFlowGroupModalVisible: false,
            flowCollpseArray: [],
            flowGroupName: '',   //流程分组的名称
            flowGroupId: "-1",
            openCollapseKey: [],
            pageType:'' //当前页面将要渲染的业务内容
        };
    },

    componentDidMount() {
        this.getFlowGroup();
    },

    componentWillReceiveProps(nextProps) {
        this.setState({"pageType":''});
    },


    /**
     * 获取流程分组及其分组下的流程列表
     */
    getFlowGroup() {
        let _this = this;
        var param = {
            "method": 'getAllFlowGroupBySchoolId',
            "pageNo": "1",
            "schoolId": this.state.loginUser.schoolId + "",
            "optSource": FLOW_OPTSOURCE_MANAGER
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    _this.buildFlowGroupSpan(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 创建流程分组的面板
     */
    buildFlowGroupSpan(flowGroupResponse) {
        var _this = this;
        var collapsePanelArray = [];
        var openCollapseKey = [];
        flowGroupResponse.forEach(function (flowGroup) {
            var flowObjArray = [];
            var processDefinitionList = flowGroup.flowProcessDefinitionList;
            processDefinitionList.forEach(function (processDefinition) {
                var procDefId = processDefinition.procDefId;
                //流程分组关系的id
                var flowGroupProcDefId = processDefinition.flowGroupProcdefId;
                var suspendButton;
                if (processDefinition.suspend == true) {
                    suspendButton =
                        <a onClick={_this.suspendOrActivationProcessDefinitionConfirm.bind(_this, procDefId, "activity")}>启用</a>;
                } else {
                    suspendButton =
                        <a onClick={_this.suspendOrActivationProcessDefinitionConfirm.bind(_this, procDefId, "suspend")}>停用</a>;
                }
                var deleteButton = <a onClick={_this.deleteProcessDefinitionConfirm.bind(_this, flowGroupProcDefId)}>删除</a>;
                var detailButton = <a className="schoolgroup_btn_left" onClick={_this.showProcessDefinitionDetailModal.bind(_this, procDefId)}>详情</a>;
                var procName = processDefinition.procDefName;
                var procDefDescribe = processDefinition.procDefDescribe;
                var flowObj = <div className="process_flex">
                    <div className="process_l">
                        <img className="process_icon" src="http://60.205.86.217/upload2/common/img/admin_1.png"/>
                        <div className="name_max4">
                            <div className="dold_text name_max4_24 upexam_float" >{procName}</div>
                            <div className="dold_text name_max4_24 name_text_12 upexam_float ">{procDefDescribe}</div>
                        </div>
                    </div>
                    <div className="process_r">
                        {suspendButton}
                        {deleteButton}
                        {detailButton}
                        {/* <a className="schoolgroup_btn_left" onClick={_this.removeFlow.bind(_this,procDefId)}>移动到</a>*/}
                    </div>
                </div>;
                flowObjArray.push(flowObj);
            });
            var flowGroupId = flowGroup.groupId;
            var flowCount = 0;
            var flowGroupName = flowGroup.groupName;
            if (isEmpty(processDefinitionList) == false) {
                flowCount = processDefinitionList.length;
            }
            var headerDiv = <div>
                <span>{flowGroupName}</span><span className="process_number">({flowCount})</span>
                <Button className="process_title_btn"
                        onClick={_this.showEditGroupModal.bind(_this, Event, flowGroupId, flowGroupName)}>编辑</Button>
            </div>;
            var collapsePanel = <Panel header={headerDiv} key={flowGroupId}>
                {flowObjArray}
            </Panel>;
            openCollapseKey.push(flowGroupId + "");
            collapsePanelArray.push(collapsePanel);
        });
        this.setState({collapsePanelArray, openCollapseKey});
    },

    /**
     * 显示编辑分组名称的窗口
     */
    showEditGroupModal(e, flowGroupId, flowGroupName) {
        this.setState({
            editFlowGroupModalVisible: true,
            "editFlowGroupId": flowGroupId,
            "flowGroupName": flowGroupName
        });
        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * 创建新的流程
     */
    createNewFlow() {
        this.setState({"createNewFlowModalVisible": true, "isChangeStep": false, stepDirect: ''});
    },
    /**
     * 切换页面流程的下一步/上一步
     * @param direct
     */
    changeStep(direct) {
        if (direct == "next") {
            var canBeNext = this.refs.createFlowComponent.canBeNextStep();
            if (canBeNext == false) {
                // message.error("请先设置流程审批的表单");
                return;
            }
        }
        this.setState({"stepDirect": direct, "isChangeStep": true});
        this.refs.createFlowComponent.changeStep(direct);
    },

    createNewFlowModalHandleCancel() {
        this.refs.createFlowComponent.changeStep("pre");
        this.refs.createFlowComponent.initCreatePage();
        this.setState({"createNewFlowModalVisible": false, "isChangeStep": false, stepDirect: ''});
    },

    /**
     * 保存流程到后台
     */
    saveFlow() {
        var _this = this;
        var flowFormDefineList = this.refs.createFlowComponent.getFormDefindData();
        var processDefinitionJson = this.refs.createFlowComponent.getProcessDefinitionJson();
        var flowFormDefineListObj = JSON.parse(flowFormDefineList);
        flowFormDefineListObj.forEach(function (flowFormDefine) {
            var variableJson = {};
            variableJson.isAbstractField = false;
            variableJson.placeholder = "";
            var selectedAbstractValues = processDefinitionJson.selectedAbstractValues;
            if(isEmpty(selectedAbstractValues)==false){
                selectedAbstractValues.forEach(function (selectedAbstract) {
                    if(flowFormDefine.label == selectedAbstract){
                        variableJson.isAbstractField = true;
                    }
                });
            }
            if(isEmpty(flowFormDefine.placeholder)==false){
                variableJson.placeholder =flowFormDefine.placeholder;
            }
            flowFormDefine.variableJson = variableJson;
        });
        //{"procDefName":"请假单","flowDescription":"it部请假单","flowGroupId":"2","messageOfCopyPersonSendType":"0","copyPersonList":["23384","23385"],"approvalIdJson":[{"approvalType":1,"approval":"23836"},{"approvalType":1,"approval":"tom"}],"formData":"[{\"type\":\"header\",\"label\":\"表头\"},{\"type\":\"text\",\"label\":\"输入框\"}]"}
        console.log("procDefJson:" + JSON.stringify(processDefinitionJson));
        //调用后台完成json到底层对象的转化
        var param = {
            "method": 'deployProcess',
            "flowProcessDefinitionJson": processDefinitionJson,
            "flowFormDefineList": JSON.stringify(flowFormDefineListObj)
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                _this.getFlowGroup();
                _this.createNewFlowModalHandleCancel();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 创建流程分组
     */
    createNewFlowGroup() {
        this.setState({createFlowGroupModalVisible: true, flowGroupName: ''});
    },

    /**
     * 停用指定的流程
     */
    suspendOrActivationProcessDefinitionConfirm(flowId, isSuspendStr) {
        console.log(flowId + "====" + isSuspendStr);
        var _this = this;
        var title = '确定要启用该流程?';
        if (isSuspendStr == "suspend") {
            title = '确定要停用该流程?';
        }
        confirm({
            title: title,
            transitionName: "",  //禁用modal的动画效果
            onOk() {
                console.log('OK');
                _this.suspendOrActivationProcessDefinition(flowId, isSuspendStr);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    },

    /**
     * 解除流程与分组的关系
     * @param flowGroupProcdefId 流程分组关系的id
     */
    deleteProcessDefinitionConfirm(flowGroupProcdefId) {
        var _this = this;
        var title = '确定要删除该流程?';
        confirm({
            title: title,
            transitionName: "",  //禁用modal的动画效果
            onOk() {
                console.log('OK');
                _this.deleteFlowGroupProcDef(flowGroupProcdefId);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    },

    /**
     * 显示编辑流程定义的窗口
     */
    showProcessDefinitionDetailModal(procDefId){
        console.log("procDefId:"+procDefId);
        this.setState({"detailFlowModalVisible":true,"procDefId":procDefId});
        if(isEmpty(this.refs.flowDetailComponent)==false){
            this.refs.flowDetailComponent.getFlowProcessDefinitionById(procDefId);
        }
    },

    /**
     * 关闭编辑流程定义的窗口
     */
    detailFlowModalHandleCancel(){
        this.setState({"detailFlowModalVisible":false});
    },

    /**
     * 停用流程(挂起流程定义)
     */
    suspendOrActivationProcessDefinition(flowId, isSuspendStr) {
        let _this = this;
        var param = {
            "method": 'suspendOrActivationProcessDefinition',
            "procDefId": flowId,
            "isSuspendStr": isSuspendStr
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isSuspendStr == "suspend") {
                        message.success("流程已停用");
                    } else {
                        message.success("流程已启用");
                    }
                    _this.getFlowGroup();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 解除流程与分组的关系（从流程分组表中删除流程）
     */
    deleteFlowGroupProcDef(flowGroupProcDefId) {
        let _this = this;
        var param = {
            "method": 'deleteFlowGroupProcDef',
            "flowGroupProcDefId": flowGroupProcDefId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("流程已删除");
                    _this.getFlowGroup();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 移动指定的流程到新的分组
     */
    removeFlow(flowId) {
        console.log(flowId);
        this.setState({"moveFlowModalVisible": true, "moveFlowId": flowId});
    },

    /**
     * 关闭新建分组的窗口
     */
    createFlowGroupModalHandleCancel() {
        this.setState({createFlowGroupModalVisible: false});
    },

    /**
     * 新建流程分组
     */
    createFlowGroup() {
        let _this = this;
        if (isEmpty(_this.state.flowGroupName)) {
            message.error("分组名称不允许为空，请重新输入，谢谢！");
            return;
        }
        var param = {
            "method": 'saveFlowGroup',
            "groupName": _this.state.flowGroupName,
            "createrId": _this.state.loginUser.colUid,
            "schoolId": this.state.loginUser.schoolId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("分组创建成功");
                    _this.getFlowGroup();
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
    editFlowGroup() {
        let _this = this;
        if (isEmpty(_this.state.flowGroupName)) {
            message.error("分组名称不允许为空，请重新输入，谢谢！");
            return;
        }
        var param = {
            "method": 'updateFlowGroup',
            "createrId": _this.state.loginUser.colUid,
            "schoolId": _this.state.loginUser.schoolId,
            "groupId": _this.state.editFlowGroupId,
            "groupName": _this.state.flowGroupName
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("分组编辑成功");
                    _this.getFlowGroup();
                }
                _this.editFlowGroupModalHandleCancel();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 删除流程分组
     */
    deleteFlowGroup() {
        let _this = this;
        var param = {
            "method": 'updateFlowGroup',
            "groupId": _this.state.editFlowGroupId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("分组删除成功");
                    _this.getFlowGroup();
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
    flowGroupNameChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var flowGroupName = target.value;
        this.setState({flowGroupName});
    },

    /**
     * 编辑分组名称窗口关闭响应
     */
    editFlowGroupModalHandleCancel() {
        this.setState({editFlowGroupModalVisible: false});
    },

    /**
     * 审批流程分组列表改变的响应函数
     * @param value
     */
    flowGroupChange(value) {
        console.log(`selected ${value}`);
        this.setState({flowGroupId: value});
    },

    /**
     * 关闭流程移动分组窗口
     */
    moveFlowModalHandleCancel() {
        this.setState({"moveFlowModalVisible": false});
    },

    /**
     * 移动流程到目标分组
     */
    moveFlowToGroup() {
        let _this = this;
        if (isEmpty(_this.state.flowGroupId) || _this.state.flowGroupId == -1) {
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
                if (ret.msg == "调用成功" && ret.success == true) {
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
     * 转向到数据导出页面
     */
    turnToExportPage(){
        this.setState({"pageType":'exportPage'});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        var saveButtons;
        if (isEmpty(this.state.stepDirect) || this.state.stepDirect == "pre") {
            saveButtons = [
                <button type="button" className="login-form-button examination_btn_white calmCancel" onClick={this.changeStep.bind(this, "next")} >下一步</button>,
                <button type="primary" className="login-form-button examination_btn_blue calmCancle" onClick={this.createNewFlowModalHandleCancel}  >关闭</button>
                // <Button onClick={this.changeStep.bind(this, "next")}>下一步</Button>,
                // <Button onClick={this.createNewFlowModalHandleCancel}>关闭</Button>
            ];
        } else if (this.state.stepDirect == "next") {
            saveButtons = [
                <button type="button" className="login-form-button examination_btn_white calmCancel" onClick={this.changeStep.bind(this, "pre")} >上一步</button>,
                <button type="primary" className="login-form-button examination_btn_blue calmCancle" onClick={this.saveFlow.bind(this, "save")}  >提交</button>
                // <Button onClick={this.changeStep.bind(this, "pre")}>上一步</Button>,
                // <Button onClick={this.saveFlow.bind(this, "save")}>提交</Button>,
                // <Button onClick={this.createNewFlowModalHandleCancel}>关闭2</Button>
            ];
        }
        var detailButton =  <button type="primary" className="login-form-button examination_btn_blue calmCancle" onClick={this.detailFlowModalHandleCancel}  >关闭</button>
        
        //  <Button onClick={this.detailFlowModalHandleCancel}>关闭3</Button>;

        var mainContent = <Collapse bordered={false} defaultActiveKey={this.state.openCollapseKey}
                                    activeKey={this.state.openCollapseKey}>
            {this.state.collapsePanelArray}
        </Collapse>;
        if(isEmpty(this.state.pageType)==false && this.state.pageType == "exportPage"){
            mainContent = <ExportComponent></ExportComponent>;
        }

        return (
            <div>
                <div className="schoolgroup_title">
                    <span className="name_max4 dold_text process_font_h">内部审批流程</span>
                    <span className="schoolgroup_btn_left"><Button
                        onClick={this.createNewFlowGroup}>新建分组</Button></span>
                    <span className="schoolgroup_btn_left"><Button
                        onClick={this.turnToExportPage}>数据导出</Button></span>
                    <span className="topics_dianzan"><Button className="schoolgroup_btn_blue_solid"
                                                             onClick={this.createNewFlow}>创建新审批</Button></span>
                </div>
                <div className="process_wrap">
                    {mainContent}
                </div>

                <Modal title="创建新审批" visible={this.state.createNewFlowModalVisible}
                       onCancel={this.createNewFlowModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={saveButtons}
                       width="700px"
                       className="new_process schoolgroup_modal"
                >
                    <div className="space">
                        <CreateFlowComponent ref="createFlowComponent"></CreateFlowComponent>
                    </div>
                </Modal>

                <Modal title="审批详情" visible={this.state.detailFlowModalVisible}
                       onCancel={this.detailFlowModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={detailButton}
                       width="700px"
                       className="new_process schoolgroup_modal"
                >
                    <div className="space">
                        <FlowDetailComponent ref="flowDetailComponent" procDefId={this.state.procDefId}></FlowDetailComponent>
                    </div>
                </Modal>

                <Modal title="新建分组" visible={this.state.createFlowGroupModalVisible}
                       onCancel={this.createFlowGroupModalHandleCancel}
                       onOk={this.createFlowGroup}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="440px"
                       className="schoolgroup_modal"
                >
                    <div className="modal_register_main">
                        <Row className="ant_row ant_row_29">
                            <Col span={6} className="framework_m_l">
                                分组名称:
                            </Col>
                            <Col span={16} className="framework_m_r">
                                <Input value={this.state.flowGroupName} onChange={this.flowGroupNameChange}/>
                            </Col>
                        </Row>
                    </div>
                </Modal>

                <Modal title="编辑分组" visible={this.state.editFlowGroupModalVisible}
                       onCancel={this.editFlowGroupModalHandleCancel}
                       onOk={this.editFlowGroup}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="440px"
                       className="schoolgroup_modal"
                       footer={[
                        <button type="ghost" className="login-form-button examination_btn_white calmSure" onClick={this.deleteFlowGroup} >删除</button>,
                        <button type="primary" className="login-form-button examination_btn_blue calmCancle" onClick={this.editFlowGroup}  >确定</button>
                        //    <Button type="button" htmlType="submit" className="calmDelete login-form-button"
                        //            onClick={this.deleteFlowGroup}>删除</Button>,
                        //            <Button type="primary" htmlType="submit" className="login-form-button"
                        //            onClick={this.editFlowGroup}>确定</Button>
                        //    <Button type="ghost" htmlType="reset" className="login-form-button"
                        //            onClick={this.editFlowGroupModalHandleCancel}>取消</Button>
                       ]}
                >
                    <div className="modal_register_main">
                        <Row className="ant_row ant_row_29">
                            <Col span={6} className="framework_m_l">
                                分组名称：
                            </Col>
                            <Col span={16} className="framework_m_r">
                                <Input value={this.state.flowGroupName} onChange={this.flowGroupNameChange}/>
                            </Col>
                        </Row>
                    </div>
                </Modal>

                <Modal title="移动到" visible={this.state.moveFlowModalVisible}
                       onCancel={this.moveFlowModalHandleCancel}
                       onOk={this.moveFlowToGroup}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="440px"
                       className="schoolgroup_modal"
                >
                    <div className="modal_register_main">
                        <Row className="ant_row ant_row_29">
                            <Col span={6} className="framework_m_l">
                                分组名称：
                            </Col>
                            <Col span={16} className="framework_m_r">
                                <Select defaultValue={this.state.flowGroupId} value={this.state.flowGroupId}
                                        style={{width: 240}} onChange={this.flowGroupChange}>
                                    <Option value="-1">请选择分组</Option>
                                    <Option value="1">出勤休假</Option>
                                    <Option value="2">外出</Option>
                                    <Option value="3">费用报销</Option>
                                    <Option value="4">其他</Option>
                                </Select>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                

            </div>
        );
    }
});

export default FlowSettingComponent;
