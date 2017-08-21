import React, { PropTypes } from 'react';
import { Table,Icon,Button,Breadcrumb,message} from 'antd';
import AddRoleMemberModal from './AddRoleMemberModal';

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
const data = [];
for (let i = 0; i < 46; i++) {
    data.push({
        key: i,
        name: `Edward King ${i}`,
        age: 32,
        address: `London, Park Lane no. ${i}`,
    });
}
var structuresObjArray=[];
var subGroupMemberList = [];
const RoleComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            memberPageNo:1,
            structuresObjArray:[],
            schoolSettingModalIsShow:false,
            addRoleModalIsShow:false,
            selectedRowKeys:[],
            addGroupMemberModalIsShow:false,
            groupSettingModalIsShow:false,
            loading: false
        };
    },

    componentDidMount(){
    },

    componentWillReceiveProps(nextProps){

    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys){
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({selectedRowKeys});
    },

    addRoleMember(){
        this.setState({addRoleModalIsShow:true});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const rowSelection = {
            selectedRowKeys:this.state.selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = this.state.selectedRowKeys.length > 0;
        return (
            <div className="schoolgroup">
                <div className="schoolgroup_title">
                    {/*<span>{structureName}</span>*/}
                    {/*{settingButton}*/}
                    <span>年级组长（1人）</span>
                    <span>
                        <Button className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn" onClick={this.addSubGroup}>编辑</Button>
                    </span>
                </div>
                <div className="schoolgroup_title">
                    <span>
                        <Button className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn" onClick={this.addRoleMember}>添加成员</Button>
                    </span>
                    <span>

                    </span>
                </div>

                <div>
                    <div style={{ marginBottom: 16 }}>
                        <Button disabled={!hasSelected}
                                className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.addSubGroup}>批量删除</Button>
                        <span className="password_ts" style={{ marginLeft: 8 }}>
                            {hasSelected ? `选中 ${this.state.selectedRowKeys.length} 条记录` : ''}</span>
                    </div>
                    <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
                </div>

                <AddRoleMemberModal isShow={this.state.addRoleModalIsShow} parentRole={this.state.parentRole} callbackParent={this.listStructures}></AddRoleMemberModal>
            </div>
        );
    }
});

export default RoleComponents;
