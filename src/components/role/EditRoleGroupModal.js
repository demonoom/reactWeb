/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Input, Button, Row, Col, message, Select} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import Confirm from '../ConfirmModal';

class AddSubGroupModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            parentGroup: '',  //部门信息
            subGroupName: '',   //角色名称
            parentRoleId: ''   //角色组id
        };
        this.closeAddSubGroupModal = this.closeAddSubGroupModal.bind(this);
        this.handleOk = this.handleOk.bind(this);
        this.handDel = this.handDel.bind(this);
        this.addSubGroup = this.addSubGroup.bind(this);
        this.subGroupNameChange = this.subGroupNameChange.bind(this);
        this.parentRoleChange = this.parentRoleChange.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);
        this.batchDeleteMemeber = this.batchDeleteMemeber.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        var parentGroup = nextProps.parentGroup;
        var parentGroupName = "";
        var parentId = "";
        if (isEmpty(parentGroup) == false) {
            parentGroupName = parentGroup.name;
            parentId = parentGroup.id;
        }
        this.setState({isShow, parentGroup, parentGroupName, parentId});
        this.setState({roleName: nextProps.roleName});
        this.setState({roleId: nextProps.delRoleGroupId});
        this.setState({subGroupName: nextProps.delRoleGroupName});
    }

    /**
     * 更新角色名字
     */
    addSubGroup() {
        let _this = this;
        var subGroupName = _this.state.subGroupName;
        var param = {
            "method": 'updateStructrureRoleName',
            "operateUserId": _this.state.loginUser.colUid,
            "roleName": _this.state.subGroupName,
            "roleId": _this.state.roleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("更新角色组成功");
                    _this.closeAddSubGroupModal();
                    _this.props.callBackNewRoleName(subGroupName, _this.state.roleId);
                    _this.state.subGroupName = '';
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 关闭学校设置窗口
     */
    closeAddSubGroupModal() {
        this.setState({"isShow": false});
        this.props.closeModel();
    }

    /**
     * 确定完成操作
     */
    handleOk() {
        this.addSubGroup();
    }

    batchDeleteMemeber() {
        this.refs.confirm.changeConfirmModalVisible(false);
        let _this = this;
        var delRoleId = _this.state.roleId;
        var param = {
            "method": 'deleteStructureRole',
            "operateUserId": _this.state.loginUser.colUid,
            "roleId": _this.state.roleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("删除角色组成功");
                    _this.closeAddSubGroupModal();
                    _this.props.callBackDelRoleId(delRoleId);
                } else {
                    message.error(ret.msg);
                    _this.closeAddSubGroupModal();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 删除操作
     */
    handDel() {
        this.showConfirmModal();
        this.closeAddSubGroupModal();
    }

    showConfirmModal() {
        this.refs.confirm.changeConfirmModalVisible(true);
    }

    closeConfirmModal() {
        this.refs.confirm.changeConfirmModalVisible(false);
    }

    subGroupNameChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subGroupName = target.value;
        this.setState({subGroupName});
    }

    parentRoleChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var parentRoleId = e;
        this.setState({parentRoleId});
    }

    render() {
        return (
            <Modal
                title="编辑角色组"
                visible={this.state.isShow}
                width={440}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeAddSubGroupModal}
                className="schoolgroup_modal"
                footer={[
                    <button type="primary" className="ant-btn-primary ant-btn" onClick={this.handleOk}>确定</button>,
                    <button type="danger" className="ant-btn login-form-button" onClick={this.handDel}>删除</button>,
                    <button type="ghost" className="ant-btn ant-btn-ghost login-form-button"
                            onClick={this.closeAddSubGroupModal}>取消</button>
                ]}
            >
                <div className="modal_register_main">
                    <Row className="ant_row">
                        <Col span={6}>
                            角色组名称：
                        </Col>
                        <Col span={18}>
                            <Input value={this.state.subGroupName} onChange={this.subGroupNameChange}/>
                        </Col>
                    </Row>
                </div>
                <Confirm
                    ref="confirm"
                    title="确定删除?"
                    onConfirmModalCancel={this.closeConfirmModal}
                    onConfirmModalOK={this.batchDeleteMemeber}
                />
            </Modal>
        );
    }

}

export default AddSubGroupModal;
