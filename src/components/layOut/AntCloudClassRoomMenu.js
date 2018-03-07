import React, {PropTypes, Link} from 'react';
import {Icon,Menu} from 'antd';

//国际化
import {IntlProvider, addLocaleData} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';
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
                <div className="menu_til">
                    <FormattedMessage
                        id='cloudClass'
                        description='云校'
                        defaultMessage='云校'
                    />
                </div>
                <Menu className="cont_menu"
                    onClick={this.handleClick}
                    defaultSelectedKeys={['mulitiClass']}
                    openKeys={['pushClass','teamManager','liveVideoSub', 'classManager']}
                    mode="inline"
                >
                    <SubMenu key="pushClass" title={<span><Icon type="book" /><span>
                    <FormattedMessage
                        id='courseAnnouncement'
                        description='课程发布'
                        defaultMessage='课程发布'
                    />
                    </span></span>}>
                        <Menu.Item key="mulitiClass">
                            <FormattedMessage
                                id='regularCourse'
                                description='常规课程'
                                defaultMessage='常规课程'
                            /></Menu.Item>
                        <Menu.Item key="singleClass">
                            <FormattedMessage
                                id='liveActionCourse'
                                description='实景课程'
                                defaultMessage='实景课程'
                            />
                        </Menu.Item>
                    </SubMenu>
                    {/*<SubMenu key="liveVideoSub" title={<span><Icon type="play-circle-o" /><span>课程直播</span></span>}>*/}
                        {/*<Menu.Item key="liveVideo">直播列表</Menu.Item>*/}
                    {/*</SubMenu>*/}
                    <SubMenu key="teamManager" title={<span><Icon type="team" /><span>
                      <FormattedMessage
                          id='teamManagement'
                          description='团队管理'
                          defaultMessage='团队管理'
                      />
                    </span></span>}>
                        <Menu.Item key="myTeam">
                            <FormattedMessage
                                id='myTeam'
                                description='我的团队'
                                defaultMessage='我的团队'
                            />
                        </Menu.Item>
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