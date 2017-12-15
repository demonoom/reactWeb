import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message,Upload} from 'antd';
import {isEmpty} from '../../utils/utils';
import FormBuilderComponent from './FormBuilderComponent';
import FlowBuilderComponent from './FlowBuilderComponent';
import {doWebService} from '../../WebServiceHelper';
const Step = Steps.Step;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

var formBuilder;
const props = {
    name: 'file',
    action: '',
    headers: {
        authorization: 'authorization-text',
    }
};

const FlowDetailComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            procDefName:'',
            procDefDescribe:''
        };
    },

    componentDidMount(){
        console.log("procDefId:"+this.props.procDefId);
        this.getFlowProcessDefinitionById(this.props.procDefId);
    },

    /**
     * 获取流程分组及其分组下的流程列表
     */
    getFlowProcessDefinitionById(procDefId) {
        let _this = this;
        var param = {
            "method": 'getFlowProcessDefinitionDetailById',
            "procDefId": procDefId,
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    console.log("response:"+ret.response);
                    var flowProcessDefinition = ret.response;
                    _this.buildFlowDetailSpan(ret.response);
                    _this.setState({
                        flowProcessDefinition,
                        procDefName:flowProcessDefinition.procDefName,
                        procDefDescribe:flowProcessDefinition.procDefDescribe
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 构建审批详情的表单
     * @param flowProcessDefinition
     */
    buildFlowDetailSpan(flowProcessDefinition){
        var _this = this;
        var flowFormDefineList = flowProcessDefinition.flowFormDefineList;
        var flowApprovalUsers = flowProcessDefinition.flowApprovalUsers;
        var flowFormTagList = [];
        var flowApprovalUserTagList = [];
        flowFormDefineList.forEach(function (flowFormDefinition) {
            var label = flowFormDefinition.label;
            var type = flowFormDefinition.type;
            var value = flowFormDefinition.value;
            var values = flowFormDefinition.values;
            var formElementVariable = flowFormDefinition.formElementVariable;
            var formTag = _this.buildFormTag(label,type,value,values,formElementVariable);
            flowFormTagList.push(formTag);
        });

        flowApprovalUsers.forEach(function (flowApprovalUser) {
            var approvalUserTag = _this.buildApprovalUserTag(flowApprovalUser);
            flowApprovalUserTagList.push(approvalUserTag);
        })

        this.setState({flowFormTagList,flowApprovalUserTagList});
    },

    /**
     * 构建表单元素
     * @param label
     * @param type
     * @param value
     * @param values
     * @param formElementVariable
     */
    buildFormTag(label,type,value,values,formElementVariable){
        var formTag;
        var placeholder = formElementVariable.placeholder;
        switch(type){
            case "text":
            case "textarea":
                formTag = <Row>
                    <Col span={3}>{label}</Col>
                    <Col span={21}>
                        <Input placeholder={placeholder} defaultValue={value}/>
                    </Col>
                </Row>
                break;
            case "select":
                var optionsArray = [];
                values.forEach(function (formDataValue) {
                    var optionLabel = formDataValue.label;
                    var optionValue = formDataValue.label+"#"+value+"#"+type;
                    var optionObj = <Option value={optionValue}>{optionLabel}</Option>;
                    optionsArray.push(optionObj);
                });
                formTag = <Row>
                    <Col span={3}>{label}</Col>
                    <Col span={21}>
                        <Select
                            style={{width: 130}}
                            className="framework_m_r"
                        >
                            {optionsArray}
                        </Select>
                    </Col>
                </Row>
                break;
            case "radio":
                var optionsArray = [];
                values.forEach(function (formDataValue) {
                    var optionLabel = formDataValue.label;
                    var optionValue = formDataValue.label+"#"+value+"#"+type;
                    var radioObj = <Radio value={optionValue}>{optionLabel}</Radio>;
                    optionsArray.push(radioObj);
                });
                formTag = <Row>
                        <Col span={3}>{label}</Col>
                        <Col span={21}>
                            <RadioGroup>
                                {optionsArray}
                            </RadioGroup>
                        </Col>
                    </Row>
                break;
            case "checkbox":
                var optionsArray = [];
                values.forEach(function (formDataValue) {
                    var label = formDataValue.label;
                    var value = formDataValue.label+"#"+value+"#"+type;
                    var optionObj = { label: label, value: value };
                    optionsArray.push(optionObj);
                })
                formTag = <Row>
                    <Col span={3}>{label}</Col>
                    <Col span={21}>
                        <CheckboxGroup options={optionsArray}/>
                    </Col>
                </Row>
                break;
            case "date":
                var tagId = label+"#"+type;
                formTag = <Row>
                    <Col span={3}>{label}</Col>
                    <Col span={21}>
                        <DatePicker />
                    </Col>
                </Row>
                break;
            case "file":
                var tagId = label+"#"+type;
                formTag = <Row>
                    <Col span={3}>{label}</Col>
                    <Col span={21}>
                        <Upload {...props}>
                            <Button>
                                <Icon type="upload" /> 上传
                            </Button>
                        </Upload>
                    </Col>
                </Row>
                break;
            case "number":
                var tagId = label+"#"+type;
                formTag = <Row>
                    <Col span={3}>{label}</Col>
                    <Col span={21}>
                        <Input placeholder={placeholder} defaultValue={value}/>
                    </Col>
                </Row>
                break;

        }
        return formTag;
    },

    buildApprovalUserTag(flowApprovalUser){
        var approvalUserTag;
        var approvalType = flowApprovalUser.approvalType;
        switch(approvalType){
            case 0:
                //用户
                var approvalUser = flowApprovalUser.approvalUser;
                approvalUserTag = <Row>
                    <Col span={8}>审批类型：用户</Col>
                    <Col span={16}>
                        审批人：{approvalUser.userName}
                    </Col>
                </Row>;
                break;
            case 1:
                //角色
                var approvalRoleVariables = flowApprovalUser.approvalRoleVariables;
                var roleName = approvalRoleVariables.name;
                approvalUserTag = <Row>
                    <Col span={8}>审批类型：角色</Col>
                    <Col span={16}>
                        审批人：{roleName}
                    </Col>
                </Row>;
                break;
            case 2:
                //部门主管
                var flowApprovalUserRule = flowApprovalUser.flowApprovalUserRule;
                var approvalLevel = flowApprovalUserRule.approvalLevel;
                var levelType = flowApprovalUserRule.levelType;
                var approvalName;
                if(approvalLevel==0){
                    approvalName = "直接主管";
                }else{
                    approvalName = "第"+approvalLevel+"级主管"
                }
                approvalUserTag = <Row>
                    <Col span={8}>审批类型：部门主管</Col>
                    <Col span={16}>
                        审批人：{approvalName}
                    </Col>
                </Row>;
                break;
            case 4:
                //发起人自己
                approvalUserTag = <Row>
                    <Col span={8}>审批类型：用户</Col>
                    <Col span={16}>
                        审批人：发起人自己
                    </Col>
                </Row>;
                break;
        }
        return approvalUserTag;
    },


    /**
     * 创建新审批
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){

    },

    initCreatePage(){

    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <div >
                <div className="modal_steps">
                    <Row>
                        <Col span={24}>审批表单</Col>
                    </Row>
                    <Row>
                        <Col span={3}>审批名称:</Col>
                        <Col span={21}>{this.state.procDefName}</Col>
                    </Row>
                    <Row>
                        <Col span={3}>审批描述:</Col>
                        <Col span={21}>{this.state.procDefDescribe}</Col>
                    </Row>
                    <Row>
                        {this.state.flowFormTagList}
                    </Row>
                    <Row>
                        <Col span={24}>审批人</Col>
                    </Row>
                    <Row>
                        {this.state.flowApprovalUserTagList}
                    </Row>
				</div>
            </div>
        );
    },
});

export default FlowDetailComponent;
