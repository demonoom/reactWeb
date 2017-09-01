import React, { PropTypes } from 'react';
import NschoolGroupSettingComponents from './NschoolGroupSettingComponents';
import RoleComponents from './RoleComponents';
import OpenNewPage from '../OpenNewPage'
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
         requestId = this.props.structureId;
         requestObj = this.props.rootStructure;
        this.setState({requestId,requestObj});
    },

    editRoleComplete(roleId,roleName,refresh){
        this.props.onEditComplete(roleId,roleName,refresh);
    },
    addSubGroupComplete(){
        this.props.addSubGroupComplete();
    },

    changeRightComponent(selectedKey,selectedRoleKeyPath,currentItem){
        var requestId = selectedKey;
        var requestObj = selectedRoleKeyPath;
        if(currentItem=="origin"){
            /*if(isEmpty(requestId)){
                requestId = this.props.structureId;
            }

            if(isEmpty(requestObj)){
                requestObj = this.props.rootStructure;
            }*/
        }else{
            if(isEmpty(requestId)){
                requestId = this.props.selectedId;
            }

            if(isEmpty(requestObj)){
                requestObj = this.props.papaKey;
            }
        }
        this.setState({requestId,requestObj});//257,256#默认
        // if(isEmpty(this.refs.roleComponents)==false){
        //     this.refs.roleComponents.loadDataWhenGhostMenuClick(selectedId);
        // }
        if(isEmpty(this.refs.nSchool)==false){
            this.refs.nSchool.changeStructureData(requestId);
        }
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        switch (this.props.currentItem) {
            default :

                // this.tabComponent = null;
                this.tabComponent=<div className="userinfo_bg_1"><span>科技改变未来，教育成就梦想</span></div>;
                break;
            case 'role':
                // 角色
                this.tabComponent = <RoleComponents selectedId={this.state.requestId} onEditComplete={this.editRoleComplete} papaKey={this.state.requestObj} firstId={this.props.firstId} defaultId={this.props.defaultId}/>;
                break;
            case 'origin':
                // 组织结构
                this.tabComponent = <NschoolGroupSettingComponents ref="nSchool"
                                                                   structureId={this.state.requestId}
                                                                   rootStructure={this.state.requestObj}
                                                                   addSubGroupComplete={this.addSubGroupComplete}
                ></NschoolGroupSettingComponents>;
                break;
            case 'stop':
                this.tabComponent = <OpenNewPage/>;
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
