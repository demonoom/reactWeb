/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col} from 'antd';
import React, {PropTypes} from 'react';
import {doWebService} from '../../WebServiceHelper';
const SubMenu = Menu.SubMenu;
var subMenuItemArray=[];
class SchoolGroupMenu extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser : loginUser,
            selectedKeys:[],
        }
        this.getStructureById = this.getStructureById.bind(this);
        this.buildMenuChildren = this.buildMenuChildren.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount(){
        var structureId = "-1";
        var operateUserId = this.state.loginUser.colUid;
        this.getStructureById(operateUserId,structureId);
    }

    /**
     * 获取当前用户的组织根节点
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
                _this.buildMenuChildren(ret.response,structure);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    buildMenuChildren (menuList,structure) {
        let _this = this;
        var menuContent;
        subMenuItemArray.splice(0);
        var openKeys='';
        openKeys=''+structure.id;
        menuList.forEach(function (subGroup) {
            var menuItem = <Menu.Item key={subGroup.id}>
                <span>{subGroup.name}</span>
                <span>({subGroup.memberCount}人)</span>
            </Menu.Item>;
            subMenuItemArray.push(menuItem);
        });
        var subMenu = <SubMenu key={structure.id} title={<span><Icon type="mail" /><span>{structure.schoolName}</span></span>}>
            {subMenuItemArray}
        </SubMenu>;
        _this.setState({subMenu,openKeys});
    }

    handleClick(e) {
        this.setState({
            selectedKeys: e.key,
        });
        this.props.callbackParent(e.key,this.state.structure);
    }

    render() {
        console.log("openKeys===>"+this.state.openKeys);
        return (
            <div>
                <div className="menu_til">组织架构</div>
                <Menu ref="middleMenu" onClick={this.handleClick}
                      selectedKeys={[this.state.selectedKeys]}
                      defaultOpenKeys={[''+this.state.openKeys]}
                      className="cont_t"
                      mode="inline"
                >
                    {this.state.subMenu}
                </Menu>
            </div>
        );
    }

}

export default SchoolGroupMenu;