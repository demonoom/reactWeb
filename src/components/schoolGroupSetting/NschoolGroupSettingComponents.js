import React, { PropTypes } from 'react';
import { Table, Icon, Button, Breadcrumb, message } from 'antd';
import { doWebService } from '../../WebServiceHelper';
import { isEmpty } from '../../utils/utils';
import SchoolSettingModal from './SchoolSettingModal';
import AddSubGroupModal from './AddSubGroupModal';
import AddGroupMemberModal from './AddGroupMemberModal';
import GroupSettingModal from './GroupSettingModal';
import ConfirmModal from '../ConfirmModal';

const columns = [{
    title: '部门名称',
    dataIndex: 'subGroupName',
    key: 'subGroupName',
}, {
    title: '操作',
    dataIndex: 'opt',
    key: 'opt',
    width: '86px'
}];
const memberColumns = [{
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: '120px',
    className: 'dold_text departmental_officer'
}, {
    title: '手机号',
    dataIndex: 'userPhone',
    key: 'userPhone',
}
];
var structuresObjArray = [];
var subGroupMemberList = [];
const NschoolGroupSettingComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            memberPageNo: 1,
            structuresObjArray: [],
            schoolSettingModalIsShow: false,
            addSubGroupModalIsShow: false,
            selectedRowKeys: [],
            addGroupMemberModalIsShow: false,
            groupSettingModalIsShow: false,
        };
    },

    componentDidMount() {
        // this.getStructureById();
        var structureId = this.props.structureId;
        var rootStructure = this.props.rootStructure;
        var currentObj = null;

        if (isEmpty(structuresObjArray) == false && structuresObjArray.length > 0) {
            currentObj = structuresObjArray[0];
            structureId = currentObj.id;
            structuresObjArray.splice(1, structuresObjArray.length);
        }

        if (isEmpty(rootStructure) == false) {
            this.setState({ "currentStructureId": structureId, "currentObj": rootStructure });
        } else {
            this.setState({ "currentStructureId": structureId, "currentObj": currentObj });
        }
        this.changeStructureData(structureId);
    },
    componentWillReceiveProps(nextProps) {
        var currentObj = null;
        if (isEmpty(structuresObjArray) == false && structuresObjArray.length > 1) {
            //currentObj = structuresObjArray[0];
            structuresObjArray.splice(1, structuresObjArray.length);
        }
        subGroupMemberList.splice(0);
        var structureId = nextProps.structureId;
        var rootStructure = nextProps.rootStructure;
        if (isEmpty(rootStructure) == false) {
            this.setState({ structureId });
        } else {
            this.setState({ structureId });
        }

        this.changeStructureData(structureId);
    },

    changeStructureData(structureId) {
        var defaultPageNo = 1;
        var currentObj = null;
        if (isEmpty(structuresObjArray) == false && structuresObjArray.length > 1) {
            //currentObj = structuresObjArray[0];
        }
        var rootStructure = this.props.rootStructure;
        if (isEmpty(rootStructure) == false) {
            this.setState({ "structureId": structureId });
        } else {
            this.setState({ "structureId": structureId });
        }

        // 获取子部门
        this.listStructures(structureId);
        // 根据部门id获取部门成员
        this.getStrcutureMembers(structureId, defaultPageNo);
        this.setState({ structureId, structuresObjArray });
    },


    /**
     * 列举子部门
     * @param operateUserId
     * @param structureId
     */
    listStructures(structureId) {
        let _this = this;
        this.getStructureById(structureId);
        var param = {
            "method": 'listStructures',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var subGroupList = [];
                if (isEmpty(response) == false) {
                    response.forEach(function (subGroup) {
                        var subGroupName = <div className="first_indent"
                            onClick={_this.getSubGroupForButton.bind(_this, subGroup.id)}>
                            <span className="antnest_name affix_bottom_tc name_max3 dold_text">{subGroup.name}</span>
                            <span className="schoolgroup_people name_max_last">({subGroup.memberCount}人                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )</span>
                        </div>;
                        var opt = <div className="knowledge_ri">
                            <Button className="sg_btn_del" icon="delete"
                                onClick={_this.removeGroup.bind(_this, subGroup.id)}></Button>
                            {/*<Button className="sg_btn_del" icon="delete" onClick={_this.showConfirmModal1.bind(_this,subGroup.id)}></Button>*/}
                        </div>
                        subGroupList.push({
                            key: subGroup.id,
                            subGroupName: subGroupName,
                            opt: opt
                        });
                    });
                }
                // _this.getStructureById(structureId);
                _this.setState({ subGroupList });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    listStructureAndMembers(structureId) {
        var defaultPageNo = 1;
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId, defaultPageNo);
    },

    /**
     * 移除部门
     */
    removeGroup(structureId) {
        this.showConfirmModal1();
        this.setState({ removeGroupId: structureId });
    },

    batchDeleteMemeber1() {
        let _this = this;
        var param = {
            "method": 'deleteStuctureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": _this.state.removeGroupId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("部门删除成功！");
                    _this.listStructures(_this.state.parentGroup.id);
                    _this.getStrcutureMembers(_this.state.parentGroup.id, _this.state.memberPageNo);
                } else {
                    message.error(ret.msg);
                }
                _this.closeConfirmModal1();
                var root;
                root = structuresObjArray[0].id;
                if (root == _this.state.parentGroup.id) {
                    _this.props.addSubGroupComplete();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取当前用户的组织根节点333
     * @param operateUserId
     * @param structureId
     */
    getStructureById(structureId) {
        let _this = this;
        var structureId = structureId + '';

        if (isEmpty(structureId)) {
            structureId = "-1";
        };

        var param = {
            "method": 'getStructureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parentGroup = ret.response;
                _this.setState({ structureIdByNoom: parentGroup.id });
                if (isEmpty(parentGroup) == false) {
                    var isExit = _this.checkStructureIsExitAtArray(parentGroup);
                    if (isExit == false) {
                        //存放组织架构的层次关系
                        structuresObjArray.push(parentGroup);
                    }
                }
                _this.setState({ parentGroup });

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    checkStructureIsExitAtArray(newStructure) {
        var isExit = false;
        for (var i = 0; i < structuresObjArray.length; i++) {
            var structure = structuresObjArray[i];
            if (structure.id == newStructure.id) {
                isExit = true;
                break;
            }
        }
        return isExit;
    },

    /**
     * 根据部门id获取部门成员
     * @param operateUserId
     * @param structureId
     */
    getStrcutureMembers(structureId, pageNo) {
        let _this = this;
        var structureId = structureId + '';

        if (structureId.indexOf(',') !== -1) {
            var structureIdArr = structureId.split(',');
            structureId = structureIdArr[0];
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
                if (isEmpty(response) == false) {
                    response.forEach(function (member) {
                        var user = member.user;
                        subGroupMemberList.push({
                            key: member.id,
                            userId: user.colUid,
                            userName: user.userName,
                            userPhone: user.phoneNumber
                        });
                    });
                }
                var pager = ret.pager;
                _this.setState({ subGroupMemberList, totalMember: pager.rsCount, selectedRowKeys: [] });//selectedRowKeys设置成[]可以清除默认勾选
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 点击部门时，获取部门下的成员
     * @param record
     * @param index
     */
    getSubGroup(record, index) {
        var memberPageNo = 1;
        this.setState({
            structureId: record.key,
            schoolSettingModalIsShow: false,
            addSubGroupModalIsShow: false,
            addGroupMemberModalIsShow: false,
            "groupSettingModalIsShow": false
        });
        this.listStructures(record.key);
        this.getStrcutureMembers(record.key, memberPageNo);
    },

    /**
     * 点击部门时，获取部门下的成员
     * @param record
     * @param index
     */
    getSubGroupForButton(structureId) {
        var memberPageNo = 1;
        subGroupMemberList.splice(0);
        var defaultMemberPageNo = 1;
        this.setState({
            structureId: structureId,
            schoolSettingModalIsShow: false,
            addSubGroupModalIsShow: false,
            addGroupMemberModalIsShow: false,
            "groupSettingModalIsShow": false,
            memberPageNo: defaultMemberPageNo
        });
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId, memberPageNo);
    },

    /**
     * 部门成员的数据分页
     * @param pageNo
     */
    memberPageOnChange(pageNo) {
        this.setState({
            memberPageNo: pageNo,
        });
        this.getStrcutureMembers(this.state.structureId, pageNo);
    },

    /**
     * 面包条点击响应
     * 切换到当前的组织架构层次，同时，在此面包条后的数据移除
     */
    breadCrumbClick(structureId) {
        var defaultPageNo = 1;
        this.listStructures(structureId);
        subGroupMemberList.splice(0);
        this.getStrcutureMembers(structureId, defaultPageNo);
        for (var i = 0; i < structuresObjArray.length; i++) {
            var structure = structuresObjArray[i];
            if (structure.id == structureId) {
                structuresObjArray.splice(i, structuresObjArray.length);
                break;
            }
        }
        var defaultMemberPageNo = 1;
        this.setState({ "structureId": structureId, structuresObjArray, "memberPageNo": defaultMemberPageNo });
    },

    /**
     * 添加子部门
     */
    addSubGroup() {
        this.setState({ "addSubGroupModalIsShow": true });
    },

    /**
     * 添加部门人员
     */
    addGroupMemeber() {
        this.setState({ "addGroupMemberModalIsShow": true });
    },

    /**
     * 部门设置
     */
    groupSetting() {
        this.setState({ "groupSettingModalIsShow": true });
    },
    /**
     * 学校设置
     */
    schoolSetting() {
        this.setState({ schoolSettingModalIsShow: true });
    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({
            selectedRowKeys,
            schoolSettingModalIsShow: false,
            addSubGroupModalIsShow: false,
            addGroupMemberModalIsShow: false,
            "groupSettingModalIsShow": false
        });
    },

    /**
     * 部门成员加载更多
     */
    loadMoreMember() {
        var memberPageNo = parseInt(this.state.memberPageNo) + 1;
        this.memberPageOnChange(memberPageNo);
    },

    /**
     * 批量删除部门员工
     */
    batchDeleteMemeber() {
        var _this = this;
        var selectedRowKeys = _this.state.selectedRowKeys;
        var memberIds = "";
        if (isEmpty(selectedRowKeys) == false) {
            memberIds = selectedRowKeys.join(",");
        }
        var param = {
            "method": 'removeStructureMember',
            "operateUserId": _this.state.loginUser.colUid,
            "structureMemberIds": memberIds,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("员工移除成功！");
                    subGroupMemberList.splice(0);
                    _this.listStructures(_this.state.structureId);
                    _this.getStrcutureMembers(_this.state.structureId, _this.state.memberPageNo);
                    _this.setState({ selectedRowKeys: [] });
                    _this.closeConfirmModal();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },


    initModalStatus() {
        this.setState({
            "groupSettingModalIsShow": false,
            "addGroupMemberModalIsShow": false,
            "addSubGroupModalIsShow": false,
            "schoolSettingModalIsShow": false
        });
    },

    addSubGroupComplete(key) {
        var _this = this;
        var root;
        root = structuresObjArray[0].id;
        if (root == key) {
            _this.props.addSubGroupComplete();
        }
        this.changeStructureData(this.state.structureId);
    },

    showConfirmModal() {
        this.setState({ calmSureDelConfirm: true })
        // this.refs.confirmModal.changeConfirmModalVisible(true);
    },
    showConfirmModal1() {
        this.setState({ calmSureDelConfirm1: true })
        // this.refs.confirmModal1.changeConfirmModalVisible(true);
    },

    closeConfirmModal() {
        this.setState({ calmSureDelConfirm: false })
        // this.refs.confirmModal.changeConfirmModalVisible(false);
    },
    closeConfirmModal1() {
        this.setState({ calmSureDelConfirm1: false })
        // this.refs.confirmModal1.changeConfirmModalVisible(false);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        const rowSelection = {
            selectedRowKeys: _this.state.selectedRowKeys,
            onChange: _this.onSelectChange,
        };
        const hasSelected = _this.state.selectedRowKeys.length > 0;
        var structureName = "";
        if (isEmpty(_this.state.parentGroup) == false) {
            structureName = _this.state.parentGroup.name;
        }
        var breadcrumbItemObjArray = [];
        if (isEmpty(_this.state.structuresObjArray) == false) {
            _this.state.structuresObjArray.forEach(function (structure) {
                var breadcrumbItemObj = <Breadcrumb.Item key={structure.id}><a
                    onClick={_this.breadCrumbClick.bind(_this, structure.id)}>{structure.name}</a></Breadcrumb.Item>;
                breadcrumbItemObjArray.push(breadcrumbItemObj);
            });
        }
        var settingButton;
        if (isEmpty(_this.state.currentObj)) {
            settingButton = null;
        } else if (_this.state.structureId == _this.state.currentObj.id) {
            settingButton = <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                onClick={this.schoolSetting}>设置</Button>
        } else {
            settingButton = <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                onClick={this.groupSetting}>部门设置</Button>;
        }
        return (
            <div className="schoolgroup">
                <div className="schoolgroup_title">
                    <span className="name_max4 dold_text">{structureName}</span>
                    {settingButton}
                </div>
                <div>
                    <Breadcrumb separator=">">
                        {breadcrumbItemObjArray}
                    </Breadcrumb>
                </div>
                <div className="schoolgroup_title">
                    <i className="iconfont schoolgroup_i">&#xe6a0;</i>
                    <span>下级部门</span>
                    <span>
                        <Button className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn"
                            onClick={this.addSubGroup}>添加子部门</Button>
                    </span>
                </div>
                <div>
                    <Table showHeader={false} columns={columns} dataSource={this.state.subGroupList}
                        className="schoolgroup_table"
                        pagination={false} />
                </div>
                <div className="schoolgroup_title">
                    <i className="iconfont schoolgroup_i ">&#xe61b;</i>
                    <span>部门人员</span>
                    <span>
                        <Button onClick={this.addGroupMemeber}
                            className="schoolgroup_btn_blue_solid schoolgroup_btn_left schoolgroup_btn">添加员工</Button>
                        <span className="schoolgroup_btn_left">
                            <Button
                                className="calmBorderRadius"
                                type="primary"
                                onClick={this.showConfirmModal}
                                disabled={!hasSelected} className="schoolgroup_btn_red schoolgroup_btn">
                                批量删除
                            </Button>
                            <span className="password_ts" style={{ marginLeft: 8 }}>
                                {hasSelected ? `选中 ${_this.state.selectedRowKeys.length} 条记录` : ''}
                            </span>
                        </span>
                    </span>
                </div>
                <div>
                    <Table rowSelection={rowSelection} columns={memberColumns}
                        pagination={false} dataSource={this.state.subGroupMemberList}
                        className="schoolgroup_table1 schoolgroup_table_department" />
                    <div className="schoolgroup_operate schoolgroup_more">
                        <a onClick={this.loadMoreMember} className="schoolgroup_more_a">加载更多</a>
                    </div>
                </div>
                <Modal
                    className="calmModal"
                    visible={this.state.calmSureDelConfirm}
                    title="提示"
                    onCancel={this.closeConfirmModal}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.batchDeleteMemeber}  >确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeConfirmModal} >取消</button>
                    ]}
                >
                    <div className="isDel">
                        <img className="sadFeel" src={require("../../../jquery-photo-gallery/icon/sad.png")} />
                        确定要删除选中的部门员工?
                            </div>
                </Modal>
                <Modal
                    className="calmModal"
                    visible={this.state.calmSureDelConfirm1}
                    title="提示"
                    onCancel={this.closeConfirmModal1}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.batchDeleteMemeber1}  >确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeConfirmModal1} >取消</button>
                    ]}
                >
                    <div className="isDel">
                        <img className="sadFeel" src={require("../../../jquery-photo-gallery/icon/sad.png")} />
                        确定删除?
                            </div>
                </Modal>
                <SchoolSettingModal isShow={this.state.schoolSettingModalIsShow}
                    rootStructure={this.state.currentObj}
                    onCancel={this.initModalStatus}></SchoolSettingModal>
                <AddSubGroupModal isShow={this.state.addSubGroupModalIsShow}
                    parentGroup={this.state.parentGroup}
                    callbackParent={this.listStructures}
                    onCancel={this.initModalStatus}
                    addSubGroupComplete={this.addSubGroupComplete}
                ></AddSubGroupModal>
                <AddGroupMemberModal isShow={this.state.addGroupMemberModalIsShow}
                    parentGroup={this.state.parentGroup}
                    callbackParent={this.listStructureAndMembers}
                    onCancel={this.initModalStatus}
                    addedUserData={this.state.subGroupMemberList}
                ></AddGroupMemberModal>
                <GroupSettingModal isShow={this.state.groupSettingModalIsShow} parentGroup={this.state.parentGroup}
                    onCancel={this.initModalStatus}></GroupSettingModal>
            </div>
        );
    }
});

export default NschoolGroupSettingComponents;
