import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import {isEmpty} from '../../utils/utils';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const ApprovalComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            approvalTypeValue:1,
        };
    },

    componentDidMount(){
    },

    componentWillReceiveProps(nextProps){
    },

    componentDidUpdate(){
    },

    /**
     * 审批人类型改变的响应
     */
    approvalTypeOnChange(e){
        this.setState({
            approvalTypeValue: e.target.value,
        });
    },

    userSelectHandleChange(value) {
        console.log(`selected ${value}`);
        this.setState({"approval":value});
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
            <div>
                <RadioGroup onChange={this.approvalTypeOnChange} value={this.state.approvalTypeValue}>
                    <Radio style={radioStyle} value={1}>
                        单个成员(指定某人)
                        {this.state.approvalTypeValue === 1 ?
                            <Select
                                showSearch
                                style={{ width: 200 }}
                                placeholder="请输入搜索条件"
                                optionFilterProp="children"
                                onChange={this.userSelectHandleChange}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                <Option value="23836">Jack</Option>
                                <Option value="23837">Lucy(te23837)</Option>
                                <Option value="tom">Tom</Option>
                                <Option value="jack1">Jack</Option>
                                <Option value="lucy2">Lucy</Option>
                                <Option value="tom3">Tom</Option>
                                <Option value="jack4">Jack</Option>
                                <Option value="lucy5">Lucy</Option>
                                <Option value="tom6">Tom</Option>
                                <Option value="jack7">Jack</Option>
                                <Option value="lucy8">Lucy</Option>
                                <Option value="tom9">Tom</Option>
                            </Select>
                            :
                            null}
                    </Radio>
                    <Radio style={radioStyle} value={2}>角色(一组固定成员)
                        {this.state.approvalTypeValue === 2 ?
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
