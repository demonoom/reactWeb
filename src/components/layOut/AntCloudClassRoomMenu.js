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
                <div className="menu_til">云校</div>
                <Menu className="cont_menu"
                    onClick={this.handleClick}
                    defaultSelectedKeys={['mulitiClass']}
                    openKeys={['pushClass','teamManager','liveVideoSub', 'classManager']}
                    mode="inline"
                >
                    <SubMenu key="pushClass" title={<span><Icon type="book" /><span>课程发布</span></span>}>
                        <Menu.Item key="mulitiClass">系列课程</Menu.Item>
                        <Menu.Item key="singleClass">单节课程</Menu.Item>
                    </SubMenu>
                    <SubMenu key="liveVideoSub" title={<span><Icon type="play-circle-o" /><span>课程直播</span></span>}>
                        <Menu.Item key="liveVideo">直播列表</Menu.Item>
                    </SubMenu>
                    <SubMenu key="teamManager" title={<span><Icon type="team" /><span>团队管理</span></span>}>
                        <Menu.Item key="myTeam">我的团队</Menu.Item>
                       {/* <Menu.Item key="allTeam">所有团队</Menu.Item>
                        <Menu.Item key="myMessage">我的消息</Menu.Item>*/}
                    </SubMenu>
                    {/*<SubMenu key="classManager" title={<span><Icon type="team" /><span>课程管理</span></span>}>*/}
                        {/*<Menu.Item key="deleteClass">删除课程</Menu.Item>*/}
                    {/*</SubMenu>*/}
                    {/*<SubMenu key="systemManager" title={<span><Icon type="setting" /><span>系统设置</span></span>}>
                        <Menu.Item key="recommend">推荐管理</Menu.Item>
                    </SubMenu>*/}
                </Menu>
            </div>
        );
    },
});
export default AntCloudClassRoomMenu;