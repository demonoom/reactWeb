import React from 'react';
import {
    Menu,
    Icon,
    Row,
    Col,
    notification,
    Modal,
    Collapse,
    Checkbox,
    Input,
    message,
    Button,
    Radio,
    Table,
    Breadcrumb,
    Tag,
    Tooltip
} from 'antd';
import HeaderComponents from '../components/HeaderComponents';
import UserFace from '../components/UserCardModalComponents';
import FloatButton from '../components/FloatButton';
import PersonCenterMenu from '../components/layOut/PersonCenterMenu';
import PersonCenter from '../components/PersonCenter';
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
import {SMALL_IMG} from '../utils/Const'
import TeachSpace from '../components/TeachSpaces';
import TeachSpaceGhostMenu from '../components/TeachSpacesGhostMenu';
import {MsgConnection} from '../utils/msg_websocket_connection';
import AntCloudClassRoomMenu from '../components/layOut/AntCloudClassRoomMenu';
import AntCloudClassRoomComponents from '../components/cloudClassRoom/AntCloudClassRoomComponents';
import SystemSettingGhostMenu from '../components/SystemSetting/SystemSettingGhostMenu';
import SystemSettingComponent from '../components/SystemSetting/SystemSettingComponent';
import AddShiftPosModel from '../components/Attendance/AddShiftPosModel';
import SendPicModel from '../components/antGroup/SendPicModel'
import {isEmpty, showLargeImg, setLocalLanaguage, getMessageFromLanguage, getLocalFromLanguage} from '../utils/utils';
import BindCoordinates from '../components/BindCoordinates/BindCoordinates'
import UploadMp3Modal from '../components/UploadMp3Modal'
import UploadOnlyVideoModal from '../components/SystemSetting/UploadOnlyVideoModal'
import UploadOnlyExcelModal from '../components/SystemSetting/UploadOnlyExcelModal'
//国际化
import {IntlProvider, addLocaleData} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';
import enUS from 'antd/lib/locale-provider/en_US';
import GuideModal from '../components/GuideModal';
import {createStore} from 'redux';
import {doWebService} from '../WebServiceHelper';
import UploadImgAndVideoModal from "../components/SystemSetting/UploadImgAndVideoModal";

const Panel = Collapse.Panel;

const {TextArea} = Input;

const RadioGroup = Radio.Group;

const CheckboxGroup = Checkbox.Group;

const memberColumns = [{
    title: '姓名',
    dataIndex: 'userName',
    key: 'userName',
    width: 160,
    className: 'dold_text departmental_officer'
}];

//部门
var columns = [{
    title: '部门名称',
    dataIndex: 'subGroupName',
    key: 'subGroupName',
}];

const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
};

var selectArr = [];
var messageData = [];
var userMessageData = [];
var structuresObjArray = [];
var subGroupMemberList = [];

