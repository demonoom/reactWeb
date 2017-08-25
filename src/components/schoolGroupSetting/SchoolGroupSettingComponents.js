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

    componentDidMount(){
        var requestId;
        var requestObj;
        if(isEmpty(this.props.structureId)==false){
            requestId = this.props.structureId;
        }else{
            requestId = this.state.selectedId;
        }
        if(isEmpty(this.props.rootStructure)==false){
            requestObj = this.props.rootStructure;
        }else{
            requestObj = this.state.papaKey;
        }
        this.setState({requestId,requestObj});
    },

    editRoleComplete(roleId,roleName){
        this.props.onEditComplete(roleId,roleName);
    },

    changeRightComponent(selectedKey,selectedRoleKeyPath,currentItem){
        var requestId = selectedKey;
        if(isEmpty(requestId)){
            requestId = this.props.selectedId;
        }
        var requestObj = selectedRoleKeyPath;
        if(isEmpty(requestObj)){
            requestObj = this.props.papaKey;
        }
        this.setState({requestId,requestObj});
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
                this.tabComponent = <NschoolGroupSettingComponents structureId={this.state.requestId} rootStructure={this.state.requestObj}></NschoolGroupSettingComponents>;
                break;
            case 'role':
                // 角色
                this.tabComponent = <RoleComponents selectedId={this.state.requestId} onEditComplete={this.editRoleComplete} papaKey={this.state.requestObj} firstId={this.props.firstId}/>;
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
