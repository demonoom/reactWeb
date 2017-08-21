/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col} from 'antd';
import React, {PropTypes} from 'react';

class SystemSettingGhostMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident : sessionStorage.getItem("ident"),
            beActive: true, // 是活动的，可伸缩的
        }
        this.changeMenu = this.changeMenu.bind(this);
        this.showpanel = this.showpanel.bind(this);
    }


    // toggle
    toggleGhostMenu(event) {

        event = event || window.event;
        event.preventDefault();
        event.stopPropagation();
        if (this.state.beActive) {
            this.props.toggleGhostMenu();
        }
    }

    // menu on
    onMenu(event) {
        $('.ghostMenu li').removeClass('on');
        event = event || window.event || arguments.callee.caller.arguments[0];
        let el = event.target;
        el.className = 'on';

    }


    // change menu
    changeMenu(event, channelStr, beActive) {
        // add on class
        this.onMenu(event)
        // 1
        this.setState({beActive: beActive});
        this.props.changeTabEvent(channelStr, beActive);

    }


    // teachingAdmin panel
    showpanel(event) {

        this.onMenu(event);

        let param = {
            mode: 'teachingAdmin',
            title: '教学管理',
            url: 'http://www.maaee.com/Excoord_PhoneService/permission/permissionList/' + this.state.ident,
        }

        LP.Start(param);
    }


    render() {
        //在菜单处于非活动状态下,隐藏向左的按钮,以免遮挡右侧区域,影响操作
        var hideButton;
        if(this.state.beActive){
            hideButton=<div className="headler" onClick={event => {
                this.toggleGhostMenu(event);
            }}><Icon type="left"/></div>;
        }else{
            hideButton="";
        }

        return (
            <div className={this.props.visible ? 'ghostMenu ghostMenuShow' : 'ghostMenu ghostMenuHide' }
                 onClick={event => {
                     this.props.toggleGhostMenu({visible: false});
                 }}>
                {hideButton}
                <div className="menu_til">系统设置</div>
                <ul className="first">
                    <li ><Icon type="book"/>组织架构</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'schoolGroupSetting', true)
                            }}>组织架构
                            </li>
                            <li onClick={ event => {
                                this.changeMenu(event, 'systemRole', true)
                            }}>系统角色
                            </li>
                        </ul>
                    </li>
                    <li><Icon type="file-text"/>审批</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'systemFlow', false)
                            }}>流程管理
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }

}

export default SystemSettingGhostMenu;