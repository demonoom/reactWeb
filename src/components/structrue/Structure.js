import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Button, Breadcrumb, message, Modal} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import AddGroupMemberModal from './AddGroupMemberModal';
import AddSubGroupModal from './AddSubGroupModal';
import ConfirmModal from '../ConfirmModal';
import SchoolSettingModal from './SchoolSettingModal';
import GroupSettingModal from './GroupSettingModal';

const confirm = Modal.confirm;

const columns = [{
    title: '部门名称',
    dataIndex: 'subGroupName',
    key: 'subGroupName',
}, {
    title: '操作',
    dataIndex: 'opt',
    key: 'opt',
    width: '86px'
}];

const memberColumns = [{
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: '120px',
    className: 'dold_text departmental_officer'
}, {
    title: '手机号',
    dataIndex: 'userPhone',
    key: 'userPhone',
},{
    title: '',
    dataIndex: 'isMaster',
    key: 'isMaster'
}
];

var structuresObjArray = [];   //面包条数组
var subGroupMemberList = [];
var currentStructureMember = [];   //当前人员

const Structure = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            memberPageNo: 1,   //默认分页
            selectedRowKeys: [],  //默认选中的人员数组
            addGroupMemberModalIsShow: false,    //添加员工model 默认隐藏
            addSubGroupModalIsShow: false,   //添加子部门model  默认隐藏
            schoolSettingModalIsShow: false,  //学校设置model  默认隐藏
            groupSettingModalIsShow: false,   //部门设置model  默认隐藏
        };
    },

    componentDidMount() {
        // this.listStructures(-1);
    },

    componentWillReceiveProps(nextProps) {
        if (isEmpty(nextProps.passDefaultStructure) == false) {
            var defaultStructure = nextProps.passDefaultStructure;
            var isExit = this.checkStructureIsExitAtArray(defaultStructure);
            if (isExit == false) {
                //存放组织架构的层次关系
                structuresObjArray.push(defaultStructure);
            }
            structuresObjArray.splice(1, structuresObjArray.length - 1);
            this.setState({
                rootGroup: defaultStructure,
                parentGroup: defaultStructure,
                structureId: defaultStructure.id,
                structuresObjArray    //面包条数组
            });   //部门和部门id   这个部门是学校obj
            //列举子部门
            this.listStructures(defaultStructure.id, false);
            // 根据部门id获取部门成员
            this.getStrcutureMembers(defaultStructure.id, this.state.memberPageNo, false);
        }
        // if (isEmpty(nextProps.onStructureMenuClick) == false) {
        //     var id = nextProps.onStructureMenuClick;
        //     this.getSubGroupForButton(id, true);
        // }
    },

    /**
     * 删除子部门
     */
    batchDeleteGroup() {
        let _this = this;
        var removeGroupId = _this.state.removeGroupId;
        var param = {
            "method": 'deleteStuctureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": _this.state.removeGroupId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("部门删除成功！");
                    // _this.listStructures(_this.state.parentGroup.id);
                    // _this.getStrcutureMembers(_this.state.parentGroup.id, _this.state.memberPageNo);
                    var arr = _this.state.currentStructure;
                    if (arr[0].parentId == _this.state.rootGroup.id) {
                        _this.props.delStructure(removeGroupId);
                    }
                    arr.forEach(function (v, i) {
                        if (v.id == removeGroupId) {
                            arr.splice(i, 1)
                        }
                    })
                    _this.buildStructures(arr);
                } else {
                    message.error(ret.msg)
                }
                _this.closeConfirmModalIcon();
                // var root;
                // root = structuresObjArray[0].id;
                // if(root == _this.state.parentGroup.id){
                //     _this.props.addSubGroupComplete();
                // }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 列举子部门
     * @param operateUserId
     * @param structureId
     */
    listStructures(structureId, flag) {
        let _this = this;
        var param = {
            "method": 'listStructures',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildStructures(response);
                _this.setState({currentStructure: response});   //当前的子部门数组
                // if (flag) {
                //     var parentGroup = ret.response[0].parent;
                //     if (isEmpty(parentGroup) == false) {
                //         var isExit = _this.checkStructureIsExitAtArray(parentGroup);
                //         if (isExit == false) {
                //             //存放组织架构的层次关系
                //             structuresObjArray.push(parentGroup);   //面包条数组
                //         }
                //     }
                //     _this.setState({parentGroup, structuresObjArray});
                // }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 构建子部门
     */
    buildStructures(response) {
        var _this = this;
        var subGroupList = [];
        if (isEmpty(response) == false) {
            response.forEach(function (subGroup) {
                var subGroupName = <div className="first_indent"
                                        onClick={_this.getSubGroupForButton.bind(_this, subGroup.id, false)}>
                    <span className="antnest_name affix_bottom_tc name_max3 dold_text">{subGroup.name}</span>
                    <span className="schoolgroup_people name_max_last">({subGroup.memberCount}人                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                )</span>
                </div>;
                var opt = <div className="knowledge_ri">
                    <Button className="sg_btn_del" icon="delete"
                            onClick={_this.removeGroup.bind(_this, subGroup.id)}></Button>
                </div>

                subGroupList.push({
                    key: subGroup.id,
                    subGroupName: subGroupName,
                    opt: opt
                });
            });
        }
        this.setState({subGroupList});
    },

    /**
     * 获取组织根节点
     * @param operateUserId
     * @param structureId
     */
    getStructureById(structureId) {
        let _this = this;
        var structureId = structureId + '';

        if (isEmpty(structureId)) {
            structureId = "-1";
        }
        ;

        var param = {
            "method": 'getStructureById',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parentGroup = ret.response;
                var owner= parentGroup.chatGroup.owner.colUid;
                console.log(999);
                console.log(owner);
                if (isEmpty(parentGroup) == false) {
                    var isExit = _this.checkStructureIsExitAtArray(parentGroup);
                    if (isExit == false) {
                        //存放组织架构的层次关系
                        structuresObjArray.push(parentGroup);   //面包条数组
                    }
                }
                _this.setState({parentGroup, structuresObjArray,owner});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据部门id获取部门成员
     * @param operateUserId
     * @param structureId
     */
    getStrcutureMembers(structureId, pageNo, flag) {
        let _this = this;
        var structureId = structureId + '';

        if (structureId.indexOf(',') !== -1) {
            var structureIdArr = structureId.split(',');
            structureId = structureIdArr[0];
        }
        var param = {
            "method": 'getStrcutureMembers',
            "operateUserId": _this.state.loginUser.colUid,
            "structureId": structureId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                // if (isEmpty(response) == false) {
                _this.buildStrcutureMembers(response, flag);
                // }
                var pager = ret.pager;
                _this.setState({totalMember: pager.rsCount});
                if (!flag) {
                    currentStructureMember.splice(0)
                }
                if (isEmpty(response) == false) {
                    response.forEach(function (v, i) {
                        currentStructureMember.push(v)
                    })
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 渲染部门成员
     */
    buildStrcutureMembers(response, flag) {
        var _this = this;
        if (!flag) {    //分页请求传的是true
            subGroupMemberList.splice(0);   //部门人员数组先清空,之后重新push
        }
        if (isEmpty(response) == false) {
            console.log(subGroupMemberList);
            response.forEach(function (member) {
                var user = member.user;
                var owner = _this.state.owner;
                if(owner==user.colUid){
                    subGroupMemberList.push({
                        key: member.id,
                        userId: user.colUid,
                        userName: user.userName,
                        userPhone:user.phoneNumber,
                        isMaster:'主管'
                    });

                }else {
                    subGroupMemberList.push({
                        key: member.id,
                        userId: user.colUid,
                        userName: user.userName,
                        userPhone:user.phoneNumber,

                    });
                }
            });

        }
        this.setState({subGroupMemberList, selectedRowKeys: []});//selectedRowKeys设置成[]可以清除默认勾选
    },

    /**
     * 确定删除部门员工
     */
    batchDeleteMemeber() {
        var _this = this;
        var selectedRowKeys = _this.state.selectedRowKeys;
        var memberIds = "";
        if (isEmpty(selectedRowKeys) == false) {
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
                    // _this.getStrcutureMembers(_this.state.structureId, _this.state.memberPageNo);
                    _this.setState({selectedRowKeys: []});
                    _this.closeConfirmModal();
                    for (var i = 0; i < selectedRowKeys.length; i++) {
                        currentStructureMember.forEach(function (v, j) {
                            if (selectedRowKeys[i] == v.id) {
                                currentStructureMember.splice(j, 1)
                            }
                        })
                    }
                    _this.buildStrcutureMembers(currentStructureMember, false)
                    _this.props.refreshLeft(true);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 添加子部门
     */
    addSubGroup() {
        this.setState({"addSubGroupModalIsShow": true});
    },

    /**
     * 子部门被点击的方法
     */
    getSubGroupForButton(structureId, flag) {
        if (flag) {   //点击左侧列表的时候传的是true  面包条只保留学校
            structuresObjArray.splice(1, structuresObjArray.length - 1)
        }
        var memberPageNo = 1;
        var defaultMemberPageNo = 1;
        this.setState({
            structureId: structureId,
            // schoolSettingModalIsShow: false,
            // addSubGroupModalIsShow: false,
            // addGroupMemberModalIsShow: false,
            // "groupSettingModalIsShow": false,
            memberPageNo: defaultMemberPageNo
        });
        this.listStructures(structureId, true);     //列举子部门
        this.getStructureById(structureId);   //获取组织架构obj
        this.getStrcutureMembers(structureId, memberPageNo, false);    //获取部门成员   false清空原数组
        this.props.passstructureIdToLeft(structureId)
    },

    checkStructureIsExitAtArray(newStructure) {
        var isExit = false;
        for (var i = 0; i < structuresObjArray.length; i++) {
            var structure = structuresObjArray[i];
            if (structure.id == newStructure.id) {
                isExit = true;
                break;
            }
        }
        return isExit;
    },

    removeGroup(structureId) {
        this.showConfirmModalIcon();
        this.setState({removeGroupId: structureId});
    },

    /**
     * 添加员工
     */
    addGroupMemeber() {
        this.setState({"addGroupMemberModalIsShow": true});
    },

    /**
     * 批量删除
     */
    showConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 删除子部门
     */
    showConfirmModalIcon() {
        this.refs.confirmModalIcon.changeConfirmModalVisible(true);
    },

    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    closeConfirmModalIcon() {
        this.refs.confirmModalIcon.changeConfirmModalVisible(false);
    },

    /**
     * 删除部门员工model隐藏
     */
    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 部门员工加载更多的回调
     */
    loadMoreMember() {
        var memberPageNo = parseInt(this.state.memberPageNo) + 1;
        this.memberPageOnChange(memberPageNo);
    },

    /**
     * 部门成员的数据分页
     * @param pageNo
     */
    memberPageOnChange(pageNo) {
        this.setState({
            memberPageNo: pageNo,
        });
        this.getStrcutureMembers(this.state.structureId, pageNo, true);
    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({
            selectedRowKeys,
            // schoolSettingModalIsShow: false,
            // addSubGroupModalIsShow: false,
            // addGroupMemberModalIsShow: false,
            // "groupSettingModalIsShow": false
        });
    },

    /**
     * 员工添加完成的回调
     */
    listStructureAndMembers(structureId) {
        var defaultPageNo = 1;
        this.getStrcutureMembers(structureId, defaultPageNo, false);
        //表示在根目录下添加的部门
        this.props.refreshLeft(true);
    },

    /**
     * 初始化model
     */
    initModalStatus() {
        this.setState({
            "groupSettingModalIsShow": false,
            "addGroupMemberModalIsShow": false,
            "addSubGroupModalIsShow": false,
            "schoolSettingModalIsShow": false
        });
    },

    /**
     * 学校设置
     */
    schoolSetting() {
        this.setState({schoolSettingModalIsShow: true});
    },

    /**
     * 部门设置
     */
    groupSetting() {
        this.setState({groupSettingModalIsShow: true});
    },

    /**
     * 面包条被点击的响应
     * 切换到当前的组织架构层次，同时，在此面包条后的数据移除
     */
    breadCrumbClick(structureId) {
        var defaultPageNo = 1;
        this.listStructures(structureId, true);   //列举子部门
        this.getStructureById(structureId);    //可以优化点
        this.getStrcutureMembers(structureId, defaultPageNo, false);   //获取部门成员   false清空原数组
        for (var i = 0; i < structuresObjArray.length; i++) {
            var structure = structuresObjArray[i];
            if (structure.id == structureId) {
                structuresObjArray.splice(i, structuresObjArray.length);
                break;
            }
        }
        var defaultMemberPageNo = 1;
        this.setState({"structureId": structureId, structuresObjArray, "memberPageNo": defaultMemberPageNo});
    },

    /**
     * 部门添加成功
     */
    addSubGroupComplete(id) {
        var rootId = this.state.rootGroup.id;
        if (rootId == id) {
            //表示在根目录下添加的部门
            this.props.refreshLeft(false);   //传false同步回来
        }
    },

    /**
     * 部门修改成功
     */
    callBackChangeMsg(id, name) {
        this.props.callBackChangeMsg(id, name)
        var obj = this.state.parentGroup;
        obj.name = name;
        this.setState({parentGroup: obj})
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        const rowSelection = {
            selectedRowKeys: _this.state.selectedRowKeys,
            onChange: _this.onSelectChange,
        };

        const hasSelected = _this.state.selectedRowKeys.length > 0;

        var structureName = "";
        if (isEmpty(_this.state.parentGroup) == false) {
            structureName = _this.state.parentGroup.name;
        }

        var breadcrumbItemObjArray = [];
        if (isEmpty(_this.state.structuresObjArray) == false) {    //面包条数组
            _this.state.structuresObjArray.forEach(function (structure) {
                var breadcrumbItemObj = <Breadcrumb.Item key={structure.id}><a
                    onClick={_this.breadCrumbClick.bind(_this, structure.id)}>{structure.name}</a></Breadcrumb.Item>;
                breadcrumbItemObjArray.push(breadcrumbItemObj);
            });
        }

        var settingButton;
        if (isEmpty(_this.state.rootGroup)) {
            settingButton = null;
        } else if (_this.state.structureId == _this.state.rootGroup.id) {
            settingButton = <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                                    onClick={this.schoolSetting}>设置</Button>
        } else {
            settingButton = <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                                    onClick={this.groupSetting}>部门设置</Button>;
        }

        return (
            <div className="schoolgroup">
                <div className="schoolgroup_title">
                    <span className="name_max4 dold_text">{structureName}</span>
                    {settingButton}
                </div>

                {/*面包条*/}
                <div>
                    <Breadcrumb separator=">">
                        {breadcrumbItemObjArray}
                    </Breadcrumb>
                </div>

                <div className="schoolgroup_title">
                    <i className="iconfont schoolgroup_i">&#xe6a0;</i>
                    <span>下级部门</span>
                    <span>
                        <Button className="schoolgroup_btn_blue schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.addSubGroup}>添加子部门</Button>
                    </span>
                </div>

                {/*子部门表格*/}
                <div>
                    <Table showHeader={false} columns={columns} dataSource={this.state.subGroupList}
                           className="schoolgroup_table"
                           pagination={false}/>
                </div>

                <div className="schoolgroup_title">
                    <i className="iconfont schoolgroup_i ">&#xe61b;</i>
                    <span>部门人员</span>
                    <span>
                        <Button onClick={this.addGroupMemeber}
                                className="schoolgroup_btn_blue_solid schoolgroup_btn_left schoolgroup_btn">添加员工</Button>
                        <span className="schoolgroup_btn_left">
                            <Button
                                type="primary"
                                onClick={this.showConfirmModal}
                                disabled={!hasSelected} className="schoolgroup_btn_red schoolgroup_btn">
                                批量删除
                            </Button>
                            <span className="password_ts" style={{marginLeft: 8}}>
                                {hasSelected ? `选中 ${_this.state.selectedRowKeys.length} 条记录` : ''}
                            </span>
                        </span>
                    </span>
                </div>

                {/*部门员工table*/}
                <div>
                    <Table rowSelection={rowSelection} columns={memberColumns}
                           pagination={false} dataSource={this.state.subGroupMemberList}
                           className="schoolgroup_table1 schoolgroup_table_department"/>
                    <div className="schoolgroup_operate schoolgroup_more">
                        <a onClick={this.loadMoreMember} className="schoolgroup_more_a">加载更多</a>
                    </div>
                </div>

                {/*添加员工model*/}
                <AddGroupMemberModal isShow={this.state.addGroupMemberModalIsShow}
                                     parentGroup={this.state.parentGroup}
                                     callbackParent={this.listStructureAndMembers}
                                     onCancel={this.initModalStatus}
                                     addedUserData={this.state.subGroupMemberList}
                ></AddGroupMemberModal>

                {/*添加子部门model*/}
                <AddSubGroupModal isShow={this.state.addSubGroupModalIsShow}
                                  parentGroup={this.state.parentGroup}
                                  callbackParent={this.listStructures}
                                  onCancel={this.initModalStatus}
                                  addSubGroupComplete={this.addSubGroupComplete}
                ></AddSubGroupModal>

                {/*学校设置model*/}
                <SchoolSettingModal isShow={this.state.schoolSettingModalIsShow}
                                    rootStructure={this.state.parentGroup}
                                    onCancel={this.initModalStatus}></SchoolSettingModal>

                {/*部门设置model*/}
                <GroupSettingModal isShow={this.state.groupSettingModalIsShow} parentGroup={this.state.parentGroup}
                                   onCancel={this.initModalStatus}
                                   callBackChangeMsg={this.callBackChangeMsg}
                ></GroupSettingModal>

                <ConfirmModal ref="confirmModal"
                              title="确定要删除选中的部门员工?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.batchDeleteMemeber}
                ></ConfirmModal>

                <ConfirmModal
                    ref="confirmModalIcon"
                    title="确定删除?"
                    onConfirmModalCancel={this.closeConfirmModalIcon}
                    onConfirmModalOK={this.batchDeleteGroup}
                />
            </div>
        );
    }
});

export default Structure;
