/**
 * Created by devnote on 17-4-17.
 */
import {Menu, Icon, Row, Col, message} from 'antd';
import React, {PropTypes} from 'react';
import {doWebService} from '../../WebServiceHelper';
import UpLoadModal from './unLoadModal';
import UpLoadImgModal from "./unLoadImgModal";
import UploadAttechModal from "./uploadAttechModal";
import UploadVideoModal from "./UploadVideoModal"
import {showNoomLargeImg} from '../../utils/utils'
import {showLargeImg} from '../../utils/utils'
import {flattenDiagnosticMessageText} from 'typescript';


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
            UploadImgModalIsShow: false,
            UploadVideoIsShow: false,
            uploadAttechModalIsShow: false
        }
        this.changeMenu = this.changeMenu.bind(this);
        this.showpanel = this.showpanel.bind(this);
        this.checkWords = this.checkWords.bind(this);
        this.noom = this.noom.bind(this);
        this.calm = this.calm.bind(this);
        this.calmVideo = this.calmVideo.bind(this);
        this.calmAttech = this.calmAttech.bind(this);
        this.closeDingModel = this.closeDingModel.bind(this);
        // this.sendImg = this.sendImg.bind(this);
        this.imgClick = this.imgClick.bind(this);
    }

    componentDidMount() {
        this.getTab();
        //测试
        // this.buildTab([]);
        //将GhostMenu组件中的方法挂在window上，以便于在littlePanel中能够调用。
        window.__noom__ = this.noom;
        window.__calm__ = this.calm;
        window.__calmVideo__ = this.calmVideo;
        window.__calmAttech__ = this.calmAttech;
    }

    imgClick(e) {
        console.log(e);
    }

    calm(callbackId) {
        this.setState({
            UploadImgModalIsShow: true
        })
        this.setState({
            callbackId
        })
    }

    calmVideo(callbackId) {
        this.setState({
            UploadVideoIsShow: true
        })
        this.setState({
            callbackId
        })
    }

    calmAttech(callbackId) {
        this.setState({
            uploadAttechModalIsShow: true
        })
        this.setState({
            callbackId
        })
    }

    noom(callbackId) {
        //控制上传组件的显示与隐藏
        this.setState({makeDingModalIsShow: true});
        this.setState({callbackId});
    }

    closeDingModel() {
        this.setState({makeDingModalIsShow: false});
        this.setState({
            UploadImgModalIsShow: false
        })
        this.setState({
            UploadVideoIsShow: false
        })
        this.setState({
            uploadAttechModalIsShow: false
        })
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
                    Array.push(data[i].name);
                    data[i].tabItems.forEach(function (item, index) {
                        if (item.name == '考勤') {
                            data[i].tabItems.splice(index, 1);
                        }
                    })
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

        for (var i = 0; i < data.length; i++) {
            data[i].tabItems.forEach(function (v) {
                console.log(v);
                var lis = <li className="multi">
                    <ul className="second">
                        <li onClick={event => {
                            _this.checkWords(v.actionParams, v.name);
                        }}><img className="icon_system_img" src={v.icon}/>{v.name}</li>
                    </ul>
                </li>;
                liArr.push(lis);
            });


            //     url: 'http://192.168.50.29:8091/#/classCardHomePageDoor'
            // }

            // var newLi = <li className="multi">
            //     <ul className="second">
            //         <li onClick={event => {
            //             _this.checkWords(newObj, '班牌编辑');
            //         }}><img className="icon_system_img"/>班牌编辑
            //         </li>
            //     </ul>
            // </li>;
            // liArr.push(newLi);

            uls = <li className="ghostMenu_li">
                <li><Icon type={this.state.icon[i]}/>{data[i].name}</li>
                {liArr}
            </li>;
            arr.push(uls);
            liArr = [];
        }
        if (_this.state.ident == 23836) {

            var newLi = <li className="multi">
                <ul className="second">
                    <li onClick={event => {
                        _this.checkWords({
                            method: 'openNewPage',
                            // url: 'http://jiaoxue.maaee.com:8091/#/ARTextbookList'
                            url: 'http://172.16.2.128:8091/#/ARTextbookList'

                        }, 'AR教材');
                    }}><img className="icon_system_img" src="http://60.205.111.227/upload2/common/img/icon_ar.png"/>AR教材
                    </li>
                </ul>
            </li>;
            liArr.push(newLi);
        }
        if (_this.state.ident == 23836) {
            // 皮肤管理
            var newObj = {
                method: 'openNewPage',
                url: 'http://jiaoxue.maaee.com:8091/#/classBrandTemplateList'
            }

            var newLi = <li className="multi">
                <ul className="second">
                    <li onClick={event => {
                        _this.checkWords(newObj, '皮肤管理');
                    }}><img className="icon_system_img" src="http://60.205.111.227/upload2/common/img/icon_skin.png"/>皮肤管理
                    </li>
                </ul>
            </li>;
            liArr.push(newLi);
        }


        //手动添加的测试菜单---开始
        var flowUl = <li className="multi">
            {/* <li>AR教材</li> */}
            {/*<ul className="second">*/}
            {/*<li onClick={event => {*/}
            {/*this.changeMenu(event, 'noomkaoqing', true)*/}
            {/*}}><img className="icon_system_img" src='http://60.205.86.217/upload2/common/img/examine_icon.png'/>考勤打卡*/}
            {/*</li>*/}
            {/*</ul>*/}

            {/*<ul className="second">*/}
            {/*<li onClick={event => {*/}
            {/*this.changeMenu(event, 'noomjuese', true)*/}
            {/*}}><img className="icon_system_img" src='http://60.205.86.217/upload2/common/img/examine_icon.png'/>角色*/}
            {/*</li>*/}
            {/*</ul>*/}

            {/*组织架构*/}

            {/*<ul className="second" style={{display: !loginFlag ? 'block' : 'none'}}>*/}
            {/*<li onClick={event => {*/}
            {/*this.changeMenu(event, 'BindCoordinates', false)*/}
            {/*}}><img className="icon_system_img" src='http://60.205.86.217/upload2/common/img/examine_icon.png'/>绑定教室坐标*/}
            {/*</li>*/}
            {/*</ul>*/}

        </li>;
        liArr.push(flowUl);
        arr.push(liArr);
        //手动添加的测试菜单---结束

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
        this.onMenu(event);
        // 1
        this.setState({beActive: beActive});
        this.props.changeTabEvent(channelStr, beActive);

    }

    checkWords(words, name) {
        var _this = this;
        //words就是返回的对象
        if (words.method == 'operateStructure') {
            // _this.changeMenu(event, 'origin', true)
            _this.changeMenu(event, 'noomStructure', true)
        } else if (words.method == 'operateStructureRole') {
            // _this.changeMenu(event, 'role', true)
            _this.changeMenu(event, 'noomjuese', true)
        } else if (words.method == 'operateApproval') {
            _this.changeMenu(event, 'systemFlow', false)
        } else if (words.method == 'operateAttendance') {
            _this.changeMenu(event, 'noomkaoqing', true)
        } else if (words.method == 'openNewLargePage') {
            _this.showLargePanel(event, words.url, name);
            _this.changeMenu(event, 'stop', false)
        } else {
            _this.showpanel(event, words.url, name);
            _this.changeMenu(event, 'stop', false)

        }
    }


    // teachingAdmin panel
    showpanel(event, urls, name) {
        urls = urls += "?access_user=" + sessionStorage.getItem("ident");
        this.onMenu(event);

        let param = {
            mode: 'teachingAdmin',
            title: name,
            url: urls,
        };

        LP.Start(param);
    }

    showLargePanel(event, urls, name) {
        urls = urls += "?access_user=" + sessionStorage.getItem("ident");
        this.onMenu(event);

        let param = {
            mode: 'teachingAdmin',
            title: name,
            url: urls,
        };

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
                <div className="menu_til">教务管理</div>
                <ul className="first">
                    {this.state.arr}
                </ul>
                <UpLoadModal
                    isShow={this.state.makeDingModalIsShow}
                    closeDingModel={this.closeDingModel}
                    callbackId={this.state.callbackId}
                />
                <UpLoadImgModal
                    isShow={this.state.UploadImgModalIsShow}
                    closeDingModel={this.closeDingModel}
                    callbackId={this.state.callbackId}
                />
                <UploadVideoModal
                    isShow={this.state.UploadVideoIsShow}
                    closeDingModel={this.closeDingModel}
                    callbackId={this.state.callbackId}
                />
                <UploadAttechModal
                    isShow={this.state.uploadAttechModalIsShow}
                    closeDingModel={this.closeDingModel}
                    callbackId={this.state.callbackId}
                />
            </div>
        );
    }

}

export default SystemSettingGhostMenu;