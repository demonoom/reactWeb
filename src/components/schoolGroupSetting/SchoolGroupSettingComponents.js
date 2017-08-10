import React, { PropTypes } from 'react';
import { Table,Icon,Button,Breadcrumb,message} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {isEmpty} from '../../utils/utils';
import SchoolSettingModal from './SchoolSettingModal';
import AddSubGroupModal from './AddSubGroupModal';
import AddGroupMemberModal from './AddGroupMemberModal';
import GroupSettingModal from './GroupSettingModal';

const columns = [{
    title: '部门名称',
    dataIndex: 'subGroupName',
    key: 'subGroupName',
},{
    title: '操作',
    dataIndex: 'opt',
    key: 'opt',
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
                            <span>{subGroup.name}</span>
                            <span className="schoolgroup_people">({subGroup.memberCount}人                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )</span>
                        </div>;
                        var opt = <div>
                                <Button icon="down" onClick={_this.getSubGroupForButton.bind(_this,subGroup.id)}></Button>
                                <Button icon="delete" onClick={_this.removeGroup.bind(_this,subGroup.id)}></Button>
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
     * 获取当前用户的组织根节点
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
                }else{
                    message.warn("没有更多可用数据");
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
            "method": 'deleteStuctureById',
            "operateUserId": _this.state.loginUser.colUid,
            "memberIds": memberIds,
        };
        /*doWebService(JSON.stringify(param), {
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
        });*/
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
        return (
            <div className="schoolgroup">
                <div className="schoolgroup_title">
                    <span>{structureName}</span>
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
                        <Button className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn" onClick={this.addSubGroup}>添加子部门</Button>
                    </span>
                </div>
                <div>
                <Table showHeader={false} columns={columns} dataSource={this.state.subGroupList} className="schoolgroup_table"
                       pagination={false}/>
                </div>
                <div className="schoolgroup_title">
                    <i className="iconfont schoolgroup_i">&#xe61b;</i>
                    <span>部门人员1111</span>
                    <span>
                        <Button onClick={this.addGroupMemeber} className="schoolgroup_btn_blue_solid schoolgroup_btn_left schoolgroup_btn">添加员工</Button>
                        <span className="schoolgroup_btn_left">
                            <Button
                                type="primary"
                                onClick={this.batchDeleteMemeber}
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
                    <Table rowSelection={rowSelection} columns={memberColumns} pagination={false} dataSource={this.state.subGroupMemberList} className="schoolgroup_table schoolgroup_table_department"/>
                    <div className="schoolgroup_operate schoolgroup_more">
                        <a onClick={this.loadMoreMember} className="schoolgroup_more_a">加载更多</a>
                    </div>
                </div>
                <SchoolSettingModal isShow={this.state.schoolSettingModalIsShow} rootStructure={this.state.rootStructure}></SchoolSettingModal>
                <AddSubGroupModal isShow={this.state.addSubGroupModalIsShow} parentGroup={this.state.parentGroup} callbackParent={this.listStructures}></AddSubGroupModal>
                <AddGroupMemberModal isShow={this.state.addGroupMemberModalIsShow} parentGroup={this.state.parentGroup} callbackParent={this.listStructures}></AddGroupMemberModal>
                <GroupSettingModal isShow={this.state.groupSettingModalIsShow} parentGroup={this.state.parentGroup} ></GroupSettingModal>
            </div>
        );
    },
});

export default SchoolGroupSettingComponents;
