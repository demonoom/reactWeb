/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Input, Button, Row, Col, message, Select} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';

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
        this.addSubGroup = this.addSubGroup.bind(this);
        this.subGroupNameChange = this.subGroupNameChange.bind(this);
        this.getStructureRoleGroups = this.getStructureRoleGroups.bind(this);
        this.parentRoleChange = this.parentRoleChange.bind(this);
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
    }

    /**
     * 添加角色
     */
    addSubGroup() {
        let _this = this;
        var param = {
            "method": 'createStructrureRole',
            "operateUserId": _this.state.loginUser.colUid,
            "roleName": _this.state.subGroupName,
            "parentRoleId": _this.state.parentRoleId
        };
        if (param.roleName.length == 0) {
            message.error('角色名称不能为空');
        } else {
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.msg == "调用成功" && ret.success == true) {
                        message.success("角色添加成功");
                        _this.closeAddSubGroupModal();
                        _this.props.addRoleComplete();
                        _this.state.subGroupName = '';
                    }
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    }


    /**
     * 关闭学校设置窗口
     */
    closeAddSubGroupModal() {
        this.setState({"isShow": false});
        this.props.closeModel();
        this.setState({subGroupName: ''});
    }

    /**
     * 确定完成操作
     */
    handleOk() {
        this.addSubGroup();
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

    /**
     * 获取角色组
     * @param operateUserId
     * @param structureId
     */
    getStructureRoleGroups() {
        let _this = this;
        var param = {
            "method": 'getStructureRoleGroups',
            "operateUserId": _this.state.loginUser.colUid,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var part = ret.response;
                part.forEach(function (v, i) {
                    if (v.createType > 0) {
                        part.splice(v, 1);
                    }
                });
                // 调用 渲染角色函数
                _this.buildMenuPart(part);
                _this.setState({part});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /*渲染下拉列表*/
    buildMenuPart(part) {
        let _this = this;
        var menuContent;
        var subRoleMenuItemArray = [];
        var openKeys = '';
        var partMenu = '';
        var menuItem = '';
        var arr = [];

        for (var i = 0; i < part.length; i++) {
            partMenu = <Option value={part[i].id} key={part[i].id}>{part[i].name}</Option>
            arr.push(partMenu);
        }
        _this.setState({arr, openKeys});
    }


    render() {
        return (
            <Modal
                title="添加角色"
                visible={this.state.isShow}
                width={440}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeAddSubGroupModal}
                onOk={this.handleOk}
                className="schoolgroup_modal"
            >
                <div className="modal_register_main">
                    <Row className="ant_row">
                        <Col span={6} className="framework_m_l">
                            <span className="c_from_icon">*</span>角色名称：
                        </Col>
                        <Col span={16} className="framework_m_r">
                            <Input placeholder="请输入角色名称" value={this.state.subGroupName}
                                   onChange={this.subGroupNameChange}/>
                        </Col>
                    </Row>
                    <Row className="ant_row">
                        <Col span={6} className="framework_m_l">
                            <span className="c_from_icon">*</span>分组到：
                        </Col>
                        <Col span={16} className="framework_m_r">
                            <Select defaultValue="请选择分组" style={{width: 245}} onChange={this.parentRoleChange}>
                                {this.state.arr}
                            </Select>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    }

}

export default AddSubGroupModal;
