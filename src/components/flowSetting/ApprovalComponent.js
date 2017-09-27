import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const ApprovalComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            approvalTypeValue:0,
        };
    },

    componentDidMount(){
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
        if(e.target.value==1){
            // message.warn("使用系统角色进行审批的功能正在开发中...");
            // return;
            this.getRolesBySchoolId();
        }
        this.setState({
            approvalTypeValue: e.target.value,
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
                approvalJson.approval=null;
                //选择了主管,使用变量代替
                approvalJson.approvalManagerVariables = "${managerIds}";
                approvalJson.approvalRoleVariables = null;
                break;
        }

        return approvalJson;
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
        return (
            <div className="modal_register_main">
                <RadioGroup onChange={this.approvalTypeOnChange} value={this.state.approvalTypeValue}>
                    <Radio style={radioStyle} value={0}>
                        单个成员(指定某人)
                        {this.state.approvalTypeValue === 0 ?
                            <Select
                                showSearch
                                style={{ width: 200 }}
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
                    <Radio style={radioStyle} value={2}>部门主管</Radio>
                    <Radio style={radioStyle} value={1}>角色(一组固定成员)
                        {this.state.approvalTypeValue === 1 ?
                            <Select
                                showSearch
                                style={{ width: 200 }}
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
            </div>
        );
    },
});

export default ApprovalComponent;
