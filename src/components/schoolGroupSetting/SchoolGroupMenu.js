/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col ,Tabs ,Button} from 'antd';
import React, {PropTypes} from 'react';
import {doWebService} from '../../WebServiceHelper';
import AddRoleGroupModal from './AddRoleGroupModal';
import AddRoleModal from './AddRoleModal';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const TabPane = Tabs.TabPane;
function callback(key) {
    console.log(key);
}
var subMenuItemArray=[];
class SchoolGroupMenu extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser : loginUser,
            selectedKeys:[],
            addSubGroupModalIsShow:false,
            addRoleModalIsShow:false,
            beActive:true

        }
        // 使用extends创建的组件使用方法要在构造器中bind一下
        this.getStructureById = this.getStructureById.bind(this);
        this.getStructureRoleGroups = this.getStructureRoleGroups.bind(this);
        this.buildMenuChildren = this.buildMenuChildren.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClickRole = this.handleClickRole.bind(this);
        this.addSubGroup = this.addSubGroup.bind(this);
        this.addRole = this.addRole.bind(this);
    }

    componentDidMount(){
        var structureId = "-1";
        var operateUserId = this.state.loginUser.colUid;
        // 渲染到DOM后 调用 获取组织根节点函数
        this.getStructureById(operateUserId,structureId);
        // 渲染到DOM后 调用 获取角色组函数
        this.getStructureRoleGroups(operateUserId,structureId);
    }

    /**
     * 获取当前用户的组织根节点(组织架构菜单)
     * @param operateUserId
     * @param structureId
     */
    getStructureById(operateUserId, structureId){
        let _this = this;
        var param = {
            "method": 'getStructureById',
            "operateUserId": operateUserId,
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                //_this.buildMenuChildren(ret.response);
                var structure = ret.response;
                _this.props.callbackParent(structure.id,structure);
                // 根据组织根节点的id请求该组织根节点里的子部门， 调用 列举子部门函数
                _this.listStructures(operateUserId,structure);
                _this.setState({structure});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 列举子部门
     * @param operateUserId
     * @param structureId
     */
    listStructures(operateUserId,structure){
        let _this = this;
        var param = {
            "method": 'listStructures',
            "operateUserId": operateUserId,
            "structureId": structure.id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                // 调用 渲染组织根节点函数
                _this.buildMenuChildren(ret.response,structure);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /*渲染组织根节点函数*/
    buildMenuChildren (menuList,structure) {
        let _this = this;
        var menuContent;
        subMenuItemArray.splice(0);
        var openKeys='';
        openKeys=''+structure.id;
        menuList.forEach(function (subGroup) {
            var menuItem = <Menu.Item key={subGroup.id}>
                { /*<Icon type="folder" className="schoolgroup_menu_i_blue" />*/}
                <i className="iconfont schoolgroup_menu_i_blue">&#xe67b;</i>
                <span>{subGroup.name}</span>
                <span>({subGroup.memberCount}人)</span>
            </Menu.Item>;
            subMenuItemArray.push(menuItem);
        });
        var subMenu = <SubMenu className="schoolgroup_menu_c" key={structure.id} title={<span><Icon type="caret-down"  className="schoolgroup_down_arrow" /><i className="iconfont schoolgroup_menu_i">&#xe6a0;</i><span>{structure.schoolName}</span></span>}>
            {subMenuItemArray}
        </SubMenu>;
        _this.setState({subMenu,openKeys});
    }

    /**
     * 获取角色组
     * @param operateUserId
     * @param structureId
     */
    getStructureRoleGroups(operateUserId, structureId){
        let _this = this;
        var param = {
            "method": 'getStructureRoleGroups',
            "operateUserId": operateUserId,
            "pageNo": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var part = ret.response;
                // _this.props.callbackParent(part.id,part);
                /*假数据*/
                /*part = [
                    {
                        "children": [
                            {
                                "createTime": 1502704554000,
                                "id": 15,
                                "name": "负责人1",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            },
                            {
                                "createTime": 1502704560000,
                                "id": 16,
                                "name": "负责人2",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            },
                            {
                                "createTime": 1502704566000,
                                "id": 17,
                                "name": "负责人3",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            }
                        ],
                        "createTime": 1502702735000,
                        "id": 4,
                        "name": "默认",
                        "parentId": -1,
                        "schoolId": 9,
                        "type": 1,
                        "userId": 24827,
                        "valid": 1
                    },
                    {
                        "children": [
                            {
                                "createTime": 1502704554000,
                                "id": 15,
                                "name": "年级组长",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            },
                            {
                                "createTime": 1502704560000,
                                "id": 16,
                                "name": "数学组长",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            },
                            {
                                "createTime": 1502704566000,
                                "id": 17,
                                "name": "语文组长",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            }
                        ],
                        "createTime": 1503050095000,
                        "id": 18,
                        "name": "职务",
                        "parentId": -1,
                        "schoolId": 9,
                        "type": 1,
                        "userId": 23836,
                        "valid": 1
                    },
                    {
                        "children": [
                            {
                                "createTime": 1502704554000,
                                "id": 15,
                                "name": "财务",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            },
                            {
                                "createTime": 1502704560000,
                                "id": 16,
                                "name": "出纳",
                                "parentId": 4,
                                "schoolId": 9,
                                "type": 0,
                                "userId": 24827,
                                "valid": 1
                            }
                        ],
                        "createTime": 1503051953000,
                        "id": 19,
                        "name": "岗位",
                        "parentId": -1,
                        "schoolId": 9,
                        "type": 1,
                        "userId": 23836,
                        "valid": 1
                    }
                ]*/
                // 调用 渲染角色函数
                _this.buildMenuPart(part);
                _this.setState({part});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /*渲染角色函数*/
    buildMenuPart (part) {
        let _this = this;
        var menuContent;
        var subRoleMenuItemArray = [];
        var openKeys='';
        var partMenu = '';
        var menuItem = '';
        var arr = [];

        for(var i = 0;i < part.length;i++) {
                part[i].children.forEach(function (subGroup) {
                    // openKeys=''+part.id;
                    var menuItem =  <Menu.Item key={subGroup.id}>
                        <Icon type="user" />
                        <span>{subGroup.name}</span>
                    </Menu.Item>;
                    subRoleMenuItemArray.push(menuItem);
                });
                partMenu = <SubMenu className="schoolgroup_menu_c" key={part[i].id} title={<span><Icon type="caret-down"  className="schoolgroup_down_arrow" /><Icon type="folder" /><span>{part[i].name}</span></span>}>
                    {subRoleMenuItemArray}
                </SubMenu>;
                // 这个地方的partMenu是一个对象，将对象放到数组里面，然后把数组setState，去DOM那里取数组就能够依次渲染出来
                arr.push(partMenu);
                subRoleMenuItemArray = [];
        }
        _this.setState({arr,openKeys});
    }

    handleClick(e) {
        this.setState({
            selectedKeys: e.key,
        });
        this.props.callbackParent(e.key,this.state.structure);
        this.props.changeTab('origin');
    }

    handleClickRole(e) {
        this.setState({
            selectedKeys: e.key,
        });
        this.props.callbackParent(e.key,this.state.structure);
        // 子传父函数调用
        this.props.changeTab('role',true,e.key);
    }

    /**
     * 添加角色组
     */
    addSubGroup(){
        this.setState({"addSubGroupModalIsShow":true});
    }

    /*添加角色*/
    addRole() {
        this.setState({"addRoleModalIsShow":true})
    }
    render() {
        console.log("openKeys===>"+this.state.openKeys);
        return (
            <div>
                <Tabs size="small">
                    {/*组织架构tab*/}
                    <TabPane tab="组织架构" key="1">
                        <Menu ref="middleMenu" onClick={this.handleClick}
                              selectedKeys={[this.state.selectedKeys]}
                              defaultOpenKeys={[this.state.openKeys]}
                              openKeys={[this.state.openKeys]}
                              className="cont_t"
                              mode="inline"
                        >
                            {this.state.subMenu}
                        </Menu>
                    </TabPane>
                    {/*角色tab*/}
                    <TabPane tab="角色" key="2">
                        <Button onClick={this.addSubGroup}>添加角色组</Button>
                        <Button onClick={this.addRole}>添加角色</Button>
                        <Menu
                            onClick={this.handleClickRole}
                            style={{ width: 240 }}
                            defaultSelectedKeys={['15']}
                            defaultOpenKeys={['4']}
                            mode="inline"
                        >
                            {this.state.arr}
                        </Menu>
                    </TabPane>
                </Tabs>
                {/*引入添加角色组模态框*/}
                <AddRoleGroupModal isShow={this.state.addSubGroupModalIsShow}/>
                {/*引入添加角色模态框*/}
                <AddRoleModal isShow={this.state.addRoleModalIsShow}/>
            </div>
        );
    }

}

export default SchoolGroupMenu;