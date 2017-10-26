import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
import {FLOW_APPROVAL_ONE_LEVEL,FLOW_APPROVAL_UNTIL_LEVEL,FLOW_CURRENT_APPROVAL_TYPE_NEXT,FLOW_CURRENT_APPROVAL_TYPE_ONE,FLOW_CURRENT_APPROVAL_TYPE_ALL} from '../../utils/Const';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const departmentLevelChildren = [];

const ApprovalComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            approvalTypeValue:0,
            departmentMultiLevel:'endToTop',    //多级主管时的默认审批方式
            currentApprovalTypeValue:FLOW_CURRENT_APPROVAL_TYPE_NEXT,    //主管的审批顺序,默认是按顺序进行审批
            ifManagerNullFillType:true,     //主管递补规则,
            selectedDepartmentLevel:"0",
        };
    },

    componentDidMount(){
        for (let i = 1; i <=20; i++) {
            var levelName = "第"+i+"级主管";
            departmentLevelChildren.push(<Option key={i}>{levelName}</Option>);
        }
        this.getTeahcerBySchoolId();
    },

    componentWillReceiveProps(nextProps){
    },

    componentDidUpdate(){
    },

    /**
     * 根据学校id,获取当前学校下的所有老师信息,并据此构建下拉列表选项
     */
    getTeahcerBySchoolId(){
        let _this = this;
        var param = {
            "method": 'getTeahcerBySchoolId',
            "school": this.state.loginUser.schoolId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg+"==="+ret.response);
                if(ret.msg=="调用成功" &&　ret.success == true){
                    _this.buildTeacherOptions(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据学校id,获取当前学校下的所有组织架构角色信息,并据此构建下拉列表选项
     */
    getRolesBySchoolId(){
        let _this = this;
        var param = {
            "method": 'getStructureRoleGroups',
            "operateUserId": this.state.loginUser.colUid,
            "pageNo":-1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg+"==="+ret.response);
                if(ret.msg=="调用成功" &&　ret.success == true){
                    _this.buildRoleOptions(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 创建审批人分组的下拉列表选项
     */
    buildTeacherOptions(response){
        var _this = this;
        var teacherUserObjArray=[];
        var teacherOptionArray = [];
        var i=0;
        var defaultSelectedTeacherId = -1;
        response.forEach(function (response) {
            var user = response.user;
            var colAccount = user.colAccount;
            var colUid = user.colUid;
            var userName = user.userName+"("+colAccount+")";
            var optionObj = <Option value={colUid}>{userName}</Option>
            teacherOptionArray.push(optionObj);
            teacherUserObjArray.push(user);
            if(i==0){
                defaultSelectedTeacherId = colUid;
            }
            i++;
        });
        _this.setState({teacherOptionArray,defaultSelectedTeacherId,teacherUserObjArray});
    },

    /**
     * 创建审批人分组的下拉列表选项
     */
    buildRoleOptions(response){
        var _this = this;
        var roleObjArray=[];
        var roleOptionArray = [];
        var i=0;
        var defaultSelectedRoleId = -1;
        response.forEach(function (response) {
            var childrenArray = response.children;
            var roleGroupName = response.name;
            childrenArray.forEach(function (role) {
                var roleId = role.id;
                var roleName = role.name+"("+roleGroupName+")";
                var optionObj = <Option value={roleId}>{roleName}</Option>
                roleOptionArray.push(optionObj);
                roleObjArray.push(role);
                if(i==0){
                    defaultSelectedRoleId = roleId;
                }
                i++;
            });
        });
        _this.setState({roleObjArray,defaultSelectedRoleId,roleOptionArray});
    },

    /**
     * 审批人类型改变的响应
     */
    approvalTypeOnChange(e){
        var selectedDepartmentLevel="1";
        if(e.target.value==1){
            // message.warn("使用系统角色进行审批的功能正在开发中...");
            // return;
            this.getRolesBySchoolId();
        }else if(e.target.value==2){
            if(departmentLevelChildren[0].key!=0){
                var levelName = "直接主管";
                departmentLevelChildren.splice(0,0,<Option key={0}>{levelName}</Option>);
                selectedDepartmentLevel="0";
            }
        }else if(e.target.value==3){
            if(departmentLevelChildren[0].key==0){
                departmentLevelChildren.splice(0,1);
                selectedDepartmentLevel="1";
            }
        }
        this.setState({
            approvalTypeValue: e.target.value,selectedDepartmentLevel
        });
    },

    /**
     * 用户列表选中响应函数
     * @param value
     */
    userSelectHandleChange(value) {
        console.log(`selected ${value}`);
        var selectedUser = null;
        var teacherUserObjArray = this.state.teacherUserObjArray;
        for(var i=0;i<teacherUserObjArray.length;i++){
            var user = teacherUserObjArray[i];
            if(value==user.colUid){
                selectedUser = user;
                break;
            }
        }
        this.setState({"approval":selectedUser});
    },

    /**
     * 角色选择响应函数
     * @param value
     */
    roleSelectHandleChange(value) {
        console.log(`selected ${value}`);
        var selectedRole = null;
        var roleObjArray = this.state.roleObjArray;
        for(var i=0;i<roleObjArray.length;i++){
            var role = roleObjArray[i];
            if(value==role.id){
                selectedRole = role;
                break;
            }
        }
        this.setState({"selectedRole":selectedRole});
    },

    /**
     * 通过json的形式,获取审批人的设置信息
     * json格式预定如下:
     * {approvalType:0,approval:te23836}
     */
    getApprovalInfoByJson(){
        var approvalJson = {};
        approvalJson.approvalType = this.state.approvalTypeValue;
        switch(this.state.approvalTypeValue){
            case 0:
                //选择的是具体用户为审批人
                approvalJson.approval = this.state.approval;
                approvalJson.approvalManagerVariables = null;
                approvalJson.approvalRoleVariables = null;
                break;
            case 1:
                approvalJson.approval=null;
                approvalJson.approvalManagerVariables = null;
                //选择的系统角色
                approvalJson.approvalRoleVariables = this.state.selectedRole;
                break;
            case 2:
                var flowApprovalUserRuleJson={};
                //选中的主管级别
                flowApprovalUserRuleJson.approvalLevel=this.state.selectedDepartmentLevel;
                flowApprovalUserRuleJson.levelType = FLOW_APPROVAL_ONE_LEVEL;
                approvalJson.approval=null;
                //选择了主管,选择一级主管模式(主管变量不再使用固定值,将会根据选定的主管级别,到后台来设置成部门id)
                approvalJson.approvalManagerVariables = "${managerIds}";
                // approvalJson.approvalRoleVariables = null;
                //设置主管的审批规则
                approvalJson.flowApprovalUserRule = flowApprovalUserRuleJson;
                //本环节审批方式
                approvalJson.currentApprovalTypeValue=this.state.currentApprovalTypeValue;
                //主管递补
                approvalJson.ifManagerNullFillType = this.state.ifManagerNullFillType;
                break;
            case 3:
                approvalJson.approval=null;
                //选择了主管,选择多级主管模式
                approvalJson.approvalManagerVariables = "${mulitiManagerId}";
                // approvalJson.approvalRoleVariables = null;
                var flowApprovalUserRuleJson={};
                //选中的主管级别
                flowApprovalUserRuleJson.approvalLevel=this.state.selectedDepartmentLevel;
                //直到选中的主管级别
                flowApprovalUserRuleJson.levelType = FLOW_APPROVAL_UNTIL_LEVEL;
                //设置主管的审批规则
                approvalJson.flowApprovalUserRule = flowApprovalUserRuleJson;
                //本环节审批方式(依次审批)
                approvalJson.currentApprovalTypeValue=FLOW_CURRENT_APPROVAL_TYPE_NEXT;
                break;
        }

        return approvalJson;
    },

    /**
     * 部门主管-指定一级,选定的主管级别改变响应函数
     * @param value 选定的部门主管级别
     */
    departmentManagerOfOneSelectHandleChange(value) {
        console.log(`selected ${value}`);
        this.setState({"selectedDepartmentLevel":value});
    },

    /**
     * 部门主管,连续多级,主管设定方式改变时的响应函数
     * @param value
     */
    departmentMultiLevelOnChange(e) {
        console.log(`selected ${e}`);
        this.setState({"departmentMultiLevel":e.target.value});
    },

    /**
     * 当前审批环节审批方式改变的响应
     * @param value
     */
    currentApprovalTypeOnChange(e) {
        console.log(`selected ${e}`);
        this.setState({"currentApprovalTypeValue":e.target.value});
    },

    /**
     * 主管递补规则改变的响应
     * @param e
     */
    ifManagerNullOnChange(e) {
        console.log(`checked = ${e.target.checked}`);
        this.setState({"ifManagerNullFillType":e.target.checked});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };

        var currentApprovalType;
        var ifManagerNull;
        if(this.state.approvalTypeValue == 2){
            //一级主管
            currentApprovalType = <div>
                <hr/>
                <Col span={4} className="line_h_30">审批方式</Col>
                <Col span={20}>
                    <RadioGroup onChange={this.currentApprovalTypeOnChange} value={this.state.currentApprovalTypeValue}>
                        <Radio style={radioStyle} value={FLOW_CURRENT_APPROVAL_TYPE_NEXT}>依次审批(本环节内审批人依次审批)</Radio>
                        <Radio style={radioStyle} value={FLOW_CURRENT_APPROVAL_TYPE_ALL}>会签(须所有审批人同意)</Radio>
                        <Radio style={radioStyle} value={FLOW_CURRENT_APPROVAL_TYPE_ONE}>或签(一名审批人同意或拒绝即可)</Radio>
                    </RadioGroup>
                </Col>
            </div>;
            ifManagerNull=<div>
                <hr/>
                <Col span={4} className="line_h_30">主管递补</Col>
                <Col span={20}>
                    <Checkbox style={radioStyle} checked={this.state.ifManagerNullFillType} onChange={this.ifManagerNullOnChange}>若该审批人空缺,由其在通讯录中的上级主管代审批</Checkbox>
                </Col>
            </div>;
        }else if(this.state.approvalTypeValue == 3){
            //多级主管
            currentApprovalType = <div>
                <hr/>
                <span className="line_h_30 margin_16">依次审批（每一级主管中的审批人依次审批）</span>
            </div>;
            ifManagerNull=null;
        }else{
            currentApprovalType = null;
            ifManagerNull=null;
        }

        return (
            <div className="modal_register_main">
                <div>
                    <Col span={4} className="line_h_30">审批人类别</Col>
                    <Col span={20}>
                        <RadioGroup  span={16} onChange={this.approvalTypeOnChange} value={this.state.approvalTypeValue}>
                            <Radio style={radioStyle} value={0}>
                                单个成员(指定某人)
                                {this.state.approvalTypeValue === 0 ?
                                    <Select
                                        showSearch
                                        style={{ width: 130 }}
                                        placeholder="请输入搜索条件"
                                        optionFilterProp="children"
                                        onChange={this.userSelectHandleChange}
                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        className="framework_m_r"
                                    >
                                        {this.state.teacherOptionArray}
                                    </Select>
                                    :
                                    null}
                            </Radio>
                            <Radio style={radioStyle} value={2}>部门主管-指定一级
                                {this.state.approvalTypeValue === 2 ?
                                    <Select
                                        style={{ width: 110 }}
                                        onChange={this.departmentManagerOfOneSelectHandleChange}
                                        className="framework_m_r"
                                        defaultValue={this.state.selectedDepartmentLevel}
                                    >
                                        {departmentLevelChildren}
                                    </Select>
                                    :
                                    null}
                            </Radio>
                            <Radio style={radioStyle} value={3}>部门主管-连续多级
                                {this.state.approvalTypeValue === 3 ?

                                    <RadioGroup onChange={this.departmentMultiLevelOnChange} value={this.state.departmentMultiLevel}>
                                        <Radio className="schoolgroup_btn_left" style={radioStyle} value={'endToTop'}>直到发起人向上的
                                            {this.state.departmentMultiLevel === 'endToTop' ?
                                                <Select
                                                    style={{ width: 110 }}
                                                    onChange={this.departmentManagerOfOneSelectHandleChange}
                                                    className="framework_m_r"
                                                    defaultValue={this.state.selectedDepartmentLevel}
                                                >
                                                    {departmentLevelChildren}
                                                </Select>
                                                :
                                                null}
                                        </Radio>
                                    </RadioGroup>
                                    :
                                    null}
                            </Radio>
                            <Radio style={radioStyle} value={1}>角色(一组固定成员)
                                {this.state.approvalTypeValue === 1 ?
                                    <Select
                                        showSearch
                                        style={{ width: 130 }}
                                        className="framework_m_r"
                                        placeholder="请选择一个角色"
                                        optionFilterProp="children"
                                        onChange={this.roleSelectHandleChange}
                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {/*<Option value="systemManager">系统管理员</Option>
                                         <Option value="teachMaster">教务处主任</Option>
                                         <Option value="teachLeader">化学组组长</Option>*/}
                                        {this.state.roleOptionArray}
                                    </Select>
                                    :
                                    null}
                            </Radio>
                        </RadioGroup>
                    </Col>

                </div>
                {currentApprovalType}
                {ifManagerNull}
            </div>
        );
    },
});

export default ApprovalComponent;
