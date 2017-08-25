import React, { PropTypes } from 'react';
import NschoolGroupSettingComponents from './NschoolGroupSettingComponents';
import RoleComponents from './RoleComponents';
import {isEmpty} from '../../utils/utils';

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

    changeRightComponent(selectedKey,selectedRoleKeyPath){
        var selectedId = selectedKey;
        if(isEmpty(selectedId)){
            selectedId = this.props.selectedId;
        }
        var papaKey = selectedRoleKeyPath;
        if(isEmpty(papaKey)){
            papaKey = this.props.papaKey;
        }
        this.setState({selectedId,papaKey});
        // if(isEmpty(this.refs.roleComponents)==false){
        //     this.refs.roleComponents.loadDataWhenGhostMenuClick(selectedId);
        // }
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
                this.tabComponent = <RoleComponents selectedId={this.state.selectedId} onEditComplete={this.editRoleComplete} papaKey={this.state.papaKey} firstId={this.props.firstId}/>;
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
