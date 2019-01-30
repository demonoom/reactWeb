/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col,message} from 'antd';
import React, {PropTypes} from 'react';
import { doWebService } from '../WebServiceHelper';
import {isEmpty} from '../utils/utils';

class GhostMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident : sessionStorage.getItem("ident"),
            beActive: true, // 是活动的，可伸缩的
            isClazzMaster:false,    //是否是班主任角色
        }
        this.changeMenu = this.changeMenu.bind(this);
        this.showpanel = this.showpanel.bind(this);
        this.getStructureRoleUserByUserId = this.getStructureRoleUserByUserId.bind(this);
    }

    componentDidMount(){
        this.getStructureRoleUserByUserId();
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
        this.getStructureRoleUserByUserId();
    }


    // teachingAdmin panel
    showpanel(event,key,param) {

        this.onMenu(event);

        /*let param = {
            mode: 'teachingAdmin',
            title: '教务管理',
            url: 'http://www.maaee.com/Excoord_PhoneService/permission/permissionList/' + this.state.ident,
        }*/

        LP.Start(param);
    }

    //获取当前用户的角色,用来控制教学空间的菜单项目可见性
    getStructureRoleUserByUserId() {
        var _this = this;
        var param = {
            "method": 'getStructureRoleUserByUserId',
            "userId": sessionStorage.getItem("ident")
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var isClazzMaster = false;
                if (isEmpty(response)==false) {
                    for(var i=0;i<response.length;i++){
                        var roleInfo = response[i];
                        var roleType = roleInfo.type;
                        if(roleType == 6){
                            //班主任
                            isClazzMaster = true;
                            break;
                        }
                    }
                }
                _this.setState({isClazzMaster});
            },
            onError: function (error) {
                message.error(error);
            }
        });
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
        var masterMenu = <div className={this.props.visible ? 'ghostMenu ghostMenuShow' : 'ghostMenu ghostMenuHide' }
                              onClick={event => {
                                  this.props.toggleGhostMenu({visible: false});
                              }}>
            {hideButton}
            <div className="menu_til">教学空间</div>
            <ul className="first">
                <li ><Icon type="book"/>常用</li>
                <li className="multi">
                    <ul className="second">
                        <li onClick={ event => {
                            console.log(event);
                        }}>审批
                        </li>
                    </ul>
                </li>
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
                <li><Icon type="laptop" />本地课堂</li>
                <li className="multi">
                    <ul className="second">
                        <li onClick={ event => {
                            this.changeMenu(event, 'localClassRoom', false)
                        }}>开启课堂
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
                        <li onClick={ event => {
                            console.log(event);
                        }}>作业统计
                        </li>
                        <li onClick={ event => {
                            console.log(event);
                        }}>作业表情统计
                        </li>
                        <li onClick={ event => {
                            console.log(event);
                        }}>错题本
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
                        <li onClick={ event => {
                            this.changeMenu(event, 'test', false)
                        }}>考试
                        </li>
                        <li onClick={ event => {
                            this.changeMenu(event, 'examAnalysis', false)
                        }}>成绩分析
                        </li>
                    </ul>
                </li>
                <li><Icon type="exception"/>数据中心</li>
                <li className="multi">
                    <ul className="second">
                        <li onClick={ event => {
                            console.log(event);
                        }}>课堂回顾统计
                        </li>
                        <li onClick={ event => {
                            console.log(event);
                        }}>手环数据统计
                        </li>
                    </ul>
                </li>
            </ul>
        </div>;
        if(this.state.isClazzMaster == true){
            masterMenu = <div className={this.props.visible ? 'ghostMenu ghostMenuShow' : 'ghostMenu ghostMenuHide' }
                 onClick={event => {
                     this.props.toggleGhostMenu({visible: false});
                 }}>
                {hideButton}
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
                    <li><Icon type="laptop" />本地课堂</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'localClassRoom', false)
                            }}>开启课堂
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
                    <li><Icon type="exception"/>考试系统</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.changeMenu(event, 'examination', false)
                            }}>组卷
                            </li>
                            <li onClick={ event => {
                                this.changeMenu(event, 'test', false)
                            }}>考试
                            </li>
                            <li onClick={ event => {
                                this.changeMenu(event, 'examAnalysis', false)
                            }}>成绩分析
                            </li>
                        </ul>
                    </li>
                    <li><Icon type="credit-card"/>班牌管理</li>
                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.showpanel(event, 'clazzDutyList',{
                                    mode: 'teachingAdmin',
                                    title: '班级值日管理',
                                    url: 'http://jiaoxue.maaee.com:8091/#/clazzDutyList?access_user=' + this.state.ident,
                                }, false)
                            }}>班级值日管理
                            </li>
                        </ul>
                    </li>

                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.showpanel(event, 'notifyBack',{
                                    mode: 'teachingAdmin',
                                    title: '通知管理',
                                    url: 'http://jiaoxue.maaee.com:8091/#/notifyBack?access_user=' + this.state.ident,
                                }, false)
                            }}>通知管理
                            </li>
                        </ul>
                    </li>

                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.showpanel(event, 'classDemeanorList',{
                                    mode: 'teachingAdmin',
                                    title: '班级风采管理',
                                    url: 'http://jiaoxue.maaee.com:8091/#/classDemeanorList?access_user=' + this.state.ident,
                                }, false)
                            }}>班级风采管理
                            </li>
                        </ul>
                    </li>

                    <li className="multi">
                        <ul className="second">
                            <li onClick={ event => {
                                this.showpanel(event, 'classHonorList',{
                                    mode: 'teachingAdmin',
                                    title: '班级荣誉管理',
                                    url: 'http://jiaoxue.maaee.com:8091/#/classHonorList?access_user=' + this.state.ident,
                                }, false)
                            }}>班级荣誉管理
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>;
        }

        return (
            <div>
                {masterMenu}
            </div>
        );
    }

}

export default GhostMenu;
