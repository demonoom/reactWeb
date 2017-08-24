import React, { PropTypes } from 'react';
import NschoolGroupSettingComponents from './NschoolGroupSettingComponents';
import RoleComponents from './RoleComponents';

const SchoolGroupSettingComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            memberPageNo:1,
            structuresObjArray:[],
            schoolSettingModalIsShow:false,
            addSubGroupModalIsShow:false,
            selectedRowKeys:[],
            addGroupMemberModalIsShow:false,
            groupSettingModalIsShow:false
        };
    },

    editRoleComplete(roleId,roleName){
        this.props.onEditComplete(roleId,roleName);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        switch (this.props.currentItem) {
            default : // 组织构架
                this.tabComponent = <NschoolGroupSettingComponents structureId={this.props.structureId} rootStructure={this.props.rootStructure}></NschoolGroupSettingComponents>;
                break;
            case 'role':
                // 角色
                this.tabComponent = <RoleComponents selectedId={this.props.selectedId} onEditComplete={this.editRoleComplete} papaKey={this.props.papaKey}/>;
                break;
        }
        return (
            <div>
                {this.tabComponent}
            </div>
        );
    }
});

export default SchoolGroupSettingComponents;
