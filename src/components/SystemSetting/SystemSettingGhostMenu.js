/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col, message} from 'antd';
import React, {PropTypes} from 'react';
import {doWebService} from '../../WebServiceHelper';

class SystemSettingGhostMenu extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            ident: sessionStorage.getItem("ident"),
            beActive: false, // 是活动的，可伸缩的,
            icon:["user","dot-chart","ellipsis"]
        }
        this.changeMenu = this.changeMenu.bind(this);
        this.showpanel = this.showpanel.bind(this);
        this.checkWords = this.checkWords.bind(this);
    }

    componentDidMount() {
        //this.getTab();
        //测试
        this.buildTab([]);
    }

    /**
     * 获取tab内容
     */
    getTab() {
        var _this = this;
        var param = {
            "method": 'getAccessibleFunctionTabs',
            "userId": this.state.loginUser.colUid,
            "moduleId": '',
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                console.log(data);
                _this.buildTab(data);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 渲染tab
     * @param data
     */
    buildTab(data) {
        let _this = this;
        var liArr = [];
        var uls = '';
        var arr = [];
        //手动添加的测试菜单---开始
        var flowUl = <li className="multi">
            <ul className="second">
                <li onClick={ event => {
                    this.changeMenu(event, 'systemFlow', false)
                }}>流程管理
                </li>
            </ul>
        </li>;
        liArr.push(flowUl);
        arr.push(liArr);
        //手动添加的测试菜单---结束
        for (var i = 0; i < data.length; i++) {
            data[i].tabItems.forEach(function (v) {
                console.log(v);
                var lis =  <li className="multi">
                                <ul className="second">
                                    <li onClick={event => {
                                        // _this.changeMenu(event, 'origin', true)
                                        _this.checkWords(v.actionParams,v.name);
                                    }}><img  className="icon_system_img"  src={v.icon}/>{v.name}</li>
                                </ul>
                          </li>
                liArr.push(lis);
            });
            uls =  <li className="ghostMenu_li">
                     <li><Icon type={this.state.icon[i]} />{data[i].name}</li>
                    {liArr}
                  </li>
            arr.push(uls);
            liArr = [];
        }
        _this.setState({arr});
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

    checkWords(words,name) {
        var _this = this;
        console.log(words);
        if(words.method == 'operateStructure'){
            _this.changeMenu(event, 'origin', true)
        }else if (words.method == 'operateStructureRole'){
            _this.changeMenu(event, 'role', true)
        }else {
            _this.showpanel(event,words.url,name);
            _this.changeMenu(event, 'stop', false)

        }
    }


    // teachingAdmin panel
    showpanel(event,urls,name) {


        this.onMenu(event);

        let param = {
            mode: 'teachingAdmin',
            title: name,
            url: urls + this.state.ident,
        }
        // console.log(param);

        LP.Start(param);
    }


    render() {
        //在菜单处于非活动状态下,隐藏向左的按钮,以免遮挡右侧区域,影响操作
        var hideButton;
        if (this.state.beActive) {
            hideButton = <div className="headler" onClick={event => {
                this.toggleGhostMenu(event);
            }}><Icon type="left"/></div>;
        } else {
            hideButton = "";
        }

        return (
            <div className={this.props.visible ? 'ghostMenu ghostMenuShow' : 'ghostMenu ghostMenuHide'}
                 onClick={event => {
                     this.props.toggleGhostMenu({visible: false});
                 }}>
                {hideButton}
                <div className="menu_til">系统设置</div>
                <ul className="first">
                    {this.state.arr}
                </ul>
            </div>
        );
    }

}

export default SystemSettingGhostMenu;