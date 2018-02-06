import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Menu, Icon, Row, Col, Tabs, Button, message} from 'antd';
import {doWebService} from '../../WebServiceHelper';

const SubMenu = Menu.SubMenu;
var subMenuItemArray = [];
const StructureSettingComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
        };
    },

    componentWillMount() {
        this.getStructureById(false);
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {

    },

    delStructure(id) {
        var arr = this.state.currentStructureSon;
        arr.forEach(function (v, i) {
            if (v.id == id) {
                arr.splice(i, 1);
            }
        });
        this.buildMenuChildren(arr, this.state.currentStructure)
    },
    /**
     * 获取当前用户的组织根节点(组织架构菜单)
     * @param operateUserId
     * @param structureId
     */
    getStructureById(flag) {
        var structureId = "-1";
        var operateUserId = this.state.loginUser.colUid;
        let _this = this;

        var param = {
            "method": 'getStructureById',
            "operateUserId": operateUserId,
            "structureId": structureId,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var structure = ret.response;
                // _this.props.callbackParent(structure.id, structure);
                // 根据组织根节点的id请求该组织根节点里的子部门， 调用 列举子部门函数
                _this.listStructures(operateUserId, structure);
                _this.setState({structure});
                if (!flag) {
                    _this.props.passDefaultStructure(structure);
                }
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
    listStructures(operateUserId, structure) {
        let _this = this;
        var param = {
            "method": 'listStructures',
            "operateUserId": operateUserId,
            "structureId": structure.id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                // 调用 渲染组织根节点函数
                _this.buildMenuChildren(ret.response, structure);
                _this.setState({currentStructureSon: ret.response, currentStructure: structure})
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildMenuChildren(menuList, structure) {
        let _this = this;
        var menuContent;
        subMenuItemArray.splice(0);
        var openKeys = '';
        openKeys = '' + structure.id;
        menuList.forEach(function (subGroup) {
            var menuItem = <Menu.Item key={subGroup.id}>
                <i className="iconfont schoolgroup_menu_i_blue upexam_float">&#xe67b;</i>
                <span className="group_name dold_text">{subGroup.name}</span>
                <span>({subGroup.memberCount}人)</span>
            </Menu.Item>;
            subMenuItemArray.push(menuItem);
        });
        var subMenu = <SubMenu className="schoolgroup_menu_c" key={structure.id}
                               title={<span><Icon type="caret-down" className="schoolgroup_down_arrow"/><i
                                   className="iconfont schoolgroup_menu_i">&#xe6a0;</i><span>{structure.schoolName}</span></span>}>
            {subMenuItemArray}
        </SubMenu>;
        _this.setState({subMenu, openKeys});
    },

    handleClick(e) {
        alert('111');
        this.setState({
            selectedKeys: e.key,
        });
        this.props.onStructureMenuClick(e.key);
    },

    setSelectedKeys(id) {
        this.setState({
            selectedKeys: id,
        });
    },

    callBackChangeMsg(id, name) {
        var arr = this.state.currentStructureSon;
        arr.forEach(function (v, i) {
            if (v.id == id) {
                v.name = name;
            }
        });
        this.buildMenuChildren(arr, this.state.currentStructure)
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <Menu ref="middleMenu" onClick={this.handleClick}
                      selectedKeys={[this.state.selectedKeys]}
                      defaultOpenKeys={[this.state.openKeys]}
                      openKeys={[this.state.openKeys]}
                      className="cont_t"
                      mode="inline"
                >
                    {this.state.subMenu}
                </Menu>
            </div>
        );
    }
});

export default StructureSettingComponents;
