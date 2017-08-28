/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col ,Tabs ,Button} from 'antd';
import React, {PropTypes} from 'react';
import {doWebService} from '../../WebServiceHelper';
import AddRoleGroupModal from './AddRoleGroupModal';
import AddRoleModal from './AddRoleModal';
import EditRoleGroupModal from './EditRoleGroupModal';
import {isEmpty} from '../../utils/utils';
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
            editRoleGroupIsShow:false,
            delRoleGroupId:'',
            beActive:true,
            secret:true,
            activeTabKey:'origin',
            isChanged:false
        }
        // 使用extends创建的组件使用方法要在构造器中bind一下
        this.getStructureById = this.getStructureById.bind(this);
        this.getStructureRoleGroups = this.getStructureRoleGroups.bind(this);
        this.buildMenuChildren = this.buildMenuChildren.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClickRole = this.handleClickRole.bind(this);
        this.addSubGroup = this.addSubGroup.bind(this);
        this.closeModel = this.closeModel.bind(this);
        this.addRole = this.addRole.bind(this);
        this.editRole = this.editRole.bind(this);
        this.initMenuInfo = this.initMenuInfo.bind(this);
        this.addRoleGroupComplete = this.addRoleGroupComplete.bind(this);
        this.tabOnChange = this.tabOnChange.bind(this);
    }

    componentDidMount(){
        this.initMenuInfo();
    }

    componentWillReceiveProps(nextProps){
        var currentItem = nextProps.currentItem;
        if(isEmpty(currentItem)==false){
            this.setState({"activeTabKey":currentItem});
            // 子传父函数调用,调用父组件的设置右侧组件的方法
            if(currentItem=="role"){
                this.props.onGhostMenuClick(currentItem,this.state.selectedRoleKeys,this.state.selectedRoleKeyPath);
            }else{
                var requestId = "";
                var requestObj=null;
                /*if(isEmpty(this.state.selectedKeys)){
                    requestId = nextProps.rootStructure.id;
                    requestObj = nextProps.rootStructure;
                }else{
                    requestId = this.state.selectedKeys;
                    requestObj = this.state.structure;
                }*/
                requestId = nextProps.rootStructure.id;
                requestObj = nextProps.rootStructure;
                this.props.onGhostMenuClick(currentItem,requestId,requestObj);
            }

        }
    }

    initMenuInfo(){
        var structureId = "-1";
        var operateUserId = this.state.loginUser.colUid;
        var rootStructure = this.props.rootStructure;
        if(isEmpty(rootStructure)==false){
            // 渲染到DOM后 调用 获取组织根节点函数
            this.listStructures(operateUserId,rootStructure);
        }else{
            this.getStructureById(operateUserId,structureId);
        }
        // 渲染到DOM后 调用 获取角色组函数
        this.getStructureRoleGroups(operateUserId,structureId);
    }

    addRoleGroupComplete(){
        this.getStructureRoleGroups();
        this.setState({"addSubGroupModalIsShow":false});
        this.setState({"addRoleModalIsShow":false});
        this.setState({"editRoleGroupIsShow":false});
        this.refs.addRoleModal.getStructureRoleGroups();
    }
    closeModel(){
        this.setState({"addSubGroupModalIsShow":false});
        this.setState({"addRoleModalIsShow":false});
        this.setState({"editRoleGroupIsShow":false});

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
                <i className="iconfont schoolgroup_menu_i_blue upexam_float">&#xe67b;</i>
                <span className="group_name dold_text">{subGroup.name}</span>
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
    getStructureRoleGroups(){
        let _this = this;
        var param = {
            "method": 'getStructureRoleGroups',
            "operateUserId": _this.state.loginUser.colUid,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var part = ret.response;
                // 调用 渲染角色函数
                _this.buildMenuPart(part);
                _this.setState({part});
                // 设置一个默认ID
                _this.setState({firstId:part[0].children[0].id});
                _this.setState({selectedRoleKeyPath:part[0].id+ '#' + part[0].name});
                _this.setState({selectedRoleKeys:part[0].children[0].id + ',' + part[0].children[0].name});
                var obj = {
                    "key" : '231,小组',
                    "keyPath" : ['231,小组','208#语文组']
                }
                _this.setState({obj:obj});
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
        var openKeysArr = [];

        for(var i = 0;i < part.length;i++) {
                part[i].children.forEach(function (subGroup) {
                    // openKeys=''+part.id;
                    var menuItem =  <Menu.Item key={subGroup.id + ',' +subGroup.name}>
                        <Icon type="user" className="schoolgroup_menu_i_blue" />
                        <span>{subGroup.name}</span>
                    </Menu.Item>;
                    subRoleMenuItemArray.push(menuItem);
                });

                partMenu = <SubMenu className="schoolgroup_menu_c" key={part[i].id + '#' + part[i].name} title={<span><Icon type="caret-down"  className="framework_down_arrow" /><i className="iconfont schoolgroup_menu_i_blue">&#xe67b;</i><span>{part[i].name}</span><Icon type="edit" className="i_framework_right" onClick={this.editRole.bind(this,part[i].id,part[i].name,event)}/></span>}>
                    {subRoleMenuItemArray}
                </SubMenu>;
                // 这个地方的partMenu是一个对象，将对象放到数组里面，然后把数组setState，去DOM那里取数组就能够依次渲染出来
                arr.push(partMenu);
                openKeysArr.push(part[i].id + '#' + part[i].name);
                subRoleMenuItemArray = [];
        }
        _this.setState({openKeysArr:openKeysArr});
        _this.setState({arr,openKeys});
    }

    handleClick(e) {

        this.setState({
            selectedKeys: e.key,
        });
        // this.props.callbackParent(e.key,this.state.structure);
        // this.props.changeTab('origin');
        this.props.onGhostMenuClick('origin',e.key,this.state.structure);
    }

    handleClickRole(e) {
        console.log(e);
        this.setState({
            selectedRoleKeys: e.key,
            selectedRoleKeyPath:e.keyPath
        });
        // 子传父函数调用
        //this.props.changeTab('role',true,e.key,e.keyPath[1]);
        this.props.onGhostMenuClick('role',e.key,e.keyPath[1]);
    }
    openMenu(e) {
        console.log(e);
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

    /*编辑角色组*/
    editRole(id,name,event){
        this.setState({"editRoleGroupIsShow":true});
        this.setState({"delRoleGroupId":id});
        this.setState({"delRoleGroupName":name});
        event.stopPropagation();
        event.preventDefault();
    }

    tabOnChange(key) {
        console.log(key);
        this.setState({activeTabKey:key,'isChanged':true});
        //this.sendMenuInfoWhenTabChange(key);
        this.props.changeTab(key);
        /*if(key=="role"){
            this.props.onGhostMenuClick('role',this.state.selectedRoleKeys,this.state.selectedRoleKeyPath);
        }else{

            this.props.onGhostMenuClick('origin',this.state.selectedKeys,this.state.structure);
        }*/
        if(key=="role"){
            this.props.onGhostMenuClick(key,this.state.selectedRoleKeys,this.state.selectedRoleKeyPath);
        }else{
            var requestId = "";
            var requestObj=null;
            /*if(isEmpty(this.state.selectedKeys)){
                requestId = this.props.rootStructure.id;
                requestObj = this.props.rootStructure;
            }else{
                requestId = this.state.selectedKeys;
                requestObj = this.state.structure;
            }*/
            requestId = this.props.rootStructure.id;
            requestObj = this.props.rootStructure;
            this.props.onGhostMenuClick(key,requestId,requestObj);
        }
    }

    sendMenuInfoWhenTabChange(key){
        if(key=="origin"){
            //组织架构
            if(isEmpty(this.state.selectedKeys)==false){
                //向上传递点击过的菜单的key
            }else{
                //向上传递组织架构根节点的key(rootStructure.id)
            }
        }else{
            // console.log(777);
            //角色
            if(isEmpty(this.state.selectedRoleKeys)==false){
                //向上传递点击过的角色菜单的key
                var selId = this.state.selectedRoleKeys;
                var arr = selId.split(',');
                //this.props.sendFirstId(arr[0]);
                this.props.changeTab(key,true,arr[0]);
            }else{
                //向上传递角色组下的第一个角色的id
                this.props.changeTab(key,true,this.state.firstId);
            }
            console.log(this.state.obj);
            // this.handleClickRole(this.state.obj);
        }
    }

    render() {
        console.log("openKeys===>"+this.state.openKeys);
        return (
            <div className="framework_tab">
                <Tabs size="small" activeKey={this.state.activeTabKey} onChange={this.tabOnChange}>
                    {/*组织架构tab*/}
                    <TabPane tab="组织架构" key="origin">
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
                    <TabPane tab="角色" key="role">
                        <span className="character_add">
                            <Button onClick={this.addSubGroup}>添加角色组</Button>
                            <Button className="add_out" onClick={this.addRole}>添加角色</Button>
                        </span>
                        <Menu
                            onClick={this.handleClickRole}
                            style={{ width: 240 }}
                            selectedKeys={[this.state.selectedRoleKeys]}
                            defaultOpenKeys={this.state.openKeysArr}
                            mode="inline"
                            className="framework_left_menu"
                            onOpenChange={this.openMenu}
                        >
                            {this.state.arr}
                        </Menu>
                    </TabPane>
                </Tabs>
                {/*引入添加角色组模态框*/}
                <AddRoleGroupModal isShow={this.state.addSubGroupModalIsShow}
                                   addRoleGroupComplete={this.addRoleGroupComplete}
                                   closeModel={this.closeModel}
                />
                {/*引入添加角色模态框*/}
                <AddRoleModal isShow={this.state.addRoleModalIsShow}
                              addRoleGroupComplete={this.addRoleGroupComplete}
                              closeModel={this.closeModel}
                              ref="addRoleModal"
                />
                {/*引入编辑角色组模态框*/}
                <EditRoleGroupModal isShow={this.state.editRoleGroupIsShow}
                                    delRoleGroupId={this.state.delRoleGroupId}
                                    delRoleGroupName={this.state.delRoleGroupName}
                                    addRoleGroupComplete={this.addRoleGroupComplete}
                                    closeModel={this.closeModel}
                />
            </div>
        );
    }

}

export default SchoolGroupMenu;