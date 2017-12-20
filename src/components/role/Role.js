import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Button, Breadcrumb, message, Modal} from 'antd';
import AddRoleMemberModal from './AddRoleMemberModal';
import EditRoleModal from './EditRoleModal'
import ConfirmModal from '../ConfirmModal'
import {doWebService} from '../../WebServiceHelper';

const confirm = Modal.confirm;

const columns = [{
    title: '姓名',
    dataIndex: 'name',
    className: 'dold_text'
}, /*{
    title: '部门',
    dataIndex: 'group',
},*/ {
    title: '手机号',
    dataIndex: 'phone',
}];

const Role = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            addRoleModalIsShow: false,
            editRoleModalIsShow: false,
            disabled: true,
            selectedRowKeys: [],
        };
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps.roleGroupClick);
        // var _this = this;

        if (isEmpty(nextProps.roleGroupClick) == false) {
            var selectedMessage = nextProps.roleGroupClick;
            var arr = selectedMessage.split(',');
            this.setState({roleId: arr[0], roleName: arr[1]});
            this.ajaxData(arr[0]);
            if (arr[2] != 0) {
                this.setState({disabled: true})
            } else {
                this.setState({disabled: false})
            }
        } else {
            if (isEmpty(nextProps.sendDefaultSelected) == false) {
                var sendDefaultSelected = nextProps.sendDefaultSelected;
                var arr = sendDefaultSelected.split('#');
                this.setState({roleId: arr[0], roleName: arr[1]});
                this.ajaxData(arr[0]);
            }
        }
        if (isEmpty(nextProps.RoleGroupName) == false) {
            var arr = nextProps.RoleGroupName.split('#');
            this.setState({papaName: arr[1]});
        }
        // if(isEmpty(selectedMessage)==false){
        //     if(selectedMessage.indexOf(',') !== -1){
        //         var arr = selectedMessage.split(',');
        //         this.setState({roleId: arr[0]});
        //         this.setState({roleName: arr[1]});
        //         this.ajaxData(arr[0]);
        //     }else {
        //         this.ajaxData(selectedMessage);
        //     }
        // }
        // var papaKey = nextProps.papaKey;
        // var papaArr = [];
        // if(isEmpty(papaKey)==false){
        //     papaArr = papaKey.split('#');
        //     this.setState({papaName:papaArr[1]});
        //     var selectedPapa = papaArr[0];
        //     this.state.defaultId.forEach(function (v,i) {
        //         if(v == selectedPapa) {
        //             _this.setState({disabled:true});
        //         } else{
        //             _this.setState({disabled:false});
        //         }
        //     })
        // };
    },

    ajaxData(roleId) {
        let _this = this;
        var param = {
            "method": 'getUsersByStructrureRoleId',
            "operateUid": this.state.loginUser.colUid,
            "pageNo": -1,
            "roleId": roleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                // console.log(data);
                _this.drawTable(data);

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    drawTable(data) {
        var mermberNum = data.length;
        var _this = this;
        _this.setState({deleteData: data});
        _this.setState({mermberNum: mermberNum});
        var mesData = [];
        data.forEach(function (v, i) {
            var person = {
                key: v.colUid,
                name: v.userName,
                // group: v.schoolName,
                phone: v.phoneNumber,
            }
            mesData.push(person);
        });
        _this.setState({mesData, selectedRowKeys: []});
    },

    addRoleMember() {
        this.setState({addRoleModalIsShow: true});
    },

    /**
     * 添加成员的回调
     */
    addRoleComplete() {
        this.ajaxData(this.state.roleId);
        this.setState({"addRoleModalIsShow": false});
    },
    /**
     * 添加成员时取消和关闭的回调
     */
    closeAddModel() {
        this.setState({"addRoleModalIsShow": false});
    },

    editRole() {
        this.setState({editRoleModalIsShow: true});
    },

    /**
     * 编辑角色时取消和关闭时候的回调
     */
    closeModel() {
        this.setState({"editRoleModalIsShow": false});
    },

    /**
     * 编辑角色名称完成后的回调操作
     * @param roleId 角色的id
     * @param roleName 角色的名称
     */
    editRoleComplete(roleId, roleName, refresh) {
        //将编辑后的名字同步至左侧
        this.props.onEditComplete(roleName, roleId);
        //设置编辑角色Modal的显示状态为false，不再显示
        this.setState({"roleName": roleName, "editRoleModalIsShow": false});
    },

    /**
     * 删除角色成功的回调
     * @param roleId
     * @param roleName
     */
    onDelComplete(roleId, roleName) {
        console.log(roleId);
        console.log(roleName);
        //
    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({selectedRowKeys});
    },

    showConfirm() {
        var _this = this;
        confirm({
            title: '确定删除?',
            onOk() {
                var selectedMem = _this.state.selectedRowKeys;
                // console.log(selectedMem);
                var userIds = '';
                selectedMem.forEach(function (v, i) {
                    userIds += v + ',';
                })

                var param = {
                    "method": 'deleteStructureRoleUsers',
                    "operateUid": _this.state.loginUser.colUid,
                    "roleId": _this.state.roleId,
                    "userIds": userIds.substr(0, userIds.length - 1)
                };
                doWebService(JSON.stringify(param), {
                    onResponse: function (ret) {
                        if (ret.success == true && ret.msg == "调用成功") {
                            message.success("删除成功");
                            _this.ajaxData(_this.state.roleId);
                        }
                    },
                    onError: function (error) {
                        message.error(error);
                    }
                });
            },
            onCancel() {
                console.log('Cancel');
            },
        })
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = this.state.selectedRowKeys.length > 0;
        return (
            <div className="schoolgroup">
                <div className="schoolgroup_title">
                    <span className="name_max4 dold_text">{this.state.roleName}</span>
                    <span className="schoolgroup_people modal_course">(<span>{this.state.mermberNum}</span>人)</span>
                    <span>
                        <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.editRole} disabled={this.state.disabled}>编辑</Button>
                    </span>
                </div>

                <div className="framework_r_height">
                    <div className="framework_btn_bg">
                         <span>
                            <Button className="schoolgroup_btn_blue schoolgroup_btn"
                                    onClick={this.addRoleMember}>添加成员</Button>
                        </span>
                        <Button disabled={!hasSelected}
                                className="schoolgroup_btn_red schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.showConfirm}>批量删除</Button>
                        <span className="password_ts" style={{marginLeft: 8}}>
                        {hasSelected ? `选中 ${this.state.selectedRowKeys.length} 条记录` : ''}</span>
                    </div>
                    <Table className="framework_user" rowSelection={rowSelection} columns={columns}
                           dataSource={this.state.mesData}
                           pagination={false}
                    />
                </div>

                <AddRoleMemberModal isShow={this.state.addRoleModalIsShow} parentRole={this.state.parentRole}
                                    callbackParent={this.listStructures}
                                    roleId={this.state.roleId}
                                    addRoleComplete={this.addRoleComplete}
                                    closeAddModel={this.closeAddModel}
                                    addedMemberData={this.state.mesData}
                ></AddRoleMemberModal>

                <EditRoleModal isShow={this.state.editRoleModalIsShow} roleId={this.state.roleId}
                               roleName={this.state.roleName}
                               onEditComplete={this.editRoleComplete}
                               onDelComplete={this.onDelComplete}
                               closeModel={this.closeModel}
                               papaName={this.state.papaName}
                />

                <ConfirmModal
                    isShow={this.state.confirmRoleModalIsShow}
                />
            </div>
        );
    }
});

export default Role;