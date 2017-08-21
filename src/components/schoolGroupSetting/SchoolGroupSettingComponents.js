import React, { PropTypes } from 'react';
import { Table,Icon,Button,Breadcrumb,message} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import NschoolGroupSettingComponents from './NschoolGroupSettingComponents';
import RoleComponents from './RoleComponents';

const columns = [{
    title: '部门名称',
    dataIndex: 'subGroupName',
    key: 'subGroupName',
},{
    title: '操作',
    dataIndex: 'opt',
    key: 'opt',
    width:'86px'
}];
const memberColumns = [{
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
    width:'120px'
},{
    title: '手机号',
    dataIndex: 'userPhone',
    key: 'userPhone'
}
];
var structuresObjArray=[];
var subGroupMemberList = [];
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
        var structureId = this.props.structureId;
        var rootStructure = this.props.rootStructure;
        this.setState({structureId,rootStructure});
        this.listStructures(structureId);
        structuresObjArray.splice(0);
    },

    componentWillReceiveProps(nextProps){
        var structureId = nextProps.structureId;
        var defaultPageNo = 1;
        //组织架构根目录（学校）
        var rootStructure = nextProps.rootStructure;
        var isExit = this.checkStructureIsExitAtArray(rootStructure);
        if(structuresObjArray.length>1){
            structuresObjArray.splice(1,structuresObjArray.length);
        }
        if(isEmpty(rootStructure)==false && isExit==false){
            //存放组织架构的层次关系
            structuresObjArray.push(rootStructure);
        }
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId,defaultPageNo);
        this.setState({structureId,rootStructure,structuresObjArray,"schoolSettingModalIsShow":false,"addSubGroupModalIsShow":false,"addGroupMemberModalIsShow":false,"groupSettingModalIsShow":false});
    },

    /**
     * 列举子部门
     * @param operateUserId
     * @param structureId
     */
    listStructures(structureId){
        let _this = this;
        var param = {
            "method": 'listStructures',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var subGroupList = [];
                if(isEmpty(response)==false){
                    response.forEach(function (subGroup) {
                        //var subGroupName = subGroup.name+"（"+subGroup.memberCount+ '人' +"）";
                        var subGroupName = <div onClick={_this.getSubGroupForButton.bind(_this,subGroup.id)}>
                            <span className="antnest_name affix_bottom_tc">{subGroup.name}</span>
                            <span className="schoolgroup_people">({subGroup.memberCount}人                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )</span>
                        </div>;
                        var opt = <div>
                                <Button className="shoolgroup_btn_sublevel" onClick={_this.getSubGroupForButton.bind(_this,subGroup.id)}><i className="iconfont schoolgroup_i_sublevel">&#xe7ee;</i></Button>
                                <Button className="sg_btn_del" icon="delete" onClick={_this.removeGroup.bind(_this,subGroup.id)}></Button>
                            </div>
                        subGroupList.push({
                            key: subGroup.id,
                            subGroupName: subGroupName,
                            opt:opt
                        });
                    });
                }
                _this.getStructureById(structureId);
                _this.setState({subGroupList,"addSubGroupModalIsShow":false,"addGroupMemberModalIsShow":false,"groupSettingModalIsShow":false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    listStructureAndMembers(structureId){
        var defaultPageNo = 1;
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId,defaultPageNo);
    },

    /**
     * 移除部门
     */
    removeGroup(structureId){
        let _this = this;
        var param = {
            "method": 'deleteStuctureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("部门删除成功！");
                    _this.listStructures(_this.state.structureId);
                    _this.getStrcutureMembers(_this.state.structureId,_this.state.memberPageNo);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取当前用户的组织根节点222
     * @param operateUserId
     * @param structureId
     */
    getStructureById(structureId){
        let _this = this;
        var param = {
            "method": 'getStructureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parentGroup = ret.response;
                var isExit = _this.checkStructureIsExitAtArray(parentGroup);
                if(isEmpty(parentGroup)==false && isExit==false){
                    //存放组织架构的层次关系
                    structuresObjArray.push(parentGroup);
                }
                _this.setState({parentGroup});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    checkStructureIsExitAtArray(newStructure){
        var isExit = false;
        for(var i=0;i<structuresObjArray.length;i++){
            var structure = structuresObjArray[i];
            if(structure.id == newStructure.id){
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
    getStrcutureMembers(structureId,pageNo){
        let _this = this;
        var param = {
            "method": 'getStrcutureMembers',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
            "pageNo":pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(isEmpty(response)==false){
                    response.forEach(function (member) {
                        var user = member.user;
                        subGroupMemberList.push({
                            key: member.id,
                            userName: user.userName,
                            userPhone:user.phoneNumber
                        });
                    });
                }
                var pager = ret.pager;
                _this.setState({subGroupMemberList,totalMember:pager.rsCount});
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
    getSubGroup(record, index){
        this.setState({structureId:record.key,schoolSettingModalIsShow:false,addSubGroupModalIsShow:false,addGroupMemberModalIsShow:false,"groupSettingModalIsShow":false});
        this.listStructures(record.key);
        this.getStrcutureMembers(record.key,this.state.memberPageNo);
    },

    /**
     * 点击部门时，获取部门下的成员
     * @param record
     * @param index
     */
    getSubGroupForButton(structureId){
        subGroupMemberList.splice(0);
        this.setState({structureId:structureId,schoolSettingModalIsShow:false,addSubGroupModalIsShow:false,addGroupMemberModalIsShow:false,"groupSettingModalIsShow":false});
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId,this.state.memberPageNo);
    },

    /**
     * 部门成员的数据分页
     * @param pageNo
     */
    memberPageOnChange(pageNo) {
        this.setState({
            memberPageNo: pageNo,
        });
        this.getStrcutureMembers(this.state.structureId,pageNo);
    },

    /**
     * 面包条点击响应
     * 切换到当前的组织架构层次，同时，在此面包条后的数据移除
     */
    breadCrumbClick(structureId){
        var defaultPageNo = 1;
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId,defaultPageNo);
        for(var i=0;i<structuresObjArray.length;i++){
            var structure = structuresObjArray[i];
            if(structure.id == structureId){
                structuresObjArray.splice(i,structuresObjArray.length);
                break;
            }
        }
        this.setState({structureId,structuresObjArray});
    },

    /**
     * 添加子部门
     */
    addSubGroup(){
        this.setState({"addSubGroupModalIsShow":true});
    },

    /**
     * 添加部门人员
     */
    addGroupMemeber(){
        this.setState({"addGroupMemberModalIsShow":true});
    },

    /**
     * 部门设置
     */
    groupSetting(){
        this.setState({"groupSettingModalIsShow":true});
    },
    /**
     * 学校设置
     */
    schoolSetting(){
        this.setState({schoolSettingModalIsShow:true});
    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys){
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({selectedRowKeys,schoolSettingModalIsShow:false,addSubGroupModalIsShow:false,addGroupMemberModalIsShow:false,"groupSettingModalIsShow":false});
    },

    /**
     * 部门成员加载更多
     */
    loadMoreMember(){
        var memberPageNo = parseInt(this.state.memberPageNo) + 1;
        this.memberPageOnChange(memberPageNo);
    },

    /**
     * 批量删除部门员工
     */
    batchDeleteMemeber(){
        var _this = this;
        var selectedRowKeys = _this.state.selectedRowKeys;
        var memberIds = "";
        if(isEmpty(selectedRowKeys)==false){
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
                    _this.getStrcutureMembers(_this.state.structureId,_this.state.memberPageNo);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        const rowSelection = {
            selectedRowKeys:_this.state.selectedRowKeys,
            onChange: _this.onSelectChange,
        };
        const hasSelected = _this.state.selectedRowKeys.length > 0;
        var structureName = "";
        if(isEmpty(_this.state.parentGroup)==false){
            structureName = _this.state.parentGroup.name;
        }
        var breadcrumbItemObjArray=[];
        if(isEmpty(_this.state.structuresObjArray)==false){
            _this.state.structuresObjArray.forEach(function (structure) {
                var breadcrumbItemObj = <Breadcrumb.Item key={structure.id} ><a onClick={_this.breadCrumbClick.bind(_this,structure.id)}>{structure.name}</a></Breadcrumb.Item>;
                breadcrumbItemObjArray.push(breadcrumbItemObj);
            });
        }
        var settingButton;
        if(isEmpty(_this.state.rootStructure)){
            settingButton = null;
        }else if(_this.state.structureId == _this.state.rootStructure.id){
            settingButton = <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn" onClick={this.schoolSetting}>设置</Button>
        }else{
            settingButton = <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn" onClick={this.groupSetting}>部门设置</Button>;
        }

        switch (this.props.roleItem) {

            default : // 组织构架
                this.tabComponent = <NschoolGroupSettingComponents structureId={this.state.structureId} rootStructure={this.state.rootStructure}></NschoolGroupSettingComponents>;
                break;
            case 'role':
                // 角色
                this.tabComponent = <RoleComponents/>;
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
