import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message,Modal,Tag} from 'antd';
import {isEmpty} from '../../utils/utils';
import ApprovalComponent from './ApprovalComponent';
import CopyPersonSettingComponent from './CopyPersonSettingComponent';
import ConditionComponent from './ConditionComponent';
import {doWebService} from '../../WebServiceHelper';
const Step = Steps.Step;
const Option = Select.Option;


var stepObjArray=[];
var copyPersonTagArray=[];
//准备发送到后台创建流程使用的审批节点数据(审批节点的顺序以数组索引顺序为依据)
var approvalJsonArray=[];
var copyPersonIdArray=[];
const children = [];
var stepConditionArray = [];
//审批条件的集合
var currentConditionInfoJsonArray = [];

const FlowBuilderComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var formData = this.props.formData;
        var formDefineList = JSON.parse(formData);
        children.splice(0);
        formDefineList.forEach(function (formDefine) {
            children.push(<Option key={formDefine.label}>{formDefine.label}</Option>);
        });
        return {
            loginUser : loginUser,
            approvalModalVisible:false,     //设置审批人窗口的显示和关闭状态
            stepObjArray:[],        //审批步骤的Step数组
            copyPersonIdArray:[],
            copyPersonModalVisible:false,   //设置抄送人窗口的显示和关闭状态
            flowName:'',    //流程名称
            flowDescription:'', //流程说明
            approvalGroup:'-1',   //选中的流程分组
            messageOfCopyPersonSendType:"-1", //流程抄送人消息发送方式
            stepConditionArray:[],   //审批条件集合
            conditionModalVisible:false,    //审批条件窗口的显示和关闭

        };
    },

    componentDidMount(){
        //初始化页面中的审批人和抄送人数据
        approvalJsonArray.splice(0);
        copyPersonIdArray.splice(0);
        stepObjArray.splice(0);
        currentConditionInfoJsonArray.splice(0);
        copyPersonTagArray.splice(0);
        stepConditionArray.splice(0);
        this.setState({stepConditionArray:[]});
        this.getFlowGroup();
    },

    componentWillReceiveProps(nextProps){
    },

    componentDidUpdate(){
    },

    /**
     * 获取流程分组及其分组下的流程列表
     */
    getFlowGroup(){
        let _this = this;
        var param = {
            "method": 'getAllFlowGroupNoProcessDefinition',
            "schoolId": this.state.loginUser.schoolId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg+"==="+ret.response);
                if(ret.msg=="调用成功" &&　ret.success == true){
                    _this.buildFlowGroupOptions(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 创建流程分组的下拉列表选项
     */
    buildFlowGroupOptions(response){
        var _this = this;
        var flowGroupArray = [];
        var i=0;
        var defaultSelectedGroupId = -1;
        response.forEach(function (flowGroup) {
            var flowGroupId = flowGroup.groupId;
            var flowGroupName = flowGroup.groupName;
            var optionObj = <Option value={flowGroupId}>{flowGroupName}</Option>
            flowGroupArray.push(optionObj);
            if(i==0){
                defaultSelectedGroupId = flowGroupId;
            }
            i++;
        });
        _this.setState({flowGroupArray,"approvalGroup":defaultSelectedGroupId});
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
    removeCopyPerson(e,userInfo){
        // console.log(e);
        // console.log("userId:"+userId);
        for(var i=0;i<copyPersonIdArray.length;i++){
            var userIdInArray = copyPersonIdArray[i];
            if(userIdInArray.toUserId == userInfo.userId){
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
        /*if(this.state.stepObjArray.length>=6){
            message.warn("审批节点请勿超过6人，谢谢！");
            return;
        }*/
        this.setState({approvalModalVisible:true});
    },

    /**
     * 显示添加审批条件的窗口
     */
    addFlowCondition(){
        //初始化条件设置组件
        if(isEmpty(this.refs.conditionComponent)==false){
            this.refs.conditionComponent.initConditionComponent();
        }
        this.setState({conditionModalVisible:true});
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
     * 设置审批条件窗口关闭的响应函数
     */
    conditionModalHandleCancel(){
        this.setState({conditionModalVisible:false});
    },

    /**
     * 添加审批人到审批节点
     */
    addApprovalToStep(){
        var approvalJson = this.refs.approvalComponent.getApprovalInfoByJson();
        console.log(approvalJson);
        var approvalType = approvalJson.approvalType;
        var approvalTypeStr = "";
        var approvalNameDiv;
        var stepObj;
        switch(approvalType){
            case 0:
                //选定具体用户
                approvalNameDiv=<div >{approvalJson.approval.userName}</div>;
                approvalTypeStr= "";
                //stepObj = <Step id={approvalJson.approval} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
                stepObj = <div id={approvalJson.approval.colUid} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close" className="close" onClick={this.removeApprovalData.bind(this,approvalJson.approval.colUid)} />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
            case 1:
                //选定指定的角色
                approvalNameDiv=<div>{approvalJson.approvalRoleVariables.name}</div>;
                approvalTypeStr= "";
                //stepObj = <Step id={approvalJson.approvalRoleVariables.id} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
                stepObj = <div id={approvalJson.approvalRoleVariables.id} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close" className="close"  onClick={this.removeApprovalData.bind(this,approvalJson.approvalRoleVariables.id)} />
                    </div>
                    <Icon type="arrow-right"  className="approval_right_arrow" />
                </div>;
                break;
            case 2:
                //主管审批规则
                var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                var approvalLevel = flowApprovalUserRule.approvalLevel;
                var levelType = flowApprovalUserRule.levelType;
                var approvalUserKey = levelType+"#"+approvalLevel;
                var approvalShowName = ""
                if(approvalLevel==0){
                    approvalShowName = "直接主管";
                }else{
                    approvalShowName = "第"+approvalLevel+"级主管";
                }
                //部门主管-指定一级(包括直接主管的选项,直接主管的level为0)
                approvalNameDiv=<div >{approvalShowName}</div>;
                approvalTypeStr= "";
                //stepObj = <Step id={approvalUserKey} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;
                stepObj = <div id={approvalUserKey} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close"  className="close" onClick={this.removeApprovalData.bind(this,approvalUserKey)}  />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
            case 3:
                //主管审批规则
                var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                var approvalLevel = flowApprovalUserRule.approvalLevel;
                var levelType = flowApprovalUserRule.levelType;
                var approvalUserKey = levelType+"#"+approvalLevel;
                var approvalShowName = ""
                approvalShowName = "从直接主管到发起人向上的第"+approvalLevel+"级主管";
                //部门主管-连续多级
                approvalNameDiv=<div>{approvalShowName}</div>;
                approvalTypeStr= "";
               /* stepObj = <Step id={approvalUserKey} status="process" title={approvalNameDiv} description={approvalTypeStr} icon={<Icon type="user" />} />;*/
                stepObj = <div id={approvalUserKey}  >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close"  className="close" onClick={this.removeApprovalData.bind(this,approvalUserKey)}  />
                    </div>
                        <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
            case 4:
                //选定审批人为流程发起人
                approvalNameDiv=<div>发起人自己</div>;
                approvalTypeStr= "";
                stepObj = <div id={approvalJson.approvalStarterVariables} >
                    <div className="approval_steps_w">
                        <Icon type="user" />
                        {approvalNameDiv}
                        <Icon type="close"  className="close"  onClick={this.removeApprovalData.bind(this,approvalJson.approvalStarterVariables)}  />
                    </div>
                    <Icon type="arrow-right" className="approval_right_arrow" />
                </div>;
                break;
        }
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
            var approvalType = approvalJson.approvalType;
            switch (approvalType){
                case 0:
                    //指定用户审批
                    if(approvalJson.approval.colUid==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
                case 1:
                    //角色审批
                    var approvalRoleVariables = approvalJson.approvalRoleVariables;
                    if(approvalRoleVariables.id==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
                case 2:
                    //部门主管审批
                    var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                    var approvalUserKey = flowApprovalUserRule.levelType+"#"+flowApprovalUserRule.approvalLevel;
                    if(approvalUserKey==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
                    break;
                case 3:
                    break;
                case 4:
                    //发起人自己审批
                    var approvalStarterVariables = approvalJson.approvalStarterVariables;
                    if(approvalStarterVariables==removeKey){
                        approvalJsonArray.splice(i,1);
                        break;
                    }
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
            var copyPersonJson = {copyToType:'0',toUserId:userId};
            copyPersonTagArray.push(userTag);
            //存放发送给后台的抄送人数据
            copyPersonIdArray.push(copyPersonJson);
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
        var copyPersonIdArray = this.state.copyPersonIdArray;
        var approvalJsonArray = this.state.approvalJsonArray;
        var copyPersonList = [];
        var flowApprovalUsers=[];
        for(var i=0;i<copyPersonIdArray.length;i++){
            var userJson = {"colUid":copyPersonIdArray[i]}
            copyPersonList.push(userJson);
        }
        //验证基本信息的非空
        if(isEmpty(this.state.flowName)){
            message.error("请输入审批名称");
            return;
        }else if(isEmpty(approvalJsonArray)){
            message.error("请选择流程审批人");
            return;
        }else if(isEmpty(copyPersonList)==false && copyPersonList.length!=0 && (isEmpty(this.state.messageOfCopyPersonSendType) || "-1"==this.state.messageOfCopyPersonSendType) ){
            message.error("请选择抄送人消息推送方式");
            return;
        }
        for(var i=0;i<approvalJsonArray.length;i++){
            var approvalJson = approvalJsonArray[i];
            var approvalType = approvalJson.approvalType;
            var approval = approvalJson.approval;
            var approvalManagerVariables=approvalJson.approvalManagerVariables;
            var approvalRoleVariables=approvalJson.approvalRoleVariables;
            var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
            var currentApprovalTypeValue = approvalJson.currentApprovalTypeValue;
            var ifManagerNullFillType = approvalJson.ifManagerNullFillType;
            var userJson = {"approvalUser":approval,"approvalType":approvalType,"approvalManagerVariables":approvalManagerVariables,
                "approvalRoleVariables":approvalRoleVariables,"flowApprovalUserRule":flowApprovalUserRule,"currentApprovalTypeValue":currentApprovalTypeValue,
                "ifManagerNullFillType":ifManagerNullFillType,"approvalStarterVariables":approvalJson.approvalStarterVariables
            }
            flowApprovalUsers.push(userJson);
        }
        //流程名称
        processDefinitionBaseJson.procDefName = this.state.flowName;
        //流程说明
        processDefinitionBaseJson.procDefDescribe =this.state.flowDescription;
        //流程所在分组
        processDefinitionBaseJson.flowGroupId = this.state.approvalGroup;
        //抄送人消息推送方式
        processDefinitionBaseJson.messageOfCopyPersonSendType = this.state.messageOfCopyPersonSendType;
        //消息抄送人列表
        processDefinitionBaseJson.copyPersonList = copyPersonList;
        //审批人列表
        processDefinitionBaseJson.flowApprovalUsers = flowApprovalUsers;
        //审批表单摘要内容
        processDefinitionBaseJson.selectedAbstractValues = this.state.selectedAbstractValues;
        //当前审批对应的审批条件的集合
        processDefinitionBaseJson.conditionalInfoList = currentConditionInfoJsonArray;
        return processDefinitionBaseJson;
    },

    /**
     * 摘要展示内容改变的响应函数
     * @param selectedValues
     */
    formDefineListHandleChange(selectedAbstractValues) {
        console.log(`selected ${selectedAbstractValues}`);
        if(selectedAbstractValues.length>3){
            message.error("最多只允许选择三个字段作为摘要显示");
            return false;
        }
        this.setState({selectedAbstractValues});
    },

    /**
     * 从审批条件设置面板中，获取已经设置的审批条件
     */
    getConditionInfoByJson(){
        //获取条件设定
        var currentConditionInfoJson = this.refs.conditionComponent.getConditionInfoByJson();
        if(isEmpty(currentConditionInfoJson)==false){
            //将获取到的条件设定，存入数组，该数组将会作为参数，传递到后台进行保存
            currentConditionInfoJsonArray.push(currentConditionInfoJson);
            this.addConditionToPanel(currentConditionInfoJson);
            //初始化条件设置组件
            // this.refs.conditionComponent.initConditionComponent();
        }
    },

    /**
     * 添加审批条件到流程设置主面板
     */
    addConditionToPanel(currentConditionInfoJson){
        var _this = this;
        //审批条件
        var conditionalSymbolJson = currentConditionInfoJson.flowConditionalSymbolList;
        //审批条件满足时对应的用户（该字段废弃）todo 后期把该字段从业务流程中剔除
        var selectedApprovalUser = currentConditionInfoJson.selectedApprovalUser;
        //审批人列表，多个审批人，该流程为单独的流程，该流程执行完成后，会直接走向结束
        var flowApprovalUsers = currentConditionInfoJson.flowApprovalUsers;
        if(isEmpty(flowApprovalUsers)){
            message.error("请选择符合条件的审批用户");
            this.setState({"conditionModalVisible":false});
            return;
        }
        /*var selectedApprovalUserArray = selectedApprovalUser.split(",");
        //审批用户类型
        var approvalType = selectedApprovalUserArray[1];
        //对应的审批用户
        var approvalUser  = selectedApprovalUserArray[0];*/
        // var currentSelectedObj;
        var showName = "";
        for(var i=0;i<flowApprovalUsers.length;i++){
            var approvalJson = flowApprovalUsers[i];
            var approvalType = approvalJson.approvalType;
            var approval = approvalJson.approval;
            var approvalManagerVariables=approvalJson.approvalManagerVariables;
            var approvalRoleVariables=approvalJson.approvalRoleVariables;
            var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
            var currentApprovalTypeValue = approvalJson.currentApprovalTypeValue;
            var ifManagerNullFillType = approvalJson.ifManagerNullFillType;
            var approvalStarterVariables = approvalJson.approvalStarterVariables;
            var linkTag = "  ";
            if(i!= flowApprovalUsers.length-1){
                linkTag="->";
            }
            switch (approvalType){
                case 0:
                    //指定用户审批
                    /*if(approvalJson.approval.colUid==approvalUser){
                        currentSelectedObj = approvalJson.approval;
                        showName += approvalJson.approval.userName+"  ";
                        break;
                    }*/
                    // currentSelectedObj = approvalJson.approvalUser;
                    showName += approvalJson.approvalUser.userName+linkTag;
                    break;
                case 1:
                    //角色审批
                    var approvalRoleVariables = approvalJson.approvalRoleVariables;
                    /*if(approvalRoleVariables.id==approvalUser){
                        currentSelectedObj = approvalRoleVariables.id;
                        showName = approvalRoleVariables.name+"  ";
                        break;
                    }*/
                    // currentSelectedObj = approvalRoleVariables.id;
                    showName += approvalRoleVariables.name+linkTag;
                    break;
                case 2:
                    //部门主管审批
                    var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                    var approvalUserKey = flowApprovalUserRule.levelType+"#"+flowApprovalUserRule.approvalLevel;
                    /*if(approvalUserKey==approvalUser){
                        currentSelectedObj = approvalUserKey;
                        if(flowApprovalUserRule.approvalLevel==0){
                            showName = "直接主管"+"  ";
                        }else{
                            showName = "第"+flowApprovalUserRule.approvalLevel+"级主管"+"  ";
                        }
                        break;
                    }*/
                    // currentSelectedObj = approvalUserKey;
                    if(flowApprovalUserRule.approvalLevel==0){
                        showName += "直接主管"+linkTag;
                    }else{
                        showName += "第"+flowApprovalUserRule.approvalLevel+"级主管"+linkTag;
                    }
                    break;
                case 3:
                    break;
                case 4:
                    //发起人自己审批
                    var approvalStarterVariables = approvalJson.approvalStarterVariables;
                    /*if(approvalStarterVariables==approvalUser){
                        currentSelectedObj = approvalStarterVariables;
                        showName = "发起人自己审批"+"  ";
                        break;
                    }*/
                    // currentSelectedObj = approvalStarterVariables;
                    showName += "发起人自己审批"+linkTag;
                    break;
            }
        }
        //todo 返回的条件中，一次条件的条件应该是构成并且的条件，并且的条件显示在同一个框内
        var flowCondition="";
        for(var i=0;i<conditionalSymbolJson.length;i++){
            var currentCondition = conditionalSymbolJson[i];
            var conditionField = currentCondition.conditionField;
            var conditionalSymbol = currentCondition.conditionalSymbol;
            var conditionalValue = currentCondition.conditionalValue;
            var showFlowStarer;
            var conditionTag;
            //todo 该面板中，应该和审批人一样，支持审批条件的移除操作
            var divId;
            if(conditionalSymbolJson.length > 1){
                //如果有多个条件，需要增加条件的拼接，形成并且的条件
                if(i!=conditionalSymbolJson.length-1){
                    if("assignOfStarter"== conditionField){
                        showFlowStarer = "发起人";
                        divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue.userName+"#"+selectedApprovalUser;
                        flowCondition += showFlowStarer +  conditionalSymbol + conditionalValue.userName+" 并且 ";
                    }else{
                        var conditionFieldArray = conditionField.split("#");
                        showFlowStarer = conditionFieldArray[0];
                        //表单元素类型
                        var conditionType = conditionFieldArray[1];
                        if(conditionType=="checkbox-group"){
                            var conditionalValues = currentCondition.conditionalValues;
                            var showConditionalValues="";
                            for(var i=0;i<conditionalValues.length;i++){
                                var conditionValue = conditionalValues[i];
                                if(i!=conditionalValues.length-1){
                                    showConditionalValues = showConditionalValues+conditionValue+ " 或者 ";
                                }else{
                                    showConditionalValues = showConditionalValues+conditionValue;
                                }
                            }
                            divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                            flowCondition += showFlowStarer +  conditionalSymbol + showConditionalValues+" 并且 ";
                        }else{
                            divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                            flowCondition += showFlowStarer +  conditionalSymbol + conditionalValue+" 并且 ";
                        }
                    }
                }else{
                    if("assignOfStarter"== conditionField){
                        showFlowStarer = "发起人";
                        divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue.userName+"#"+selectedApprovalUser;
                        // flowCondition += <div>{showFlowStarer} {conditionalSymbol} {conditionalValue.userName}</div>;
                        flowCondition += showFlowStarer +  conditionalSymbol + conditionalValue.userName;
                    }else{
                        var conditionFieldArray = conditionField.split("#");
                        showFlowStarer = conditionFieldArray[0];
                        //表单元素类型
                        var conditionType = conditionFieldArray[1];
                        if(conditionType=="checkbox-group"){
                            var conditionalValues = currentCondition.conditionalValues;
                            var showConditionalValues="";
                            for(var i=0;i<conditionalValues.length;i++){
                                var conditionValue = conditionalValues[i];
                                if(i!=conditionalValues.length-1){
                                    showConditionalValues = showConditionalValues+conditionValue+ " 或者 ";
                                }else{
                                    showConditionalValues = showConditionalValues+conditionValue;
                                }
                            }
                            divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                            flowCondition += showFlowStarer +  conditionalSymbol + showConditionalValues;
                        }else{
                            divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                            // flowCondition += <div>如果{showFlowStarer} {conditionalSymbol} {conditionalValue}</div>;
                            flowCondition += showFlowStarer +  conditionalSymbol + conditionalValue;
                        }
                    }
                }
            }else{
                //如果只有一个条件，按现有的方式进行显示;
                if("assignOfStarter"== conditionField){
                    showFlowStarer = "发起人";
                    divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue.userName+"#"+selectedApprovalUser;
                    flowCondition += showFlowStarer +  conditionalSymbol + conditionalValue.userName;
                }else{
                    var conditionFieldArray = conditionField.split("#");
                    showFlowStarer = conditionFieldArray[0];
                    //表单元素类型
                    var conditionType = conditionFieldArray[1];
                    if(conditionType=="checkbox-group"){
                        var conditionalValues = currentCondition.conditionalValues;
                        var showConditionalValues="";
                        for(var i=0;i<conditionalValues.length;i++){
                            var conditionValue = conditionalValues[i];
                            if(i!=conditionalValues.length-1){
                                showConditionalValues = showConditionalValues+conditionValue+ " 或者 ";
                            }else{
                                showConditionalValues = showConditionalValues+conditionValue;
                            }
                        }
                        divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                        flowCondition += showFlowStarer +  conditionalSymbol + showConditionalValues;
                    }else{
                        divId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                        flowCondition += showFlowStarer +  conditionalSymbol + conditionalValue;
                    }
                }
            }
        };
        conditionTag = <div id={divId} >
            <div>如果 {flowCondition}</div>
            <div>审批人：{showName}</div>
            <Icon type="close"  className="close" onClick={_this.removeApprovalConditonData.bind(_this,divId)} />
        </div>;
        stepConditionArray.push(conditionTag);
        this.setState({stepConditionArray,"conditionModalVisible":false});
    },

    /**
     * 从审批条件数组中移除对应的条件
     */
    removeApprovalConditonData(divId){
        var _this = this;
        console.log(divId);
        //todo 从存储审批条件的数组中移除审批条件，并重建页面的审批条件
        for (var i = 0; i < currentConditionInfoJsonArray.length; i++) {
            var currentConditionInfoJson = currentConditionInfoJsonArray[i];
            //审批条件
            var conditionalSymbolJson = currentConditionInfoJson.flowConditionalSymbolList;
            //审批条件满足时对应的用户
            var selectedApprovalUser = currentConditionInfoJson.selectedApprovalUser;
            var isExist = false;
            for(var j=0;j<conditionalSymbolJson.length;j++){
                var currentCondition = conditionalSymbolJson[j];
                var conditionField = currentCondition.conditionField;
                var conditionalSymbol = currentCondition.conditionalSymbol;
                var conditionalValue = currentCondition.conditionalValue;
                var currentDivId;
                if("assignOfStarter"== conditionField){
                    currentDivId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue.userName+"#"+selectedApprovalUser;
                }else{
                    currentDivId = conditionField+"#"+conditionalSymbol+"#"+conditionalValue+"#"+selectedApprovalUser;
                }
                if(currentDivId == divId){
                    isExist = true;
                    break;
                }
            }
            if(isExist){
                currentConditionInfoJsonArray.splice(i,1);
                break;
            }
        }
        //如果审批条件的数组中已经不存在审批条件了，则移除全部审批条件的div
        if(currentConditionInfoJsonArray.length==0){
            stepConditionArray.splice(0);
            _this.setState({stepConditionArray});
        }else{
            stepConditionArray.splice(0);
            currentConditionInfoJsonArray.forEach(function (currentConditionInfoJson) {
                _this.addConditionToPanel(currentConditionInfoJson);
            })
        }
    },

    /**
     * 根据审批用户的类型，到审批人数组中找出当前用户的名字或者角色的名字
     */
    getUserInfoFromApprovalJsonArray(selectedApprovalUser){
        var currentSelectedObj;
        var approvalJsonArray = this.state.approvalJsonArray;
        var selectedApprovalUserArray = selectedApprovalUser.split(",");
        //审批用户类型
        var approvalType = selectedApprovalUserArray[1];
        //对应的审批用户
        var approvalUser  = selectedApprovalUserArray[0];
        for(var i=0;i<approvalJsonArray.length;i++){
            var approvalJson = approvalJsonArray[i];
            var approvalType = approvalJson.approvalType;
            var approval = approvalJson.approval;
            var approvalManagerVariables=approvalJson.approvalManagerVariables;
            var approvalRoleVariables=approvalJson.approvalRoleVariables;
            var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
            var currentApprovalTypeValue = approvalJson.currentApprovalTypeValue;
            var ifManagerNullFillType = approvalJson.ifManagerNullFillType;
            var approvalStarterVariables = approvalJson.approvalStarterVariables;
            switch (approvalType){
                case 0:
                    //指定用户审批
                    if(approvalJson.approval.colUid==approvalUser){
                        currentSelectedObj = approvalJson.approval;
                        break;
                    }
                    break;
                case 1:
                    //角色审批
                    var approvalRoleVariables = approvalJson.approvalRoleVariables;
                    if(approvalRoleVariables.id==approvalUser){
                        currentSelectedObj = approvalRoleVariables.id;
                        break;
                    }
                    break;
                case 2:
                    //部门主管审批
                    var flowApprovalUserRule = approvalJson.flowApprovalUserRule;
                    var approvalUserKey = flowApprovalUserRule.levelType+"#"+flowApprovalUserRule.approvalLevel;
                    if(approvalUserKey==approvalUser){
                        currentSelectedObj = approvalUserKey;
                        break;
                    }
                    break;
                case 3:
                    break;
                case 4:
                    //发起人自己审批
                    var approvalStarterVariables = approvalJson.approvalStarterVariables;
                    if(approvalStarterVariables==approvalUser){
                        currentSelectedObj = approvalStarterVariables;
                        break;
                    }
                    break;
            }
            return currentSelectedObj;
        }
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div className="modal_register_main">
                <Row>
                    <Col span={6}  className="framework_m_l">审批名称：</Col>
                    <Col span={16}  className="framework_m_r">
                        <Input value={this.state.flowName} onChange={this.flowNameChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">审批说明：</Col>
                    <Col span={16} className="framework_m_r">
                        <Input value={this.state.flowDescription} onChange={this.flowDescriptionChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">选择分组：</Col>
                    <Col span={16} className="framework_m_r">
                        <Select defaultValue={this.state.approvalGroup} value={this.state.approvalGroup} style={{ width: 240 }} onChange={this.approvalGroupChange}>
                            {this.state.flowGroupArray}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">审批人设置：</Col>
                    <Col span={17} className="framework_m_r">

                        <div className="approval_steps approval_steps_flow">
                            {/*<Step status="process" title="项目组长审批" icon={<Icon type="user" />} />*/}
                            {this.state.stepObjArray}
                        </div>
                        <Button className="upexam_float" icon="plus-circle" onClick={this.addFlowStep}></Button>

                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">分条件审批：</Col>
                    <Col span={17} className="framework_m_r">
                            <Button className="upexam_float" onClick={this.addFlowCondition}>添加</Button><br/>
                        <div className="approval_steps conditions_approval_steps">
                            {this.state.stepConditionArray}
                        </div>

                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">摘要展示内容：</Col>
                    <Col span={17} className="framework_m_r">
                        <Select
                            multiple={true}
                            style={{ width: '100%' }}
                            placeholder="请选择将要在审批列表中显示的字段"
                            onChange={this.formDefineListHandleChange}
                            value={this.state.selectedAbstractValues}
                        >
                            {children}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">抄送人设置：</Col>
                    <Col span={16} className="framework_m_r">
                        {this.state.copyPersonTagArray}
                        <Button icon="plus-circle" onClick={this.addCopyPerson}></Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={6} className="framework_m_l">自动通知抄送人：</Col>
                    <Col span={16} className="framework_m_r">
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
                       width="600px"
                       className="builder_modal"
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
                       width="616px"
                >
                    <div className="space">
                        <CopyPersonSettingComponent ref="copyPersonSettingComponent" copyPersonIdArray={this.state.copyPersonIdArray}></CopyPersonSettingComponent>
                    </div>
                </Modal>

                <Modal title="设置审批条件" visible={this.state.conditionModalVisible}
                       onCancel={this.conditionModalHandleCancel}
                       onOk={this.getConditionInfoByJson}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       width="600px"
                       className="builder_modal"
                >
                    <div className="space">
                        <ConditionComponent ref="conditionComponent" formData = {this.props.formData} approvalJsonArray={this.state.approvalJsonArray}></ConditionComponent>
                    </div>
                </Modal>

            </div>
        );
    },
});

export default FlowBuilderComponent;
