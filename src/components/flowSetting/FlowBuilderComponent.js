import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message,Modal,Tag} from 'antd';
import {isEmpty} from '../../utils/utils';
import ApprovalComponent from './ApprovalComponent';
import CopyPersonSettingComponent from './CopyPersonSettingComponent';
const Step = Steps.Step;
const Option = Select.Option;


var stepObjArray=[];
var copyPersonTagArray=[];
//准备发送到后台创建流程使用的审批节点数据(审批节点的顺序以数组索引顺序为依据)
var approvalJsonArray=[];
var copyPersonIdArray=[];
const FlowBuilderComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            approvalModalVisible:false,     //设置审批人窗口的显示和关闭状态
            stepObjArray:[],        //审批步骤的Step数组
            copyPersonIdArray:[],
            copyPersonModalVisible:false,   //设置抄送人窗口的显示和关闭状态
            flowName:'',    //流程名称
            flowDescription:'', //流程说明
            approvalGroup:'-1',   //选中的流程分组
            messageOfCopyPersonSendType:-1, //流程抄送人消息发送方式
        };
    },

    componentDidMount(){
    },

    componentWillReceiveProps(nextProps){
    },

    componentDidUpdate(){
    },

    /**
     * 弹出添加抄送人的弹窗
     */
    addCopyPerson(){
        this.setState({copyPersonModalVisible:true});
        if(isEmpty(this.refs.copyPersonSettingComponent)==false){
            this.refs.copyPersonSettingComponent.initPage();
        }
    },

    /**
     * 移除抄送人
     * 如果不可以移除,则执行e.preventDefault();
     */
    removeCopyPerson(e,userId){
        // console.log(e);
        // console.log("userId:"+userId);
        for(var i=0;i<copyPersonIdArray.length;i++){
            var userIdInArray = copyPersonIdArray[i];
            if(userIdInArray == userId){
                copyPersonIdArray.splice(i,1);
                break;
            }
        }
        this.setState({copyPersonIdArray});
    },

    /**
     * 添加流程步骤
     */
    addFlowStep(){
        this.setState({approvalModalVisible:true});
    },

    /**
     * 抄送人通知发送方式
     */
    copySendHandleChange(value) {
        console.log(`messageOfCopyPersonSendType selected ${value}`);
        this.setState({messageOfCopyPersonSendType:value});
    },

    /**
     * 设置审批人窗口关闭
     */
    approvalModalHandleCancel(){
        this.setState({approvalModalVisible:false});
    },

    /**
     * 添加审批人到审批节点
     */
    addApprovalToStep(){
        var approvalJson = this.refs.approvalComponent.getApprovalInfoByJson();
        console.log(approvalJson);
        var approvalType = approvalJson.approvalType;
        var approvalTypeStr = approvalType==1?"单个用户":"角色";
        var approvalNameDiv=<div onClick={this.removeApprovalData.bind(this,approvalJson.approval)}>{approvalJson.approval}</div>;
        var stepObj = <Step id={approvalJson.approval} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
        stepObjArray.push(stepObj);
        approvalJsonArray.push(approvalJson);
        this.setState({stepObjArray,approvalJsonArray});
        this.approvalModalHandleCancel();
    },

    /**
     * 移除审批数据
     * @param removeKey
     */
    removeApprovalData(removeKey){
        this.removeApprovalStep(removeKey);
        this.removeApprovalJsonArray(removeKey);
    },

    /**
     * 移除流程审批Json数据
     * 数据应该包括用户id,用户类型(单个用户/角色用户)
     */
    removeApprovalJsonArray(removeKey){
        for(var i=0;i<approvalJsonArray.length;i++){
            var approvalJson = approvalJsonArray[i];
            if(approvalJson.approval==removeKey){
                approvalJsonArray.splice(i,1);
                break;
            }
        }
    },

    /**
     * 移除审批节点
     */
    removeApprovalStep(removeKey){
        var stepObjArray = this.state.stepObjArray;
        for(var i=0;i<stepObjArray.length;i++){
            var stepObj = stepObjArray[i];
            if(stepObj.props.id==removeKey){
                stepObjArray.splice(i,1);
                break;
            }
        }
        this.setState({stepObjArray});
    },

    /**
     * 添加抄送人到Tag数组
     */
    addCopyPersonToTagArray(){
        var teacherTargetOptions = this.refs.copyPersonSettingComponent.getCopyPersonArray();
        if(isEmpty(teacherTargetOptions)){
            message.error("请选择要添加的抄送人！");
            return;
        }
        for(var i=0;i<teacherTargetOptions.length;i++){
            var teacher = teacherTargetOptions[i];
            var teacherArray = teacher.value.split("#");
            var userId = teacherArray[0];
            var userName = teacherArray[1];
            var userTag =  <Tag closable onClose={this.removeCopyPerson.bind(this,Event,{userId})}>{userName}</Tag>;
            copyPersonTagArray.push(userTag);
            //存放发送给后台的抄送人数据
            copyPersonIdArray.push(userId);
        }
        this.setState({copyPersonTagArray,copyPersonIdArray});
        this.copyPersonModalHandleCancel();
    },

    /**
     * 关闭设置抄送人的窗口
     */
    copyPersonModalHandleCancel(){
        this.setState({copyPersonModalVisible:false});
    },

    /**
     * 流程名称改变的响应函数
     */
    flowNameChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var flowName = target.value;
        this.setState({flowName});
    },

    /**
     * 流程说明改变的响应函数
     */
    flowDescriptionChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var flowDescription = target.value;
        this.setState({flowDescription});
    },

    /**
     * 审批流程分组列表改变的响应函数
     * @param value
     */
    approvalGroupChange(value) {
        console.log(`selected ${value}`);
        this.setState({approvalGroup:value});
    },

    /**
     * 该面板是流程基本信息配置面板，可以从该面板中获取以json描述的流程信息
     */
    getProcessDefinitionBaseJson(){
        var processDefinitionBaseJson={};
        //流程名称
        processDefinitionBaseJson.procDefName = this.state.flowName;
        //流程说明
        processDefinitionBaseJson.flowDescription=this.state.flowDescription;
        //流程所在分组
        processDefinitionBaseJson.flowGroupId = this.state.approvalGroup;
        //抄送人消息推送方式
        processDefinitionBaseJson.messageOfCopyPersonSendType = this.state.messageOfCopyPersonSendType;
        //消息抄送人列表
        processDefinitionBaseJson.copyPersonList = this.state.copyPersonIdArray;
        //审批人列表
        processDefinitionBaseJson.approvalIdJson = this.state.approvalJsonArray;
        return processDefinitionBaseJson;
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <Row>
                    <Col span={4}>审批名称</Col>
                    <Col span={10}>
                        <Input value={this.state.flowName} onChange={this.flowNameChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>审批说明</Col>
                    <Col span={10}>
                        <Input value={this.state.flowDescription} onChange={this.flowDescriptionChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>选择分组</Col>
                    <Col span={20}>
                        <Select defaultValue={this.state.approvalGroup} value={this.state.approvalGroup} style={{ width: 240 }} onChange={this.approvalGroupChange}>
                            <Option value="-1">请选择分组</Option>
                            <Option value="1">出勤休假</Option>
                            <Option value="2">外出</Option>
                            <Option value="3">费用报销</Option>
                            <Option value="4">其他</Option>
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>审批人设置</Col>
                    <Col span={20}>
                        <Steps>
                            {/*<Step status="process" title="项目组长审批" icon={<Icon type="user" />} />*/}
                            {this.state.stepObjArray}
                        </Steps>
                        <Button icon="plus-circle" onClick={this.addFlowStep}></Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>抄送人设置</Col>
                    <Col span={20}>
                        {this.state.copyPersonTagArray}
                        <Button icon="plus-circle" onClick={this.addCopyPerson}></Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>自动通知抄送人</Col>
                    <Col span={20}>
                        <Select defaultValue="-1" style={{ width: 240 }} value={this.state.messageOfCopyPersonSendType} onChange={this.copySendHandleChange}>
                            <Option value="-1">请选择</Option>
                            <Option value="0">仅全部同意后通知</Option>
                            <Option value="1">发起时和同意后均通知</Option>
                        </Select>
                    </Col>
                </Row>

                <Modal title="设置审批人" visible={this.state.approvalModalVisible}
                       onCancel={this.approvalModalHandleCancel}
                       onOk={this.addApprovalToStep}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="700px"
                >
                    <div className="space">
                        <ApprovalComponent ref="approvalComponent"></ApprovalComponent>
                    </div>
                </Modal>

                <Modal title="设置抄送人" visible={this.state.copyPersonModalVisible}
                       onCancel={this.copyPersonModalHandleCancel}
                       onOk={this.addCopyPersonToTagArray}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="700px"
                >
                    <div className="space">
                        <CopyPersonSettingComponent ref="copyPersonSettingComponent" copyPersonIdArray={this.state.copyPersonIdArray}></CopyPersonSettingComponent>
                    </div>
                </Modal>

            </div>
        );
    },
});

export default FlowBuilderComponent;
