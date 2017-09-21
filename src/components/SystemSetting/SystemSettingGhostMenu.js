/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col, message} from 'antd';
import React, {PropTypes} from 'react';
import {doWebService} from '../../WebServiceHelper';
import UpLoadModal from './unLoadModal';
import {showNoomLargeImg} from '../../utils/utils'
import {showLargeImg} from '../../utils/utils'


class SystemSettingGhostMenu extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            ident: sessionStorage.getItem("ident"),
            beActive: false, // 是活动的，可伸缩的,
            icon: ["user", "dot-chart", "ellipsis"],
            makeDingModalIsShow: false,
        }
        this.changeMenu = this.changeMenu.bind(this);
        this.showpanel = this.showpanel.bind(this);
        this.checkWords = this.checkWords.bind(this);
        this.noom = this.noom.bind(this);
        this.closeDingModel = this.closeDingModel.bind(this);
        this.sendImg = this.sendImg.bind(this);
        this.imgClick = this.imgClick.bind(this);
    }

    componentDidMount() {
        this.getTab();
        //测试
        // this.buildTab([]);

        //将GhostMenu组件中的方法挂在window上，以便于在littlePanel中能够调用。
        window.__noom__ = this.noom;
        window.__sendImg__ = this.sendImg;
    }

    sendImg(currentUrl, urls) {
        var imgArr = [];
        var num = '';
        var urls = urls.split('#');
        var _this = this;
        //根据urls的length动态创建img
        urls.forEach(function (v, i) {
            var imgId = "img" + i;
            var img = <span className="topics_zan"><img id={imgId} className="topics_zanImg"
                                                        onClick={showLargeImg} src={v}/>
                      </span>;
            imgArr.push(img);
            if (currentUrl == v) {
                num = i;
            }
        });
        this.setState({imgArr});
        //图片已渲染到DOM
        console.log(1);
        document.querySelectorAll(".topics_zanImg")[num].click();
        console.log(2);
    }

    imgClick(e) {
        console.log(e);
    }

    noom(callbackId) {
        //控制上传组件的显示与隐藏
        this.setState({makeDingModalIsShow: true});
        this.setState({callbackId});
    }

    closeDingModel() {
        this.setState({makeDingModalIsShow: false});
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
                //判断是否有管理员
                var Array = [];
                for (var i = 0; i < data.length; i++) {
                    Array.push(data[i].name)
                }
                if (Array.indexOf('管理员') == -1) {
                    _this.checkVip(true);
                } else {
                    _this.checkVip(false);
                }
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
        // var flowUl = <li className="multi">
        //     <ul className="second">
        //         <li onClick={ event => {
        //             this.changeMenu(event, 'systemFlow', false)
        //         }}>流程管理
        //         </li>
        //     </ul>
        // </li>;
        // liArr.push(flowUl);
        // arr.push(liArr);
        //手动添加的测试菜单---结束
        for (var i = 0; i < data.length; i++) {
            data[i].tabItems.forEach(function (v) {
                console.log(v);
                var lis = <li className="multi">
                    <ul className="second">
                        <li onClick={event => {
                            _this.checkWords(v.actionParams, v.name);
                        }}><img className="icon_system_img" src={v.icon}/>{v.name}</li>
                    </ul>
                </li>
                liArr.push(lis);
            });
            uls = <li className="ghostMenu_li">
                <li><Icon type={this.state.icon[i]}/>{data[i].name}</li>
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

    checkVip(a) {
        this.props.checkVip(a);
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

    checkWords(words, name) {
        var _this = this;
        console.log(words);
        //words就是返回的对象
        if (words.method == 'operateStructure') {
            _this.changeMenu(event, 'origin', true)
        } else if (words.method == 'operateStructureRole') {
            _this.changeMenu(event, 'role', true)
        } else if (words.method == 'operateApproval') {
            _this.changeMenu(event, 'systemFlow', false)
        } else {
            _this.showpanel(event, words.url, name);
            _this.changeMenu(event, 'stop', false)

        }
    }


    // teachingAdmin panel
    showpanel(event, urls, name) {


        this.onMenu(event);

        let param = {
            mode: 'teachingAdmin',
            title: name,
            url: urls,
        }

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
                <div className="menu_til">教学管理</div>
                <ul className="first">
                    {this.state.arr}
                </ul>
                <UpLoadModal
                    isShow={this.state.makeDingModalIsShow}
                    closeDingModel={this.closeDingModel}
                    callbackId={this.state.callbackId}
                />
                {/*<div ref='yida' id="yida" className="toppics_ul_bg share_cont">*/}
                {/*{this.state.imgArr}*/}
                {/*</div>*/}
                <ul>
                    <li className="imgLi">
                        {this.state.imgArr}
                    </li>
                </ul>
            </div>
        );
    }

}

export default SystemSettingGhostMenu;