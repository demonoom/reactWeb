import React, {PropTypes} from 'react';
import {Table, Icon, Button, Breadcrumb, message, Modal} from 'antd';
import AddRoleMemberModal from './AddRoleMemberModal';
import {doWebService} from '../../WebServiceHelper';
import EditRoleModal from './EditRoleModal'

const confirm = Modal.confirm;

const columns = [{
    title: '姓名',
    dataIndex: 'name',
}, {
    title: '部门',
    dataIndex: 'group',
}, {
    title: '手机号',
    dataIndex: 'phone',
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
            deleteData:[],
            mermberNum:0
        };
    },

    componentDidMount() {
        var selectedMessage = this.props.selectedId;
        var arr = selectedMessage.split(',');
        this.setState({roleId: arr[0]});
        this.setState({roleName: arr[1]});
        var papaKey = this.props.papaKey;
        var papaArr = papaKey.split('#');
        this.setState({papaName:papaArr[1]});
    },

    componentWillReceiveProps(nextProps) {
        var selectedMessage = nextProps.selectedId;
        console.log('哈哈');
        console.log(nextProps.selectedId);
        // console.log('哈哈哈');
        // console.log(selectedMessage);
        var arr = selectedMessage.split(',');
        this.setState({roleId: arr[0]});
        this.setState({roleName: arr[1]});
        this.ajaxData(arr[0]);
        var papaKey = nextProps.papaKey;
        var papaArr = papaKey.split('#');
        this.setState({papaName:papaArr[1]});
    },

    ajaxData(roleId){
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
        _this.setState({deleteData:data});
        _this.setState({mermberNum:mermberNum});
        var mesData = [];
        data.forEach(function (v, i) {
            var person = {
                key: v.colUid,
                name: v.userName,
                group: v.schoolName,
                phone: v.phoneNumber,
            }
            mesData.push(person);
        });
        _this.setState({mesData,selectedRowKeys:[]});
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
                            _this.ajaxData();
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
     * 编辑角色名称完成后的回调操作
     * @param roleId 角色的id
     * @param roleName 角色的名称
     */
    editRoleComplete(roleId,roleName){
        //设置编辑角色Modal的显示状态为false，不再显示
        this.setState({"roleName":roleName,"editRoleModalIsShow":false});
        this.props.onEditComplete(roleId,roleName);
    },
    /**
     * 编辑角色时取消和关闭时候的回调
     */
    closeModel(){
        this.setState({"editRoleModalIsShow":false});
    },
    /**
     * 添加成员的回调
     */
    addRoleComplete(){
        this.ajaxData();
        this.setState({"addRoleModalIsShow":false});
    },
    /**
     * 添加成员时取消和关闭的回调
     */
    closeAddModel(){
        this.setState({"addRoleModalIsShow":false});
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
                    <span>{this.state.roleName}</span>&nbsp;&nbsp;&nbsp;&nbsp;
                    <span>(<span>{this.state.mermberNum}</span>人)</span>
                    <span>
                        <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.editRole}>编辑</Button>
                    </span>
                </div>

                <div className="framework_r_height">
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
                    <Table className="framework_user" rowSelection={rowSelection} columns={columns} dataSource={this.state.mesData}
                           pagination={false}
                    />
                </div>

                <AddRoleMemberModal isShow={this.state.addRoleModalIsShow} parentRole={this.state.parentRole}
                                    callbackParent={this.listStructures}
                                    roleId={this.state.roleId}
                                    addRoleComplete={this.addRoleComplete}
                                    closeAddModel={this.closeAddModel}
                ></AddRoleMemberModal>
                <EditRoleModal isShow={this.state.editRoleModalIsShow} roleId={this.state.roleId}
                               roleName={this.state.roleName}
                               onEditComplete={this.editRoleComplete}
                               closeModel={this.closeModel}
                               papaName={this.state.papaName}
                />
            </div>
        );
    }
});

export default RoleComponents;
