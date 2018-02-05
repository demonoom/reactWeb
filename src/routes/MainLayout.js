import React from 'react';
import {Menu, Icon, Row, Col, notification, Modal, Collapse, Checkbox, Input, message} from 'antd';
import HeaderComponents from '../components/HeaderComponents';
import UserFace from '../components/UserCardModalComponents';
import FloatButton from '../components/FloatButton';
import PersonCenterMenu from '../components/layOut/PersonCenterMenu';
import PersonCenter from '../components/PersonCenter';
import moment from 'moment';
import AntNestTabComponents from '../components/antNest/AntNestTabComponents';
import DingMessageTabComponents from '../components/dingMessage/DingMessageTabComponents';
import AntGroupTabComponents from '../components/antGroup/AntGroupTabComponents';
import MessageMenu from '../components/layOut/MessageMenu';
import AntGroupMenu from '../components/layOut/AntGroupMenu';
import AntNestMenu from '../components/layOut/AntNestMenu';
import DingMessageMenu from '../components/dingMessage/DingMessageMenu';
import PersonCenterComponents from '../components/antGroup/PersonCenterComponents';
import AntCloudMenu from '../components/layOut/AntCloudMenu';
import AntCloudTableComponents from '../components/antCloud/AntCloudTableComponents';
import {LocaleProvider} from 'antd';
import {showLargeImg} from '../utils/utils'
import {isEmpty, SMALL_IMG, MIDDLE_IMG, LARGE_IMG} from '../utils/Const'
import TeachSpace from '../components/TeachSpaces';
import TeachSpaceGhostMenu from '../components/TeachSpacesGhostMenu';
import {MsgConnection} from '../utils/msg_websocket_connection';
import AntCloudClassRoomMenu from '../components/layOut/AntCloudClassRoomMenu';
import AntCloudClassRoomComponents from '../components/cloudClassRoom/AntCloudClassRoomComponents';
import SchoolGroupSettingComponents from '../components/schoolGroupSetting/SchoolGroupSettingComponents';
import SchoolGroupMenu from '../components/schoolGroupSetting/SchoolGroupMenu';
import SystemSettingGhostMenu from '../components/SystemSetting/SystemSettingGhostMenu';
import SystemSettingComponent from '../components/SystemSetting/SystemSettingComponent';
import AddShiftPosModel from '../components/Attendance/AddShiftPosModel';
import SendPicModel from '../components/antGroup/SendPicModel'
// 推荐在入口文件全局设置 locale
import 'moment/locale/zh-cn';

moment.locale('zh-cn');
import {createStore} from 'redux';

const Panel = Collapse.Panel;

const CheckboxGroup = Checkbox.Group;

var messageData = [];
var userMessageData = [];

const store = createStore(function () {

});
//消息通信js
window.ms = null;

