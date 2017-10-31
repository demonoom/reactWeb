import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Menu, Icon} from 'antd';

const SubMenu = Menu.SubMenu;

const AttendanceSettingComponents = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,

        };
    },

    componentDidMount() {

    },

    handleClick(e) {
        // console.log(e.key);
        this.props.attendanceSettingClick(e.key);
    },


    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <Menu
                    onClick={this.handleClick}
                    style={{width: 240}}
                    defaultSelectedKeys={['attendanceManagement']}
                    defaultOpenKeys={['sub2', 'sub4']}
                    mode="inline"
                >
                    <SubMenu key="sub2" title={<span><Icon type="appstore"/><span>考勤设置</span></span>}>
                        <Menu.Item key="attendanceManagement">考勤组管理</Menu.Item>
                        <Menu.Item key="shiftManagement">班次管理</Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub4" title={<span><Icon type="setting"/><span>考勤统计</span></span>}>
                        <Menu.Item key="monthlySummary">月度汇总</Menu.Item>
                        <Menu.Item key="dailyStatistics">每日统计</Menu.Item>
                        <Menu.Item key="originalRecord">原始记录</Menu.Item>
                    </SubMenu>
                </Menu>
            </div>
        );
    }
});

export default AttendanceSettingComponents;
