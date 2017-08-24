/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Radio, Button, Row, Col, message, Input, Select, Cascader} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
const RadioGroup = Radio.Group;
const Option = Select.Option;
/**
 * 部门设置
 */
class GroupSettingModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            parentGroup: '',  //部门信息
            groupOptions: [],
        };
        this.closeGroupSettingModal = this.closeGroupSettingModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.getChatGroupById = this.getChatGroupById.bind(this);
        this.getStructureById = this.getStructureById.bind(this);
        this.listStructures = this.listStructures.bind(this);
        this.getStrcutureMembers = this.getStrcutureMembers.bind(this);
        this.updateStructureChatGroupOwner = this.updateStructureChatGroupOwner.bind(this);
        this.groupMemberHandleChange = this.groupMemberHandleChange.bind(this);
        this.groupSelectOnChange = this.groupSelectOnChange.bind(this);
        this.loadGroupSelectData = this.loadGroupSelectData.bind(this);
        this.chatGroupManagerHandleChange = this.chatGroupManagerHandleChange.bind(this);
        this.parentGroupNameChange = this.parentGroupNameChange.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        var rootStructureId = -1;
        this.getStructureById(rootStructureId);
        this.setState({isShow});
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        //部门设置时，获取部门信息
        var parentGroup = nextProps.parentGroup;
        var parentGroupName = "";
        var parentId = "";
        var chatGroupId = "";
        if (isEmpty(parentGroup) == false) {
            parentGroupName = parentGroup.name;
            parentId = parentGroup.id;
            chatGroupId = parentGroup.chatGroupId;
        }
        this.getStrcutureMembers(parentId, 1);
        if(isShow==true && isEmpty(chatGroupId)==false){
            this.getChatGroupById(chatGroupId);
        }
        this.setState({isShow, parentGroup, parentGroupName, parentId});
    }

    /**
     * 根据群id获取群对象
     * @param chatGroupId 群id
     */
    getChatGroupById(chatGroupId) {
        let _this = this;
        var param = {
            "method": 'getChatGroupById',
            "chatGroupId": chatGroupId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false) {
                    var members = response.members;
                    var ownerId = response.ownerId;
                    var chatGroupMemberArray = [];
                    if (isEmpty(members) == false) {
                        members.forEach(function (member) {
                            var memberId = member.colUid;
                            var memberName = member.userName;
                            var memberOption = <Option value={memberId}>{memberName}</Option>;
                            chatGroupMemberArray.push(memberOption);
                        });
                    }
                    _this.setState({chatGroupMemberArray, ownerId});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 根据部门id获取部门成员
     * @param operateUserId
     * @param structureId
     */
    getStrcutureMembers(structureId, pageNo) {
        let _this = this;
        if(isEmpty(structureId)){
            return;
        }
        var param = {
            "method": 'getStrcutureMembers',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var subGroupMemberList = [];
                if (isEmpty(response) == false && typeof(response.length)!="undefined" ) {
                    response.forEach(function (member) {
                        var user = member.user;
                        var userOption = <Option key={member.id}>{user.userName}</Option>;
                        subGroupMemberList.push(userOption);
                    });
                }
                var pager = ret.pager;
                _this.setState({subGroupMemberList, totalMember: pager.rsCount});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 获取当前用户的组织根节点111
     * @param operateUserId
     * @param structureId
     */
    getStructureById(structureId) {
        let _this = this;
        var param = {
            "method": 'getStructureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var groupOptions = [];
                var groupOption = {
                    value: response.id,
                    label: response.schoolName
                };
                groupOptions.push(groupOption);
                _this.setState({groupOptions});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 更改组织架构群对应的群主
     * @param chatGroupId 群id
     */
    updateStructureChatGroupOwner() {
        let _this = this;
        var param = {
            "method": 'updateStructureChatGroupOwner',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": _this.state.structureId,
            "ownerId": _this.state.ownerId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("群主设置成功！");
                    _this.closeGroupSettingModal();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 关闭部门设置窗口
     */
    closeGroupSettingModal() {
        this.setState({"isShow": false});
        this.props.onCancel();
    }

    /**
     * 确定完成操作(完成部门设置)
     */
    handleOk() {
        var _this = this;
        //部门主管
        var groupManagerArray = _this.state.groupManager;
        //群主
        var chatGroupManager = _this.state.chatGroupManager;
        //部门名称
        var groupName = _this.state.parentGroupName;
        var groupManager="";
        if(isEmpty(groupManagerArray)==false){
            groupManager = groupManagerArray.join(",");
        }
        var info = {
            operateUserId:_this.state.loginUser.colUid,
            structureId:_this.state.parentId,
            groupManager:groupManager,
            chatGroupManager:chatGroupManager,
            groupName:groupName};
        var param = {
            "method": 'updateStructureBaseInfo',//部门设置
            "info": JSON.stringify(info), //部门主管,多个主管的id用逗号分割,memberId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("部门修改成功！");
                    _this.closeGroupSettingModal();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 部门主管列表选中响应
     */
    groupMemberHandleChange(value) {
        console.log(`selected ${value}`);
        this.setState({
            "groupManager": value,
        });
    }

    /**
     * 点击部门名称时，查询子部门，并追加到CaseCade组件中
     * @param operateUserId
     * @param structureId
     */
    listStructures(operateUserId, structure) {
        let _this = this;
        var param = {
            "method": 'listStructures',
            "operateUserId": operateUserId,
            "structureId": structure.id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                _this.buildMenuChildren(ret.response, structure);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    loadGroupSelectData(selectedOptions) {
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;

        // load options lazily
        setTimeout(() => {
            targetOption.loading = false;
            targetOption.children = [{
                label: `${targetOption.label} Dynamic 1`,
                value: 'dynamic1',
            }, {
                label: `${targetOption.label} Dynamic 2`,
                value: 'dynamic2',
            }];
            this.setState({
                options: [...this.state.options],
            });
        }, 1000);
    }

    groupSelectOnChange(value, selectedOptions) {
        console.log(value, selectedOptions);
        this.setState({
            inputValue: selectedOptions.map(o => o.label).join(', '),
        });
    }

    /**
     * 群主改变的响应
     * @param value
     */
    chatGroupManagerHandleChange(value) {
        console.log(`selected ${value}`);
        this.setState({"chatGroupManager": value});
    }

    /**
     * 部门名称改变响应函数
     * @param e
     */
    parentGroupNameChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var parentGroupName = target.value;
        this.setState({"parentGroupName": parentGroupName});
    }


    render() {
        const {value} = this.state;
        return (
            <Modal
                title="部门设置"
                visible={this.state.isShow}
                width={440}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeGroupSettingModal}
                onOk={this.handleOk}
                className="schoolgroup_modal"
            >
                <div className="modal_register_main">
                    <Row className="ant_row">
                        <Col span={6} className="schoolgroup_modal_col6">
                            部门名称：
                        </Col>
                        <Col span={18}>
                            <Input placeholder="部门名称" value={this.state.parentGroupName}
                                   onChange={this.parentGroupNameChange}/>
                        </Col>
                    </Row>
                    <Row className="ant_row">
                        <Col span={6} className="schoolgroup_modal_col6">
                            部门主管：
                        </Col>
                        <Col span={18}>
                            <Select
                                mode="tags"
                                tags={true}
                                style={{width: '100%'}}
                                value={this.state.groupManager}
                                placeholder="Please select"
                                defaultValue={[]}
                                onChange={this.groupMemberHandleChange}
                            >
                                {this.state.subGroupMemberList}
                            </Select>
                        </Col>
                    </Row>
                    <Row className="ant_row">
                        <Col span={6} className="schoolgroup_modal_col6">
                            群主设置：
                        </Col>
                        <Col span={18}>
                            <Select
                                showSearch
                                style={{width: 200}}
                                placeholder="Select a person"
                                optionFilterProp="children"
                                onChange={this.chatGroupManagerHandleChange}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {this.state.chatGroupMemberArray}
                            </Select>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    }

}

export default GroupSettingModal;