const MainLayout = React.createClass({
    proxyObj: null,
    getInitialState() {
        return {
            collapse: true,
            ghostMenuVisible: true,
            systemSettingGhostMenuVisible: true,
            activeMiddleMenu: '',
            selectedKeys: '',
            personCenterParams: '',
            currentKey: 'message',
            openKeysStr: '',
            locale: 'zh-cn',
            resouceType: '',
            ifr: {},
            cloudRoomMenuItem: 'mulitiClass',
            antCloudKey: 'fileManager',
            activeSystemSettingMiddleMenu: '',
            mesTabClick: false,
            isSearch: false,
            isSearchGroup: false,
            isPersonCenter: false,
            addShiftPosModel: false,
            sendPicModel: false,
            lastClick: '',  //聊天功能最后一次点击的对象
            RMsgActiveKey: ['2'],
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this)
    },

    openNotification() {
        notification.open({
            // message: 'Notification Title',
            description: '你有一条新的叮消息，请及时查看.',
        });
    },


    onCollapseChange() {
        this.setState({
            collapse: !this.state.collapse,
        })
    },
    toolbarClick: function (e) {


        if ('teachSpace' == e.key) {

            if (e.key == this.state.currentKey) {
                this.changeGhostMenuVisible();
            } else {
                this.setState({currentKey: e.key, resouceType: 'B'});
            }
            return;
        }

        if ('systemSetting' == e.key) {
            // if (this.state.vipKey) {
            //     return;
            // }
            if (e.key == this.state.currentKey) {
                this.changeSystemGhostMenuVisible();
            } else {
                this.setState({currentKey: e.key, resouceType: 'B'});
            }
            return;
        }

        this.setState({currentKey: e.key, resouceType: ''});

        if (e.key != "KnowledgeResources") {
            var breadcrumbArray = [{hrefLink: '#/MainLayout', hrefText: "首页"}];
        }
    },

    componentDidMount() {
        this.refs.dingMusic.innerHTML = '<source src="../../static/dingmes.mp3" type="audio/mpeg">'
        this.refs.mesMusic.innerHTML = '<source src="../../static/message.mp3" type="audio/mpeg">'
        window.__noomSelect__ = this.noomSelect;
        window.__noomSelectGroup__ = this.noomSelectUser;
        window.__sendImg__ = this.sendImg;
        //定义方法（调用进入哪个聊天人）
        // window.__toWhichCharObj__ = this.toWhichCharObj;
        window.__noomSelectPic__ = this.noomSelectPic;
        window.__noomShareMbile__ = this.noomShareMbile;
    },

    componentWillMount() {
        var userIdent = sessionStorage.getItem("ident");
        if (userIdent == null || userIdent == "") {
            location.hash = "login";
        }

        var loginUserId = sessionStorage.getItem("ident");
        var machineId = localStorage.getItem("machineId");
        var password = sessionStorage.getItem("loginPassword");
        var pro = {
            "command": "messagerConnect",
            "data": {
                "machineType": "web",
                "userId": Number.parseInt(loginUserId),
                "machine": machineId,
                "password": password,
                "version": 0.1
            }
        };
        ms = new MsgConnection();
        ms.connect(pro);

    },


    noomSelectPic(src, obj) {
        this.setState({sendPicModel: true, pinSrc: src, picFile: obj});
    },

    /**
     * 分享移动网页的回调
     * @param src
     */
    noomShareMbile(src, title) {
        this.getAntGroup();
        this.getStructureUsers();
        this.getRecentContents();
        this.setState({shareSrc: src, shareTitle: title});
        this.setState({shareModalVisible: true});
    },

    collapseChange(key) {
        this.setState({RMsgActiveKey: key});
        this.getUserChatGroupById(-1);
        this.getRecentContents();
    },

    /**
     * 获取群组列表
     * @param pageNo
     */
    getUserChatGroupById(pageNo) {
        var _this = this;
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    // var charGroupArray = [];
                    var groupOptions = [];
                    response.forEach(function (e) {
                        var chatGroupId = e.chatGroupId;
                        var chatGroupName = e.name;
                        var membersCount = e.members.length;
                        var groupMemebersPhoto = [];
                        for (var i = 0; i < membersCount; i++) {
                            var member = e.members[i];
                            var memberAvatarTag = <img src={member.avatar}></img>;
                            groupMemebersPhoto.push(memberAvatarTag);
                            if (i >= 3) {
                                break;
                            }
                        }
                        var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                        switch (groupMemebersPhoto.length) {
                            case 1:
                                imgTag = <div className="maaee_group_face1">{groupMemebersPhoto}</div>;
                                break;
                            case 2:
                                imgTag = <div className="maaee_group_face2">{groupMemebersPhoto}</div>;
                                break;
                            case 3:
                                imgTag = <div className="maaee_group_face3">{groupMemebersPhoto}</div>;
                                break;
                            case 4:
                                imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                                break;
                        }
                        var groupName = chatGroupName;
                        var groupNameTag = <div>{imgTag}<span>{groupName}</span></div>
                        var groupJson = {label: groupNameTag, value: chatGroupId};
                        groupOptions.push(groupJson);
                    });
                    _this.setState({"groupOptions": groupOptions});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取联系人列表
     */
    getAntGroup() {
        var _this = this;
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var i = 0;
                var concatOptions = [];
                for (var i = 0; i < response.length; i++) {
                    if (response[i].colUid == 41451 || response[i].colUid == 138437 || response[i].colUid == 142033 || response[i].colUid == 139581) {
                        continue
                    }
                    var userId = response[i].colUid;
                    var userName = response[i].userName;
                    var imgTag = <img src={response[i].avatar} className="antnest_38_img" height="38"></img>;
                    var userNameTag = <div>{imgTag}<span>{userName}</span></div>;
                    var userJson = {label: userNameTag, value: userId};
                    if (userId != sessionStorage.getItem("ident")) {
                        concatOptions.push(userJson);
                    }
                }
                _this.setState({"concatOptions": concatOptions});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 组织架构列表
     */
    getStructureUsers: function () {
        var _this = this;
        var param = {
            "method": 'getStructureUsers',
            "operateUserId": sessionStorage.getItem("ident"),
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                var userStruct = [];
                data.forEach(function (e) {

                    var userStructId = e.colUid;
                    var userStructName = e.userName;
                    var userStructImgTag = <img src={e.avatar} className="antnest_38_img" height="38"></img>;
                    var userStructNameTag = <div>{userStructImgTag}<span>{userStructName}</span></div>;
                    var userStructJson = {label: userStructNameTag, value: userStructId};

                    if (userStructId != sessionStorage.getItem("userStructId")) {
                        userStruct.push(userStructJson);
                    }
                });
                _this.setState({"structureOptions": userStruct});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取最近联系人
     */
    getRecentContents() {
        userMessageData.splice(0);
        messageData.splice(0);
        var _this = this;
        var param = {
            "method": 'getUserRecentMessages',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false || isEmpty(messageData) == false) {
                    response.forEach(function (e) {
                        //如果这条消息的来源是我自己 助手 ,就直接讲readState制成1
                        _this.setMessageArrayForOnePerson(e);
                    });
                    _this.showMessageData();
                }


            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 将返回的每一个message消息对象进行处理，将同一个人的消息整合到一起
     * 格式为：{fromUser,messageResponse}
     * 如：{{colUid:23836,userName:'王丹'},[{content:'123'}{content:'test'}]}
     */
    setMessageArrayForOnePerson(messageObj) {
        if (messageObj.command == "message") {
            var fromUser = messageObj.fromUser;
            var content = messageObj.content;

            var messageIndex = -1;
            var messageToType = messageObj.toType;
            var contentJson = {"content": content,};
            if (messageToType == 1) {
                //个人消息
                var showUser;
                if (fromUser.colUid != sessionStorage.getItem("ident")) {
                    showUser = fromUser;
                } else {
                    showUser = messageObj.toUser;
                }
                if (isEmpty(showUser)) {
                    console.log("toUser为空");
                    return;
                }
                var colUid = showUser.colUid;
                messageIndex = this.checkMessageIsExist(colUid);
                //个人消息
                if (messageIndex == -1) {
                    var contentArray = [contentJson];
                    var userJson = {
                        key: colUid,
                        "fromUser": showUser,
                        contentArray: contentArray,
                        "messageToType": messageToType,
                    };
                    messageData.push(userJson);
                } else {
                    messageData[messageIndex].contentArray.push(contentJson);
                }
            } else {
                //群组消息
                var toChatGroup = messageObj.toChatGroup;
                if (isEmpty(toChatGroup) == false) {
                    var chatGroupId = toChatGroup.chatGroupId;
                    var groupName = toChatGroup.name;
                    messageIndex = this.checkMessageIsExist(messageObj.toChatGroup.chatGroupId);
                    if (messageIndex == -1) {
                        var contentArray = [contentJson];
                        var userJson = {
                            key: chatGroupId,
                            "fromUser": fromUser,
                            contentArray: contentArray,
                            "messageToType": messageToType,
                            "toChatGroup": toChatGroup,
                        };
                        messageData.push(userJson);
                    } else {
                        messageData[messageIndex].contentArray.push(contentJson);
                    }
                }
            }
        }
    },

    checkMessageIsExist(userId) {
        var messageIndex = -1;
        for (var i = 0; i < messageData.length; i++) {
            var userJson = messageData[i];
            if (userJson.key == userId) {
                messageIndex = i;
                break;
            }
        }
        return messageIndex;
    },

    /**
     * 渲染用户最新消息列表
     */
    showMessageData() {
        userMessageData.splice(0);
        messageData.forEach(function (data) {
            var messageType = data.messageToType;
            if (messageType == 1) {
                //个人消息
                var userStructId = data.key;
                var userStructName = data.fromUser.userName;
                var userStructImgTag = <img src={data.fromUser.avatar} className="antnest_38_img" height="38"></img>;
                var userStructNameTag = <div>{userStructImgTag}<span>{userStructName}</span></div>;
                var userStructJson = {label: userStructNameTag, value: userStructId};

                if (userStructId != sessionStorage.getItem("userStructId") && userStructId != 138437 && userStructId != 41451 && userStructId != 142033 && userStructId != 139581) {
                    userMessageData.push(userStructJson);
                }
            } else {
                //群组

                var chatGroupId = data.key;
                var chatGroupName = data.toChatGroup.name;
                var membersCount = data.toChatGroup.avatar.split('#').length;
                var groupMemebersPhoto = [];
                for (var i = 0; i < membersCount; i++) {
                    var memberAvatarTag = <img src={data.toChatGroup.avatar.split('#')[i] + '?' + SMALL_IMG}></img>;
                    groupMemebersPhoto.push(memberAvatarTag);
                    if (i >= 3) {
                        break;
                    }
                }
                var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                switch (groupMemebersPhoto.length) {
                    case 1:
                        imgTag = <div className="maaee_group_face1">{groupMemebersPhoto}</div>;
                        break;
                    case 2:
                        imgTag = <div className="maaee_group_face2">{groupMemebersPhoto}</div>;
                        break;
                    case 3:
                        imgTag = <div className="maaee_group_face3">{groupMemebersPhoto}</div>;
                        break;
                    case 4:
                        imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                        break;
                }
                var groupName = chatGroupName;
                var groupNameTag = <div>{imgTag}<span>{groupName}</span></div>
                var groupJson = {label: groupNameTag, value: chatGroupId + '%'};
                userMessageData.push(groupJson);
            }

        });
        this.setState({"userMessageData": []});   //先setStatet空可以让render强刷
        this.setState({"userMessageData": userMessageData});
    },

    /**
     * 修改分享文件的文本框内容改变响应函数
     */
    nowThinkingInputChange(e) {

        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var nowThinking = target.value;
        if (isEmpty(nowThinking)) {
            nowThinking = "这是一个云盘分享的文件";
        }
        this.setState({"nowThinking": nowThinking});
    },

    /**
     * 我的好友复选框被选中时的响应
     * @param checkedValues
     */
    concatOptionsOnChange(checkedValues) {
        this.setState({"checkedConcatOptions": checkedValues});
    },

    /**
     * 组织架构复选框被选中时的响应
     * @param checkedValues
     */
    roleOptionsOnChange(checkedValues) {
        this.setState({"checkedsSructureOptions": checkedValues});
    },

    /**
     * 我的好友复选框被选中时的响应x
     * @param checkedValues
     */
    groupOptionsOnChange(checkedValues) {
        this.setState({"checkedGroupOptions": checkedValues});
    },

    /**
     * 最近联系复选框被选中时的响应x
     * @param checkedValues
     */
    recentConnectOptionsOnChange(checkedValues) {
        this.setState({"checkedRecentConnectOptions": checkedValues});
    },

    /**
     * 分享文件点击OK
     */
    getsharekey() {
        var shareSrc = this.state.shareSrc;
        var shareTitle = this.state.shareTitle;
        var _this = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var createTime = (new Date()).valueOf();
        var messageToPer = 1;//根据接收者是群组还是个人来决定
        var messageToGrp = 4;
        var checkedConcatOptions = this.state.checkedConcatOptions;   //好友id数组
        var checkedGroupOptions = this.state.checkedGroupOptions;   //群组id数组
        var checkedsSructureOptions = this.state.checkedsSructureOptions;  //组织架构id数组
        var checkedRecentConnectOptions = this.state.checkedRecentConnectOptions;  //最近联系人id 既包括群组(%结尾)又有个人数组

        if (isEmpty(checkedConcatOptions) == true && isEmpty(checkedGroupOptions) == true && isEmpty(checkedsSructureOptions) == true && isEmpty(checkedRecentConnectOptions) == true) {
            message.error('请选择转发好友或群组');
            return false
        }

        //链接消息
        var cover = "http://png.findicons.com/files/icons/2083/go_green_web/64/link.png";
        var attachment = {
            "address": shareSrc,
            "createTime": createTime,
            "playing": false,
            "type": 4,
            "user": loginUser,
            "cover": cover,
            "content": shareTitle,
        };

        if (isEmpty(checkedRecentConnectOptions) == false) {
            checkedRecentConnectOptions.forEach(function (e) {
                var mes = e + '';
                if (mes.indexOf('%') == -1) {
                    //个人
                    var uuid = _this.createUUID();
                    var messageJson = {
                        'content': shareTitle, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "attachment": attachment, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                } else {
                    //群组
                    var toId = e.slice(0, e.length - 1)
                    var uuid = _this.createUUID();
                    var messageJson = {
                        'content': shareTitle, "createTime": createTime, 'fromUser': loginUser,
                        "toId": toId, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp, "attachment": attachment, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                }
            });
        }

        if (isEmpty(checkedGroupOptions) == false) {
            checkedGroupOptions.forEach(function (e) {
                var uuid = _this.createUUID();
                var messageJson = {
                    'content': shareTitle, "createTime": createTime, 'fromUser': loginUser,
                    "toId": e, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToGrp, "attachment": attachment, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            });
        }

        if (isEmpty(checkedConcatOptions) == false) {
            checkedConcatOptions.forEach(function (e) {
                var uuid = _this.createUUID();
                var messageJson = {
                    'content': shareTitle, "createTime": createTime, 'fromUser': loginUser,
                    "toId": e, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToPer, "attachment": attachment, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            });
        }

        if (isEmpty(checkedsSructureOptions) == false) {
            checkedsSructureOptions.forEach(function (e) {
                var uuid = _this.createUUID();
                var messageJson = {
                    'content': shareTitle, "createTime": createTime, 'fromUser': loginUser,
                    "toId": e, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToPer, "attachment": attachment, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            });
        }
        _this.shareModalHandleCancel();
    },

    /**
     * 关闭分享文件model
     */
    shareModalHandleCancel() {
        this.setState({
            shareModalVisible: false,
            "checkedGroupOptions": [],
            "checkedConcatOptions": [],
            "checkedsSructureOptions": [],
            "checkedRecentConnectOptions": [],
            RMsgActiveKey: ['2']
        });
    },

    toWhichCharObj() {
        var _this = this;
        var lastClick = this.state.lastClick;
        if (isEmpty(lastClick) == false) {

            setTimeout(function () {
                // _this.turnToMessagePage(lastClick);
                _this.refs.messageMenu.turnToMessagePage(lastClick);
            }, 50)
        } else {

        }
    },

    sendImg(currentUrl, urls) {
        var imgArr = [];
        var num = '';
        var urls = urls.split('#');
        var _this = this;
        //根据urls的length动态创建img
        urls.forEach(function (v, i) {
            var imgId = "img" + i;
            var img = <span className="topics_zan"><img id={imgId} className="topics_zanImg noomSendImg"
                                                        onClick={showLargeImg} src={v}/>
                      </span>;
            imgArr.push(img);
            if (currentUrl == v) {
                num = i;
            }
        });
        this.setState({imgArr});
        //图片已渲染到DOM
        document.querySelectorAll(".noomSendImg")[num].click();   //使用noomSendImg可以区分选择的图片是聊天里的还是审批里的,不会造成混乱
    },

    noomSelect(obj) {
        this.sendMessage_noom_user(obj);
    },

    sendMessage_noom_user(userInfo) {
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: userInfo.colUid,
            "fromUser": userInfo,
            contentArray: contentArray,
            "messageToType": 1,
        };
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "userInfo": userInfo,
            "messageType": 'message',
            "actionFrom": "search",
            userJson,
            isSearch: true
        });
    },

    noomSelectUser(obj) {
        this.sendMessage_noom_group(obj);
    },

    sendMessage_noom_group(groupObj) {
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: groupObj.chatGroupId,
            "fromUser": groupObj,
            contentArray: contentArray,
            "messageToType": 4,
            "toChatGroup": groupObj
        };
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "groupObj": groupObj,
            "messageType": 'groupMessage',
            "actionFrom": "personCenterGroupList",
            userJson,
            isSearchGroup: true
        });
    },

    //获取试卷列表
    getExamPagerList: function (optType) {
        this.refs.examPagerTabComponents.getExamPagerList();
    },

    getStudyEvaluate: function (optType) {
        this.refs.studyEvaluateTabComponents.getStudyEvaluate();
    },

    callBackKnowledgeMenuBuildBreadCrume(menuText, menuLevel, menuId, openKeysStr) {
        return this.refs.knowledgeMenuComponents.bulidBreadCrumbArray(menuText, menuLevel, menuId, openKeysStr);

    },

    getTeacherResource(params) {

        this.setState({resouceType: '', currentKey: "personCenter", personCenterParams: params});
    },


    getAntNest(optType) {
        //onlyTeacherTopic或者getAllTopic
        var pageNo;
        var fromTap = true;
        if ("getAllTopic" == optType) {
            this.refs.antNestTabComponents.getTopics(pageNo, 0, true, fromTap);
        } else {
            this.refs.antNestTabComponents.getTopics(pageNo, 1, true, fromTap);
        }
    },

    getDingMessage(optType) {
        var pageNo = 1;
        if ("myReceive" == optType) {
            this.refs.dingMessageTabComponents.getDList(pageNo, 1);
        } else {
            this.refs.dingMessageTabComponents.getDList(pageNo, 2);
        }
        this.refs.dingMessageTabComponents.mesListLev();
    },
    /**
     * 收到叮消息的回调
     * @param flag
     */
    showAlert(flag) {
        if (flag) {
            //控制小红点的显示与隐藏
            this.refs.dingAlert.className = 'ding_alert_show';
            //控制提示框
            this.openNotification();
            //控制提示音播放
            var audio = document.getElementById("dingMusic");
            audio.play();
            // document.title = '您有新的叮消息';

        } else {
            this.refs.dingAlert.className = 'ding_alert';
        }

    },

    /**
     * 聊天卸载时，将这个js保存的信息清空，下次加载时会调用点击最后的那个方法
     */
    clearEverything() {
        this.setState({userInfo: ''});
        this.setState({messageType: ''});
    },

    /**
     * 收到普通消息的回调
     */
    showMesAlert(flag) {
        if (flag) {
            //控制提示音播放
            var audio = document.getElementById("mesMusic");
            audio.play();
            //控制小红点的显示与隐藏
            this.refs.msgAlert.className = 'ding_alert_show';
        } else {
            this.refs.msgAlert.className = 'ding_alert';
        }
    },

    refresh() {
        // var flag = this.state.mesTabClick;
        // if (!flag) {
        // this.refs.messageMenu.getUserRecentMessages();
        // }
        this.refs.messageMenu.componentWillReceiveProps();
    },

    teachSpaceTab(activeMenu, beActive) {
        let _this = this;
        // 2
        this.changeGhostMenuVisible({visible: false, beActive: beActive});
        this.setState({activeMiddleMenu: activeMenu});
    },

    systemSettingTab(activeMenu, beActive, selectedKeys) {
        //activeMenu就是区别用的那个字符串
        //beActive为true，ghost就会拉进去，否则不会进去
        this.changeSystemGhostMenuVisible({visible: false, beActive: beActive});
        this.setState({activeSystemSettingMiddleMenu: activeMenu});
        this.setState({selectedKeys: selectedKeys});
    },
    checkVip(a) {
        this.setState({vipKey: a});
    },

    /**
     * 设置教学空间的Ghost Menu的显示和关闭
     * @param obj
     */
    changeGhostMenuVisible(obj) {
        if (obj) {
            if (!obj.beActive) return;
            this.setState({ghostMenuVisible: obj.visible});
        } else {
            let visible = !this.state.ghostMenuVisible;
            this.setState({ghostMenuVisible: visible});
        }
    },

    /**
     * 设置系统设置的Ghost Menu的显示和关闭
     * @param obj
     */
    changeSystemGhostMenuVisible(obj) {
        if (obj) {
            if (!obj.beActive) return;
            this.setState({systemSettingGhostMenuVisible: obj.visible});
        } else {
            let visible = !this.state.systemSettingGhostMenuVisible;
            if (this.state.vipKey) {
                return;
            }
            this.setState({systemSettingGhostMenuVisible: visible});
        }
    },


    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getPersonalCenterData(userId) {
        this.refs.personCenterComponents.getPersonalCenterData(userId);
    },

    setFirstPerson(userContactsData) {
        var userJson = userContactsData[0];
        this.setState({"userContactsData": userContactsData});
        this.getPersonalCenterData(userJson.userObj.colUid);
    },

    getGroupInfo() {
        this.refs.personCenterComponents.getUserChatGroup();
    },

    getGroupMenu() {
        this.refs.personCenterComponents.getGroupMenu();
    },
    /**
     * 回调发送群组消息
     * @param groupObj
     */
    sendGroupMessage(groupObj) {
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: groupObj.chatGroupId,
            // key: groupObj.ownerId,
            "fromUser": groupObj,
            contentArray: contentArray,
            "messageToType": 4,
            "toChatGroup": groupObj
        };
        this.setState({
            currentKey: 'message',
            resouceType: '',
            "groupObj": groupObj,
            "messageType": 'groupMessage',
            "actionFrom": "personCenterGroupList",
            userJson,
            lastClick: userJson
        });
    },

    /**
     * 好友对好友的消息发送
     */
    sendMessage(userInfo) {
        var contentJson = {"content": '', "createTime": ''};
        var contentArray = [contentJson];
        var userJson = {
            key: userInfo.user.colUid,
            "fromUser": userInfo.user,
            contentArray: contentArray,
            "messageToType": 1
        };
        this.setState({
            //把currentKey改成了’message‘就能够装载 消息组件
            lastClick: userJson,
            currentKey: 'message',
            resouceType: '',
            "userInfo": userInfo.user,
            "messageType": 'message',
            "actionFrom": "personCenter",
            userJson,
            isPersonCenter: true,
        });
    },

    /**
     * 好友对好友的消息发送
     */
    receiveNewMessage(userJson) {
        this.setState({
            // currentKey: 'message',
            // resouceType: '',
            "userInfo": userJson.fromUser,
            "messageType": 'message',
            "actionFrom": "backgroudMessage",
            "userJson": userJson
        });
    },

    /**
     * 点击消息动态联系人列表时，进入消息列表
     * 根据当前点击的消息对象不同，分别进入个人消息和群组消息界面
     * @param fromObj
     */
    turnToMessagePage(fromObj) {
        var timeNode = (new Date()).valueOf();
        if (fromObj.fromUser.colUtype == "SGZH_WEB") {
            //审批助手逻辑
            this.refs.antGroupTabComponents.getShengpiMes(fromObj.fromUser.colUid);
        } else {
            //有的地方写的是messageType，有的地方写的是messageToType,都要考虑到
            if (fromObj.messageType == 1 || fromObj.messageToType == 1) {
                // 个人消息
                this.refs.antGroupTabComponents.getPersonMessage(fromObj.fromUser, timeNode);
            } else {
                // 群组消息
                this.refs.antGroupTabComponents.sendGroupMessage(fromObj.toChatGroup, timeNode);
            }
        }

        this.setState({mesTabClick: true});
        //将最后一次点击的信息全部存储在mainLayOut的state中
        this.setState({lastClick: fromObj});
    },

    changeMesTabClick() {
        this.setState({mesTabClick: false});
    },

    getAntCloud(optType) {
        this.setState({"antCloudKey": optType});
    },

    getSubGroup(structureId, structure) {
        this.setState({structureId, rootStructure: structure});
    },

    /**
     * 获取云校的操作
     * @param menuItemKey
     */
    getCloudClassRoom(menuItemKey) {
        console.log("menuItemKey:" + menuItemKey);
        this.setState({"cloudRoomMenuItem": menuItemKey});
    },
    search() {
        //打开littlepanel
        var loginUserId = sessionStorage.getItem("ident");
        let obj = {
                mode: 'teachingAdmin',
                url: 'http://www.maaee.com//Excoord_PhoneService/antSearch/indexSearch/' + loginUserId,
                title: '搜索'
            }
        ;
        LP.Start(obj);
    },

    changeIsSearch() {
        this.setState({isSearch: false});
    },

    changeIsSearchGroup() {
        this.setState({isSearchGroup: false});
    },

    changeIsPersonCenter() {
        this.setState({isPersonCenter: false});
    },

    mapShow() {
        this.setState({addShiftPosModel: true});
    },

    closeModel(flag) {
        this.setState({addShiftPosModel: false});
        // if(flag) {
        //     window.__setPos__();
        // }
    },

    closeSendPicModel() {
        this.setState({sendPicModel: false});
    },

    postPos(postPos) {
        this.setState({postPos});
        window.__setPos__(postPos);
    },

    sendPicToOthers(url) {
        this.refs.antGroupTabComponents.sendPicToOthers(url);
    },

    createUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },

    render() {

        const collapse = this.state.collapse;
        //根据如下判断结果，完成对页面中部位置的渲染，不同情况，渲染不同组件
        var middleComponent;
        var mainContent;
        var tabComponent;

        switch (this.state.currentKey) {
            case 'message':
                //消息动态
                middleComponent = <MessageMenu onUserClick={this.turnToMessagePage}
                                               userJson={this.state.userJson}
                                               isSearch={this.state.isSearch}
                                               isSearchGroup={this.state.isSearchGroup}
                                               isPersonCenter={this.state.isPersonCenter}
                                               changeIsSearch={this.changeIsSearch}
                                               changeIsSearchGroup={this.changeIsSearchGroup}
                                               changeIsPersonCenter={this.changeIsPersonCenter}
                                               onLoad={this.turnToMessagePage}
                                               changeMesTabClick={this.changeMesTabClick}
                                               toWhichCharObj={this.toWhichCharObj}
                                               ref="messageMenu"
                />;
                tabComponent = <AntGroupTabComponents ref="antGroupTabComponents"
                                                      userInfo={this.state.userInfo}
                                                      groupObj={this.state.groupObj}
                                                      actionFrom={this.state.actionFrom}
                                                      messageType={this.state.messageType}
                                                      messageUtilObj={ms}
                                                      onNewMessage={this.receiveNewMessage}
                                                      showAlert={this.showAlert}
                                                      showMesAlert={this.showMesAlert}
                                                      refresh={this.refresh}
                                                      clearEverything={this.clearEverything}
                />;
                break;
            case 'antGroup':
                //蚁群
                middleComponent = <AntGroupMenu ref="antGroupMenu" callbackSetFirstPerson={this.setFirstPerson}
                                                callbackPersonCenterData={this.getPersonalCenterData}
                                                callbackGetGroupInfo={this.getGroupInfo}
                                                callbackGetGroupMenu={this.getGroupMenu}
                />;
                tabComponent = <PersonCenterComponents ref="personCenterComponents"
                                                       userInfo={this.state.userObj}
                                                       userContactsData={this.state.userContactsData}
                                                       onSendGroupMessage={this.sendGroupMessage}
                                                       onSendMessage={this.sendMessage}/>;
                break;
            case 'personCenter':
                //个人中心
                middleComponent = <PersonCenterMenu callbackParent={this.getTeacherResource}/>;
                tabComponent = <PersonCenter params={this.state.personCenterParams}/>;

                break;
            case 'antNest':
                //蚁巢
                middleComponent = <AntNestMenu callbackParent={this.getAntNest}/>;
                tabComponent = <AntNestTabComponents ref="antNestTabComponents"/>;

                break;
            case 'teachSpace':
                //教学空间
                middleComponent =
                    <TeachSpaceGhostMenu visible={this.state.ghostMenuVisible}
                                         toggleGhostMenu={this.changeGhostMenuVisible}
                                         changeTabEvent={this.teachSpaceTab}/>;
                tabComponent = <TeachSpace currentItem={this.state.activeMiddleMenu}/>;
                break;
            case 'antCloud':
                //蚁盘
                middleComponent = <AntCloudMenu callbackParent={this.getAntCloud}/>;
                tabComponent = <AntCloudTableComponents antCloudKey={this.state.antCloudKey}
                                                        messageUtilObj={ms}
                ></AntCloudTableComponents>;
                // tabComponent = <nAntCloudTableComponents antCloudKey={this.state.antCloudKey}
                //                                         messageUtilObj={ms}
                // ></nAntCloudTableComponents>;
                break;
            case 'antCloudClassRoom':
                //云校
                middleComponent = <AntCloudClassRoomMenu callbackParent={this.getCloudClassRoom}/>;
                tabComponent = <AntCloudClassRoomComponents currentItem={this.state.cloudRoomMenuItem}/>;

                break;

            case 'systemSetting':
                //教学管理
                middleComponent =
                    <SystemSettingGhostMenu visible={this.state.systemSettingGhostMenuVisible}
                                            toggleGhostMenu={this.changeSystemGhostMenuVisible}
                                            changeTabEvent={this.systemSettingTab}
                                            checkVip={this.checkVip}
                    />;
                tabComponent = <SystemSettingComponent currentItem={this.state.activeSystemSettingMiddleMenu}
                                                       changeTab={this.systemSettingTab}
                                                       mapShow={this.mapShow}
                                                       postPos={this.state.postPos}></SystemSettingComponent>;

                break;
            case 'dingMessage':
                //叮消息
                middleComponent = <DingMessageMenu callbackParent={this.getDingMessage}/>;
                tabComponent = <DingMessageTabComponents ref="dingMessageTabComponents" showAlert={this.showAlert}/>;

                break;
        }
        //
        //
        //
        /*
         就是页面右侧的结构，目前只有两种默认左右分
         */
        switch (this.state.resouceType) {
            default :
                mainContent = <Row>
                    <Col span={5}>
                        {middleComponent}
                    </Col>
                    <Col span={19}>
                        <div className="ant-layout-container">
                            <div className="ant-layout-content">
                                {tabComponent}
                            </div>
                        </div>
                    </Col>
                </Row>;
                break;
            case 'B':
                mainContent =
                    <Row>
                        <Col span={24}>
                            <div className="ant-layout-container teachSpacePanel">
                                {tabComponent}
                                {middleComponent}
                            </div>
                        </Col>
                    </Row>;
                break;
        }
        //
        //
        //
        return (
            <LocaleProvider locale={this.state.locale}>
                <div className={collapse ? "ant-layout-aside ant-layout-aside-collapse" : "ant-layout-aside"}>

                    <aside className="ant-layout-sider">
                        <div className="ant-layout-logo">
                            <UserFace callbackParent={this.getTeacherResource}/>
                        </div>
                        <Menu mode="inline" theme="dark"
                              defaultSelectedKeys={[this.state.currentKey]}
                              selectedKeys={[this.state.currentKey]}
                            // onClick={this.toolbarClick.bind(this,event,this.state.vipKey)}>
                              onClick={this.toolbarClick}>
                            <Menu.Item key="message" className="padding_menu">
                                <i className="icon_menu_ios icon_message"></i>
                                <b className="ding_alert" ref='msgAlert'></b>
                                <div className="tan">动态</div>

                            </Menu.Item>
                            <Menu.Item key="antNest" className="padding_menu">
                                <i className="icon_menu_ios icon_yichao1"></i>
                                <div className="tan">蚁巢</div>
                            </Menu.Item>
                            <Menu.Item key="teachSpace" className="padding_menu">
                                <i className="icon_menu_ios icon_jiaoxue"></i>
                                <div className="tan">教学空间</div>
                            </Menu.Item>
                            <Menu.Item key="antGroup" className="padding_menu">
                                <i className="icon_menu_ios icon_antgroup"></i>
                                <div className="tan">蚁群</div>
                            </Menu.Item>
                            <Menu.Item key="antCloudClassRoom" className="padding_menu">
                                <i className="icon_menu_ios icon_cloud"></i>
                                <div className="tan">云校</div>
                            </Menu.Item>
                            <Menu.Item key="antCloud" className="padding_menu">
                                <i className="icon_menu_ios icon_antdisk"></i>
                                <div className="tan">蚁盘</div>
                            </Menu.Item>
                            <Menu.Item key="systemSetting" className="padding_menu">
                                <i className="icon_menu_ios icon_schoolGroup"></i>
                                <div className="tan">教务管理</div>
                            </Menu.Item>
                            <Menu.Item key="dingMessage" className="padding_menu">
                                <i className="icon_menu_ios icon_ding"></i>
                                <b className="ding_alert" ref='dingAlert'></b>
                                <div className="tan">叮一下</div>
                            </Menu.Item>
                            <FloatButton ref="floatButton" messageUtilObj={ms}/>
                        </Menu>

                        <div className="ant-aside-action">

                        </div>

                    </aside>

                    <div className="ant-layout-main">
                        <div className="ant-layout-header">
                            <HeaderComponents search={this.search}/>
                        </div>

                        <div className="ant-layout-operation">
                            {mainContent}
                        </div>
                    </div>
                    <div className="panleArea"></div>
                    <div className="downloadArea"></div>
                    <div>
                        <audio id="dingMusic" ref='dingMusic'>

                        </audio>
                        <audio id="mesMusic" ref='mesMusic'>

                        </audio>
                    </div>
                    <AddShiftPosModel
                        isShow={this.state.addShiftPosModel}
                        closeModel={this.closeModel}
                        postPos={this.postPos}
                    />
                    <SendPicModel
                        isShow={this.state.sendPicModel}
                        closeModel={this.closeSendPicModel}
                        pinSrc={this.state.pinSrc}
                        picFile={this.state.picFile}
                        sendPicToOthers={this.sendPicToOthers}
                    />
                    <Modal title="分享文件" className="cloud_share_Modal"
                           visible={this.state.shareModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onCancel={this.shareModalHandleCancel}
                           onOk={this.getsharekey}
                    >
                        <div>
                            <Row>
                                <Col span={12} className="share_til">选择好友分享文件：</Col>
                                <Col span={12} className="share_til">这一刻的想法：
                                    <span className="right_ri cloud_share_prompt"><Icon type="link"
                                                                                        className="info_school_s"/><span>这是一个云盘分享的文件</span></span>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={11} className="upexam_float cloud_share_cont">
                                    <Collapse bordered={false} activeKey={this.state.RMsgActiveKey}
                                              onChange={this.collapseChange}
                                    >
                                        <Panel header="最近联系人" key="2">
                                            <CheckboxGroup options={this.state.userMessageData}
                                                           value={this.state.checkedRecentConnectOptions}
                                                           onChange={this.recentConnectOptionsOnChange}
                                            />
                                        </Panel>
                                        <Panel header="我的群组" key="1">
                                            <CheckboxGroup options={this.state.groupOptions}
                                                           value={this.state.checkedGroupOptions}
                                                           onChange={this.groupOptionsOnChange}
                                            />
                                        </Panel>
                                        <Panel header="我的好友" key="0">
                                            <CheckboxGroup options={this.state.concatOptions}
                                                           value={this.state.checkedConcatOptions}
                                                           onChange={this.concatOptionsOnChange}
                                            />
                                        </Panel>
                                        <Panel header="组织架构" key="3">
                                            <CheckboxGroup options={this.state.structureOptions}
                                                           value={this.state.checkedsSructureOptions}
                                                           onChange={this.roleOptionsOnChange}
                                            />
                                        </Panel>
                                    </Collapse>
                                </Col>
                                <Col span={12} className="topics_dianzan">
                                    <div>
                                        <Input type="textarea" rows={14} placeholder="这是一个云盘分享的文件"
                                               value={this.state.nowThinking}
                                               onChange={this.nowThinkingInputChange}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Modal>
                    <ul style={{display: 'none'}}>
                        <li className="imgLi">
                            {this.state.imgArr}
                        </li>
                    </ul>
                </div>
            </LocaleProvider>
        );
    },

});

export default MainLayout;

