import React, {PropTypes, Link} from 'react';
import {Menu, Icon} from 'antd';

var mMenu;
const HomeWorkMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {
            currentMenu: 'goSchool',
            currentPage: 1,
            openSubMenu: this.props.activeMenu,
            show: 1,
            lessonCount: 0,
            menuList: [],
        };
    },

    handleClick(e) {
        this.setState({
            currentMenu: e.key,
        });

        var domE = e.domEvent;
        var target = domE.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = domE.currentTarget;
        } else {
            target = domE.target;
        }
        $("li[style]").each(function () {
            $(this).css("background-color", "");
        });
        target.style.backgroundColor = "#e5f2fe";
        this.setState({openSubMenu: e.key});
        var optContent = e.key;
        if (e.key == "assignHomeWork") {
            this.props.callbackParent(optContent);
        }

    },

    render() {
        return (
            <div>
                <div className="menu_til">作业</div>
                <Menu ref="middleMenu" onClick={this.handleClick}
                      className="cont_t"
                      defaultOpenKeys={['goSchool']}
                      openKeys={[this.state.openSubMenu]}
                      selectedKeys={['assignHomeWork']}
                      mode="inline"
                >
                    <Menu.Item key="assignHomeWork" style={{backgroundColor: '#e5f2fe'}}> <span><Icon type="mail"
                                                                                                      className='le_1'/><span>布置作业</span></span>
                    </Menu.Item>
                </Menu>
            </div>
        );
    },
});
export default HomeWorkMenu;