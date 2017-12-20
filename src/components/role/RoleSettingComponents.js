import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Menu, Icon, Row, Col, Tabs, Button, message} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import AddRoleGroupModal from './AddRoleGroupModal';
import AddRoleModal from './AddRoleModal';
import EditRoleGroupModal from './EditRoleGroupModal';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TabPane = Tabs.TabPane;

var openKeysArr = [];

const RoleSettingComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            addSubGroupModalIsShow: false,
            addRoleModalIsShow: false,
            editRoleGroupIsShow: false,
        };
    },

    componentWillMount() {
        this.getStructureRoleGroups();
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        if (isEmpty(nextProps.roleName) == false && isEmpty(nextProps.roleId) == false) {
            var arr = this.state.part;
            var roleId = Number(nextProps.roleId);
            arr.forEach(function (v, i) {
                for (var i = 0; i < v.children.length; i++) {
                    if (v.children[i].id == roleId) {
                        v.children[i].name = nextProps.roleName
                    }
                }
            });
            this.buildMenuPart(arr);
        }
    },

    /**
     * 获取角色组
     * @param operateUserId
     * @param structureId
     */
    getStructureRoleGroups() {
        let _this = this;
        var param = {
            "method": 'getStructureRoleGroups',
            "operateUserId": _this.state.loginUser.colUid,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var part = ret.response;
                var defaultArr = [];
                part.forEach(function (v, i) {
                    openKeysArr.push(part[i].id + '#' + part[i].name);
                    if (v.createType > 0) {
                        defaultArr.push(v.id);
                    }
                });
                // _this.props.sendFirstId(part[0].children[0].id);
                // _this.props.sendDefaultId(defaultArr);
                // // 调用 渲染角色函数
                _this.buildMenuPart(part);
                _this.setState({part});
                _this.props.sendDefaultSelected(part[0].children[0].id + '#' + part[0].children[0].name);
                // // 设置一个默认ID
                // _this.setState({firstId:part[0].children[0].id});
                // _this.setState({selectedRoleKeyPath:part[0].id+ '#' + part[0].name});
                _this.setState({selectedRoleKeys: part[0].children[0].id + ',' + part[0].children[0].name + ',' + part[0].children[0].createType});
                // _this.props.onGhostMenuClick('role',part[0].children[0].id+','+part[0].children[0].name,part[0].id+ '#' + part[0].name);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /*渲染角色函数*/
    buildMenuPart(part) {
        console.log(part);
        let _this = this;
        var menuContent;
        var subRoleMenuItemArray = [];
        var openKeys = '';
        var partMenu = '';
        var menuItem = '';
        var arr = [];

        for (var i = 0; i < part.length; i++) {
            part[i].children.forEach(function (subGroup) {
                var menuItem = <Menu.Item key={subGroup.id + ',' + subGroup.name + ',' + subGroup.createType}>
                    <Icon type="user" className="schoolgroup_menu_i_blue name_max5_i"/>
                    <span className="name_max5 dold_text">{subGroup.name}</span>
                </Menu.Item>;
                subRoleMenuItemArray.push(menuItem);
            });
            if (i == 0) {
                partMenu = <SubMenu className="schoolgroup_menu_c" key={part[i].id + '#' + part[i].name}
                                    title={<span><Icon type="caret-down" className="framework_down_arrow"/>
                                        <i className="iconfont schoolgroup_menu_i_blue">&#xe67b;</i>
                                        <span>{part[i].name}</span></span>}>
                    {subRoleMenuItemArray}
                </SubMenu>;
            } else {
                partMenu = <SubMenu className="schoolgroup_menu_c" key={part[i].id + '#' + part[i].name}
                                    title={<span><Icon type="caret-down" className="framework_down_arrow"/>
                                        <i className="iconfont schoolgroup_menu_i_blue">&#xe67b;</i>
                                        <span>{part[i].name}</span>
                                        <Icon type="edit" className="i_framework_right"
                                              onClick={_this.editRole.bind(this, part[i].id, part[i].name, event)}/></span>}>
                    {subRoleMenuItemArray}
                </SubMenu>;
            }

            // 这个地方的partMenu是一个对象，将对象放到数组里面，然后把数组setState，去DOM那里取数组就能够依次渲染出来
            arr.push(partMenu);
            subRoleMenuItemArray = [];
        }
        _this.setState({arr, openKeys});
    },

    /**
     * 添加角色组
     */
    addSubGroup() {
        this.setState({"addSubGroupModalIsShow": true});
    },

    /*添加角色*/
    addRole() {
        var partLength = this.state.part.length;
        if (partLength <= 1) {
            message.error('请先添加角色组');
        } else {
            this.setState({"addRoleModalIsShow": true})
        }
    },

    /*编辑角色组*/
    editRole(id, name, event) {
        this.setState({"editRoleGroupIsShow": true});
        this.setState({"delRoleGroupId": id});
        this.setState({"delRoleGroupName": name});
        event.stopPropagation();
        event.preventDefault();
    },

    handleClickRole(e) {
        console.log(e);
        this.setState({
            selectedRoleKeys: e.key,
            selectedRoleKeyPath: e.keyPath
        });
        this.props.roleGroupClick(e.key, e.keyPath[1]);
    },

    closeModel() {
        this.setState({"addSubGroupModalIsShow": false});
        this.setState({"addRoleModalIsShow": false});
        this.setState({"editRoleGroupIsShow": false});

    },

    /**
     * 添加角色组
     */
    addSubGroup() {
        this.setState({"addSubGroupModalIsShow": true});
    },

    /*添加角色*/
    addRole() {
        var partLength = this.state.part.length;
        if (partLength <= 1) {
            message.error('请先添加角色组');
        } else {
            this.setState({"addRoleModalIsShow": true})
            this.refs.addRoleModal.getStructureRoleGroups();
        }
    },

    callBackNewRoleName(name, id) {
        var arr = this.state.part;
        arr.forEach(function (v, i) {
            if (v.id == id) {
                v.name = name
            }
        });
        this.buildMenuPart(arr);
    },

    callBackDelRoleId(id) {
        debugger
        var arr = this.state.part;
        arr.forEach(function (v, i) {
            if (v.id == id) {
                arr.splice(i, 1);
            }
        });
        this.buildMenuPart(arr);
    },

    addRoleGroupComplete() {
        this.getStructureRoleGroups()
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <span className="character_add">
                    <Button onClick={this.addSubGroup}>添加角色组</Button>
                    <Button className="add_out" onClick={this.addRole}>添加角色</Button>
                </span>
                <Menu
                    onClick={this.handleClickRole}
                    style={{width: 240}}
                    selectedKeys={[this.state.selectedRoleKeys]}
                    defaultOpenKeys={openKeysArr}
                    mode="inline"
                    className="framework_left_menu"
                >
                    {this.state.arr}
                </Menu>

                {/*引入添加角色组模态框*/}
                <AddRoleGroupModal isShow={this.state.addSubGroupModalIsShow}
                                   addRoleGroupComplete={this.addRoleGroupComplete}
                                   closeModel={this.closeModel}
                />
                {/*引入添加角色模态框*/}
                <AddRoleModal isShow={this.state.addRoleModalIsShow}
                              addRoleComplete={this.addRoleGroupComplete}
                              closeModel={this.closeModel}
                              ref="addRoleModal"
                />
                {/*引入编辑角色组模态框*/}
                <EditRoleGroupModal isShow={this.state.editRoleGroupIsShow}
                                    delRoleGroupId={this.state.delRoleGroupId}
                                    delRoleGroupName={this.state.delRoleGroupName}
                                    closeModel={this.closeModel}
                                    callBackNewRoleName={this.callBackNewRoleName}
                                    callBackDelRoleId={this.callBackDelRoleId}
                />
            </div>
        );
    }
});

export default RoleSettingComponents;
