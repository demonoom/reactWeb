import React, {PropTypes, Link} from 'react';
import {Icon,Menu} from 'antd';
const SubMenu = Menu.SubMenu;

var mMenu;

const AntCloudClassRoomMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {

        };
    },

    handleClick(e){
        console.log('click ', e);
        mMenu.props.callbackParent(e.key);
    },

    render() {
        return (
            <div className="cloud_class_menu">
                <div className="menu_til">云课堂</div>
                <Menu className="cont_menu"
                    onClick={this.handleClick}
                    defaultSelectedKeys={['mulitiClass']}
                    openKeys={['pushClass','teamManager']}
                    mode="inline"
                >
                    <SubMenu key="pushClass" title={<span><Icon type="mail" /><span>课程发布</span></span>}>
                        <Menu.Item key="mulitiClass">系列课程</Menu.Item>
                        <Menu.Item key="singleClass">单节课程</Menu.Item>
                    </SubMenu>
                    <SubMenu key="teamManager" title={<span><Icon type="appstore" /><span>团队管理</span></span>}>
                        <Menu.Item key="myTeam">我的团队</Menu.Item>
                        <Menu.Item key="allTeam">所有团队</Menu.Item>
                        <Menu.Item key="myMessage">我的消息</Menu.Item>
                    </SubMenu>
                </Menu>
            </div>
        );
    },
});
export default AntCloudClassRoomMenu;