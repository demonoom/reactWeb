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
     * 获取流程分组及其分组下的流程列表
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
     * 审批人类型改变的响应
     */
    approvalTypeOnChange(e){
        if(e.target.value==1){
            message.warn("使用系统角色进行审批的功能正在开发中...");
            return;
        }
        this.setState({
            approvalTypeValue: e.target.value,
        });
    },

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
     * 通过json的形式,获取审批人的设置信息
     * json格式预定如下:
     * {approvalType:0,approval:te23836}
     */
    getApprovalInfoByJson(){
        var approvalJson = {};
        approvalJson.approvalType = this.state.approvalTypeValue;
        approvalJson.approval = this.state.approval;
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
                                {/*<Option value="23836">Jack</Option>
                                <Option value="24491">小虎(te24491)</Option>
                                <Option value="tom">Tom</Option>
                                <Option value="jack1">Jack</Option>
                                <Option value="lucy2">Lucy</Option>
                                <Option value="tom3">Tom</Option>
                                <Option value="jack4">Jack</Option>
                                <Option value="lucy5">Lucy</Option>
                                <Option value="tom6">Tom</Option>
                                <Option value="jack7">Jack</Option>
                                <Option value="lucy8">Lucy</Option>
                                <Option value="tom9">Tom</Option>*/}
                                {this.state.teacherOptionArray}
                            </Select>
                            :
                            null}
                    </Radio>
                    <Radio style={radioStyle} value={1}>角色(一组固定成员)
                        {this.state.approvalTypeValue === 1 ?
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                placeholder="Select a person"
                                optionFilterProp="children"
                                onChange={this.userSelectHandleChange}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                <Option value="systemManager">系统管理员</Option>
                                <Option value="teachMaster">教务处主任</Option>
                                <Option value="teachLeader">化学组组长</Option>
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
