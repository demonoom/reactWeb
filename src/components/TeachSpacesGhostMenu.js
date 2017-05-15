/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col} from 'antd';
import React, {PropTypes} from 'react';

class GhostMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
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
    showpanel() {

        this.onMenu(event);

        let param = {
            mode: 'teachingAdmin',
            title: '教学管理',
            url: 'http://www.maaee.com/Excoord_PhoneService/permission/permissionList/23836',
        }

        LP.Start(param);
    }


    render() {

        return (
            <div className={this.props.visible ? 'ghostMenu ghostMenuShow' : 'ghostMenu ghostMenuHide' }
                 onClick={event => {
                     this.props.toggleGhostMenu({visible: false});
                 }}>
                <div className="headler" onClick={event => {
                    this.toggleGhostMenu(event);
                }}><Icon type="left"/></div>
                <div className="menu_til">教学空间</div>
                <ul className="first">
                    <li ><Icon type="book"/>备课</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'teachTimes', true)
                            }}>备课计划
                            </li>
                            <li onClick={ event => {
                                this.changeMenu(event, 'KnowledgeResources', true)
                            }}>资源库
                            </li>
                        </ul>
                    </li>
                    <li><Icon type="file-text"/>作业</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'homeWork', false)
                            }}>布置作业
                            </li>
                        </ul>
                    </li>
                    <li><Icon type="area-chart"/>分析评价</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'studyEvaluate', false)
                            }}>学情分析
                            </li>
                        </ul>
                    </li>
                    <li><Icon type="exception"/>考试系统</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'examination', false)
                            }}>组卷
                            </li>
                        </ul>
                    </li>
                    <li><Icon type="exception"/>其它</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.showpanel(event, 'teachingAdmin', false)
                            }}>教学管理
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        );
    }

}

export default GhostMenu;