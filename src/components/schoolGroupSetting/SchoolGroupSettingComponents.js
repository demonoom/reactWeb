import React, { PropTypes } from 'react';
import { Table,Button,Breadcrumb} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {isEmpty} from '../../utils/utils';

const columns = [{
    title: '部门名称',
    dataIndex: 'subGroupName',
    key: 'subGroupName',
}];
const memberColumns = [{
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
},{
    title: '操作',
    dataIndex: 'userOpt',
    key: 'userOpt',
}
];
var structuresObjArray=[];
const SchoolGroupSettingComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser : loginUser,
            memberPageNo:1,
            structuresObjArray:[]
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
        this.setState({structureId,rootStructure,structuresObjArray});
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
                var parentGroup=null;
                if(isEmpty(response)==false){
                    response.forEach(function (subGroup) {
                        var subGroupName = subGroup.name+"("+subGroup.memberCount+")";
                        subGroupList.push({
                            key: subGroup.id,
                            subGroupName: subGroupName,
                        });
                        parentGroup = subGroup.parent;
                    });
                    var isExit = _this.checkStructureIsExitAtArray(parentGroup);
                    if(isEmpty(parentGroup)==false && isExit==false){
                        //存放组织架构的层次关系
                        structuresObjArray.push(parentGroup);
                    }
                }
                _this.setState({subGroupList});
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
                var subGroupMemberList = [];
                if(isEmpty(response)==false){
                    response.forEach(function (member) {
                        var user = member.user;
                        var userOpt = <Button icon="edit"></Button>
                        subGroupMemberList.push({
                            key: member.id,
                            userName: user.userName,
                            userOpt:userOpt
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
        this.setState({structureId:record.key});
        this.listStructures(record.key);
        this.getStrcutureMembers(record.key,this.state.memberPageNo);
    },

    /**
     * 部门成员的数据分页
     * @param pageNo
     */
    memberPageOnChange(pageNo) {
        this.getStrcutureMembers(this.state.structureId,pageNo);
        this.setState({
            memberPageNo: pageNo,
        });
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

    },

    /**
     * 添加部门人员
     */
    addGroupMemeber(){

    },

    /**
     * 部门设置
     */
    groupSetting(){

    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        var rootStructureName = "";
        if(isEmpty(_this.state.rootStructure)==false){
            rootStructureName = _this.state.rootStructure.schoolName;
        }
        var breadcrumbItemObjArray=[];
        if(isEmpty(_this.state.structuresObjArray)==false){
            _this.state.structuresObjArray.forEach(function (structure) {
                var breadcrumbItemObj = <Breadcrumb.Item key={structure.id}><a onClick={_this.breadCrumbClick.bind(_this,structure.id)}>{structure.name}</a></Breadcrumb.Item>;
                breadcrumbItemObjArray.push(breadcrumbItemObj);
            });
        }
        return (
            <div style={{overflow:'scroll'}}>
                <div>
                    <span>{rootStructureName}</span>
                    <Button>设置</Button>
                </div>
                <div>
                    <Breadcrumb>
                        {breadcrumbItemObjArray}
                    </Breadcrumb>
                </div>
                <div>
                    <div>下级部门</div>
                    <div>
                        <Button onClick={this.addSubGroup}>添加子部门</Button>
                        <Button onClick={this.groupSetting}>部门设置</Button>
                    </div>
                </div>
                <Table onRowClick={this.getSubGroup} showHeader={false} columns={columns} dataSource={this.state.subGroupList}
                       pagination={false}/>
                <div>
                    <div>部门人员</div>
                    <div>
                        <Button onClick={this.addGroupMemeber}>添加员工</Button>
                    </div>
                </div>
                <Table onRowClick={this.getSubGroup} showHeader={false} columns={memberColumns} dataSource={this.state.subGroupMemberList}
                       pagination={{
                           total: this.state.totalMember,
                           pageSize: getPageSize(),
                           onChange: this.memberPageOnChange
                       }} />
            </div>
        );
    },
});

export default SchoolGroupSettingComponents;
