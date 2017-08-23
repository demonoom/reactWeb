import React, {PropTypes} from 'react';
import {Table, Icon, Button, Breadcrumb, message, Modal} from 'antd';
import AddRoleMemberModal from './AddRoleMemberModal';
import {doWebService} from '../../WebServiceHelper';
import EditRoleModal from './EditRoleModal'

const confirm = Modal.confirm;

const columns = [{
    title: '姓名',
    dataIndex: 'name',
    className:'antnest_name'
}, {
    title: '部门',
    dataIndex: 'group',
    className:'antnest_name'
}, {
    title: '手机号',
    dataIndex: 'phone',
    className:'antnest_name'
}];

const RoleComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            memberPageNo: 1,
            structuresObjArray: [],
            schoolSettingModalIsShow: false,
            addRoleModalIsShow: false,
            editRoleModalIsShow:false,
            selectedRowKeys: [],
            addGroupMemberModalIsShow: false,
            groupSettingModalIsShow: false,
            loading: false,
            roleId: '',
            roleName: '',
            data: [],
            deleteData:[]
        };
    },

    componentDidMount() {
        var selectedMessage = this.props.selectedId;
        var arr = selectedMessage.split(',');
        this.setState({roleId: arr[0]});
        this.setState({roleName: arr[1]});
    },

    componentWillReceiveProps(nextProps) {
        var selectedMessage = nextProps.selectedId;
        var arr = selectedMessage.split(',');
        this.setState({roleId: arr[0]});
        this.setState({roleName: arr[1]});
        var data = [];
        let _this = this;
        var param = {
            "method": 'getUsersByStructrureRoleId',
            "operateUid": this.state.loginUser.colUid,
            "pageNo": -1,
            "roleId": arr[0]
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                _this.drawTable(data);

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    drawTable(data) {
        var _this = this;
        _this.setState({deleteData:data});
        var mesData = [];
        data.forEach(function (v, i) {
            var person = {
                key: v.colUid,
                name: v.userName,
                group: v.schoolName,
                phone: `London, Park Lane no.`,
            }
            mesData.push(person);
        });
        _this.setState({mesData});
    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({selectedRowKeys});
    },

    addRoleMember() {
        this.setState({addRoleModalIsShow: true});
    },
    editRole() {
        this.setState({editRoleModalIsShow:true});
    },
    pageOnChange(pageNo) {
        this.this.setState({
            currentPage: pageNo,
        });
    },
    showConfirm() {
        var _this = this;
        confirm({
            title: '确定删除?',
            onOk() {
                var selectedMem = _this.state.selectedRowKeys;
                // console.log(selectedMem);
                var userIds = '';
                selectedMem.forEach(function (v,i) {
                    // console.log(v.key);
                    userIds += v + ',';
                })
                // console.log(userIds);
                // console.log(_this.state.roleId);
                // console.log(userIds.substr(0,userIds.length-1));

                var param = {
                    "method": 'deleteStructureRoleUsers',
                    "operateUid": _this.state.loginUser.colUid,
                    "roleId": _this.state.roleId,
                    "userIds": userIds.substr(0,userIds.length-1)
                };
                // console.log(param);
                doWebService(JSON.stringify(param), {
                    onResponse: function (ret) {
                        // console.log(ret);
                        if(ret.success==true && ret.msg=="调用成功") {
                            message.success("删除成功")
                        }
                    },
                    onError: function (error) {
                        message.error(error);
                    }
                });
            },
            onCancel() {
                console.log('Cancel');
            }
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
                    <span>{this.state.roleName}</span>
                    <span>(1人)</span>
                    <span>
                        <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.editRole}>编辑</Button>
                    </span>
                </div>

                <div>
                    <div style={{marginBottom: 16}}>
                         <span>
                        <Button className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.addRoleMember}>添加成员</Button>
                    </span>
                        <Button disabled={!hasSelected}
                                className="schoolgroup_btn_red schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.showConfirm}>批量删除</Button>
                        <span className="password_ts" style={{marginLeft: 8}}>
                            {hasSelected ? `选中 ${this.state.selectedRowKeys.length} 条记录` : ''}</span>
                    </div>
                    <Table rowSelection={rowSelection} columns={columns} dataSource={this.state.mesData}
                           pagination={false}
                    />
                </div>

                <AddRoleMemberModal isShow={this.state.addRoleModalIsShow} parentRole={this.state.parentRole}
                                    callbackParent={this.listStructures}
                                    roleId={this.state.roleId}></AddRoleMemberModal>
                <EditRoleModal isShow={this.state.editRoleModalIsShow}/>
            </div>
        );
    }
});

export default RoleComponents;