var delLastClick = false;

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
            searchWords: '',
            userNameFromOri: '',
            structuresObjArray: [],
            selectedRowKeys: [],
            tags: [],  //标签显示
            inputVisible: false,
            videoPlayModel: false,
            inputValue: '',
            selectMp3ModalIsShow: false,
            calmOnlyVideoModalIsShow: false,
            calmOnlyExcelModalIsShow: false,
            selectMp3CallbackId: '',
            calmOnlyVideoCallbackId: '',
            calmOnlyExcelCallbackId: '',
        };
        this.changeGhostMenuVisible = this.changeGhostMenuVisible.bind(this)
        this.calmImgAndVideo = this.calmImgAndVideo.bind(this);
    },

    openNotification() {
        notification.open({
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

        if ('unionClass' == e.key) {
            this.setState({currentKey: e.key, resouceType: 'C'});
        } else {
            this.setState({currentKey: e.key, resouceType: ''});
        }
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
        window.__bindCoordinates__ = this.bindCoordinates;
        window.__playVideo__ = this.playVideo;
        window.__playAudio__ = this.playAudio;
        window.__selectMp3__ = this.selectMp3;
        window.__calmOnlyVideo__ = this.calmOnlyVideo;
        window.__calmOnlyExcel__ = this.calmOnlyExcel;
        window.__noomSaveFileError__ = this.noomSaveFile;
        window.__calmImgAndVideo__ = this.calmImgAndVideo;
    },

    noomSaveFile() {
        message.error('请将文件分享给某个人后在动态中进行操作');
    },

    calmImgAndVideo(callbackId) {
        this.setState({
            uploadImgAndVideoIsShow: true
        })
        this.setState({
            callbackId
        })
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
     * 因为需要填写想法,因此使用到999的就只有这两处,他们在确定时发送的对象略有不同,在此用shareType做以区分
     * @param src
     */
    noomShareMbile(src, title) {
        this.showAddMembersModal(999);
        this.setState({shareSrc: src, shareTitle: title});
        this.setState({shareType: 0});
        // this.getAntGroup();
        // this.getStructureUsers();
        // this.getRecentContents();
        // this.setState({shareModalVisible: true});
    },

    /**
     * 打点功能进行显示
     */
    bindCoordinates() {
        this.refs.bindCoordinatesModel.changeConfirmModalVisible(true)
    },

    selectMp3(callbackId) {
        //控制上传组件的显示与隐藏
        this.setState({selectMp3ModalIsShow: true});
        this.setState({selectMp3CallbackId: callbackId});
    },
    calmOnlyVideo(callbackId) {
        //控制上传组件的显示与隐藏
        this.setState({calmOnlyVideoModalIsShow: true});
        this.setState({calmOnlyVideoCallbackId: callbackId});
    },
    calmOnlyExcel(callbackId) {
        //控制上传组件的显示与隐藏
        this.setState({calmOnlyExcelModalIsShow: true});
        this.setState({calmOnlyExcelCallbackId: callbackId});
    },

    closeSelectMp3Model() {
        this.setState({selectMp3ModalIsShow: false});
    },
    closecalmOnlyVideoModalIsShowModel() {
        this.setState({calmOnlyVideoModalIsShow: false});
    },
    closecalmOnlyExcelModalIsShowModel() {
        this.setState({calmOnlyExcelModalIsShow: false});
    },

    playVideo(src) {
        console.log(src);

        var videoPlayer = <video id="videoPlayerAr" controls="controls" minLength={100} autoplay>
            <source type="video/mp4" src={src}/>
        </video>;
        this.setState({videoPlayModel: true, videoPlayer});
        setTimeout(function () {
            document.getElementById('videoPlayerAr').play();
        }, 300)
    },

    playAudio(src) {

        var audioPlayer = <audio id="audioPlayerAr" controls="controls" autoplay>
            <source src={src}/>
        </audio>;

        this.setState({audioPlayModel: true, audioPlayer});
        setTimeout(function () {
            document.getElementById('audioPlayerAr').play();
        }, 300)

    },

    audioPlayerModalHandleCancel() {
        var audioPlayer = '';
        this.setState({audioPlayModel: false, audioPlayer});
        document.getElementById('audioPlayerAr').pause();
    },

    videoPlayerModalHandleCancel() {
        var videoPlayer = '';
        this.setState({videoPlayModel: false, videoPlayer});
        document.getElementById('videoPlayerAr').pause();
    },

    /**
     * 从蚁盘分享文件调用新model
     * 因为需要填写想法,因此使用到999的就只有这两处,他们在确定时发送的对象略有不同,在此用shareType做以区分
     * @param obj
     */
    showShareFromCloud(obj) {
        this.showAddMembersModal(999);
        this.setState({shareType: 1, shareCloudFile: obj});
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
        this.setState({"nowThinking": nowThinking});
    },

    /**
     * 群点击设置上层只传入id过来.剩下的交给下层
     */
    gopTalkSetClick(id) {
        var _this = this;
        var param = {
            "method": 'getChatGroupById',
            "chatGroupId": id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    var members = data.members;
                    var membersArray = [];
                    members.forEach(function (e) {
                        var memberId = e.colUid;
                        var memberName = e.userName;
                        var userJson = {key: memberId, groupUser: memberName, userInfo: e};
                        membersArray.push(userJson);
                    });
                    _this.buildGroupSet(membersArray, data);

                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 群主转让
     */
    mainTransfer(currentMemberArray) {
        //先渲染出来，在展示弹框
        var array = [];
        currentMemberArray.forEach(function (v, i) {
            var radioSon = <Radio style={radioStyle} value={v.key}>{v.groupUser}</Radio>;
            array.push(radioSon);
        });
        this.setState({radioSon: array});
        this.setState({mainTransferModalVisible: true});
    },

    mainTransferModalHandleCancel() {
        this.setState({mainTransferModalVisible: false});
        this.setState({radioValue: 1});
    },

    mainTransferOnChange(e) {
        this.setState({
            radioValue: e.target.value,
        });
    },

    mainTransferForSure() {
        var _this = this;
        var newOwnerId = this.state.radioValue;
        var oldOwnerId = this.state.currentGroupObj.owner.colUid;
        var chatGroupId = this.state.currentGroupObj.chatGroupId;
        var param = {
            "method": 'changeChatGroupOwner',
            "chatGroupId": chatGroupId,
            "oldOwnerId": oldOwnerId,
            "newOwnerId": newOwnerId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success('转让成功');
                    _this.mainTransferModalHandleCancel();
                    var obj = _this.state.currentGroupObj;
                    obj.owner.colUid = newOwnerId;
                    _this.setState({currentGroupObj: obj});
                    _this.levGroupSet();
                    //重新刷新页面
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 修改群名称
     */
    showUpdateChatGroupNameModal() {
        var currentGroupObj = this.state.currentGroupObj;
        var updateChatGroupTitle = currentGroupObj.name;
        this.setState({"updateChatGroupNameModalVisible": true, "updateChatGroupTitle": updateChatGroupTitle});
    },

    /**
     * 关闭修改群名称的窗口
     */
    updateChatGroupNameModalHandleCancel() {
        this.setState({"updateChatGroupNameModalVisible": false});
    },

    /**
     * 修改群名称
     */
    updateChatGroupName() {
        var _this = this;
        //更新(判断和当前的groupObj信息是否一致)
        var currentGroupObj = this.state.currentGroupObj;
        if (isEmpty(this.state.updateChatGroupTitle) == false) {
            var param = {
                "method": 'updateChatGroupName',
                "chatGroupId": currentGroupObj.chatGroupId,
                "name": this.state.updateChatGroupTitle,
                "userId": sessionStorage.getItem("ident"),
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    var response = ret.response;
                    if (ret.msg == "调用成功" && ret.success == true && response == true) {
                        message.success("聊天群组修改成功");
                    } else {
                        message.success("聊天群组修改失败");
                    }
                    _this.setState({"updateChatGroupNameModalVisible": false});
                    _this.levGroupSet();
                    var antGroupTabComponents = _this.refs.antGroupTabComponents;
                    var personCenterComponents = _this.refs.personCenterComponents;
                    if (isEmpty(antGroupTabComponents) == false) {
                        antGroupTabComponents.changeWelcomeTitle(_this.state.updateChatGroupTitle)
                    }
                    if (isEmpty(personCenterComponents) == false) {
                        personCenterComponents.getUserChatGroup()
                    }
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },

    /**
     * 修改群组名称时，名称内容改变的响应函数
     * @param e
     */
    updateChatGroupTitleOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var updateChatGroupTitle = target.value;
        this.setState({"updateChatGroupTitle": updateChatGroupTitle});
    },

    creatGroup() {
        //创建群聊
        this.showAddMembersModal(99);
    },

    choiceCanSeePer(type, arr) {
        //接收到id进行初始化
        var array = [];
        if (isEmpty(arr) == false) {
            arr.forEach(function (v, i) {
                array.push(v.userId);
            })
        }
        // selectArr
        selectArr = arr;
        this.setState({selectedRowKeys: array, tags: arr});
        this.showAddMembersModal(type);
    },

    /**
     * 添加群成员(两种情况下的搜索fanwei)
     */
    showAddMembersModal(type) {
        if (type == 1) {
            //部门群
            this.getStructureById("-1");
            this.setState({
                "addDeGroupMemberModalVisible": true,
                originDiv: 'none',
                OriUserNotOrIf: 'none',
                OriUserIfOrNot: 'block',
                originFlag: true,
                searchArea: 'originzation',
                inputClassName: 'ant-form-item add_member_menu_search2 line_block',
                creatInput: 'none',
                superTitleName: '添加群成员',
                groupDiv: 'none',
                idea: 'none',
                choiceCanSeePer: false
            });
        } else if (type == 99) {
            //创建群聊
            this.setState({
                "addDeGroupMemberModalVisible": true,
                originDiv: 'inline-block',
                OriUserNotOrIf: 'block',
                OriUserIfOrNot: 'none',
                originFlag: false,
                searchArea: 'defaultArea',
                inputClassName: 'ant-form-item add_member_menu_search line_block',
                creatInput: 'block',    //控制创建群名搜索框
                superTitleName: '创建群聊',
                groupDiv: 'none',
                idea: 'none',
                choiceCanSeePer: false
            });
            this.getRecentShareUsers();
        } else if (type == 999) {
            //分享想法
            this.setState({
                "addDeGroupMemberModalVisible": true,
                originDiv: 'inline-block',
                OriUserNotOrIf: 'block',
                OriUserIfOrNot: 'none',
                originFlag: false,
                searchArea: 'defaultArea',
                inputClassName: 'ant-form-item add_member_menu_search line_block',
                creatInput: 'none',    //控制创建群名搜索框
                idea: 'block',    //控制想法textarea
                superTitleName: '分享文件',
                groupDiv: 'inline-block',
                choiceCanSeePer: false
            });
            this.getRecentShareUsers();
        } else if (type == 9999) {
            //仅做选人逻辑,确定返回选人的id
            this.setState({
                "addDeGroupMemberModalVisible": true,
                originDiv: 'inline-block',
                OriUserNotOrIf: 'block',
                OriUserIfOrNot: 'none',
                originFlag: false,
                searchArea: 'defaultArea',
                inputClassName: 'ant-form-item add_member_menu_search line_block',
                creatInput: 'none',
                superTitleName: '添加群成员',
                groupDiv: 'none',
                idea: 'none',
                choiceCanSeePer: true   //控制仅返回选择人的信息
            });
            this.getRecentShareUsers();
        } else {
            //普通群
            //显示顶部的三个标签
            //显示另一个table
            //去请求最近联系人
            this.setState({
                "addDeGroupMemberModalVisible": true,
                originDiv: 'inline-block',
                OriUserNotOrIf: 'block',
                OriUserIfOrNot: 'none',
                originFlag: false,
                searchArea: 'defaultArea',
                inputClassName: 'ant-form-item add_member_menu_search line_block',
                creatInput: 'none',
                superTitleName: '添加群成员',
                groupDiv: 'none',
                idea: 'none',
                choiceCanSeePer: false
            });
            this.getRecentShareUsers();
        }
    },

    /**
     * 普通群加人组织架构被点击
     */
    originClicked(e) {
        var arr = document.getElementsByClassName('add_member_menu');
        for (var i = 0; i < arr.length; i++) {
            arr[i].className = 'add_member_menu noom_cursor'
        }
        e.target.className = 'add_member_menu noom_cursor add_member_menu_select';
        this.getStructureById("-1");
        this.setState({
            userNameFromOri: '',  //解决搜索框有内容去切换头部无效的问题
            originDiv: 'inline-block',   //控制普通群头部三个按钮
            OriUserNotOrIf: 'none',  //控制最大的两个table的显示隐藏
            OriUserIfOrNot: 'block',  //控制最大的两个table的显示隐藏
            originFlag: true,   //控制搜索框有无内容的显示结果,只要是组织架构的就设成true
        });
    },

    /**
     * 普通群加人最近联系人被点击
     */
    rencentClicked(e) {
        var arr = document.getElementsByClassName('add_member_menu');
        for (var i = 0; i < arr.length; i++) {
            arr[i].className = 'add_member_menu noom_cursor'
        }
        e.target.className = 'add_member_menu noom_cursor add_member_menu_select';
        //改变dataSourse
        //显示隐藏
        this.getRecentShareUsers();
        this.setState({
            originDiv: 'inline-block',
            OriUserNotOrIf: 'block',
            OriUserIfOrNot: 'none',
            originFlag: false,
            userNameFromOri: ''  //解决搜索框有内容去切换头部无效的问题
        });
    },

    /**
     * 普通群加人我的好友被点击
     */
    friendClicked(e) {
        var arr = document.getElementsByClassName('add_member_menu');
        for (var i = 0; i < arr.length; i++) {
            arr[i].className = 'add_member_menu noom_cursor'
        }
        e.target.className = 'add_member_menu noom_cursor add_member_menu_select';
        //改变dataSourse
        //显示隐藏
        this.getUserContacts();
        this.setState({
            originDiv: 'inline-block',
            OriUserNotOrIf: 'block',
            OriUserIfOrNot: 'none',
            originFlag: false,
            userNameFromOri: ''  //解决搜索框有内容去切换头部无效的问题
        });
    },

    /**
     * 普通群加人我的群组被点击
     */
    groupClicked(e) {
        var arr = document.getElementsByClassName('add_member_menu');
        for (var i = 0; i < arr.length; i++) {
            arr[i].className = 'add_member_menu noom_cursor'
        }
        e.target.className = 'add_member_menu noom_cursor add_member_menu_select';
        //改变dataSourse
        //显示隐藏
        this.getAntGroup();
        this.setState({
            originDiv: 'inline-block',
            OriUserNotOrIf: 'block',
            OriUserIfOrNot: 'none',
            originFlag: false,
            userNameFromOri: ''  //解决搜索框有内容去切换头部无效的问题
        });
    },


    /**
     * 获取联系人列表
     */
    getAntGroup() {
        var _this = this;
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": -1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isEmpty(response) == false) {
                        var arr = [];
                        response.forEach(function (v) {
                            arr.push({
                                key: v.chatGroupId + '@',
                                userId: v.chatGroupId,
                                userName: v.name,
                            });
                        });
                        _this.setState({defaultUserData: arr});
                    }
                } else {

                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },


    /**
     * 获取我的好友
     */
    getUserContacts() {
        var _this = this;
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isEmpty(response) == false) {
                        var arr = [];
                        response.forEach(function (v) {
                            if (v.colUid != 41451 && v.colUid != 138437 && v.colUid != 142033 && v.colUid != 139581 && v.colUid != sessionStorage.getItem("ident")) {
                                arr.push({
                                    key: v.colUid,
                                    userId: v.colUid,
                                    userName: v.userName,
                                });
                            }
                        })
                        _this.setState({defaultUserData: arr});
                    }
                } else {

                }
            },

            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取最近联系人
     */
    getRecentShareUsers() {
        var _this = this;
        var param = {
            "method": 'getRecentShareUsers',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isEmpty(response) == false) {
                        var arr = [];
                        response.forEach(function (v) {
                            if (_this.state.idea == 'block') {
                                //包括群组
                                if (v.type == 0) {
                                    //个人
                                    if (v.user.colUid != 120024) {
                                        var user = v.user;
                                        arr.push({
                                            key: user.colUid,
                                            userId: user.colUid,
                                            userName: user.userName,
                                        });
                                    }
                                } else {
                                    //群
                                    arr.push({
                                        key: v.chatGroup.chatGroupId + '@',
                                        userId: v.chatGroup.chatGroupId,
                                        userName: v.chatGroup.name,
                                    });
                                }
                            } else {
                                //不包括群组
                                if (v.type == 0) {
                                    if (v.user.colUid != 120024) {
                                        var user = v.user;
                                        arr.push({
                                            key: user.colUid,
                                            userId: user.colUid,
                                            userName: user.userName,
                                        });
                                    }
                                }
                            }
                        });
                        _this.setState({defaultUserData: arr});
                    }
                } else {

                }
            },

            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取当前用户的组织根节点(蚁群中的组织架构菜单)
     * @param operateUserId
     * @param structureId
     */
    getStructureById(structureId) {
        let _this = this;
        var structureId = structureId + '';
        if (isEmpty(structureId)) {
            structureId = "-1";
        }
        var param = {
            "method": 'getStructureById',
            "operateUserId": sessionStorage.getItem("ident"),
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parentGroup = ret.response;
                if (isEmpty(ret.response) == false) {
                    var owner = parentGroup.chatGroup.owner.colUid;
                }
                // 根据组织根节点的id请求该组织根节点里的子部门， 调用 列举子部门函数
                if (structureId == "-1") {
                    _this.listStructures(parentGroup.id);
                    var defaultPageNo = 1;
                    _this.getStrcutureMembers(parentGroup.id, defaultPageNo);
                    _this.setState({structureId: parentGroup.id});
                }
                if (isEmpty(parentGroup) == false) {
                    var isExit = _this.checkStructureIsExitAtArray(parentGroup);
                    if (isExit == false) {
                        //存放组织架构的层次关系
                        structuresObjArray.push(parentGroup);

                    }
                }

                _this.setState({parentGroup, structuresObjArray, owner});
            },

            onError: function (error) {
                message.error(error);
            }
        });
    },

    checkStructureIsExitAtArray(newStructure) {
        var isExit = false;
        for (var i = 0; i < structuresObjArray.length; i++) {
            var structure = structuresObjArray[i];
            if (structure.id == newStructure.id) {
                isExit = true;
                break;
            }
        }
        return isExit;
    },

    /**
     * 列举蚁群中的子部门11
     * @param operateUserId
     * @param structureId
     */
    listStructures(structureId) {
        let _this = this;
        _this.getStructureById(structureId);
        var param = {
            "method": 'listStructures',
            "operateUserId": sessionStorage.getItem("ident"),
            "structureId": structureId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var subGroupList = [];
                if (isEmpty(response) == false) {
                    response.forEach(function (subGroup) {
                        var subGroupName = <div className="first_indent"
                                                onClick={_this.getSubGroupForButton.bind(_this, subGroup.id)}>
                            <span className="antnest_name affix_bottom_tc name_max3 dold_text">{subGroup.name}</span>
                        </div>
                        subGroupList.push({
                            key: subGroup.id,
                            subGroupName: subGroupName,
                        });

                    });
                } else {
                    var subGroupName = <div className="add_member_noDataTipImg">
                        <img className="noDataTipImg" style={{width: '235px'}}
                             src={require('../components/images/noDataTipImg.png')}/>
                    </div>
                    subGroupList.push({
                        key: 99999,
                        subGroupName: subGroupName,
                    });
                }
                _this.setState({subGroupList, "optType": "getGroupMenu"});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 点击部门时，获取部门下的成员
     * @param record
     * @param index
     */
    getSubGroupForButton(structureId) {
        var memberPageNo = 1;
        subGroupMemberList.splice(0);
        var defaultMemberPageNo = 1;
        this.setState({
            structureId: structureId,
            memberPageNo: defaultMemberPageNo,
        });
        this.listStructures(structureId);
        this.getStrcutureMembers(structureId, memberPageNo);
        this.getStructureById(sessionStorage.getItem("ident"), structureId)
    },

    /**
     * 根据部门id获取部门成员
     * @param operateUserId
     * @param structureId
     */
    getStrcutureMembers(structureId, pageNo) {
        let _this = this;
        var structureId = structureId + '';
        if (structureId.indexOf(',') !== -1) {
            var structureIdArr = structureId.split(',');
            structureId = structureIdArr[0];
        }
        var param = {
            "method": 'getStrcutureMembers',
            "operateUserId": sessionStorage.getItem("ident"),
            "structureId": structureId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var owner = _this.state.owner;
                if (isEmpty(response) == false) {
                    response.forEach(function (member) {
                        var user = member.user;
                        subGroupMemberList.push({
                            key: user.colUid,
                            userId: user.colUid,
                            userName: user.userName,
                        });
                    });
                }
                var pager = ret.pager;
                var pageCount = pager.pageCount;
                if (pageCount == pageNo) {
                    var wordSrc = '无更多数据';
                    _this.setState({wordSrc});

                }
                _this.setState({subGroupMemberList, totalMember: pager.rsCount});
            },
            onError: function (error) {
                message.error(error);
            }
        });


    },

    addDeGroupMemberModalHandleCancel() {
        var arr = document.getElementsByClassName('add_member_menu');
        for (var i = 0; i < arr.length; i++) {
            arr[i].className = 'add_member_menu noom_cursor'
        }
        arr[0].className = 'add_member_menu noom_cursor add_member_menu_select';

        subGroupMemberList.splice(0);
        structuresObjArray.splice(0);
        this.state.selectedRowKeys = [];
        this.state.userNameFromOri = '';
        this.state.groupCreatName = '';
        this.state.nowThinking = '';
        this.state.tags = [];
        this.state.idea = 'none';
        selectArr = [];
        this.setState({"addDeGroupMemberModalVisible": false});
    },

    /**
     * 获取页面数据，创建聊天群组
     */
    createChatGroup() {
        var _this = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var memberIds = this.state.selectedRowKeys.join(",");
        var groupCreatName = this.state.groupCreatName;
        if (isEmpty(groupCreatName)) {
            message.error("请输入群组名称");
            return;
        }
        if (groupCreatName.length > 10) {
            message.error("群组名称不能超过10个字符");
            return;
        }
        if (isEmpty(memberIds)) {
            message.error("请选择群成员");
            return;
        }
        var param = {
            "method": 'createChatGroup',
            "groupAvatar": loginUser.avatar,
            "groupName": groupCreatName,
            "ownerId": sessionStorage.getItem("ident"),
            "memberIds": memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("聊天群组创建成功");
                    //关闭弹窗
                    //清空输入群名的input
                    //动态刷新
                    _this.addDeGroupMemberModalHandleCancel();
                    _this.refs.personCenterComponents.getUserChatGroup();
                } else {
                    message.success("聊天群组创建失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    callBackChoiceCanSeePer() {
        //拿到面板中选中人的Id
        this.callBackChoiceCanSeePerToNest(this.state.tags)
    },

    callBackChoiceCanSeePerToNest(arr) {
        this.refs.antNestTabComponents.callBackChoiceCanSeePerToNest(arr);
        this.addDeGroupMemberModalHandleCancel();
    },

    /**
     * 添加群成员
     */
    addGroupMember() {
        var _this = this;
        if (this.state.choiceCanSeePer) {
            //跳转到只返回选择人的逻辑
            _this.callBackChoiceCanSeePer()
            return
        }
        if (this.state.idea == 'block') {
            _this.shareFilesNew(this.state.shareType);
        } else {
            if (this.state.creatInput == 'block') {
                //创建群名的输入框显示,确定转到创建群的逻辑
                _this.createChatGroup();
            } else {
                var memberTargetkeys = this.state.selectedRowKeys;
                var memberIds = memberTargetkeys.join(",");
                var currentGroupObj = this.state.currentGroupObj;
                var param = {
                    "method": 'addChatGroupMember',
                    "chatGroupId": currentGroupObj.chatGroupId,
                    "memberIds": memberIds
                };
                doWebService(JSON.stringify(param), {
                    onResponse: function (ret) {
                        var response = ret.response;
                        if (ret.msg == "调用成功" && ret.success == true && response == true) {
                            message.success("群成员添加成功");
                        } else {
                            message.success("群成员添加失败");
                        }
                        _this.levGroupSet();
                        _this.addDeGroupMemberModalHandleCancel();
                    },
                    onError: function (error) {
                        message.error(error);
                    }
                });
            }
        }
    },

    /**
     * 解散该群
     */
    showDissolutionChatGroupConfirmModal() {
        this.setState({calmBreakGroup: true})
        // this.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭解散群聊按钮对应的confirm窗口
     */
    closeDissolutionChatGroupConfirmModal() {
        this.setState({calmBreakGroup: false})
        // this.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 解散聊天群
     */
    dissolutionChatGroup() {
        var currentGroupObj = this.state.currentGroupObj;
        var memberIds = this.getCurrentMemberIds();
        var optType = "dissolution";
        this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
        this.closeDissolutionChatGroupConfirmModal();
    },

    getCurrentMemberIds() {
        var memberIds = "";
        var currentGroupObj = this.state.currentGroupObj;
        if (isEmpty(currentGroupObj) == false) {
            var members = currentGroupObj.members;
            members.forEach(function (e) {
                var memberId = e.colUid;
                memberIds += memberId + ",";
            });
        }
        return memberIds;
    },

    deleteChatGroupMember(chatGroupId, memberIds, optType) {
        var _this = this;
        var successTip = "";
        var errorTip = "";
        if (optType == "dissolution") {
            successTip = "群组解散成功";
            errorTip = "群组解散失败";
        } else if (optType == "removeMember") {
            successTip = "群成员移出成功";
            errorTip = "群成员移出失败";
        } else if (optType == "exitChatGroup") {
            successTip = "您已成功退出该群组";
            errorTip = "退出群组失败";
        }
        var param = {
            "method": 'deleteChatGroupMember',
            "chatGroupId": chatGroupId,
            "memberIds": memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.msg == "调用成功" && ret.success == true && response == true) {
                    message.success(successTip);
                    if (optType == "dissolution" || optType == "exitChatGroup") {
                        //退出或解散
                        //1.收回侧边  2.右侧滞空  3.左侧删除聊天
                        _this.levGroupSet();
                        _this.refs.messageMenu.delMes(chatGroupId);
                    } else if (optType == "removeMember") {
                        //移除成员
                        _this.levGroupSet();
                    }
                } else {
                    message.success(errorTip);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 显示删除群成员的确认窗口
     */
    showConfirmModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var memberIds = target.value;
        this.setState({"delMemberIds": memberIds, calmBreakGroup: true});
    },

    /**
     * 关闭移出群聊按钮对应的confirm窗口
     */
    closeConfirmModal() {
        this.setState({calmBreakGroup: false})
    },

    /**
     * 移除选中的群组成员
     */
    deleteSelectedMember() {
        var currentGroupObj = this.state.currentGroupObj;
        var memberIds = this.state.delMemberIds;
        var optType = "removeMember";
        this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
        this.closeConfirmModal();
    },

    /**
     * 删除并退出
     */
    showExitChatGroupConfirmModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var memberIds = target.value;
        this.setState({"delMemberIds": memberIds, calmExitGroup: true});
        // this.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    closeExitChatGroupConfirmModal() {
        this.setState({calmExitGroup: false})
        // this.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 删除并退出群组
     */
    exitChatGroup() {
        var currentGroupObj = this.state.currentGroupObj;
        var memberIds = sessionStorage.getItem("ident");
        var optType = "exitChatGroup";
        this.deleteChatGroupMember(currentGroupObj.chatGroupId, memberIds, optType);
        this.closeExitChatGroupConfirmModal();
    },

    /**
     * 构建群点击设置
     * @param arr
     */
    buildGroupSet(currentMemberArray, currentGroupObj) {
        var groupType = currentGroupObj.type;
        this.state.dissolutionChatGroupButton = '';
        this.setState({currentGroupObj});
        var _this = this;
        var topButton,
            dissolutionChatGroupButton;
        var divBlock = 'none';
        if (currentGroupObj.owner.colUid == sessionStorage.getItem("ident")) {
            //我是群主
            divBlock = 'inline-block';
            topButton = <span>
                <span type="primary" className="noom_cursor set_in_btn_font"
                      onClick={this.showAddMembersModal.bind(this, groupType)}><Icon
                    className="i_antdesign" type="plus"/>添加群成员</span></span>
            dissolutionChatGroupButton =
                <Button onClick={this.showDissolutionChatGroupConfirmModal} className="group_red_font"><i
                    className="iconfont">&#xe616;</i>解散该群</Button>;
            _this.setState({dissolutionChatGroupButton})

            var memberLiTag = [];
            currentMemberArray.forEach(function (e) {
                var memberId = e.key;
                var groupUser = e.groupUser;
                var userInfo = e.userInfo;
                var userHeaderIcon;
                if (isEmpty(userInfo) == false) {
                    userHeaderIcon = <img src={userInfo.avatar}></img>;
                } else {
                    userHeaderIcon =
                        <span className="attention_img"><img
                            src={require('../components/images/maaee_face.png')}></img></span>;
                }
                var liTag = currentGroupObj.ownerId == e.key ? <div className="group_fr">
                    <span className="attention_img">{userHeaderIcon}</span><span>{groupUser}</span>
                </div> : <div className="group_fr">
                    <span className="attention_img">{userHeaderIcon}</span><span>{groupUser}</span>
                    <Button value={memberId} onClick={_this.showConfirmModal} className="group_del"><Icon
                        type="close-circle-o"/></Button>
                </div>;
                memberLiTag.push(liTag);
            });
        } else {
            //我不是群主
            if (currentGroupObj.type == 1) {
                //部门群
                topButton = <span className="right_ri"></span>;
            } else {
                //普通群
                if (JSON.parse(sessionStorage.getItem("loginUser")).colUtype == 'STUD') {
                    //学生
                    topButton = <span className="right_ri"></span>;
                } else {
                    //老师
                    topButton = <span>
                        <span type="primary" className="noom_cursor set_in_btn_font"
                              onClick={this.showAddMembersModal.bind(this, groupType)}>
                        <Icon className="i_antdesign" type="plus"/>添加群成员</span></span>
                }
            }

            var memberLiTag = [];
            currentMemberArray.forEach(function (e) {
                var groupUser = e.groupUser;
                var userInfo = e.userInfo;
                var userHeaderIcon;
                if (isEmpty(userInfo) == false) {
                    userHeaderIcon = <img src={userInfo.avatar}></img>;
                } else {
                    userHeaderIcon =
                        <span className="attention_img"><img
                            src={require('../components/images/maaee_face.png')}></img></span>;
                }
                var liTag = <div className="group_fr">
                    <span className="attention_img">{userHeaderIcon}</span><span>{groupUser}</span>
                </div>;
                memberLiTag.push(liTag);
            });
        }

        var personDate = <div className="group_cont">
            <div className="myfollow_zb del_out">
                <ul className="group_fr_ul">
                    <li className="color_gary_f">群聊名称：{currentGroupObj.name}
                        <span style={{display: divBlock}} className="noom_cursor set_in_btn_font"
                              onClick={this.showUpdateChatGroupNameModal}><Icon type="edit" className="i_antdesign"/>编辑</span>
                    </li>
                    <li className="color_gary_f">群主：{currentGroupObj.owner.userName}
                        <span style={{display: divBlock}} className="noom_cursor set_in_btn_font"
                              onClick={this.mainTransfer.bind(this, currentMemberArray)}><Icon type="swap"
                                                                                               className="i_antdesign"/>转让群主</span>
                    </li>
                    <li className="color_gary_f">
                        <span>群聊成员：{currentMemberArray.length}人</span>{topButton}</li>
                    <li className="user_hei flow_x">
                        {memberLiTag}
                    </li>
                </ul>
            </div>
        </div>;

        this.setState({personDate});
        this.refs.groupSetPanel.className = 'groupSet_panel ding_enter';
    },

    /**
     * 群消息设置侧边栏离场
     */
    levGroupSet() {
        this.refs.groupSetPanel.className = 'groupSet_panel ding_leave';
    },

    /**
     * 公共侧边栏进场
     */
    interPublicSidebarSet(obj) {
        this.setState({publicSidebarTitle: obj.title, publicSidebarContent: obj.div});
        this.refs.publicSidebar.className = 'groupSet_panel ding_enter';
    },

    /**
     * 公共侧边栏离场
     */
    levPublicSidebarSet() {
        this.refs.publicSidebar.className = 'groupSet_panel ding_leave';
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

    searchShareUsersOnChange(checkedValues) {
        this.setState({"searchShareUsersOptions": checkedValues});
    },

    /**
     * 调用分享接口
     */
    getsharekey() {
        var _this = this;
        var shareFileId = this.state.shareCloudFile.id;
        var operateUserId = this.state.shareCloudFile.createUid;
        var param = {
            "method": 'share',
            "operateUserId": operateUserId,
            "cloudFileIds": shareFileId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功") {
                    _this.shareCloudFile(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 新版分享文件从蚁盘
     * @param response
     */
    shareCloudFile(response) {
        var _this = this;
        var memberTargetkeys = this.state.selectedRowKeys;
        var nowThinking = this.state.nowThinking;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var createTime = (new Date()).valueOf();
        var messageToPer = 1;//根据接收者是群组还是个人来决定
        var messageToGrp = 4;

        if (typeof(nowThinking) == 'undefined' || nowThinking == '') {
            nowThinking = '这是一个蚁盘分享的文件'
        }

        if (isEmpty(memberTargetkeys) == true) {
            message.error('请选择转发好友或群组');
            return false
        }

        var filePath = "http://jiaoxue.maaee.com:8091/#/fileShareLink?shareId=" + response + "&userId=" + sessionStorage.getItem("ident");

        //链接消息
        var cover = "http://png.findicons.com/files/icons/2083/go_green_web/64/link.png";

        var attachement = {
            "address": filePath,
            "user": loginUser,
            "createTime": createTime,
            "cover": cover,
            "content": this.state.shareCloudFile.name,
            "type": 4
        };
        this.sendShareMeg(memberTargetkeys, attachement, messageToPer, messageToGrp, nowThinking, createTime, loginUser);
    },

    /**
     * 新版分享文件
     * @returns {boolean}
     */
    shareFilesNew(shareType) {
        //shareType=0分享是链接,=1分享是的文件  具体到这只是attachment不同
        if (shareType == 1) {
            //分享文件先要获取shareId,之后做出attachement
            this.getsharekey();
            return
        }
        var _this = this;
        var memberTargetkeys = this.state.selectedRowKeys;
        var nowThinking = this.state.nowThinking;
        var shareSrc = this.state.shareSrc;
        var shareTitle = this.state.shareTitle;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var createTime = (new Date()).valueOf();
        var messageToPer = 1;//根据接收者是群组还是个人来决定
        var messageToGrp = 4;

        if (typeof(nowThinking) == 'undefined' || nowThinking == '') {
            nowThinking = '这是一个蚁盘分享的文件'
        }

        if (isEmpty(memberTargetkeys) == true) {
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

        this.sendShareMeg(memberTargetkeys, attachment, messageToPer, messageToGrp, nowThinking, createTime, loginUser);
    },

    /**
     * 分享文件 发送->
     * @param memberTargetkeys
     * @param attachment
     * @param messageToPer
     * @param messageToGrp
     * @param nowThinking
     * @param createTime
     * @param loginUser
     */
    sendShareMeg(memberTargetkeys, attachment, messageToPer, messageToGrp, nowThinking, createTime, loginUser) {
        var _this = this;
        memberTargetkeys.forEach(function (v, i) {
            var str = v + '';
            if (str.indexOf('@') == '-1') {
                var uuid = _this.createUUID();
                var messageJson = {
                    'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                    "toId": str, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToPer, "attachment": attachment, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);

            } else {
                var toId = str.slice(0, str.length - 1)
                var uuid = _this.createUUID();
                var messageJson = {
                    'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                    "toId": toId, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToGrp, "attachment": attachment, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            }
        });
        this.addDeGroupMemberModalHandleCancel();
    },

    toWhichCharObj() {
        if (delLastClick) {
            delLastClick = false;
            return false
        }
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

    rightMsgDelFinish() {
        this.refs.antGroupTabComponents.rightMsgDelFinish();
        // this.setState({lastClick: ''})
        delLastClick = true;
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
        setTimeout(function () {
            document.querySelectorAll(".noomSendImg")[num].click();   //使用noomSendImg可以区分选择的图片是聊天里的还是审批里的,不会造成混乱
        }, 150)
    },

    noomSelect(obj) {
        this.sendMessage_noom_user(obj);
    },

    sendMessage_noom_user(userInfo) {
        var _this = this;
        var content = '';
        var createTime = '';
        var param = {
            "method": 'getUser2UserMessages',
            "user1Id": sessionStorage.getItem("ident"),
            "user2Id": userInfo.colUid,
            "timeNode": (new Date()).valueOf()
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功') {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        content = response[0].content;
                        createTime = response[0].createTime;
                    }
                    var contentJson = {"content": content, "createTime": ''};
                    var contentArray = [contentJson];
                    var userJson = {
                        key: userInfo.colUid,
                        "fromUser": userInfo,
                        contentArray: contentArray,
                        "messageToType": 1,
                    };
                    _this.setState({
                        currentKey: 'message',
                        resouceType: '',
                        "userInfo": userInfo,
                        "messageType": 'message',
                        "actionFrom": "search",
                        userJson,
                        isSearch: true
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    noomSelectUser(obj) {
        this.sendMessage_noom_group(obj);
    },

    sendMessage_noom_group(groupObj) {
        var _this = this;
        var content = '';
        var createTime = '';

        var param = {
            "method": 'getChatGroupMessages',
            "chatGroupId": groupObj.chatGroupId,
            "timeNode": (new Date()).valueOf()
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功') {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        content = response[0].content;
                        createTime = response[0].createTime;

                        var contentJson = {"content": content, "createTime": ''};
                        var contentArray = [contentJson];
                        var userJson = {
                            key: groupObj.chatGroupId,
                            "fromUser": groupObj,
                            contentArray: contentArray,
                            "messageToType": 4,
                            "toChatGroup": groupObj
                        };
                        _this.setState({
                            currentKey: 'message',
                            resouceType: '',
                            "groupObj": groupObj,
                            "messageType": 'groupMessage',
                            "actionFrom": "personCenterGroupList",
                            userJson,
                            isSearchGroup: true
                        });
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
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

    delLeftMsgFinish(uuid) {
        this.refs.messageMenu.delLeftMsgFinish(uuid);
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
        // this.setState({"antCloudKey": optType});
        var _this = this;
        setTimeout(function () {
            _this.refs.antCloudTableComponents.changeFileType(optType);
        }, 50)
    },

    getSubGroup(structureId, structure) {
        this.setState({structureId, rootStructure: structure});
    },

    /**
     * 获取云校的操作
     * @param menuItemKey
     */
    getCloudClassRoom(menuItemKey) {
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

    emitEmpty() {
        this.userNameInput.focus();
        this.setState({searchWords: ''});
    },

    onChangeUserName(e) {
        //搜索框改变就清空选择数组
        this.state.searchShareUsersData = [];
        this.state.checkedConcatOptions = [];
        this.state.checkedGroupOptions = [];
        this.state.checkedsSructureOptions = [];
        this.state.checkedRecentConnectOptions = [];
        this.state.searchShareUsersOptions = [];
        if (e.target.value.length != 0) {
            this.searchShareUsers(e.target.value);
        }
        this.setState({searchWords: e.target.value});
    },

    onChangeGroupName(e) {
        this.setState({groupCreatName: e.target.value});
    },

    //群组加人搜索
    onChangeUserNameFromOri(e) {
        var originFlag = this.state.originFlag;  //部门群下搜索此值为true,普通群为false
        this.state.searchUserFromOri = [];
        if (e.target.value.length != 0) {
            this.searchUserFromOri(e.target.value);
        }

        if (!originFlag) {
            //普通群,搜索框的内容决定最大的两个table的显示隐藏
            if (e.target.value.length != 0) {
                this.setState({OriUserNotOrIf: 'none', OriUserIfOrNot: 'block'})
            } else {
                this.setState({OriUserNotOrIf: 'block', OriUserIfOrNot: 'none'})
            }
        }

        this.setState({userNameFromOri: e.target.value});
    },

    /**
     * 从组织架构搜索人
     * @param str
     */
    searchUserFromOri(str) {
        var searchArea = this.state.searchArea;  //defaultArea为全局,originzation为组织架构内
        var _this = this;
        var param = {
            "method": 'searchShareUsers',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": -1,
            "searchKeyWords": str,
        };
        if (searchArea == 'defaultArea') {
            param.dataType = 0;
        } else if (searchArea == 'originzation') {
            param.dataType = 3;
        }
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        _this.showSearchUserFromOri(response)
                    } else {
                        //显示没有结果
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 构建从组织架构搜索出来的用户表格
     * @param data
     */
    showSearchUserFromOri(data) {
        var arr = [];
        data.forEach(function (v) {
            if (v.type == 0) {
                var user = v.user;
                arr.push({
                    key: user.colUid,
                    userId: user.colUid,
                    userName: user.userName,
                });
            }
        });
        this.setState({searchUserFromOri: arr});
    },

    searchShareUsers(str) {
        var _this = this;
        var param = {
            "method": 'searchShareUsers',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": -1,
            "searchKeyWords": str,
            "dataType": 0
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        _this.showSearchShareUsers(response)
                    } else {
                        //显示没有结果
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    showSearchShareUsers(res) {
        var arr = [];
        res.forEach(function (data) {
            var messageType = data.type;
            if (messageType == 0) {
                //个人消息
                var userStructId = data.user.colUid;
                var userStructName = data.user.userName;
                var userStructImgTag = <img src={data.user.avatar} className="antnest_38_img" height="38"></img>;
                var userStructNameTag = <div>{userStructImgTag}<span>{userStructName}</span></div>;
                var userStructJson = {label: userStructNameTag, value: userStructId};

                if (userStructId != sessionStorage.getItem("userStructId") && userStructId != 138437 && userStructId != 41451 && userStructId != 142033 && userStructId != 139581) {
                    arr.push(userStructJson);
                }
            } else {
                //群组

                var chatGroupId = data.chatGroup.chatGroupId;
                var chatGroupName = data.chatGroup.name;
                var membersCount = data.chatGroup.avatar.split('#').length;
                var groupMemebersPhoto = [];
                for (var i = 0; i < membersCount; i++) {
                    var memberAvatarTag = <img src={data.chatGroup.avatar.split('#')[i] + '?' + SMALL_IMG}></img>;
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
                arr.push(groupJson);
            }

        });
        this.setState({"searchShareUsersData": arr});
    },

    /**
     * 部门成员加载更多
     */
    loadMoreMember() {
        var _this = this;
        if (isEmpty(_this.state.memberPageNo)) {
            return
        }
        var memberPageNo = parseInt(_this.state.memberPageNo) + 1;
        this.memberPageOnChange(memberPageNo);
    },

    /**
     * 部门成员的数据分页
     * @param pageNo
     */
    memberPageOnChange(pageNo) {
        this.setState({
            memberPageNo: pageNo,
        });
        this.getStrcutureMembers(this.state.structureId, pageNo);
    },

    /**
     * 面包条点击响应
     * 切换到当前的组织架构层次，同时，在此面包条后的数据移除
     */
    breadCrumbClick(structureId) {
        var defaultPageNo = 1;
        for (var i = 0; i < structuresObjArray.length; i++) {
            var structure = structuresObjArray[i];
            if (structure.id == structureId) {
                structuresObjArray.splice(i, structuresObjArray.length);
                break;
            }
        }
        this.listStructures(structureId);
        subGroupMemberList.splice(0);
        this.getStrcutureMembers(structureId, defaultPageNo);
        var defaultMemberPageNo = 1;
        this.setState({"structureId": structureId, structuresObjArray, "memberPageNo": defaultMemberPageNo});
    },

    /**
     * 表格选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    /**
     * 同步table与tags
     * @param record
     * @param selected
     */
    onRowSelected(record, selected) {
        if (selected) {
            selectArr.push(record);
        } else {
            var key = record.key;
            for (var i = 0; i < selectArr.length; i++) {
                if (selectArr[i].key == key) {
                    selectArr.splice(i, 1);
                }
            }
        }
        this.setState({tags: selectArr});
    },

    /**
     * 用户手动选择/取消选择所有列的回调
     */
    onSelectAll(selected, selectedRows, changeRows) {
        var arr = this.state.tags;
        var array;
        //此处应该是连接数组或者是取消数组
        // 第一个参数布尔值true表示钩中，false表示取消，第三个参数表示钩中的人的数组
        if (selected) {
            //数组合并
            array = arr.concat(changeRows);
        } else {
            //在原数组中去除这个数组的项
            changeRows.forEach(function (data, index) {
                arr.forEach(function (v, i) {
                    if (v.key == data.key) {
                        arr.splice(i, 1);
                    }
                })
            })
            array = arr;
        }
        this.setState({tags: array});
        selectArr = array;
    },

    /*标签关闭的回调*/
    handleClose(removedTag) {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        var arr = [];
        this.setState({tags});
        //设置勾选状态   selectedRowKeys
        for (var i = 0; i < tags.length; i++) {
            arr.push(tags[i].key);
        }
        this.state.selectedRowKeys = arr;
        //在这里把点击的这一项从selectArr中删除  selectArr全局函数
        for (var i = 0; i < selectArr.length; i++) {
            if (selectArr[i].key == removedTag.key) {
                selectArr.splice(i, 1);
            }
        }
    },

    handleInputChange(e) {
        this.setState({inputValue: e.target.value});
    },

    handleInputConfirm() {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
    },

    /**
     * 显示文件分享的引导页
     */
    showShareGuideModal(globalTitle, globalSrc) {
        this.refs.guideModal.changeGuideModalVisible(true);
        this.setState({'shareSrc': globalSrc, 'shareTitle': globalTitle});
    },

    /**
     * 设置不同的操作指向，用来根据不同的数据源，分别将文件/文件夹分享到朋友或蚁巢
     * @param guideType
     */
    setGuideType(guideType) {
        if (guideType.key == "friend") {
            window.__noomShareMbile__(this.state.shareSrc, this.state.shareTitle);
        } else {
            this.setState({shareToAntNestVisible: true});
        }
        this.refs.guideModal.changeGuideModalVisible(false);
    },

    /**
     * 关闭分享到蚁巢的modal
     */
    shareToAntNestModalHandleCancel() {
        this.setState({shareToAntNestVisible: false, nowThinking: ''});
    },

    /**
     * 分享文件到蚁巢
     */
    shareToAntNest() {
        var _this = this;
        var cover = "http://png.findicons.com/files/icons/2083/go_green_web/64/link.png";
        var param = {
            "method": 'addLinkTopic',
            "ident": sessionStorage.getItem("ident"),
            "content": _this.state.nowThinking,
            "cover": cover,
            "title": _this.state.shareTitle,
            "linkAddress": _this.state.shareSrc,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    if (response) {
                        message.success("分享成功");
                    }
                    _this.shareToAntNestModalHandleCancel();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    closeDingModel() {
        this.setState({
            uploadImgAndVideoIsShow: false,
        })
    },

    render() {

        const {tags, inputVisible, inputValue} = this.state;

        var _this = this;
        //引入国际化的支持
        var messageFromLanguage = getMessageFromLanguage();
        var local = getLocalFromLanguage();
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
            onSelect: this.onRowSelected,
            onSelectAll: this.onSelectAll
        };

        const hasSelected = this.state.selectedRowKeys.length > 0;

        //构建蚁群中的组织架构部分的面包屑组件
        var breadcrumbItemObjArray = [];
        if (isEmpty(_this.state.structuresObjArray) == false) {
            _this.state.structuresObjArray.forEach(function (structure) {

                var breadcrumbItemObj = <Breadcrumb.Item key={structure.id}>
                    <a onClick={_this.breadCrumbClick.bind(_this, structure.id)}>{structure.name}</a></Breadcrumb.Item>;
                breadcrumbItemObjArray.push(breadcrumbItemObj);

            });
        }

        const suffix = this.state.searchWords ? <Icon type="close-circle" onClick={this.emitEmpty}/> : null;
        const searchIfOrNot = this.state.searchWords ? 'none' : 'block';
        const searchNotOrIf = this.state.searchWords ? 'block' : 'none';
        const searchOriIfOrNot = this.state.userNameFromOri ? 'none' : 'block';
        const searchOriNotOrIf = this.state.userNameFromOri ? 'block' : 'none';
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
                                               rightMsgDelFinish={this.rightMsgDelFinish}
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
                                                      delLeftMsgFinish={this.delLeftMsgFinish}
                                                      gopTalkSetClick={this.gopTalkSetClick}
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
                                                       setChatGroup={this.gopTalkSetClick}
                                                       creatGroup={this.creatGroup}
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
                tabComponent = <AntNestTabComponents
                    ref="antNestTabComponents"
                    interPublicSidebarSet={this.interPublicSidebarSet}
                    choiceCanSeePer={this.choiceCanSeePer}
                />;

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
                                                        ref="antCloudTableComponents"
                                                        showShareGuideModal={this.showShareGuideModal}
                                                        showShareFromCloud={this.showShareFromCloud}
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
            case 'unionClass':
                //叮消息
                tabComponent = null;
                middleComponent = null;
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
            case 'C':
                //联合开课的布局结构,该布局完全占据右侧区域,内嵌iframe来实现
                var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                var userName = loginUser.userName;
                var userId = loginUser.colUid
                var url = "https://www.maaee.com/openvidu/schoolClass/unionClassList.html?teacherId=" + userId + "&teacherName=" + userName;
                mainContent =
                    <Row>
                        <Col span={24}>
                            <div className="ant-layout-container teachSpacePanel" style={{background: '#fff'}}>
                                <iframe src={url} style={{width: '100%', height: '100%', border: 'none'}}></iframe>
                            </div>
                        </Col>
                    </Row>;
                break;
        }
        var localProviderLanguage = "";
        if (local == "en") {
            localProviderLanguage = enUS;
        }
        return (
            <LocaleProvider locale={localProviderLanguage}>
                <IntlProvider
                    locale={local}
                    messages={messageFromLanguage}
                >
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
                                    <div className="tan">
                                        <FormattedMessage
                                            id='chat'
                                            description='动态'
                                            defaultMessage='动态'
                                        />
                                    </div>
                                </Menu.Item>
                                <Menu.Item key="antNest" className="padding_menu">
                                    <i className="icon_menu_ios icon_yichao1"></i>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='antNest'
                                            description='蚁巢'
                                            defaultMessage='蚁巢'
                                        />
                                    </div>
                                </Menu.Item>
                                <Menu.Item key="teachSpace" className="padding_menu">
                                    <i className="icon_menu_ios icon_jiaoxue"></i>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='teachingSpace'
                                            description='教学空间'
                                            defaultMessage='教学空间'
                                        />
                                    </div>

                                </Menu.Item>
                                <Menu.Item key="antGroup" className="padding_menu">
                                    <i className="icon_menu_ios icon_antgroup"></i>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='contacts'
                                            description='蚁群'
                                            defaultMessage='蚁群'
                                        />
                                    </div>
                                </Menu.Item>
                                <Menu.Item key="antCloudClassRoom" className="padding_menu">
                                    <i className="icon_menu_ios icon_cloud"></i>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='cloudClass'
                                            description='云校'
                                            defaultMessage='云校'
                                        />
                                    </div>
                                </Menu.Item>
                                <Menu.Item key="antCloud" className="padding_menu">
                                    <i className="icon_menu_ios icon_antdisk"></i>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='cloudDisk'
                                            description='蚁盘'
                                            defaultMessage='蚁盘'
                                        /></div>
                                </Menu.Item>
                                <Menu.Item key="systemSetting" className="padding_menu">
                                    <i className="icon_menu_ios icon_schoolGroup"></i>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='courseMangement'
                                            description='教务管理'
                                            defaultMessage='教务管理'
                                        /></div>
                                </Menu.Item>
                                <Menu.Item key="dingMessage" className="padding_menu">
                                    <i className="icon_menu_ios icon_ding"></i>
                                    <b className="ding_alert" ref='dingAlert'></b>
                                    <div className="tan">
                                        <FormattedMessage
                                            id='notificationCenter'
                                            description='叮一下'
                                            defaultMessage='叮一下'
                                        /></div>
                                </Menu.Item>
                                {/*<Menu.Item key="unionClass" className="padding_menu">*/}
                                    {/*<i className="icon_menu_ios icon_joint-class"></i>*/}
                                    {/*<b className="ding_alert" ref='dingAlert'></b>*/}
                                    {/*<div className="tan">*/}
                                        {/*联合开课*/}
                                    {/*</div>*/}
                                {/*</Menu.Item>*/}
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
                        <ul style={{display: 'none'}}>
                            <li className="imgLi">
                                {this.state.imgArr}
                            </li>
                        </ul>
                        {/*群设置侧边栏*/}
                        <div className="groupSet_panel" ref="groupSetPanel">
                            <div className="side_header">
                                群设置
                                <Icon type="close" className="d_mesclose_new" onClick={this.levGroupSet}/>
                            </div>
                            <div className="set_in_background">
                                {this.state.personDate}
                            </div>
                            <div className="set_in_del_btn">
                                <Button onClick={this.showExitChatGroupConfirmModal}
                                        className="group_red_btn">删除并退出</Button>{this.state.dissolutionChatGroupButton}

                            </div>
                        </div>
                        <GuideModal ref="guideModal" setGuideType={this.setGuideType}></GuideModal>
                        {/*公共侧边栏*/}
                        <div className="groupSet_panel" ref="publicSidebar">
                            <div className="side_header">
                                {this.state.publicSidebarTitle}
                                <Icon type="close" className="d_mesclose_new" onClick={this.levPublicSidebarSet}/>
                            </div>
                            <div className="set_in_background2">
                                {this.state.publicSidebarContent}
                            </div>
                        </div>
                        <Modal className="person_change_right"
                               visible={this.state.mainTransferModalVisible}
                               title="转移群主"
                               onCancel={this.mainTransferModalHandleCancel}
                               transitionName=""  //禁用modal的动画效果
                               maskClosable={false} //设置不允许点击蒙层关闭
                               footer={[

                                   <button type="ghost" htmlType="reset"
                                           className="ant-btn ant-btn-ghost login-form-button"
                                           onClick={this.mainTransferModalHandleCancel}>取消</button>,
                                   <button type="primary" htmlType="submit"
                                           className="ant-btn ant-btn-primary ant-btn-lg"
                                           onClick={this.mainTransferForSure}>确定</button>
                               ]}
                        >
                            <Row className="ant-form-item">
                                <Col span={24}>
                                    <RadioGroup onChange={this.mainTransferOnChange} value={this.state.radioValue}>
                                        {this.state.radioSon}
                                    </RadioGroup>
                                </Col>
                            </Row>
                        </Modal>

                        <Modal className="modol_width"
                               visible={this.state.updateChatGroupNameModalVisible}
                               title="修改群名称"
                               onCancel={this.updateChatGroupNameModalHandleCancel}
                               transitionName=""  //禁用modal的动画效果
                               maskClosable={false} //设置不允许点击蒙层关闭
                               footer={[

                                   <button type="ghost" htmlType="reset"
                                           className="ant-btn ant-btn-ghost login-form-button"
                                           onClick={this.updateChatGroupNameModalHandleCancel}>取消</button>,
                                   <button type="primary" htmlType="submit"
                                           className="ant-btn ant-btn-primary ant-btn-lg"
                                           onClick={this.updateChatGroupName}>确定</button>
                               ]}
                        >
                            <Row className="ant-form-item">
                                <Col span={6} className="right_look">群名称：</Col>
                                <Col span={14}>
                                    <Input value={this.state.updateChatGroupTitle}
                                           defaultValue={this.state.updateChatGroupTitle}
                                           onChange={this.updateChatGroupTitleOnChange}/>
                                </Col>
                            </Row>
                        </Modal>

                        <Modal
                            visible={this.state.addDeGroupMemberModalVisible}
                            title={this.state.superTitleName}
                            onCancel={this.addDeGroupMemberModalHandleCancel}
                            transitionName=""  //禁用modal的动画效果
                            maskClosable={false} //设置不允许点击蒙层关闭
                            className="add_member Share-files"
                            footer={[

                                <button type="ghost" htmlType="reset"
                                        className="ant-btn ant-btn-ghost login-form-button"
                                        onClick={this.addDeGroupMemberModalHandleCancel}>取消</button>,
                                <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg"
                                        onClick={this.addGroupMember}>确定</button>
                            ]}
                            width={700}
                        >
                            <div style={{display: this.state.idea, marginBottom: '14px'}}>
                                <Input type="textarea" rows={2} placeholder="这一刻的想法" value={this.state.nowThinking}
                                       onChange={this.nowThinkingInputChange}/>
                            </div>
                            <div style={{display: this.state.creatInput, marginBottom: '14px'}}>
                                <Input
                                    placeholder="请输入群名称"
                                    value={this.state.groupCreatName}
                                    onChange={this.onChangeGroupName}
                                    ref={node => this.userNameInput = node}
                                />
                            </div>
                            <div id="mebChecked" className="ant-form-item add_member_menu_tab"
                                 style={{display: this.state.originDiv}}>
                                <span className="add_member_menu noom_cursor add_member_menu_select"
                                      onClick={this.rencentClicked}>最近联系人</span>
                                <span className="add_member_menu noom_cursor" onClick={this.friendClicked}>我的好友</span>
                                <span style={{display: this.state.groupDiv}} className="add_member_menu noom_cursor"
                                      onClick={this.groupClicked}>我的群组</span>
                                <span className="add_member_menu noom_cursor" onClick={this.originClicked}>组织架构</span>
                            </div>
                            <div id="inPut100" className={this.state.inputClassName}>
                                <Col span={24} className="right_ri">
                                    <Input
                                        placeholder="请输入要搜索的姓名"
                                        value={this.state.userNameFromOri}
                                        onChange={this.onChangeUserNameFromOri}
                                        ref={node => this.userNameInput = node}
                                    />
                                </Col>
                            </div>
                            <div className="ant-form-item flex">
                              <span className="gray_6_12" style={{height: '24px'}}>
                                    <span className="upexam_float " style={{lineHeight: '24px'}}>已选择：</span>
                                    <div className="add_member_tags_wrap">
                                        <div className="add_member_tags upexam_float">
                                            {tags.map((tag, index) => {
                                                const isLongTag = tag.length > 20;
                                                const tagElem = (
                                                    <Tag key={tag.key} closable={index !== -1}
                                                         afterClose={() => this.handleClose(tag)}>
                                                        {isLongTag ? `${tag.userName.slice(0, 20)}...` : tag.userName}
                                                    </Tag>
                                                );
                                                return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                            })}
                                            {inputVisible && (
                                                <Input
                                                    type="text" size="small"
                                                    style={{width: 78}}
                                                    value={inputValue}
                                                    onChange={this.handleInputChange}
                                                    onBlur={this.handleInputConfirm}
                                                    onPressEnter={this.handleInputConfirm}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </span>
                            </div>
                            <div className="ant-form-item flex">
                                <div style={{display: this.state.OriUserNotOrIf}} className="favorite_scroll">
                                    <div className="add_member_wrap">
                                        <Table columns={memberColumns}
                                               pagination={false} dataSource={this.state.defaultUserData}
                                               className="schoolgroup_table1 schoolgroup_table_department"
                                               scroll={{y: 240}}
                                               rowSelection={rowSelection}
                                        />
                                    </div>
                                </div>

                                <div style={{display: this.state.OriUserIfOrNot}} className="department_scroll bai">
                                    <div style={{display: searchOriNotOrIf}} className="favorite_scroll">
                                        {/*获取组织架构的部门下的人*/}
                                        <div className="add_member_wrap">
                                            <Table columns={memberColumns}
                                                   pagination={false} dataSource={this.state.searchUserFromOri}
                                                   className="schoolgroup_table1 schoolgroup_table_department"
                                                   scroll={{y: 240}}
                                                   rowSelection={rowSelection}
                                            />
                                        </div>
                                    </div>

                                    <div style={{display: searchOriIfOrNot}} className="favorite_scroll">
                                        {/*获取组织架构的所有部门*/}
                                        <div className="add_member_left">
                                            {/*面包屑*/}
                                            <Breadcrumb separator=">">
                                                {breadcrumbItemObjArray}
                                            </Breadcrumb>
                                            <Table showHeader={false} columns={columns}
                                                   dataSource={this.state.subGroupList}
                                                   className="schoolgroup_table"
                                                   pagination={false}/>
                                        </div>

                                        {/*获取组织架构的部门下的人*/}
                                        <div className="add_member_right">
                                            <Table columns={memberColumns}
                                                   pagination={false} dataSource={this.state.subGroupMemberList}
                                                   className="schoolgroup_table1 schoolgroup_table_department"
                                                   scroll={{y: 240}}
                                                   rowSelection={rowSelection}
                                            />
                                            <div className="schoolgroup_operate schoolgroup_more">
                                                <a onClick={this.loadMoreMember}
                                                   className="schoolgroup_more_a">{this.state.wordSrc}</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal>

                        <Modal
                            visible={this.state.shareToAntNestVisible}
                            title="分享文件"
                            onCancel={this.shareToAntNestModalHandleCancel}
                            transitionName=""  //禁用modal的动画效果
                            maskClosable={false} //设置不允许点击蒙层关闭
                            className="add_member"
                            footer={[

                                <button type="ghost" htmlType="reset"
                                        className="ant-btn ant-btn-ghost login-form-button"
                                        onClick={this.shareToAntNestModalHandleCancel}>取消</button>,
                                <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg"
                                        onClick={this.shareToAntNest}>确定</button>
                            ]}
                            width={616}
                        >
                            <div style={{marginBottom: '14px'}}>
                                <Input type="textarea" rows={2} placeholder="这一刻的想法" style={{height: '84px'}}
                                       value={this.state.nowThinking}
                                       onChange={this.nowThinkingInputChange}/>
                            </div>
                            <div style={{marginBottom: '14px'}}>
                                {this.state.shareTitle}
                            </div>
                        </Modal>

                        <Modal
                            className="calmModal"
                            visible={this.state.calmRemoveMembers}
                            title="提示"
                            onCancel={this.closeConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure"
                                        onClick={this.deleteSelectedMember}>确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                        onClick={this.closeConfirmModal}>取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../jquery-photo-gallery/icon/sad.png")}/>
                                确定要移除选中的群成员?
                            </div>
                        </Modal>
                        <Modal
                            className="calmModal"
                            visible={this.state.calmBreakGroup}
                            title="提示"
                            onCancel={this.closeDissolutionChatGroupConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure"
                                        onClick={this.dissolutionChatGroup}>确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                        onClick={this.closeDissolutionChatGroupConfirmModal}>取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../jquery-photo-gallery/icon/sad.png")}/>
                                确定要解散该群组?
                            </div>
                        </Modal>
                        <Modal
                            className="calmModal"
                            visible={this.state.calmExitGroup}
                            title="提示"
                            onCancel={this.closeExitChatGroupConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure"
                                        onClick={this.deleteSelectedMember}>确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                        onClick={this.closeExitChatGroupConfirmModal}>取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../jquery-photo-gallery/icon/sad.png")}/>
                                确定要退出该群组?
                            </div>
                        </Modal>

                        <Modal title={null}
                               visible={this.state.videoPlayModel}
                               transitionName=""  //禁用modal的动画效果
                               maskClosable={false} //设置不允许点击蒙层关闭
                               onCancel={this.videoPlayerModalHandleCancel}
                               footer={null}
                               className='noomVideoPlayer'
                               footer={[
                                   <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                           onClick={this.videoPlayerModalHandleCancel}>关闭</button>
                               ]}
                        >
                            {this.state.videoPlayer}
                        </Modal>

                        <Modal title={null}
                               visible={this.state.audioPlayModel}
                               transitionName=""  //禁用modal的动画效果
                               maskClosable={false} //设置不允许点击蒙层关闭
                               onCancel={this.audioPlayerModalHandleCancel}
                               footer={null}
                               className='noomVideoPlayer'
                               footer={[
                                   <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                           onClick={this.audioPlayerModalHandleCancel}>关闭</button>
                               ]}
                        >
                            {this.state.audioPlayer}
                        </Modal>

                        <BindCoordinates
                            ref='bindCoordinatesModel'
                        />

                        <UploadMp3Modal
                            isShow={this.state.selectMp3ModalIsShow}
                            closeDingModel={this.closeSelectMp3Model}
                            callbackId={this.state.selectMp3CallbackId}
                        />
                        <UploadOnlyVideoModal
                            isShow={this.state.calmOnlyVideoModalIsShow}
                            closeDingModel={this.closecalmOnlyVideoModalIsShowModel}
                            callbackId={this.state.calmOnlyVideoCallbackId}
                        />
                        <UploadOnlyExcelModal
                            isShow={this.state.calmOnlyExcelModalIsShow}
                            closeDingModel={this.closecalmOnlyExcelModalIsShowModel}
                            callbackId={this.state.calmOnlyExcelCallbackId}
                        />
                        <UploadImgAndVideoModal
                            isShow={this.state.uploadImgAndVideoIsShow}
                            closeDingModel={this.closeDingModel}
                            callbackId={this.state.callbackId}
                        />
                    </div>
                </IntlProvider>
            </LocaleProvider>
        );
    },

});

export default MainLayout;

