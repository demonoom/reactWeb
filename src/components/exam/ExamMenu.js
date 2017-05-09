import React, {PropTypes, Link} from 'react';
import {Menu, Icon} from 'antd';

const ExamMenu = React.createClass({
    getInitialState() {
        return {
            currentMenu: 'createExamPager',
            currentPage: 1,
            openSubMenu: this.props.activeMenu,
            show: 1,
            lessonCount: 0,
            menuList: [],
        };
    },

    handleClick(e) {
        debugger
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
        this.setState({currentMenu: e.key, openSubMenu: e.key});
        var optContent = e.key;
        if (e.key == "createExamPager") {
            this.props.callbackParent(optContent);
        }

    },

    render() {
        return (
            <div>
                <div className="menu_til">考试</div>
                <Menu ref="middleMenu" onClick={this.handleClick}
                      className="cont_t"
                      defaultOpenKeys={['createExamPager']}
                      openKeys={[this.state.openSubMenu]}
                      selectedKeys={['createExamPager']}
                      mode="inline"
                >
                    <Menu.Item key="createExamPager" style={{backgroundColor: '#e5f2fe'}}> <span><Icon type="mail"
                                                                                                       className='le_1'/><span>组卷</span></span>
                    </Menu.Item>
                </Menu>
            </div>
        );
    },
});
export default ExamMenu;