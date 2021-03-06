import React, {PropTypes} from 'react';
import {
    Breadcrumb,
    Button,
    Col,
    Collapse,
    Dropdown,
    Icon,
    Menu,
    message,
    Modal,
    notification,
    Progress,
    Row,
    Table,
    Tabs,
    Card,
    Checkbox,
} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import EmotionInputComponents from './EmotionInputComponents';
import {
    getImgName,
    getLocalTime,
    getPageSize,
    isEmpty,
    MIDDLE_IMG,
    SMALL_IMG,
    checkUrl,
    getUrl
} from '../../utils/Const';
import {phone} from '../../utils/phone';
import {formatHM, formatMD, isToday, showLargeImg} from '../../utils/utils';
import GroupFileUploadComponents from './GroupFileUploadComponents';
import EditDingModal from './EditDingModal';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel;
const fileDetilColumns = [{
    title: '',
    dataIndex: 'img',
}];
var data_noom = [];
var antGroup;
// var messageList = [];
//消息通信js
var ms;
var imgTagArray = [];
var showImg = "";
var showContent = "";//将要显示的内容
var data = [];
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
var liveInfosPanelChildren;
// var errorModalIsShow = false;
var topScrollHeight = 0;
var scrollType = "auto";
var receiveMessageArray = [];
//上传文件
var uploadFileList = [];
var isDirectToBottom = true;
var isNewPage = false;
//此处返回的消息数量
var currentReturnCount = 0;
var didCount = 0;
var isRendering = false;
var isRequesting = false;
var preHeight = 0;
var isSend = false;
var menu = null;
var msgMenu = null;
var msgMenuLeft = null;
var uuidArr = [];
var targetDirColumns = [{
    title: '文件夹名称',
    dataIndex: 'dirName',
}, {
    title: '操作',
    className: 'ant-table-selection-user schoolgroup_operate',
    dataIndex: 'moveDirOpt',
}
];
var userGroupsColumns = [{
    title: '群聊头像',
    dataIndex: 'groupPhoto',
    className: 'left-12',
}, {
    title: '群聊名称',
    dataIndex: 'groupName',
}, {
    title: '群聊人数',
    dataIndex: 'userCount',
}, {
    title: '群设置',
    dataIndex: 'groupSet',
},];

var imgErrorCount = 0;

var messageData = [];
var userMessageData = [];

var mesReFlag = true;

const AntGroupTabComponents = React.createClass({

    getInitialState() {
        antGroup = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        // //聊天的更多功能
        menu = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" onClick={this.saveFile}>保存到蚁盘</a>
                </Menu.Item>
                {/*<Menu.Item>*/}
                {/*<a target="_blank">评论</a>*/}
                {/*</Menu.Item>*/}
                {/*<Menu.Item>*/}
                {/*<a target="_blank">保存到蚁盘</a>*/}
                {/*</Menu.Item>*/}
            </Menu>
        );
        msgMenu = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.withdrawMsg}>撤回</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.turnToDing}>叮一下</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.relayMsg}>转发</a>
                </Menu.Item>
            </Menu>
        );
        msgMenuLeft = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.relayMsg}>转发</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.delMsg}>删除</a>
                </Menu.Item>
            </Menu>
        );
        return {
            loginUser: loginUser,
            isreader: true,
            defaultActiveKey: 'loginWelcome',
            activeKey: 'loginWelcome',
            optType: 'getUserList',
            userContactsData: [],
            currentPerson: -1,
            messageList: [],
            userIdOfCurrentTalk: '',
            userGroupsData: [],
            createChatGroupModalVisible: false,
            mockData: [],       //联系人穿梭框左侧备选数据
            targetKeys: [],     //联系人穿梭框右侧已选数据
            chatGroupTitle: '',
            updateGroupId: '',
            currentMemberArray: [],
            selectedRowKeys: [],  // Check here to configure the default column
            selectedRowKeysStr: '',
            memberData: [],  //添加群成员时，待添加群成员的数组
            memberTargetKeys: [],    //添加群成员时，已选中待添加群成员的数组
            updateChatGroupTitle: '',
            followsUserArray: [],
            breadcrumbVisible: true,
            totalLiveCount: 0,   //直播课页面的直播课总数
            currentLivePage: 1,  //直播课页面的当前页码
            currentCourseWarePage: 1,    //资源页面的当前页码
            totalCourseWareCount: 0,     //资源页面的资源总数
            currentSubjectPage: 1,    //题目页面的当前页码
            totalSubjectCount: 0,     //题目页面的资源总数
            totalChatGroupCount: 0,  //当前用户的群组总数
            currentChatGroupPage: 1,    //群组列表页面的当前页码
            errorModalIsShow: false,
            uploadPercent: 0,
            progressState: 'none',
            totalCount: 0,
            readState: '未读',
            mesReadActiveKey: "1",
            makeDingModalIsShow: false,
            concatOptions: [],
            structureOptions: [],   //组织架构
            groupOptions: [],
            RMsgActiveKey: ['2'],
            msgMenu: (
                <Menu>
                    <Menu.Item>
                        <a target="_blank" className="ellips_t" onClick={this.turnToDing}>叮一下</a>
                    </Menu.Item>
                    <Menu.Item>
                        <a target="_blank" className="ellips_t" onClick={this.relayMsg}>转发</a>
                    </Menu.Item>
                </Menu>
            ),
            sendFileButton: false,
        };

    },

    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey: activeKey});
    },

    componentWillMount() {
        ms = antGroup.props.messageUtilObj;
        var messageType = antGroup.props.messageType;
        var propsUserInfo = antGroup.props.userInfo;
        var actionFrom = antGroup.props.actionFrom;
        var timeNode = (new Date()).valueOf();
        if (isEmpty(messageType) == false) {
            if (messageType == "message") {
                antGroup.setState({"optType": "sendMessage"});
                antGroup.getUser2UserMessages(propsUserInfo, timeNode);
                if (isEmpty(actionFrom) == false) {
                    antGroup.turnToMessagePage(propsUserInfo, messageType);
                }
            } else {
                antGroup.setState({"optType": "sendGroupMessage"});
                antGroup.sendGroupMessage(antGroup.props.groupObj, timeNode);
                if (isEmpty(actionFrom) == false) {
                    antGroup.turnToMessagePage(antGroup.props.groupObj, messageType);
                }
            }
        }
    },

    componentDidMount() {
        this.turnToMessagePage(sessionStorage.getItem("loginUser"), "message", "noTurnPage");
        window.__sendfile__ = this.sendFile;
        //查看分享的文件
        window.__noomShareId__ = this.noomShareId;
        window.__noomSaveFile__ = this.noomSaveFile;
    },

    componentDidUpdate() {
        this.msMsgRead();
    },

    componentWillUnmount() {
        // 在组件卸载之前将消息数组清空
        // messageTagArray.splice(0);
        this.props.clearEverything()
    },

    rightMsgDelFinish() {
        this.setState({optType: 'getUserList'})
    },

    changeWelcomeTitle(welcomeTitle) {
        antGroup.state.currentGroupObj.name = welcomeTitle;
    },

    /**
     *  已读消息回复服务器
     */
    msMsgRead() {
        var messageList = this.state.messageList;
        var id = this.state.loginUser.colUid;
        if (isEmpty(messageList) == false && messageList.length > 0) {
            if (typeof (messageList[0].groupReadState) != 'undefined') {
                //群组消息
                messageList.forEach(function (v, i) {
                    if (v.fromUser.colUid != id) {
                        // if (v.groupReadState == 0 && v.readState >= 0) {
                        if (v.groupReadState == 0) {
                            var receivedCommand = {
                                "command": "message_read",
                                "data": {"messageUUID": v.uuid}
                            };
                            ms.send(receivedCommand);
                            // v.readState = 1;
                            v.groupReadState = 1;
                            uuidArr.push(v.uuid);
                        }
                    }
                });

            } else {
                messageList.forEach(function (v, i) {
                    if (v.fromUser.colUid != id) {
                        if (v.readState == 0) {
                            var receivedCommand = {
                                "command": "message_read",
                                "data": {"messageUUID": v.uuid}
                            };
                            ms.send(receivedCommand);
                            v.readState = 1;
                            uuidArr.push(v.uuid);
                        }
                    }
                });
                // this.setState({messageList});
            }
            // var batchedUpdates = require('react-dom').unstable_batchedUpdates;
        }
    },

    //拿到分享链接里的查看文件id,去请求该文件的详细
    noomShareId(id) {
        var _this = this;
        var param = {
            "method": 'getCloudFileShareById',
            "shareId": id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response.attachments;
                _this.buildFileDetilData(response);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关闭查看分享的文件详情的model
     */
    checkFileModalHandleCancel() {
        this.setState({checkFileModalVisible: false});
        //关闭model时清空表格数据
        data_noom = [];
    },


    /**
     * 分享文件链接构建查看文件详细的table
     */
    buildFileDetilData(res) {
        var _this = this;
        data_noom = [];
        //打开model,model里有一个table,支持多选，选择后下面的下载和保存到蚁盘可用
        //根据数据展示文件,response已经拿到用它来渲染table
        //table支持多选，选择后下面的下载和保存到蚁盘可用
        //注：先将table渲染出来，再显示model，和昨天的model一样

        res.forEach(function (v, i) {
            //文件地址
            var fileSrc = v.cloudFile.path;
            //文件大小
            var fileLength = v.cloudFile.length;
            //文件ID
            var fileId = v.cloudFileId;
            //文件名
            var fileName = v.cloudFile.name;
            //文件创建时间
            var fileCreTime = getLocalTime(v.cloudFile.createTime);

            var fileCreateUid = v.cloudFile.createUid;
            //我要的key
            var key = fileSrc + '@' + fileName + '@' + fileLength;

            var imgTag = <div className="file_icon_cont noom_cursor"
                              onClick={_this.watchFileShare.bind(this, fileId, fileCreateUid, fileName)}>
                            <span className="file_icon_img">
                                <img src="../src/components/images/lALPBY0V4pdU_AxmZg_102_102.png"/>
                            </span>
                <img id={fileId} style={{display: "none"}} src={fileSrc}
                     onClick={showLargeImg}
                     alt=""/>
                <div className="file_icon_text">
                    <span className="file_icon_text2">{fileName}</span>
                    <span className="right_ri password_ts">{fileCreTime}</span>
                </div>
            </div>;
            var fileMes = {
                key: fileId,
                img: imgTag,
            };
            data_noom.push(fileMes);
        });

        this.setState({selectedRowKeys: []});
        this.setState({checkFileModalVisible: true});
    },

    onTabClick(e) {
        this.setState({mesReadActiveKey: e});
    },

    /**
     * 群消息中点击已读获取已读详细人员
     */
    checkTalkReaders(e) {
        var _this = this;
        if (typeof (e.groupReadState) != 'undefined') {
            //群消息
            this.refs.dingPanel.className = 'read_panel ding_enter';
            //渲染详情面板
            _this.showReaderList(e.uuid);
            _this.showNevReaderList(e.uuid);
            //先进入详情，后willcomponents
        }
    },

    /**
     * 群设置点击
     */
    gopTalkSetClick() {
        var groupSetId = this.state.groupSetId;
        this.props.gopTalkSetClick(groupSetId);
    },

    /**
     * 渲染群消息已读详情
     */
    showReaderList(id) {
        var _this = this;
        var param = {
            "method": 'getMessageReadUsers',
            "messageUUID": id,
            "type": '0'
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    var arr = [];
                    data.forEach(function (e) {
                        var id = e.colUid;
                        var memberAvatarTag = <img src={e.avatar}></img>;
                        var imgTag = <div className="maaee_group_face1">{memberAvatarTag}</div>;
                        var name = <span className="font_gray_666">{e.userName}</span>
                        var chatGroupJson = {
                            key: id,
                            groupPhoto: imgTag,
                            'groupName': name,
                        };

                        arr.push(chatGroupJson);
                    });
                    _this.setState({"readMenuMebs": arr});
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
     * 渲染群消息未读详情
     */
    showNevReaderList(id) {
        var _this = this;
        var param = {
            "method": 'getMessageReadUsers',
            "messageUUID": id,
            "type": '1'
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    var arr = [];
                    data.forEach(function (e) {
                        var id = e.colUid;
                        var memberAvatarTag = <img src={e.avatar}></img>;
                        var imgTag = <div className="maaee_group_face1">{memberAvatarTag}</div>;
                        var name = <span className="font_gray_666">{e.userName}</span>
                        var chatGroupJson = {
                            key: id,
                            groupPhoto: imgTag,
                            'groupName': name,
                        };

                        arr.push(chatGroupJson);
                    });
                    _this.setState({"noReadMenuMebs": arr});
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
     * 群消息已读人员侧边栏离场
     */
    levMesDetil() {
        this.refs.dingPanel.className = 'ding_panel ding_leave';
        this.setState({mesReadActiveKey: '1'});
    },

    /**
     * 表格分页响应函数
     * 需要注意该表格承载了不同的数据，需要根据情况进行分页
     * @param pageNo
     */
    pageOnChange(pageNo) {
        antGroup.getUserRootCloudFiles(antGroup.state.ident, pageNo);
        antGroup.setState({
            currentPage: pageNo,
        });
    },

    /**
     * 保存分享文件的回调(新版)
     */
    noomSaveFile(id) {
        this.saveFile(id);
        this.setState({isShare: true});
    },

    /**
     * 保存分享文件的回调
     */
    saveShareFile() {
        //在这里拿到文件的地址，名字，大小
        //调用存文件的那个函数
        var selectedFile = this.state.selectedRowKeys;
        // var arr = [];
        // //需要的信息用@拼接成一个字符串，顺序为 地址 文件名 大小
        // selectedFile.forEach(function (v, i) {
        //     arr = v.split('@');
        // });
        var fileIds = '';
        selectedFile.forEach(function (v) {
            fileIds += v + ','
        });
        fileIds = fileIds.substring(0, fileIds.length - 1);
        //打开我的文件model
        this.saveFile(fileIds);
        this.setState({isShare: true});
    },

    getMesUUid(uuid, e, keyWord) {
        var dingMenu = keyWord == 'dingMes' ? 'none' : 'block';
        //dingMes
        var nowTime = (new Date()).valueOf();

        var withdrawMsg = (
            <Menu>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.withdrawMsg}>撤回</a>
                </Menu.Item>
                <Menu.Item style={{display: dingMenu}}>
                    <a target="_blank" className="ellips_t" onClick={this.turnToDing}>叮一下</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.relayMsg}>转发</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.delMsg}>删除</a>
                </Menu.Item>
            </Menu>
        );
        var withdrawMsgCannot = (
            <Menu>
                <Menu.Item style={{display: dingMenu}}>
                    <a target="_blank" className="ellips_t" onClick={this.turnToDing}>叮一下</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.relayMsg}>转发</a>
                </Menu.Item>
                <Menu.Item>
                    <a target="_blank" className="ellips_t" onClick={this.delMsg}>删除</a>
                </Menu.Item>
            </Menu>
        );

        if ((nowTime - e.mesTimeForDetil) < 120000) {
            this.setState({msgMenu: withdrawMsg});
        } else {
            this.setState({msgMenu: withdrawMsgCannot});
        }
        this.setState({mesUuid: uuid});
        this.setState({megObj: e});
    },

    /**
     * 消息转发
     */
    relayMsg() {
        var megObj = this.state.megObj;
        if (megObj.attachmentType == 2) {
            message.error('该消息不支持');
            return false
        }
        this.getAntGroup();
        this.getStructureUsers();
        this.getRecentContents();
        this.setState({relayMsgModalVisible: true});
        //打开选择人员model
    },

    /**
     * 消息删除
     */
    delMsg() {
        var megObj = this.state.megObj;
        var _this = this;
        var param = {
            "method": 'removeUserMessage',
            "uuids": megObj.uuid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功' && ret.response == true) {
                    //从数组中去除那条消息
                    var messageList = antGroup.state.messageList;
                    messageList.forEach(function (v, i) {
                        if (isEmpty(v) == false) {
                            if (v.uuid == megObj.uuid) {
                                messageList.splice(i, 1);
                                antGroup.setState({mesRetNum: i});
                            }
                        }
                    });
                    antGroup.setState({messageList});
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
     * 消息转发model关闭的回调
     */
    relayMsgModalHandleCancel() {
        this.setState({
            relayMsgModalVisible: false,
            "checkedGroupOptions": [],
            "checkedConcatOptions": [],
            "checkedRecentConnectOptions": [],
            RMsgActiveKey: ['2']
        });
    },

    /**
     * 消息转发确定
     */
    sendMegToOthers() {
        //根据不同类型的消息转发
        //文字 图片 大表情 链接 文件   -语音-
        var megObj = this.state.megObj;
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

        if (megObj.attachmentType == 1) {
            //图片消息
            var attachment = {
                "address": megObj.attachment,
                "createTime": createTime,
                "playing": false,
                "type": 1,
                "user": loginUser
            };

            if (isEmpty(checkedRecentConnectOptions) == false) {
                checkedRecentConnectOptions.forEach(function (e) {
                    var mes = e + '';
                    if (mes.indexOf('%') == -1) {
                        //个人
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": e, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToPer, "attachment": attachment,
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    } else {
                        //群组
                        var toId = e.slice(0, e.length - 1)
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": toId, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToGrp, "attachment": attachment,
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    }
                });
            }

            if (isEmpty(checkedGroupOptions) == false) {
                checkedGroupOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp, "attachment": attachment
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedConcatOptions) == false) {
                checkedConcatOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "attachment": attachment
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedsSructureOptions) == false) {
                checkedsSructureOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "attachment": attachment
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

        } else if (megObj.attachmentType == 4) {
            //链接消息
            var cover = "http://png.findicons.com/files/icons/2083/go_green_web/64/link.png";
            var attachment = {
                "address": megObj.attachment,
                "createTime": createTime,
                "playing": false,
                "type": 4,
                "user": megObj.fromUser,
                "cover": cover,
                "content": megObj.content,
            };

            if (isEmpty(checkedRecentConnectOptions) == false) {
                checkedRecentConnectOptions.forEach(function (e) {
                    var mes = e + '';
                    if (mes.indexOf('%') == -1) {
                        //个人
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
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
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
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
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp, "attachment": attachment, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedConcatOptions) == false) {
                checkedConcatOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "attachment": attachment, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedsSructureOptions) == false) {
                checkedsSructureOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "attachment": attachment, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }
        } else if (isEmpty(megObj.expressionItem) == false) {
            //大表情消息
            var expressionItem = {
                "address": megObj.expressionItem
            }

            if (isEmpty(checkedRecentConnectOptions) == false) {
                checkedRecentConnectOptions.forEach(function (e) {
                    var mes = e + '';
                    if (mes.indexOf('%') == -1) {
                        //个人
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": e, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToPer, "expressionItem": expressionItem
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    } else {
                        //群组
                        var toId = e.slice(0, e.length - 1)
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": toId, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToGrp, "expressionItem": expressionItem
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    }
                });
            }

            if (isEmpty(checkedGroupOptions) == false) {
                checkedGroupOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp, "expressionItem": expressionItem
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedConcatOptions) == false) {
                checkedConcatOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "expressionItem": expressionItem
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedsSructureOptions) == false) {
                checkedsSructureOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "expressionItem": expressionItem
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

        } else if (isEmpty(megObj.fileName) == false) {
            //文件消息
            var cloudFile = {
                "name": megObj.fileName,
                "length": megObj.fileLength,
                "parentId": -2,
                "createUid": loginUser.colUid,
                "fileType": 0,
                "schoolId": loginUser.schoolId,
                "path": megObj.filePath,
                "uuid": megObj.fileUid
            };

            if (isEmpty(checkedRecentConnectOptions) == false) {
                checkedRecentConnectOptions.forEach(function (e) {
                    var mes = e + '';
                    if (mes.indexOf('%') == -1) {
                        //个人
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": e, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToPer, "cloudFile": cloudFile
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    } else {
                        //群组
                        var toId = e.slice(0, e.length - 1)
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": toId, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToGrp, "cloudFile": cloudFile
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    }
                });
            }

            if (isEmpty(checkedGroupOptions) == false) {
                checkedGroupOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp, "cloudFile": cloudFile
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedConcatOptions) == false) {
                checkedConcatOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "cloudFile": cloudFile
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedsSructureOptions) == false) {
                checkedsSructureOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "cloudFile": cloudFile
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }
        } else {
            // 文字消息

            if (isEmpty(checkedRecentConnectOptions) == false) {
                checkedRecentConnectOptions.forEach(function (e) {
                    var mes = e + '';
                    if (mes.indexOf('%') == -1) {
                        //个人
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": e, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToPer,
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    } else {
                        //群组
                        var toId = e.slice(0, e.length - 1)
                        var uuid = _this.createUUID();
                        var messageJson = {
                            'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                            "toId": toId, "command": "message", "hostId": loginUser.colUid,
                            "uuid": uuid, "toType": messageToGrp,
                        };
                        var commandJson = {"command": "message", "data": {"message": messageJson}};
                        ms.send(commandJson);
                    }
                });
            }

            if (isEmpty(checkedGroupOptions) == false) {
                checkedGroupOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp,
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedConcatOptions) == false) {
                checkedConcatOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer,
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

            if (isEmpty(checkedsSructureOptions) == false) {
                checkedsSructureOptions.forEach(function (e) {
                    var uuid = antGroup.createUUID();
                    var messageJson = {
                        'content': megObj.content, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer,
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                });
            }

        }

        //初始化
        this.setState({
            relayMsgModalVisible: false,
            "checkedGroupOptions": [],
            "checkedConcatOptions": [],
            "checkedsSructureOptions": [],
            "checkedRecentConnectOptions": [],
            RMsgActiveKey: ['2'],
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
                    // console.log("toUser为空");
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
     * 最近联系复选框被选中时的响应x
     * @param checkedValues
     */
    recentConnectOptionsOnChange(checkedValues) {
        this.setState({"checkedRecentConnectOptions": checkedValues});
    },

    /**
     * 我的好友复选框被选中时的响应x
     * @param checkedValues
     */
    groupOptionsOnChange(checkedValues) {
        this.setState({"checkedGroupOptions": checkedValues});
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

    collapseChange(key) {
        this.setState({RMsgActiveKey: key});
        this.getRecentContents();
        this.getUserChatGroupById(-1);
    },

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
     * 消息转叮
     */
    turnToDing() {
        var _this = this;
        var megObj = this.state.megObj;
        //console.log(megObj.groupReadState);区分是群还是个人  个人传个人  群传未读人
        if (isEmpty(megObj.attachmentType) == true && isEmpty(megObj.fileName) == true && isEmpty(megObj.expressionItem) == true) {
            //文字
            if (typeof (megObj.groupReadState) != 'undefined') {
                //群
                _this.checkNevReaders(megObj.uuid);
            } else {
                //个人
                _this.setState({
                    dingSelectedRowKeys: [megObj.toId],
                    dingSelectedNames: [{key: megObj.toId, name: megObj.toName}]
                });
            }
            _this.setState({msgContent: megObj.content, dingUuid: megObj.uuid});
            //打开model
            _this.setState({makeDingModalIsShow: true});
        } else {
            message.error('该消息不支持');
        }
    },

    /**
     *
     */
    checkNevReaders(id) {
        var _this = this;
        var param = {
            "method": 'getMessageReadUsers',
            "messageUUID": id,
            "type": '1'
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    var dingSelectedRowKeys = [];
                    var dingSelectedNames = [];
                    if (isEmpty(data) == false) {
                        data.forEach(function (v, i) {
                            dingSelectedRowKeys.push(v.colUid);
                            dingSelectedNames.push({key: v.colUid, name: v.userName});
                        })
                        _this.setState({
                            dingSelectedRowKeys,
                            dingSelectedNames
                        });
                    }
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    closeDingModel() {
        this.setState({makeDingModalIsShow: false});
    },

    /**
     * 叮消息转换成功变成叮消息的样式
     * @param id
     */
    dingMsgReturnSuc(id) {
        var messageList = antGroup.state.messageList;
        messageList.forEach(function (v, i) {
            if (isEmpty(v) == false) {
                if (v.uuid == id) {
                    v.biumes = true
                }
            }
        });
        //根据uuid改变megList
    },

    /**
     * 消息撤回的方法
     */
    withdrawMsg() {
        var mesUuid = this.state.mesUuid;
        var param = {
            "method": 'retractMessage',
            "userId": antGroup.state.loginUser.colUid,
            "messageUUID": mesUuid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var messageList = antGroup.state.messageList;
                    messageList.forEach(function (v, i) {
                        if (isEmpty(v) == false) {
                            if (v.uuid == mesUuid) {
                                messageList.splice(i, 1);
                                antGroup.setState({mesRetNum: i});
                            }
                        }
                    });
                    antGroup.setState({messageList});
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
     *打开保存文件到蚁盘的model
     */
    saveFile(fileIds) {
        //1.请求用户的私人网盘用数据构建model的table
        var param = {
            "method": 'getUserRootCloudFiles',
            "userId": antGroup.state.loginUser.colUid,
            "pageNo": 1,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    //构建我的文件目标文件夹数据
                    antGroup.buildTargetDirData(ret, true, fileIds);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 构建移动文件时的目标文件夹数据
     * @param ret
     */
    buildTargetDirData(ret, flag, fileIds) {
        var targetDirDataArray = [];
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            ret.response.forEach(function (e) {
                if (i == 0) {
                    if (e.parent) {
                        var parentDirectoryId = e.parent.parentId;
                        antGroup.setState({"parentDirectoryIdAtMoveModal": parentDirectoryId});
                    }
                }
                i++;
                var key = e.id;
                var name = e.name;
                var directory = e.directory;
                var fileLogo = antGroup.buildFileLogo(name, directory, e);

                var dirName = <span className="font_gray_666"
                    //这是点击文件名进入文件夹的功能
                                    onClick={antGroup.intoDirectoryInner.bind(antGroup, e, fileIds)}>
                {fileLogo}
            </span>;
                var moveDirOpt;
                if (e.directory == true) {
                    moveDirOpt = <div>
                        {/*这是确定保存的功能*/}
                        <Button onClick={antGroup.saveFileToTargetDir.bind(antGroup, key, fileIds)}>确定</Button>
                    </div>;
                } else {
                    dirName = name;
                }
                var dataJson = {
                    key: key,
                    dirName: dirName,
                    moveDirOpt: moveDirOpt
                };
                targetDirDataArray.push(dataJson);
            })
            antGroup.setState({"targetDirDataArray": targetDirDataArray});
            //2.当表格组件好之后就让model显示出来
            if (flag) {
                antGroup.setState({saveFileModalVisible: true});
            }
        }
    },

    /**
     *拿到保存的文件的信息的回调
     * @param filePath
     * @param fileName
     * @param fileLength
     */
    getCloudFile(filePath, fileName, fileLength, fileCreateUid) {
        this.setState({filePath, fileName, fileLength, fileCreateUid});
    },

    /**
     * 点击确定按钮，保存文件到指定目录
     */
    saveFileToTargetDir(parentCloudFileId, fileIds) {
        if (this.state.isShare) {
            var param = {
                "method": 'copyCloudFiles',
                "operateUserId": antGroup.state.loginUser.colUid,
                "toCloudFileId": parentCloudFileId,
                "fromCloudFileIds": fileIds
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                        var initPageNo = 1;
                        var queryConditionJson = "";
                        if (antGroup.state.currentDirectoryId != -1) {
                            antGroup.listFiles(antGroup.state.ident,
                                antGroup.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            antGroup.getUserRootCloudFiles(antGroup.state.ident, antGroup.state.currentPage);
                        }
                        message.success("文件保存成功");
                    } else {
                        message.error("文件保存失败");
                    }
                    antGroup.setState({saveFileModalVisible: false});
                    antGroup.setState({checkFileModalVisible: false});
                    antGroup.setState({isShare: false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });

        } else {
            //1.将此文件的信息拿过来
            var name = this.state.fileName;
            var path = this.state.filePath;
            var length = this.state.fileLength;
            var fileCreateUid = this.state.fileCreateUid;

            var param = {
                "method": 'createCloudFile',
                "operateUserId": antGroup.state.loginUser.colUid,
                "parentCloudFileId": parentCloudFileId,
                "name": name,
                "path": path,
                "length": length
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                        var initPageNo = 1;
                        var queryConditionJson = "";
                        if (antGroup.state.currentDirectoryId != -1) {
                            antGroup.listFiles(antGroup.state.ident,
                                antGroup.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            antGroup.getUserRootCloudFiles(antGroup.state.ident, antGroup.state.currentPage);
                        }
                        message.success("文件保存成功");
                    } else {
                        message.error("文件保存失败");
                    }
                    antGroup.setState({saveFileModalVisible: false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },

    /**
     *构建我的文件model文件图标
     */
    buildFileLogo(name, directory, e) {
        var fileLogo = <span className="cloud_text">
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc"
                    //这也是点击文件名进入文件夹的功能
                      onClick={antGroup.intoDirectoryInner.bind(antGroup, e)}>{name}</span>
            </span>;
        return fileLogo;
    },

    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj, fileIds) {
        var initPageNo = 1;
        var queryConditionJson = "";
        //点击第一层文件夹时，记录当前文件夹的群主是否是当前用户
        if (antGroup.state.currentDirectoryId == -1 && this.state.getFileType != "myFile") {
            if (directoryObj.createUid == this.state.ident) {
                this.setState({"isGroupCreator": true});
            } else {
                this.setState({"isGroupCreator": false});
            }
        }
        antGroup.setState({
            "parentDirectoryIdAtMoveModal": directoryObj.parentId,
            "currentDirectoryIdAtMoveModal": directoryObj.id
        });
        antGroup.listFiles(antGroup.state.ident, directoryObj.id, queryConditionJson, initPageNo, fileIds);
    },

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles: function (operateUserId, cloudFileId, queryConditionJson, pageNo, fileIds) {
        data = [];
        antGroup.setState({totalCount: 0});
        antGroup.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
        var param = {
            "method": 'listFiles',
            "operateUserId": antGroup.state.loginUser.colUid,
            "cloudFileId": cloudFileId,
            "queryConditionJson": queryConditionJson,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    antGroup.buildTargetDirData(ret, false, fileIds);
                } else {
                    var parentDirectoryId = e.parent.parentId;
                    antGroup.setState({"parentDirectoryId": parentDirectoryId});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关闭保存文件到蚁盘的model
     */
    moveFileModalHandleCancel() {
        antGroup.setState({saveFileModalVisible: false});
    },

    /**
     * 让保存文件到蚁盘model后退
     */
    returnParentAtMoveModal() {
        var initPageNo = 1;
        if (antGroup.state.parentDirectoryIdAtMoveModal == 0) {
            antGroup.setState({"parentDirectoryIdAtMoveModal": -1, "currentDirectoryIdAtMoveModal": -1});
            antGroup.getUserRootCloudFiles(antGroup.state.ident, initPageNo);
        } else {
            var queryConditionJson = "";
            antGroup.listFiles(antGroup.state.ident, antGroup.state.parentDirectoryIdAtMoveModal, queryConditionJson, initPageNo);
        }
    },

    /**
     * 获取用户文件根目录
     * @param userId
     * @param pageNo
     */
    getUserRootCloudFiles: function (userId, pageNo) {
        data = [];
        antGroup.setState({currentDirectoryId: -1, totalCount: 0});
        var param = {
            "method": 'getUserRootCloudFiles',
            "userId": antGroup.state.loginUser.colUid,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    antGroup.buildTargetDirData(ret, false);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 让上传组件显示
     */
    sendFile() {
        if (antGroup.state.loginUser.colUtype === 'STUD') {
            antGroup.canSendFile();
            return
        }

        //清空上传文件数组
        uploadFileList.splice(0, uploadFileList.length);
        antGroup.setState({cloudFileUploadModalVisible: true, uploadPercent: 0, progressState: 'none'});
    },

    /**
     * 关闭上传文件弹窗
     */
    cloudFileUploadModalHandleCancel() {
        var _this = this;
        antGroup.setState({"cloudFileUploadModalVisible": false, sendFileButton: false});
        if (isEmpty(_this.refs.fileUploadCom) == false) {
            _this.refs.fileUploadCom.initFileUploadPage();
        }
    },

    /**
     * 处理上传组件已上传的文件列表
     */
    handleFileSubmit(fileList) {
        // if (fileList == null || fileList.length == 0) {
        uploadFileList.splice(0, uploadFileList.length);
        // }
        for (var i = 0; i < fileList.length; i++) {
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj);
        }
    },

    canSendFile() {
        var param = {
            "method": 'canSendFile',
            "userId": antGroup.state.loginUser.colUid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success) {
                    //清空上传文件数组
                    uploadFileList.splice(0, uploadFileList.length);
                    antGroup.setState({cloudFileUploadModalVisible: true, uploadPercent: 0, progressState: 'none'});
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
     * 发送文件的回调
     */
    uploadFile() {
        if (uploadFileList.length == 0) {
            message.warning("请选择上传的文件,谢谢！");
        } else {
            this.setState({sendFileButton: true});
            var formData = new FormData();
            for (var i = 0; i < uploadFileList.length; i++) {
                formData.append("file" + i, uploadFileList[i]);
                formData.append("name" + i, uploadFileList[i].name);
            }
            $.ajax({
                type: "POST",
                url: "http://60.205.86.217:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData: false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType: false,
                xhr: function () {        //这是关键  获取原生的xhr对象  做以前做的所有事情
                    var xhr = jQuery.ajaxSettings.xhr();
                    xhr.upload.onload = function () {
                        antGroup.setState({progressState: 'none'});
                    };
                    xhr.upload.onprogress = function (ev) {
                        antGroup.setState({progressState: 'block'});
                        //if (ev.lengthComputable) {
                        var loaded = ev.total * 1.7;
                        var total = ev.total * 2;
                        // var percent = 100 * loaded / total;
                        var percent = 100 * ev.loaded / ev.total;
                        antGroup.setState({uploadPercent: Math.round(percent)});
                        //}
                    };
                    return xhr;
                },
                success: function (responseStr) {
                    if (responseStr != "") {
                        var fileUrl = responseStr;
                        //fileUrl文件的路径，根据路径创建文件发送对象，ms.send,关闭模态框
                        //调用发送文件的方法
                        var arr = fileUrl.split(',');
                        arr.forEach(function (v, i) {
                            antGroup.sendFileToOthers(v, i);
                        });
                    }
                },
                error: function (responseStr) {
                    antGroup.setState({cloudFileUploadModalVisible: false});
                }
            });

        }
        this.refs.fileUploadCom.clearFile();
    },

    sendPicToOthers(url) {
        var name = '';
        //文件路径
        var path = url;

        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

        var uuid = this.createUUID();

        var createTime = (new Date()).valueOf();

        var attachment = {
            "address": path,
            "createTime": createTime,
            "playing": false,
            "type": 1,
            "user": loginUser
        };

        var messageJson = {
            'content': name, "createTime": createTime, 'fromUser': loginUser,
            "toId": antGroup.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
            "uuid": uuid, "toType": 1, "attachment": attachment
        };

        if (antGroup.state.optType == "sendGroupMessage") {
            messageJson.toId = antGroup.state.currentGroupObj.chatGroupId;
            messageJson.toType = 4;
        }

        var commandJson = {"command": "message", "data": {"message": messageJson}};

        ms.send(commandJson);
        //关闭model
    },

    /**
     * 拿到文件路径，发送message
     */
    sendFileToOthers(url, i) {
        isSend = true;
        //文件种类
        var fileType = uploadFileList[i].type;
        //文件名
        var name = uploadFileList[i].name;
        //文件大小
        var length = uploadFileList[i].size;
        //文件路径
        var path = url;

        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

        var uuid = antGroup.createUUID();

        var createTime = (new Date()).valueOf();

        if (fileType == 'image/png' || fileType == 'image/jpeg' || fileType == 'image/jpg') {
            var attachment = {
                "address": path,
                "createTime": createTime,
                "playing": false,
                "type": 1,
                "user": loginUser
            };

            var messageJson = {
                'content': name, "createTime": createTime, 'fromUser': loginUser,
                "toId": antGroup.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
                "uuid": uuid, "toType": 1, "attachment": attachment
            };
            antGroup.cloudFileUploadModalHandleCancel();
        } else {
            var cloudFile = {
                "name": name,
                "length": length,
                "parentId": -2,
                "createUid": loginUser.colUid,
                "fileType": 0,
                "schoolId": loginUser.schoolId,
                "path": path,
                "uuid": uuid
            };

            var messageJson = {
                'content': name, "createTime": createTime, 'fromUser': loginUser,
                "toId": antGroup.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
                "uuid": uuid, "toType": 1, "cloudFile": cloudFile
            };
        }

        if (antGroup.state.optType == "sendGroupMessage") {
            messageJson.toId = antGroup.state.currentGroupObj.chatGroupId;
            messageJson.toType = 4;
        }

        var commandJson = {"command": "message", "data": {"message": messageJson}};
        ms.send(commandJson);
    },

    handleScroll(e) {
        if (scrollType == "auto") {
            return;
        }
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var scrollTop = target.scrollTop;
        isNewPage = false;
        preHeight = target.scrollHeight;
        if (scrollTop <= 1 && isRendering == false && !isRequesting) {
            didCount = 0;
            if (antGroup.state.messageComeFrom == "groupMessage") {
                antGroup.getChatGroupMessages(antGroup.state.currentGroupObj, antGroup.state.firstMessageCreateTime);
            } else {
                antGroup.getUser2UserMessages(antGroup.state.currentUser, antGroup.state.firstMessageCreateTime);
            }
        }
    },

    handleScrollType(e) {
        scrollType = "defined";
    },

    checkKeyType() {
        var sendType;
        if (antGroup.state.messageComeFrom == "groupMessage") {
            sendType = "groupSend";
        } else {
            sendType = "";
        }
        isSend = true;
        antGroup.messageSendByType(sendType);
    },

    showpanle(obj) {
        LP.Start(obj);
    },


    shouldComponentUpdate() {
        if (this.state.isreader) {
            return true;
        } else {
            return false;
        }
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

    checkSameMessageIsExist(currentUUID) {
        var isExits = false;
        for (var i = 0; i < receiveMessageArray.length; i++) {
            var messageUUId = receiveMessageArray[i];
            if (currentUUID == messageUUId) {
                isExits = true;
                break;
            }
        }
        return isExits;
    },

    //ding消息被点击
    entDingMesDetil() {

    },

    /**
     * 进入收发消息的窗口
     * @param user
     */
    turnToMessagePage(operatorObj, messageType, isTurnPage) {
        this.initMyEmotionInput();
        var _this = this;
        var userId;
        var messageList = [];
        ms.msgWsListener = {
            onError: function (errorMsg) {
                console.log(errorMsg, 'onError');
                if (_this.state.errorModalIsShow == false) {
                    _this.setState({"errorModalIsShow": true});
                    ms.closeConnection();
                    Modal.error({
                        transitionName: "",  //禁用modal的动画效果
                        title: '系统异常通知',
                        content: errorMsg,
                        onOk() {
                            sessionStorage.removeItem("ident");
                            sessionStorage.removeItem("loginUser");
                            //sessionStorage.removeItem("machineId");
                            location.hash = "Login";
                            window.ms = null;
                            LP.delAll();
                        },
                    });
                }
            }, onWarn: function (warnMsg) {
                message.warning(warnMsg);
            }, onMessage: function (info) {
                console.log(info);
                mesReFlag = true;
                var messageList = antGroup.state.messageList;
                // console.log(info);
                // console.log('info');
                var groupObj;
                var gt = $('#groupTalk');
                if (antGroup.state.optType == "sendMessage") {
                    //如果是个人消息通信，传入的对象应该是用户对象
                    userId = operatorObj.colUid;
                } else {
                    //如果是群组消息通信，传入的对象应该是群组对象
                    groupObj = operatorObj;
                }

                if (isEmpty(gt[0]) == false) {
                    var gtScrollHeight = gt[0].scrollHeight;
                    var gtScrollTop = gt[0].scrollTop;
                    if (parseInt(gtScrollHeight) - parseInt(gtScrollTop) === gt[0].clientHeight) {
                        isDirectToBottom = true;
                    } else {
                        isDirectToBottom = false;
                    }
                }

                var messageList = [];
                //获取messageList
                var command = info.command;
                var messageOfSinge;
                if (isEmpty(command) == false) {
                    if (command == "messageList") {
                        showImg = "";
                        var data = info.data;
                        //手机发送的群消息的处理
                        // messageOfSinge = data.messages[0];


                        var messageArray = data.messages;
                        var uuidsArray = [];
                        messageArray.forEach(function (e) {
                            var fromUser = e.fromUser;
                            var colUtype = fromUser.colUtype;
                            var content = e.content;
                            var uuid = e.uuid;
                            uuidsArray.push(uuid);
                            var messageReturnJson = antGroup.getImgTag(e);
                            var imgTagArrayReturn = [];
                            if (isEmpty(messageReturnJson) == false && isEmpty(messageReturnJson.messageType) == false) {
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                            }
                            ;
                            if (e.toType == 1) {
                                //个人消息
                                if (("SGZH" == colUtype || fromUser.colUid == userId)) {
                                    imgTagArray.splice(0);
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    messageList.push(message);
                                }
                            } else if (e.toType == 4) {
                                //处理聊天的群组消息
                                if (("SGZH" == colUtype || isEmpty(groupObj) == false && groupObj.chatGroupId == e.toId)) {
                                    imgTagArray.splice(0);
                                    var message = {
                                        'fromUser': fromUser,
                                        'content': content,
                                        "messageType": "getMessage",
                                        "imgTagArray": imgTagArrayReturn,
                                        "messageReturnJson": messageReturnJson
                                    };
                                    messageList.push(message);
                                }
                            }
                        });
                        if (uuidsArray.length != 0) {
                            var receivedCommand = {
                                "command": "messageRecievedResponse",
                                "data": {"uuids": uuidsArray}
                            };
                            ms.send(receivedCommand);
                        }
                        //antGroup.addMessageList(messageList,"first");
                    } else if (command == 'message_read') {
                        //已读未读处理，更改相关消息的readState， 分群和个人
                        if (isEmpty(info.data.message.toType) == false) {
                            var uuid = info.data.message.uuid;

                            if (uuidArr.indexOf(uuid) != -1) {
                                //消息已读之后服务器返回的message,在uuidArr数组中,不应该setState,
                                //从数组中除去,并return
                                uuidArr.forEach(function (v, i) {
                                    if (v == uuid) {
                                        uuidArr.splice(i, 1);
                                    }
                                });
                                return false
                            }
                            var messageList = antGroup.state.messageList;
                            if (info.data.message.toType == 1) {
                                if (info.data.readUserCount !== 0) {
                                    messageList.forEach(function (v, i) {
                                        if (isEmpty(v) == false) {
                                            if (v.uuid == uuid) {
                                                v.readState = info.data.readUserCount;
                                                v.readStateStr = '已读';
                                            }
                                        }
                                    });
                                }
                            } else {
                                messageList.forEach(function (v, i) {
                                    if (isEmpty(v) == false) {
                                        if (v.uuid == uuid) {
                                            v.readState = info.data.readUserCount;
                                            v.readStateStr = info.data.readUserCount + '人已读';
                                        }
                                    }
                                });
                            }
                            antGroup.setState({messageList});
                        }
                    } else if (command == "message") {
                        var data = info.data;
                        if (data.message.command == "biu_message") {
                            // var obj = JSON.parse(data.message.content);
                            if (data.message.fromUser.colUid != 41451) {
                                _this.props.showAlert(true);
                            }
                        } else if (data.message.command == "message") {
                            if (data.message.fromUser.colUid !== _this.state.loginUser.colUid && data.message.showType == 0) {
                                if (isEmpty(data.message.toChatGroup) == false || isEmpty(data.message.toUser) == false) {
                                    _this.props.showMesAlert(true);
                                    _this.props.refresh();
                                }
                            } else {
                                //普通消息是我发出的
                                if (isEmpty(data.message.cloudFile) == false) {
                                    //判断消息是文件消息，让model关闭
                                    antGroup.cloudFileUploadModalHandleCancel();
                                }
                            }
                        } else if (data.message.command == "retractMessage") {
                            mesReFlag = false;
                            //根据data.message.content去messagelist中删除消息
                            var messageList = antGroup.state.messageList;
                            messageList.forEach(function (v, i) {
                                if (isEmpty(v) == false) {
                                    if (v.uuid == data.message.content) {
                                        messageList.splice(i, 1);
                                        antGroup.setState({mesRetNum: i});
                                    }
                                }
                            });
                            antGroup.setState({messageList});
                        } else if (data.message.command == "message_read") {
                            //消息已读之后来自蚂蚁君的message_read,没用直接return
                            return false
                        } else if (data.message.command == "dissolutionChatGroup") {
                            //组织架构删除子部门后来自群通知着的消息
                            return false
                        } else if (data.message.command == "COMMAND_DELETE_RECORD_MESSAGE") {
                            //删除消息的commend,没用直接return
                            var uuid = JSON.parse(data.message.content)[0].uuid;
                            var messageList = antGroup.state.messageList;
                            messageList.forEach(function (v, i) {
                                if (isEmpty(v) == false) {
                                    if (v.uuid == uuid) {
                                        messageList.splice(i, 1);
                                        antGroup.setState({mesRetNum: i});
                                    }
                                }
                            });
                            antGroup.setState({messageList});
                            return false
                        } else if (data.message.command == "COMMAND_DELETE_RECENT_MESSAGE") {
                            var uuids = '';
                            var uuid;
                            JSON.parse(data.message.content).forEach(function (v) {
                                if (v.toType == 1) {
                                    uuid = v.toUser.colUid;
                                } else {
                                    uuid = v.toChatGroup.chatGroupId
                                }
                                uuids += uuid + '#';
                            });
                            antGroup.props.delLeftMsgFinish(uuids);
                            return false
                        }

                        showImg = "";
                        messageOfSinge = data.message;
                        var fromUser = messageOfSinge.fromUser;
                        var colUtype = fromUser.colUtype;
                        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                        var content = messageOfSinge.content;
                        if (colUtype == 'SGZH_WEB' && loginUser.colUid == 119665) {
                            content = JSON.parse(messageOfSinge.content).messageTip;
                            var flowTypeObj = JSON.parse(messageOfSinge.content);
                            delete flowTypeObj.messageTip;
                            antGroup.setState({FlowType: flowTypeObj});
                        }
                        var uuidsArray = [];
                        var uuid = messageOfSinge.uuid;
                        var toId = messageOfSinge.toId;
                        if (isEmpty(messageOfSinge.toUser) == false) {
                            var toName = messageOfSinge.toUser.userName;
                        }
                        var showType = messageOfSinge.showType;  //showType为0正常显示 1通知形式
                        var readState = messageOfSinge.readState;  //0为未读，1为已读
                        //判断是否是叮消息
                        //判断这条消息是我发出的，处理别的手机发送消息不同步的问题
                        if (messageOfSinge.fromUser.colUid == antGroup.state.loginUser.colUid) {
                            isSend = true;
                        }
                        ;
                        var biumes = null;
                        if (messageOfSinge.command == 'message') {
                            biumes = false;
                        }
                        if (messageOfSinge.command == 'biu_message') {
                            biumes = true;
                        }
                        //附件，图片路径或者音频路径
                        if (isEmpty(messageOfSinge.attachment) == false) {
                            var attachment = messageOfSinge.attachment.address;
                            var attachmentType = messageOfSinge.attachment.type;
                        }
                        //动态表情
                        if (isEmpty(messageOfSinge.expressionItem) == false) {
                            var expressionItem = messageOfSinge.expressionItem.address;
                        }
                        //文件
                        if (isEmpty(messageOfSinge.cloudFile) == false) {
                            //文件名
                            var fileName = messageOfSinge.cloudFile.name;
                            //路径
                            var filePath = messageOfSinge.cloudFile.path;
                            //大小
                            var fileLength = messageOfSinge.cloudFile.length;
                            //uuid
                            var fileUid = messageOfSinge.cloudFile.uuid;
                            //文件CreateUid
                            var fileCreateUid = messageOfSinge.cloudFile.createUid;
                        }
                        uuidsArray.push(uuid);
                        var isExist = antGroup.checkSameMessageIsExist(uuid);
                        if (isExist) {
                            return;
                        } else {
                            receiveMessageArray.push(uuid);
                        }
                        if (uuidsArray.length != 0) {
                            var receivedCommand = {
                                "command": "messageRecievedResponse",
                                "data": {"uuids": uuidsArray}
                            };
                            ms.send(receivedCommand);
                        }
                        var isCurrentDay = isToday(messageOfSinge.createTime);
                        var createTime;
                        var mesTime;
                        if (isCurrentDay) {
                            //如果是当天的消息，只显示时间
                            createTime = formatHM(messageOfSinge.createTime);
                            mesTime = formatHM(messageOfSinge.createTime);
                        } else {
                            //非当天时间，显示的是月-日
                            createTime = formatMD(messageOfSinge.createTime);
                            mesTime = formatMD(messageOfSinge.createTime) + ' ' + formatHM(messageOfSinge.createTime);
                        }
                        var contentJson = {"content": content, "createTime": createTime};
                        var contentArray = [contentJson];
                        //推时间
                        var noomGroupId = -999;
                        var noomchatGroupId = -9999;
                        if (isEmpty(messageOfSinge.toChatGroup) == false) {
                            noomGroupId = messageOfSinge.toChatGroup.chatGroupId
                        }
                        ;
                        if (isEmpty(antGroup.state.currentGroupObj) == false) {
                            noomchatGroupId = antGroup.state.currentGroupObj.chatGroupId
                        }
                        ;
                        if (noomGroupId == noomchatGroupId || operatorObj.colUid == data.message.fromUser.colUid || data.message.fromUser.colUid == antGroup.state.loginUser.colUid) {
                            if (isEmpty(antGroup.state.messageList) == false && antGroup.state.messageList.length > 0) {
                                if (messageOfSinge.createTime - antGroup.state.messageList[0].mesTimeForDetil > 300000) {
                                    var messageShoww = {
                                        'fromUser': {
                                            "avatar": "http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png",
                                            "colUid": 120024,
                                            "userName": "群通知者",
                                        },
                                        'content': formatHM(messageOfSinge.createTime),
                                        "messageType": "getMessage",
                                        "showType": 1,
                                        "messageReturnJson": {
                                            messageType: "text",
                                        },
                                    };
                                    messageList.push(messageShoww);
                                    antGroup.addMessageList(messageList, "first");
                                    messageList.splice(0);
                                }
                            }
                        }

                        if (messageOfSinge.toType == 1 && typeof (content) != 'undefined' && messageOfSinge.command != "retractMessage") {
                            //个人单条消息
                            imgTagArray.splice(0);
                            var imgTagArrayReturn = [];
                            var messageReturnJson = antGroup.getImgTag(messageOfSinge);
                            if (isEmpty(messageReturnJson) == false && isEmpty(messageReturnJson.messageType) == false) {
                                if (messageReturnJson.messageType == "text") {
                                    content = messageReturnJson.textMessage;
                                } else if (messageReturnJson.messageType == "imgTag") {
                                    imgTagArrayReturn = messageReturnJson.imgMessage;
                                }
                            }

                            if (isSend == false) {
                                if (data.message.command != "message_read" && data.message.command != "biu_message") {
                                    if (operatorObj.colUid === data.message.fromUser.colUid) {
                                        //处理在停留在别人聊天窗口时另一人新消息会显示的问题，其中operatorObj是点击的那个人的信息，
                                        //data.message.fromUser是新消息来的那个人的信息
                                        var messageShow = {
                                            'fromUser': fromUser,
                                            'content': content,
                                            "messageType": "getMessage",
                                            "imgTagArray": imgTagArrayReturn,
                                            "messageReturnJson": messageReturnJson,
                                            "attachment": attachment,
                                            "attachmentType": attachmentType,
                                            "expressionItem": expressionItem,
                                            "fileName": fileName,
                                            "filePath": filePath,
                                            "fileLength": fileLength,
                                            "fileUid": fileUid,
                                            "fileCreateUid": fileCreateUid,
                                            "biumes": biumes,
                                            "uuid": uuid,
                                            "showType": showType,
                                            "readState": readState,
                                            "mesTime": mesTime,
                                            "mesTimeForDetil": messageOfSinge.createTime,
                                        };
                                        messageList.push(messageShow);
                                    }
                                    if (isEmpty(messageOfSinge.toUser) == false) {
                                        var userJson = {
                                            // key: messageOfSinge.toUser.colUid,
                                            key: messageOfSinge.fromUser.colUid,   //key是做红点的时候改的
                                            // "fromUser": messageOfSinge.toUser,
                                            "fromUser": messageOfSinge.fromUser,
                                            contentArray: contentArray,
                                            "messageToType": 1,
                                            "uuid": messageOfSinge.uuid
                                        };
                                        antGroup.props.onNewMessage(userJson);
                                    }
                                }

                            } else {
                                //我发出的
                                if (isEmpty(messageOfSinge.toUser) == false) {
                                    if (data.message.command != "message_read") {
                                        var messageShow = {
                                            'fromUser': fromUser,
                                            'content': content,
                                            "messageType": "getMessage",
                                            "imgTagArray": imgTagArrayReturn,
                                            "messageReturnJson": messageReturnJson,
                                            "attachment": attachment,
                                            "attachmentType": attachmentType,
                                            "expressionItem": expressionItem,
                                            "fileName": fileName,
                                            "filePath": filePath,
                                            "fileLength": fileLength,
                                            "fileUid": fileUid,
                                            "fileCreateUid": fileCreateUid,
                                            "uuid": uuid,
                                            "showType": showType,
                                            "readState": readState,
                                            "readStateStr": '未读',
                                            "mesTime": mesTime,
                                            "mesTimeForDetil": messageOfSinge.createTime,
                                            "toId": toId,
                                            "toName": toName,
                                        };
                                        //如果发送的消息=当前点击人的id，才push
                                        if (messageOfSinge.toUser.colUid === _this.state.curId) {
                                            messageList.push(messageShow);
                                        }
                                        var userJson = {
                                            key: messageOfSinge.toUser.colUid,
                                            // key: _this.state.loginUser.colUid,
                                            "fromUser": messageOfSinge.toUser,
                                            // "fromUser": messageOfSinge.fromUser,
                                            // "fromUser": messageOfSinge.fromUser,个人消息收到的时候要写成fromUser，而发出的要写成
                                            //toUser，否则会造成左侧联系人丢失。
                                            contentArray: contentArray,
                                            "messageToType": 1,
                                            "uuid": messageOfSinge.uuid
                                        };
                                        // if (isEmpty(isTurnPage)) {
                                        // }
                                        antGroup.props.onNewMessage(userJson);
                                        isSend = false;
                                    }
                                }
                            }
                        } else if (messageOfSinge.toType == 4 && typeof (content) != 'undefined' && messageOfSinge.command != "retractMessage") {
                            //群组单条消息
                            if (isEmpty(antGroup.state.currentGroupObj) == false
                                && antGroup.state.currentGroupObj.chatGroupId == messageOfSinge.toChatGroup.chatGroupId) {
                                //判断选中的群组就是要发送的群组
                                imgTagArray.splice(0);
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge);
                                if (isEmpty(messageReturnJson) == false && isEmpty(messageReturnJson.messageType) == false) {
                                    if (messageReturnJson.messageType == "text") {
                                        content = messageReturnJson.textMessage;
                                    } else if (messageReturnJson.messageType == "imgTag") {
                                        imgTagArrayReturn = messageReturnJson.imgMessage;
                                    }
                                }
                                var messageShow = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson,
                                    "attachment": attachment,
                                    "attachmentType": attachmentType,
                                    "expressionItem": expressionItem,
                                    "fileName": fileName,
                                    "filePath": filePath,
                                    "fileLength": fileLength,
                                    "fileUid": fileUid,
                                    "fileCreateUid": fileCreateUid,
                                    "uuid": uuid,
                                    "showType": showType,
                                    "readState": readState,
                                    "readStateStr": '全部未读',
                                    "groupReadState": readState,
                                    "mesTime": mesTime,
                                    "mesTimeForDetil": messageOfSinge.createTime,
                                };
                                //messageList.splice(0, 0, messageShow);
                                messageList.push(messageShow);
                                var userJson = {
                                    key: messageOfSinge.toChatGroup.chatGroupId,
                                    // key: _this.state.loginUser.colUid,
                                    "fromUser": fromUser,
                                    "toChatGroup": messageOfSinge.toChatGroup,
                                    contentArray: contentArray,
                                    "messageToType": 4,
                                    "uuid": messageOfSinge.uuid
                                };
                                // if (isEmpty(isTurnPage)) {
                                // }
                                antGroup.props.onNewMessage(userJson);
                            } else {
                                var userJson = {
                                    key: messageOfSinge.toChatGroup.chatGroupId,
                                    // key: _this.state.loginUser.colUid,
                                    "fromUser": fromUser,
                                    "toChatGroup": messageOfSinge.toChatGroup,
                                    contentArray: contentArray,
                                    "messageToType": 4,
                                    "uuid": messageOfSinge.uuid
                                };
                                // if (isEmpty(isTurnPage)) {
                                // }
                                antGroup.props.onNewMessage(userJson);
                            }
                        }
                        antGroup.addMessageList(messageList, "first");
                        //antGroup.setState({"messageList": messageList});
                    }
                }
            }
        };
        if (isEmpty(isTurnPage)) {
            if (messageType == "message") {
                //如果是个人消息通信，传入的对象应该是用户对象
                antGroup.setState({
                    "optType": "sendMessage",
                    "userIdOfCurrentTalk": operatorObj.colUid,
                    "currentUser": operatorObj
                });
            } else {
                //如果是个人消息通信，传入的对象应该是群组对象
                antGroup.setState({"optType": "sendGroupMessage", "currentGroupObj": operatorObj});
            }
        }

    },

    /**
     * 判断来的消息是什么消息
     * @param messageOfSingle
     * @returns {{}}
     */
    getImgTag(messageOfSingle) {
        if (isEmpty(messageOfSingle.content.trim()) == false) {

            if (isEmpty(messageOfSingle.attachment) == false) {
                if (messageOfSingle.attachment.type == 1) {
                    //图片
                    var address = messageOfSingle.attachment.address;
                    messageReturnJson = {messageType: "bigImgTag", address: address};
                } else if (messageOfSingle.attachment.type == 2) {
                    //语音
                    var address = messageOfSingle.attachment.address;
                    messageReturnJson = {messageType: "videoTag", address: address};
                } else if (messageOfSingle.attachment.type == 3) {
                    var address = messageOfSingle.attachment.address;
                    var addressCover = messageOfSingle.attachment.cover;
                    messageReturnJson = {messageType: "littleAudio", address: address, addressCover: addressCover};
                } else if (messageOfSingle.attachment.type == 4) {
                    //链接
                    var address = messageOfSingle.attachment.address;
                    var content = messageOfSingle.attachment.content;
                    messageReturnJson = {messageType: "linkTag", address: address, content: content};
                }
            } else {
                var imgTags = [];
                var messageReturnJson = {};
                messageReturnJson = antGroup.changeImgTextToTag(messageOfSingle.content, imgTags, messageReturnJson);
            }
        } else {
            if (isEmpty(messageOfSingle.expressionItem) == false) {
                //动态表情（ios的动态表情本来就是没有content的）
                var expressionItem = messageOfSingle.expressionItem;
                messageReturnJson = {messageType: "audioTag", expressionItem: expressionItem};
            } else if (isEmpty(messageOfSingle.attachment) == false) {
                if (messageOfSingle.attachment.type == 4) {
                    //没有内容链接
                    var address = messageOfSingle.attachment.address;
                    var content = messageOfSingle.attachment.content;
                    messageReturnJson = {messageType: "linkTag", address: address, content: content};
                } else if (messageOfSingle.attachment.type == 1) {
                    //图片
                    var address = messageOfSingle.attachment.address;
                    messageReturnJson = {messageType: "bigImgTag", address: address};
                } else if (messageOfSingle.attachment.type == 2) {
                    //语音
                    var address = messageOfSingle.attachment.address;
                    messageReturnJson = {messageType: "videoTag", address: address};
                }
            } else if (isEmpty(messageOfSingle.cloudFile) == false) {
                //上传的文件

                //文件名
                var name = messageOfSingle.cloudFile.name;
                //文件大小
                var length = messageOfSingle.cloudFile.length;
                //文件路径
                var path = messageOfSingle.cloudFile.path;
                messageReturnJson = {messageType: "fileUpload", name: name, length: length, path: path};
            }
        }
        return messageReturnJson;
    },

    /**
     * 将表情的标记转为表情的图片
     * 需要按点替换，被替换的位置需要打上标记，之后再将原内容，以imgTag的形式替换回去
     */
    changeImgTextToTag(str, imgTags, messageReturnJson) {
        showContent = str;
        if (isEmpty(str) == false) {
            var start = str.indexOf("[bexp_");
            if (start != -1) {
                var end = str.indexOf("]");
                var subStr = str.substring(start, end + 1);
                showContent = showContent.replace(subStr, "~");
                var imgUrl = getImgName(subStr);
                var localUrl = "../src/components/images/emotions/" + imgUrl;
                var subStrReplace = <span className='attention_img'><img className="face_text_img"
                                                                         src={localUrl}/></span>;
                imgTags.push(subStrReplace);
                var otherStr = str.substring(end + 1);
                if (otherStr.indexOf("[bexp_") != -1) {
                    antGroup.changeImgTextToTag(otherStr, imgTags);
                } else {
                    showImg += otherStr;
                    var textStrEnd = otherStr;
                }
                messageReturnJson = {messageType: "imgTag", imgMessage: imgTags};

            } else {
                //不存在表情，为单纯性的文字消息
                messageReturnJson = {messageType: "text", textMessage: str};
            }
        }
        return messageReturnJson;
    },

    /**
     *发送文字信息的回调
     **/
    sendMessage(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var sendType = target.value;
        isSend = true;
        antGroup.messageSendByType(sendType);
    },

    messageSendByType(sendType) {
        var messageContent = antGroup.getEmotionInputById();
        if (isEmpty(messageContent)) {
            message.error("消息内容不允许为空!");
            return;
        }
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = antGroup.createUUID();
        var createTime = (new Date()).valueOf();
        var messageJson = {
            'content': messageContent, "createTime": createTime, 'fromUser': loginUser,
            "toId": antGroup.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
            "uuid": uuid, "toType": 1
        };
        if (antGroup.state.optType == "sendGroupMessage") {
            messageJson.toId = antGroup.state.currentGroupObj.chatGroupId;
            messageJson.toType = 4;
        }
        var commandJson = {"command": "message", "data": {"message": messageJson}};
        ms.send(commandJson);
        //send过信息之后要做的事情，联动
        antGroup.initMyEmotionInput();
        //让消息回到底部
        var gt = $('#groupTalk');
        gt.scrollTop(parseInt(gt[0].scrollHeight));
        if (isEmpty(sendType) == false && sendType == "groupSend") {
            // antGroup.setState({"isDirectToBottom": true});
            isDirectToBottom = true;
        } else {
            // messageList.splice(0, 0, messageJson);
            // // 更新左侧消息动态列表
            // var showCreateTime = formatHM(createTime);
            // var contentJson = {"content": messageContent, "createTime": showCreateTime};
            // var contentArray = [contentJson];
            // var userJson = {
            //     key: antGroup.state.currentUser.colUid,
            //     "fromUser": antGroup.state.currentUser,
            //     contentArray: contentArray,
            //     "messageToType": 1
            // };
            // antGroup.props.onNewMessage(userJson);
            // antGroup.setState({"messageList": messageList, "isDirectToBottom": true});
            /*var messageList = [];
             messageList.push(messageJson);
             antGroup.addMessageList(messageList,"first");
             antGroup.setState({"isDirectToBottom": true});*/
        }
    },

    /**
     * 通过id获取文本域对象，并进而获取vaue值
     * @returns {string}
     */
    getEmotionInputById() {
        var messageContent = $(".emoji-wysiwyg-editor")[0].innerHTML;
        if (messageContent.indexOf("emojiPicker") != -1) {
            messageContent = $("#emotionInput")[0].value;
        } else {
            messageContent = $(".emoji-wysiwyg-editor")[0].innerText;
        }
        return messageContent;
    },

    /**
     * 初始化表情输入框
     * 清空话题标题输入框
     */
    initMyEmotionInput() {
        $("#emotionInput").val("");
        var emotionArray = $(".emoji-wysiwyg-editor");
        if (isEmpty(emotionArray) == false) {
            for (var i = 0; i < emotionArray.length; i++) {
                emotionArray[i].innerHTML = "";
                emotionArray[i].innerText = "";
                emotionArray[i].onKeyDown = this.checkKeyType;
            }
        }
    },

    getUserChatGroup() {
        antGroup.getUserChatGroupById(antGroup.state.currentChatGroupPage);
    },

    /**
     * 点击群组列表表格行时，获取当前行对应的记录信息
     * @param record　当前行的群组信息
     * @param index　当前行的索引顺序，从０开始
     */
    sendGroupMessage(groupObj, timeNode) {
        this.setState({groupSetId: groupObj.chatGroupId});
        scrollType = "auto";
        isDirectToBottom = true;
        antGroup.setState({"messageComeFrom": "groupMessage", "currentUser": '', messageList: []});
        antGroup.reGetChatMessage(groupObj, timeNode);
        this.props.showMesAlert(false);
    },

    reGetChatMessage(groupObj, timeNode) {

        antGroup.getChatGroupMessages(groupObj, timeNode);
        var messageType = "groupMessage";
        antGroup.turnToMessagePage(groupObj, messageType);
    },

    /**
     * 弹出消息提示
     * 当获取不到更早的消息列表时，给出提示信息
     * @param response
     */
    tipNotic(response) {
        if (typeof (response) != "undefined" && response.length == 0) {
            notification.open({
                message: '',
                description: '没有更多消息了',
                icon: <Icon type="meh" style={{color: '#108ee9', top: '-7px', position: 'relative'}}/>,

            });
            //
        }
    },

    addMessageList(messages, firstOrLast) {
        if (!mesReFlag) {
            return
        }
        if (isEmpty(firstOrLast) == false) {
            if (isEmpty(messages[0]) == false) {
                var num = antGroup.state.mesRetNum;
                if (messages[0].showType == 1) {
                    //对通知消息进行重排
                    antGroup.state.messageList.splice(num, 0, messages[0])
                } else {
                    if (antGroup.state.messageList[0].uuid !== messages[0].uuid) {
                        antGroup.state.messageList.unshift(messages[0]);
                    }

                }
            }
            antGroup.setState({messageList: antGroup.state.messageList});
        } else {
            antGroup.setState({messageList: antGroup.state.messageList.concat(messages)});
        }

        var gt = $('#groupTalk');
        if (isDirectToBottom == false) {
            if (isNewPage == true) {
                var nowHeight = gt[0].scrollHeight;
                // console.log("nowHeight:" + nowHeight + "=======preHeight:" + preHeight);
                var newHeight = Number(nowHeight) - Number(preHeight);
                // console.log("newHeight====>" + Number(newHeight));
                gt.scrollTop(Number(newHeight));
            }
        } else {
            if (isEmpty(gt[0]) == false) {
                topScrollHeight = gt[0].scrollHeight;
                gt.scrollTop(parseInt(gt[0].scrollHeight));
            }
        }
    },

    /**
     * 获取群聊天信息
     */
    getChatGroupMessages(groupObj, timeNode) {
        var param = {
            "method": 'getChatGroupMessages',
            "chatGroupId": groupObj.chatGroupId,
            "timeNode": timeNode
        };

        isRequesting = true;
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                isRequesting = false;
                if (ret.msg == "调用成功" && ret.success == true) {
                    var i = 0;
                    antGroup.tipNotic(ret.response);
                    var messageList = [];
                    isNewPage = true;
                    var timeSign = 0;   //起始时间标记
                    ret.response.forEach(function (e) {
                        if (e.command == "message") {
                            var messageOfSinge = e;
                            if (i == ret.response.length - 1) {
                                antGroup.setState({"firstMessageCreateTime": messageOfSinge.createTime});
                            }
                            i++;
                            if (isEmpty(messageOfSinge.attachment) == false) {
                                var attachment = messageOfSinge.attachment.address;
                                var attachmentType = messageOfSinge.attachment.type;
                            }
                            ;
                            if (isEmpty(messageOfSinge.expressionItem) == false) {
                                var expressionItem = messageOfSinge.expressionItem.address;
                            }
                            ;
                            if (isEmpty(messageOfSinge.cloudFile) == false) {
                                //文件名
                                var fileName = messageOfSinge.cloudFile.name;
                                //路径
                                var filePath = messageOfSinge.cloudFile.path;
                                //大小
                                var fileLength = messageOfSinge.cloudFile.length;
                                //uuid
                                var fileUid = messageOfSinge.cloudFile.uuid;
                                //文件CreateUid
                                var fileCreateUid = messageOfSinge.cloudFile.createUid;
                            }
                            ;
                            var biumes = null;
                            if (e.biuId != 0) {
                                //这是biumessage
                                biumes = true;
                            } else {
                                biumes = false;
                            }
                            var uuidsArray = [];
                            var fromUser = messageOfSinge.fromUser;
                            var colUtype = fromUser.colUtype;
                            var isCurrentDay = isToday(messageOfSinge.createTime);
                            var mesTime;
                            var timeSignForTime;
                            if (isCurrentDay) {
                                //如果是当天的消息，只显示时间
                                mesTime = formatHM(messageOfSinge.createTime);
                                timeSignForTime = formatHM(timeSign);
                            } else {
                                //非当天时间，显示的是月-日
                                mesTime = formatMD(messageOfSinge.createTime) + ' ' + formatHM(messageOfSinge.createTime);
                                timeSignForTime = formatMD(timeSign) + ' ' + formatHM(timeSign);
                            }
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (messageOfSinge.createTime - timeSign != messageOfSinge.createTime && timeSign - messageOfSinge.createTime > 300000) {
                                var messageShow = {
                                    'fromUser': {
                                        "avatar": "http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png",
                                        "colUid": 120024,
                                        "userName": "群通知者",
                                    },
                                    'content': timeSignForTime,
                                    "messageType": "getMessage",
                                    "showType": 1,
                                    "messageReturnJson": {
                                        messageType: "text",
                                    },
                                };
                                messageList.push(messageShow);
                            }
                            ;
                            timeSign = messageOfSinge.createTime;
                            if (("SGZH" == colUtype || groupObj.chatGroupId == e.toId) && e.toType == 4) {
                                var uuid = e.uuid;
                                var showType = e.showType;
                                uuidsArray.push(uuid);
                                imgTagArray.splice(0);
                                showImg = "";
                                var content = e.content;
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(e);
                                var groupReadState = e.readState;
                                if (e.readUserCount == 0) {
                                    var readStateStr = '全部未读',
                                        readState = 0;
                                } else {
                                    var readStateStr = e.readUserCount + '人已读',
                                        readState = e.readUserCount;
                                }
                                ;
                                if (isEmpty(messageReturnJson) == false && isEmpty(messageReturnJson.messageType) == false) {
                                    if (messageReturnJson.messageType == "text") {
                                        content = messageReturnJson.textMessage;
                                    } else if (messageReturnJson.messageType == "imgTag") {
                                        imgTagArrayReturn = messageReturnJson.imgMessage;
                                    }
                                }
                                var message = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson,
                                    "attachment": attachment,
                                    "attachmentType": attachmentType,
                                    "expressionItem": expressionItem,
                                    "fileName": fileName,
                                    "filePath": filePath,
                                    "fileLength": fileLength,
                                    "fileUid": fileUid,
                                    "fileCreateUid": fileCreateUid,
                                    "biumes": biumes,
                                    "uuid": uuid,
                                    "showType": showType,
                                    "readStateStr": readStateStr,
                                    "readState": readState,
                                    "groupReadState": groupReadState,
                                    "mesTime": mesTime,
                                    "mesTimeForDetil": timeSign,
                                };
                                messageList.push(message);
                            }
                        }
                    });
                    var gt = $('#groupTalk');
                    if (parseInt(gt[0].scrollHeight) - parseInt(gt[0].scrollTop) === gt[0].clientHeight) {
                        isDirectToBottom = true;
                    } else {
                        isDirectToBottom = false;
                    }
                    antGroup.addMessageList(messageList);
                }
            },
            onError: function (error) {
                isRequesting = false;
                message.error(error);
            }
        });
    },

    /**
     * 审批助手逻辑
     */
    getShengpiMes(id) {

        var obj = {
            mode: 'teachingAdmin',
            title: '审批助手',
            // url: 'http://www.maaee.com/Excoord_PhoneService/gongzhonghao/show/' + id + '/' + antGroup.state.loginUser.colUid + str,
            url: 'http://www.maaee.com/Excoord_PhoneService/gongzhonghao/show/' + id + '/' + antGroup.state.loginUser.colUid,
            width: '380px'
        };

        if (antGroup.state.loginUser.colUid == 119665) {
            var FlowType = antGroup.state.FlowType;
            var str = '';
            for (var k in FlowType) {
                str += '?' + k + '=' + FlowType[k];
            }
            obj.url = 'http://www.maaee.com/Excoord_PhoneService/gongzhonghao/show/' + id + '/' + antGroup.state.loginUser.colUid + str
        }

        LP.Start(obj);
    },
    /**
     * 点击消息列表，进入个人消息的列表窗口
     * @param userObj   点击的那个人的信息
     * @param timeNode
     */
    getPersonMessage(userObj, timeNode) {
        //将点击的那个个人的id记录下来
        this.setState({curId: userObj.colUid})
        isDirectToBottom = true;
        isNewPage = false;
        antGroup.setState({"messageComeFrom": "personMessage", "currentGroupObj": '', messageList: []});
        antGroup.getUser2UserMessages(userObj, timeNode);
        var messageType = "message";
        antGroup.turnToMessagePage(userObj, messageType);
        this.props.showMesAlert(false);
    },

    /**
     * 聊天语音播放的回调
     */
    audioPlay(id, direction) {
        document.getElementById(id).play();
        var timer = setInterval(function () {
            //播放开始，替换类名
            document.getElementById(id + '_audio').className = 'audio' + direction + '_run';
            if (document.getElementById(id).ended) {
                //播放结束，替换类名
                document.getElementById(id + '_audio').className = 'audio' + direction;
                window.clearInterval(timer);
            }
        }, 10)
    },

    /**
     * 下载文件的回调
     * @param url
     */
    downFile(url) {
        window.location.href = url;
    },
    /**
     *  预览分享链接文件的回调
     */
    watchFileShare(fileUid, fileCreateUid, fileName) {
        this.checkFileModalHandleCancel();
        var url = "http://www.maaee.com/Excoord_PhoneService/cloudFile/cloudFileShow/" + fileUid + "/" + fileCreateUid;
        var suffix = fileName.substr(fileName.length - 3);
        if (suffix == 'jpg' || suffix == 'JPG' || suffix == 'png' || suffix == 'PNG' || suffix == 'bmp' || suffix == 'BMP') {
            document.getElementById(fileUid).click();
        } else {
            this.view(event, url, name);
        }
    },

    /**
     *预览文件的回调
     */
    watchFile(url, fileUid, fileCreateUid, fileName) {
        // let obj = {mode: 'teachingAdmin', url: id, title: ""};
        // LP.Start(obj);
        //文件的uuid和创建人的id
        // var fileUid = fileUid;
        // var fileCreateUid = fileCreateUid;
        //根据文件的后缀名判断是不是图片
        var url = "http://www.maaee.com/Excoord_PhoneService/cloudFile/cloudFileShow/" + fileUid + "/" + fileCreateUid;
        var suffix = fileName.substr(fileName.length - 3);
        // 如果是图片直接用插件展示,否则交给iframe展示
        if (suffix == 'jpg' || suffix == 'JPG' || suffix == 'png' || suffix == 'PNG' || suffix == 'bmp' || suffix == 'BMP') {
            document.getElementById(fileUid).click();
        } else {
            this.view(event, url, name);
        }

    },

    view(e, url, tit) {
        e = e || window.event;
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;

        let mode = (tit) => {
            let refArr = tit.split('.');
            let type = refArr[refArr.length - 1];
            return type;
        };

        let obj = {mode: mode(tit), title: tit, url: url, width: '380px'};
        // let obj = {mode: 'teachingAdmin', title: tit, url: url, width: '380px'};

        LP.Start(obj);
    },

    /**
     * 查看链接的回调
     */
    readLink(id) {
        let obj = {mode: 'teachingAdmin', url: id, title: ""};
        LP.Start(obj);
    },

    handlePrependChatDataItem(data, showDate) {
        let dom = $('<div style="width: 100%; height: auto;"></div>');
        var groupListCon = jQuery("#groupTalk").children().eq(0);
        groupListCon.prepend(dom);
        $(this.refs.dataBox).prepend(dom);
        ReactDOM.render(this, dom[0]);
    },

    /**
     * 获取个人的聊天信息
     */
    getUser2UserMessages(userObj, timeNode) {
        var _this = this;
        currentReturnCount = 0;
        var param = {
            "method": 'getUser2UserMessages',
            "user1Id": sessionStorage.getItem("ident"),
            "user2Id": userObj.colUid,
            "timeNode": -1
        };
        isRequesting = true;
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                isRequesting = false;
                if (ret.msg == "调用成功" && ret.success == true) {
                    var i = 0;
                    antGroup.tipNotic(ret.response);
                    var messageList = [];
                    isNewPage = true;
                    var timeSign = 0;   //起始时间标记
                    ret.response.forEach(function (e) {
                        console.log(e);
                        if (e.command == "message") {
                            var messageOfSinge = e;
                            if (i == ret.response.length - 1) {
                                antGroup.setState({"firstMessageCreateTime": messageOfSinge.createTime});
                            }
                            i++;
                            var uuidsArray = [];
                            if (isEmpty(messageOfSinge.attachment) == false) {
                                var attachment = messageOfSinge.attachment.address;
                                var attachmentType = messageOfSinge.attachment.type;
                            }
                            if (isEmpty(messageOfSinge.expressionItem) == false) {
                                var expressionItem = messageOfSinge.expressionItem.address;
                            }
                            if (isEmpty(messageOfSinge.cloudFile) == false) {
                                //文件名
                                var fileName = messageOfSinge.cloudFile.name;
                                //路径
                                var filePath = messageOfSinge.cloudFile.path;
                                //大小
                                var fileLength = messageOfSinge.cloudFile.length;
                                //uuid
                                var fileUid = messageOfSinge.cloudFile.uuid;
                                //文件CreateUid
                                var fileCreateUid = messageOfSinge.cloudFile.createUid;
                            }
                            var biumes = null;
                            if (e.biuId != 0) {
                                //这是biumessage
                                biumes = true;
                            } else {
                                biumes = false;
                            }
                            var fromUser = messageOfSinge.fromUser;
                            var toId = messageOfSinge.toId;
                            var toName = messageOfSinge.toUser.userName;
                            var isCurrentDay = isToday(messageOfSinge.createTime);
                            var mesTime;
                            var timeSignForTime;
                            if (isCurrentDay) {
                                //如果是当天的消息，只显示时间
                                mesTime = formatHM(messageOfSinge.createTime);
                                timeSignForTime = formatHM(timeSign);
                            } else {
                                //非当天时间，显示的是月-日
                                mesTime = formatMD(messageOfSinge.createTime) + ' ' + formatHM(messageOfSinge.createTime);
                                timeSignForTime = formatMD(timeSign) + ' ' + formatHM(timeSign);
                            }
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (messageOfSinge.createTime - timeSign != messageOfSinge.createTime && timeSign - messageOfSinge.createTime > 300000) {
                                var messageShow = {
                                    'fromUser': {
                                        "avatar": "http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png",
                                        "colUid": 120024,
                                        "userName": "群通知者",
                                    },
                                    'content': timeSignForTime,
                                    "messageType": "getMessage",
                                    "showType": 1,
                                    "messageReturnJson": {
                                        messageType: "text",
                                    },
                                };
                                messageList.push(messageShow);
                            }
                            ;
                            timeSign = messageOfSinge.createTime;
                            if (messageOfSinge.toType == 1) {
                                var uuid = messageOfSinge.uuid;
                                var showType = messageOfSinge.showType;
                                uuidsArray.push(uuid);
                                var content = messageOfSinge.content;
                                if (messageOfSinge.readUserCount == 0) {
                                    var readStateStr = '未读',
                                        readState = 0;
                                } else {
                                    var readStateStr = '已读',
                                        readState = messageOfSinge.readUserCount;
                                }
                                imgTagArray.splice(0);
                                showImg = "";
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(messageOfSinge);
                                if (isEmpty(messageReturnJson) == false && isEmpty(messageReturnJson.messageType) == false) {
                                    if (messageReturnJson.messageType == "text") {
                                        content = messageReturnJson.textMessage;
                                    } else if (messageReturnJson.messageType == "imgTag") {
                                        imgTagArrayReturn = messageReturnJson.imgMessage;
                                    }
                                }
                                var messageShow = {
                                    'fromUser': fromUser,
                                    'content': content,
                                    "messageType": "getMessage",
                                    "imgTagArray": imgTagArrayReturn,
                                    "messageReturnJson": messageReturnJson,
                                    "attachment": attachment,
                                    "attachmentType": attachmentType,
                                    "expressionItem": expressionItem,
                                    "fileName": fileName,
                                    "filePath": filePath,
                                    "fileLength": fileLength,
                                    "fileUid": fileUid,
                                    "fileCreateUid": fileCreateUid,
                                    "biumes": biumes,
                                    "uuid": uuid,
                                    "showType": showType,
                                    "readState": readState,
                                    "readStateStr": readStateStr,
                                    "mesTime": mesTime,
                                    "mesTimeForDetil": messageOfSinge.createTime,
                                    "toId": toId,
                                    "toName": toName,
                                };
                                messageList.push(messageShow);
                            }
                        }
                    });
                    var gt = $('#groupTalk');
                    if (parseInt(gt[0].scrollHeight) - parseInt(gt[0].scrollTop) === gt[0].clientHeight) {
                        isDirectToBottom = true;
                    } else {
                        isDirectToBottom = false;
                    }
                    antGroup.addMessageList(messageList);
                }
            },
            onError: function (error) {
                isRequesting = false;
                message.error(error);
            }
        });
    },

    /**
     * 返回当前聊天群组窗口页面（对应tab组件工具栏上的返回按钮）
     */
    returnToChatGroupMessagePage() {
        var currentGroupObj = antGroup.state.currentGroupObj;
        //返回群组窗口时，重新获取最近的聊天记录
        antGroup.getChatGroupMessages(currentGroupObj);
        var messageType = "groupMessage";
        antGroup.turnToMessagePage(currentGroupObj, messageType);
    },

    /**
     * 表格选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    /**
     * 查看大图片
     * @param selectedRowKeys
     */
    noomWatchImg(id) {
        document.getElementById(id).click();
    },

    imgOnError(src, e) {
        if (imgErrorCount > 3) {
            e.target.src = '../src/components/images/e9c6ad1e-7ef3-45cf-ab40-25d5b5a0374c.png';
            imgErrorCount = 0;
            return;
        }
        e.target.src = src;
        // e.target.src = '../src/components/images/e9c6ad1e-7ef3-45cf-ab40-25d5b5a0374c.png';
        e.target.onerror = null;
        imgErrorCount++;
    },

    /**
     * 小视屏播放
     * @param selectedRowKeys
     */
    littleAudioPlay(src) {
        var videoPlayer = <video id="videoPlayer" width={320} controls={false} autoplay>
            <source type="video/mp4" src={src}/>
        </video>;
        antGroup.setState({videoPlayModel: true, videoPlayer});
        setTimeout(function () {
            document.getElementById('videoPlayer').play();
        }, 300)
    },

    videoPlayerModalHandleCancel() {
        var videoPlayer = '';
        antGroup.setState({videoPlayModel: false, videoPlayer});
        document.getElementById('videoPlayer').pause();
    },

    render() {
        var groupSetting = 'none';
        if (this.state.messageComeFrom == 'groupMessage') {
            groupSetting = 'block'
        }
        var _this = this;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = this.state.selectedRowKeys.length > 0;
        var progressState = antGroup.state.progressState;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var welcomeTitle;
        var returnToolBar = <div className="ant-tabs-right"><Button
            onClick={antGroup.returnAntGroupMainPage}>返回</Button></div>;
        var tabComponent;
        var userPhoneCard;
        var breadCrumb = <Breadcrumb separator=">">
            <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
            <Breadcrumb.Item href="#/MainLayout">动态</Breadcrumb.Item>
        </Breadcrumb>;
        if (antGroup.state.optType == "sendMessage" || antGroup.state.optType == "sendGroupMessage") {
            var messageTagArray = [];
            messageTagArray.splice(0);
            var messageList = antGroup.state.messageList;

            var imgArr = [];
            if (isEmpty(messageList) == false && messageList.length > 0) {
                // console.log(messageList);
                for (var i = messageList.length - 1; i >= 0; i--) {
                    //寻找messageList中的图片，动态构建img
                    if (isEmpty(messageList[i]) == false) {
                        if (isEmpty(messageList[i].attachmentType) == false) {
                            if (messageList[i].attachmentType == 1) {
                                var img = <span className="topics_zan"><img id={messageList[i].attachment}
                                                                            className="topics_zanImg"
                                                                            onClick={showLargeImg}
                                                                            src={messageList[i].attachment + '?' + MIDDLE_IMG}
                                                                            alt={messageList[i].attachment}
                                />
                      </span>;
                                imgArr.push(img);
                            }
                        }
                        ;
                    }
                    var e = messageList[i];

                    if (isEmpty(e) == true) {
                        continue;
                    }
                    var name = e.fileName
                    //文件后缀名
                    var extname;
                    var styleImg;
                    if (isEmpty(name) == false) {
                        extname = name.substr(name.lastIndexOf('.') + 1);
                        if (extname == 'mp3') {
                            styleImg = '../src/components/images/mp3.png';
                        } else if (extname == 'mp4') {
                            styleImg = '../src/components/images/mp4_icon.png';
                        } else if (extname == 'ppt') {
                            styleImg = '../src/components/images/ppt.png';
                        } else if (extname == 'docx') {
                            styleImg = '../src/components/images/doc.png';
                        } else if (extname == 'pdf') {
                            styleImg = '../src/components/images/pdf.png';
                        } else if (extname == 'xls') {
                            styleImg = '../src/components/images/xls.png';
                        } else {
                            styleImg = '../src/components/images/lALPBY0V4pdU_AxmZg_102_102.png';
                        }
                    }

                    var content = e.content;
                    var mesTime = e.mesTime;
                    var fromUser = e.fromUser.userName;
                    var userPhoneIcon;
                    if (isEmpty(e.fromUser.avatar)) {
                        userPhoneIcon = <img src={require('../images/maaee_face.png')}></img>;
                    } else {
                        userPhoneIcon = <img src={e.fromUser.avatar + '?' + SMALL_IMG}></img>;
                    }
                    var messageType = e.messageType;
                    var messageTag;
                    var attachment = e.attachment;
                    var attachmentType = e.attachmentType;
                    var expressionItem = e.expressionItem;


                    //是否是biumessage
                    var biumes = e.biumes;
                    //文件名
                    var fileName = e.fileName;

                    attachment
                    //路径
                    var filePath = e.filePath;
                    //大小
                    var fileLength = (e.fileLength / 1024).toFixed(2);
                    //原始大小
                    var oriFileLength = e.fileLength;
                    //文件的uuid
                    var fileUid = e.fileUid;
                    //文件的createUid
                    var fileCreateUid = e.fileCreateUid;

                    if (isEmpty(messageType) == false && messageType == "getMessage") {
                        if (isEmpty(e.messageReturnJson) == false && isEmpty(e.messageReturnJson.messageType) == false) {
                            if (e.messageReturnJson.messageType == "text") {
                                //context有内容的消息
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (isEmpty(attachment) == false) {
                                        //有内容的链接
                                        if (e.toId == 138437) {
                                            messageTag = <li style={{'textAlign': 'right'}} className="right">
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                    <span className="borderballoon noom_cursor"
                                                          onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                        <div className="borderballoon_le_cont">
                                                            <img className="upexam_float span_link_img"
                                                                 style={{width: 40}}
                                                                 src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                                 alt=""/>
                                                             <div className="span_link_div">
                                                                 <span
                                                                     className="span_link file_link_img_t">{content}</span>
                                                             </div>
                                                        </div>
                                                        <i className="borderballoon_dingcorner_ri_no"></i>
                                                    </span>
                                                    </div>
                                                </div>
                                            </li>;
                                        } else {
                                            messageTag = <li style={{'textAlign': 'right'}} className="right">
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                        <span className="borderballoon noom_cursor"
                                                              onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                            <div className="borderballoon_le_cont">
                                                                <img className="upexam_float span_link_img"
                                                                     style={{width: 40}}
                                                                     src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                                     alt=""/>
                                                                 <div className="span_link_div">
                                                                     <span
                                                                         className="span_link file_link_img_t">{content}</span>
                                                                 </div>
                                                            </div>
                                                            <i className="borderballoon_dingcorner_ri_no"></i>
                                                        </span>
                                                        <span className="talk_bubble_read"
                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                    </div>
                                                </div>
                                            </li>;
                                        }
                                        // }
                                    } else if (isEmpty(expressionItem) == false) {
                                        //来自安卓的动态表情（安卓的动态表情的content里有“表情”两个字）
                                        if (e.toId == 138437) {
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                        <img src={expressionItem}
                                                             style={{width: '100px', height: '100px'}}/>
                                                        <span><i className="borderballoon_dingcorner_le_no"></i></span>
                                                        <span className="talk_bubble_ellipsis">
                                                        <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                                  placement="topCenter"
                                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                                        </Dropdown>
                                                    </span>
                                                    </div>
                                                </div>
                                            </li>;
                                        } else {
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                        <img src={expressionItem}
                                                             style={{width: '100px', height: '100px'}}/>
                                                        <span><i className="borderballoon_dingcorner_le_no"></i></span>
                                                        <span className="talk_bubble_ellipsis">
                                                        <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                                  placement="topCenter"
                                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                                        </Dropdown>
                                                    </span>
                                                        <span className="talk_bubble_read"
                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                    </div>
                                                </div>
                                            </li>;
                                        }

                                    } else if (isEmpty(fileName) == false) {
                                        //发送的文件（content里带有文件名字）
                                        if (e.toId == 138437) {
                                            messageTag = <li style={{'textAlign': 'right'}} className="right">
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                    <span className="borderballoon noom_cursor borderballoon_file">
                                                        <span className="bot"></span>
                                                        <span className="top"></span>
                                                        <div className="borderballoon_le_cont">
                                                            <img className="upexam_float span_link_img"
                                                                 style={{width: 38}}
                                                                 src={styleImg}
                                                                 alt=""/>
                                                            <div className="span_link_div">
                                                                <span className="span_link">{fileName}</span>
                                                                <span
                                                                    className="span_link password_ts">{fileLength}kb</span>
                                                            </div>
                                                        </div>
                                                        <img id={fileUid} style={{display: "none"}} src={filePath}
                                                             onClick={showLargeImg} alt=""/>
                                                        <div className="file_noom">
                                                            <a className="noom_cursor  file_noom_line"
                                                               onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                                <Icon type="eye"/>预览
                                                            </a>
                                                            <a href={filePath} target="_blank" title="下载"
                                                               download={filePath}
                                                               className="downfile_noom file_noom_line">
                                                                <Icon type="download"/>下载</a>
                                                            <Dropdown overlay={menu}
                                                                      onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                                <a className="ant-dropdown-link file_noom_line"
                                                                   href="javascript:;">
                                                                  <Icon type="bars"/>更多
                                                                </a>
                                                            </Dropdown>
                                                        </div>
                                                    </span>
                                                        <span className="talk_bubble_ellipsis">
                                                        <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                                  placement="topCenter"
                                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                                        </Dropdown>
                                                </span>
                                                    </div>
                                                </div>
                                            </li>;
                                        } else {
                                            messageTag = <li style={{'textAlign': 'right'}} className="right">
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                    <span className="borderballoon noom_cursor borderballoon_file">
                                                        <span className="bot"></span>
                                                        <span className="top"></span>
                                                        <div className="borderballoon_le_cont">
                                                            <img className="upexam_float span_link_img"
                                                                 style={{width: 38}}
                                                                 src={styleImg}
                                                                 alt=""/>
                                                            <div className="span_link_div">
                                                                <span className="span_link">{fileName}</span>
                                                                <span
                                                                    className="span_link password_ts">{fileLength}kb</span>
                                                            </div>
                                                        </div>
                                                        <img id={fileUid} style={{display: "none"}} src={filePath}
                                                             onClick={showLargeImg} alt=""/>
                                                        <div className="file_noom">
                                                            <a className="noom_cursor  file_noom_line"
                                                               onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                                <Icon type="eye"/>预览
                                                            </a>
                                                            <a href={filePath} target="_blank" title="下载"
                                                               download={filePath}
                                                               className="downfile_noom file_noom_line">
                                                                <Icon type="download"/>下载</a>
                                                            <Dropdown overlay={menu}
                                                                      onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                                <a className="ant-dropdown-link file_noom_line"
                                                                   href="javascript:;">
                                                                  <Icon type="bars"/>更多
                                                                </a>
                                                            </Dropdown>
                                                        </div>
                                                    </span>
                                                        <span className="talk_bubble_ellipsis">
                                                        <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                                  placement="topCenter"
                                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                                        </Dropdown>
                                                </span>
                                                        <span className="talk_bubble_read"
                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>

                                                    </div>
                                                </div>
                                            </li>;
                                        }

                                    } else {
                                        //文字消息
                                        if (biumes == true) {
                                            //叮消息
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                        <span className="borderballoon"
                                                              onClick={this.entDingMesDetil}>{e.content}
                                                            <i className="borderballoon_dingcorner_le"></i>
                                                        </span>
                                                        <span className="talk_bubble_ellipsis">
                                                                <Dropdown overlay={this.state.msgMenu}
                                                                          trigger={['click']}
                                                                          placement="topCenter"
                                                                          onVisibleChange={this.getMesUUid.bind(this, e.uuid, e, 'dingMes')}>
                                                                    <Icon className="icon_ellipsis" type="ellipsis"/>
                                                                </Dropdown>
                                                            </span>
                                                    </div>
                                                    {/*<Dropdown overlay={msgMenu} placement="topLeft"*/}
                                                    {/*onVisibleChange={this.getMesUUid.bind(this, e.uuid)}>*/}
                                                    {/*<Icon type="ellipsis"/>*/}
                                                    {/*</Dropdown>*/}
                                                </div>
                                            </li>;
                                        } else {
                                            //普通文字消息
                                            if (e.showType == 1) {
                                                messageTag = <li className="reminder"><span>{e.content}</span></li>;
                                            } else {
                                                // checkUrl
                                                if (checkUrl(e.content) == false) {
                                                    if (e.toId == 138437) {
                                                        messageTag =
                                                            <li className="right" style={{'textAlign': 'right'}}>
                                                                <div className="u-name">
                                                                    <span>{fromUser}</span>
                                                                    <span className="cart_time">{mesTime}</span>
                                                                </div>
                                                                <div className="talk-cont">
                                                                    <span className="name">{userPhoneIcon}</span>
                                                                    <div className="talk_bubble_box">
                                                            <span className="borderballoon">{e.content}
                                                                <i className="borderballoon_dingcorner_le_no"></i>
                                                            </span>
                                                                        <span className="talk_bubble_ellipsis">
                                                                <Dropdown overlay={this.state.msgMenu}
                                                                          trigger={['click']}
                                                                          placement="topCenter"
                                                                          onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                    <Icon className="icon_ellipsis" type="ellipsis"/>
                                                                </Dropdown>
                                                            </span>
                                                                    </div>
                                                                </div>
                                                            </li>;
                                                    } else {
                                                        messageTag =
                                                            <li className="right" style={{'textAlign': 'right'}}>
                                                                <div className="u-name">
                                                                    <span>{fromUser}</span>
                                                                    <span className="cart_time">{mesTime}</span>
                                                                </div>
                                                                <div className="talk-cont">
                                                                    <span className="name">{userPhoneIcon}</span>
                                                                    <div className="talk_bubble_box">
                                                            <span className="borderballoon">{e.content}
                                                                <i className="borderballoon_dingcorner_le_no"></i>
                                                            </span>
                                                                        <span className="talk_bubble_ellipsis">
                                                                <Dropdown overlay={this.state.msgMenu}
                                                                          trigger={['click']}
                                                                          placement="topCenter"
                                                                          onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                    <Icon className="icon_ellipsis" type="ellipsis"/>
                                                                </Dropdown>
                                                            </span>
                                                                        <span className="talk_bubble_read"
                                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                                    </div>
                                                                </div>
                                                            </li>;
                                                    }

                                                } else {
                                                    //内容为链接
                                                    // getUrl(e.content);
                                                    if (e.toId == 138437) {
                                                        messageTag =
                                                            <li className="right" style={{'textAlign': 'right'}}>
                                                                <div className="u-name">
                                                                    <span>{fromUser}</span>
                                                                    <span className="cart_time">{mesTime}</span>
                                                                </div>
                                                                <div className="talk-cont">
                                                                    <span className="name">{userPhoneIcon}</span>
                                                                    <div className="talk_bubble_box">
                                                            <span className="borderballoon">
                                                                <a className="noom_link" target="_Blank"
                                                                   href={'http://' + e.content}>{e.content}</a>
                                                                <i className="borderballoon_dingcorner_le_no"></i>
                                                            </span>
                                                                        <span className="talk_bubble_ellipsis">
                                                                <Dropdown overlay={this.state.msgMenu}
                                                                          trigger={['click']}
                                                                          placement="topCenter"
                                                                          onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                    <Icon className="icon_ellipsis" type="ellipsis"/>
                                                                </Dropdown>
                                                            </span>
                                                                    </div>
                                                                </div>
                                                            </li>;
                                                    } else {
                                                        messageTag =
                                                            <li className="right" style={{'textAlign': 'right'}}>
                                                                <div className="u-name">
                                                                    <span>{fromUser}</span>
                                                                    <span className="cart_time">{mesTime}</span>
                                                                </div>
                                                                <div className="talk-cont">
                                                                    <span className="name">{userPhoneIcon}</span>
                                                                    <div className="talk_bubble_box">
                                                            <span className="borderballoon">
                                                                {getUrl(e.content)[0]}
                                                                <a className="noom_link" target="_Blank"
                                                                   href={getUrl(e.content)[2]}>{getUrl(e.content)[2]}</a>
                                                                {getUrl(e.content)[1]}
                                                                <i className="borderballoon_dingcorner_le_no"></i>
                                                            </span>
                                                                        <span className="talk_bubble_ellipsis">
                                                                <Dropdown overlay={this.state.msgMenu}
                                                                          trigger={['click']}
                                                                          placement="topCenter"
                                                                          onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                    <Icon className="icon_ellipsis" type="ellipsis"/>
                                                                </Dropdown>
                                                            </span>
                                                                        <span className="talk_bubble_read"
                                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                                    </div>
                                                                </div>
                                                            </li>;
                                                    }

                                                }
                                            }
                                        }
                                    }
                                } else {
                                    //我收到的
                                    if (isEmpty(attachment) == false) {
                                        //有内容的链接
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span><span
                                                className="cart_time">{mesTime}</span></div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <span className="borderballoon_le noom_cursor"
                                                      onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                 <span className="bot"></span>
                                                 <span className="top"></span>
                                                 <img className="upexam_float span_link_img" style={{width: 40}}
                                                      src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                      alt=""/>
                                                <span className="span_link file_link_img_t">{content}</span>
                                                <i className="borderballoon_dingcorner_ri_no"></i>
                                                    <span className="talk_bubble_ellipsis">
                                                        <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                  placement="topCenter"
                                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                                        </Dropdown>
                                                    </span>
                                            </span>
                                            </div>
                                        </li>;
                                    } else if (isEmpty(fileName) == false) {
                                        //发送的文件（content里带有文件名字）
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_le_bubble_box">
                                                    <span className="borderballoon_le"
                                                        // onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid)}><img
                                                    >
                                                        <span className="bot"></span>
                                                        <span className="top"></span>
                                                        <div className="borderballoon_le_cont">
                                                            <img className="upexam_float" style={{width: 38}}
                                                                 src={styleImg}
                                                                 alt=""/>
                                                            <img id={fileUid} style={{display: "none"}} src={filePath}
                                                                 onClick={showLargeImg} alt=""/>
                                                            <div className="span_link_div">
                                                                <span className="span_link">{fileName}</span>
                                                                <span
                                                                    className="span_link password_ts">{fileLength}kb</span>
                                                            </div>
                                                            <i className="borderballoon_dingcorner_ri_no"></i>
                                                        </div>
                                                        <div className="file_noom">
                                                            <a className="noom_cursor  file_noom_line"
                                                               onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                                <Icon type="eye"/>预览</a>
                                                            <a href={filePath} target="_blank" title="下载"
                                                               download={filePath}
                                                               className="downfile_noom file_noom_line">
                                                                <Icon type="download"/>下载</a>
                                                            <Dropdown overlay={menu}
                                                                      onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                                <a className="ant-dropdown-link file_noom_line"
                                                                   href="javascript:;">
                                                                  <Icon type="bars"/>更多
                                                                </a>
                                                            </Dropdown>
                                                        </div>
                                                    </span>
                                                    <span className="talk_bubble_ellipsis">
                                                            <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                      placement="topCenter"
                                                                      onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                <Icon className="icon_ellipsis" type="ellipsis"/>
                                                            </Dropdown>
                                                        </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else if (isEmpty(expressionItem) == false) {
                                        //来自安卓的动态表情（安卓的动态表情的content里有“表情”两个字）
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_le_bubble_box">
                                                    <img style={{width: '100px', height: '100px'}}
                                                         src={expressionItem}/>
                                                    <span>
                                                        <i className="borderballoon_dingcorner_ri_no"></i>
                                                    </span>
                                                    <span className="talk_bubble_ellipsis">
                                                        <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                  placement="topCenter"
                                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                                        </Dropdown>
                                                    </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        if (biumes == true) {
                                            //叮消息有角标
                                            messageTag = <li style={{'textAlign': 'left'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_le_bubble_box">
                                                        <span className="borderballoon_le"
                                                              onClick={this.entDingMesDetil}>
                                                            <span className="bot"></span>
                                                            <span className="top"></span>
                                                            {e.content}
                                                            <i className="borderballoon_dingcorner_ri"></i>
                                                        </span>
                                                        <span className="talk_bubble_ellipsis">
                                                            <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                      placement="topCenter"
                                                                      onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                <Icon className="icon_ellipsis" type="ellipsis"/>
                                                            </Dropdown>
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>;
                                        } else {
                                            //普通消息无角标
                                            if (e.fromUser.colUid == 120024 || e.showType == 1) {
                                                messageTag = <li className="reminder"><span>{e.content}</span></li>;
                                            } else {
                                                // checkUrl
                                                if (checkUrl(e.content) == false) {
                                                    messageTag = <li style={{'textAlign': 'left'}}>
                                                        <div className="u-name">
                                                            <span>{fromUser}</span>
                                                            <span className="cart_time">{mesTime}</span>
                                                        </div>
                                                        <div className="talk-cont">
                                                            <span className="name">{userPhoneIcon}</span>
                                                            <div className="talk_le_bubble_box">
                                                                <span className="borderballoon_le">
                                                                    <span className="bot"></span>
                                                                    <span className="top"></span>
                                                                    {e.content}
                                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                                </span>
                                                                <span className="talk_bubble_ellipsis">
                                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                              placement="topCenter"
                                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                        <Icon className="icon_ellipsis"
                                                                              type="ellipsis"/>
                                                                    </Dropdown>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>;
                                                } else {
                                                    messageTag = <li style={{'textAlign': 'left'}}>
                                                        <div className="u-name">
                                                            <span>{fromUser}</span>
                                                            <span className="cart_time">{mesTime}</span>
                                                        </div>
                                                        <div className="talk-cont">
                                                            <span className="name">{userPhoneIcon}</span>
                                                            <div className="talk_le_bubble_box">
                                                                <span className="borderballoon_le">
                                                                    <span className="bot"></span>
                                                                    <span className="top"></span>
                                                                    {getUrl(e.content)[0]}
                                                                    <a className="noom_link_left" target="_Blank"
                                                                       href={getUrl(e.content)[2]}>{getUrl(e.content)[2]}</a>
                                                                    {getUrl(e.content)[1]}
                                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                                </span>
                                                                <span className="talk_bubble_ellipsis">
                                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                              placement="topCenter"
                                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                        <Icon className="icon_ellipsis"
                                                                              type="ellipsis"/>
                                                                    </Dropdown>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </li>;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else if (e.messageReturnJson.messageType == "imgTag") {
                                //context没有内容的消息
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (e.toId == 138437) {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon ">{e.imgTagArray}
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        var startMe = e.content.indexOf("[bexp_");
                                        var newStrMe = e.content.split("").reverse().join("");
                                        var endMe = newStrMe.indexOf("]");
                                        var endStrMe = newStrMe.substring(0, endMe);
                                        var startStrMe = e.content.substring(0, startMe);
                                        var endStrRevMe = endStrMe.split("").reverse().join("");
                                        if (isEmpty(startStrMe) == false || isEmpty(endStrRevMe) == false) {
                                            //文字加表情
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                        <span className="borderballoon ">
                                                            <span className="text_face">{startStrMe}</span>
                                                            {e.imgTagArray}
                                                            <i className="borderballoon_dingcorner_le_no"></i>
                                                            <span className="text_face">{endStrRevMe}</span>
                                                </span>
                                                        <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                        <span className="talk_bubble_read"
                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                    </div>
                                                </div>
                                            </li>;
                                        } else {
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_bubble_box">
                                                <span className="borderballoon ">{e.imgTagArray}
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                        <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                        <span className="talk_bubble_read"
                                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                    </div>
                                                </div>
                                            </li>;
                                        }
                                    }

                                } else {
                                    //我收到的
                                    var start = e.content.indexOf("[bexp_");
                                    var newStr = e.content.split("").reverse().join("");
                                    var end = newStr.indexOf("]");
                                    var endStr = newStr.substring(0, end);
                                    var startStr = e.content.substring(0, start);
                                    var endStrRev = endStr.split("").reverse().join("");
                                    if (isEmpty(startStr) == false || isEmpty(endStrRev) == false) {
                                        //文字加表情
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_le_bubble_box">
                                                    <span className="borderballoon_le">
                                                        <span className="text_face">{startStr}</span>
                                                        {e.imgTagArray}
                                                        <i className="borderballoon_dingcorner_ri_no"></i>
                                                        <span className="text_face">{endStrRev}</span>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_le_bubble_box">
                                                <span className="borderballoon_le">{e.imgTagArray}
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    }
                                }
                            } else if (e.messageReturnJson.messageType == "audioTag") {
                                //动态表情（iOS发来的，安卓发过来的表情里有“表情”两个汉字）
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (e.toId == 138437) {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                    <img src={expressionItem}
                                                         style={{width: '100px', height: '100px'}}/>
                                                    <span>
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                    <img src={expressionItem}
                                                         style={{width: '100px', height: '100px'}}/>
                                                    <span>
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                    <span className="talk_bubble_read"
                                                          onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                </div>
                                            </div>
                                        </li>;
                                    }

                                } else {
                                    //我收到的(--)
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name">
                                            <span>{fromUser}</span>
                                            <span className="cart_time">{mesTime}</span>
                                        </div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <div className="talk_le_bubble_box">
                                                <img style={{width: '100px', height: '100px'}} src={expressionItem}/>
                                                <span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                            </div>
                                        </div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "linkTag") {
                                //没有内容的链接
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (e.toId == 138437) {
                                        messageTag = <li style={{'textAlign': 'right'}} className="right">
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon noom_cursor borderballoon_file"
                                                      onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <div className="borderballoon_le_cont">
                                                        <img className="upexam_float span_link_img" style={{width: 40}}
                                                             src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                             alt=""/>
                                                         <div className="span_link_div">
                                                             <span
                                                                 className="span_link file_link_img_t">{e.messageReturnJson.content}</span>
                                                         </div>
                                                    </div>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                     </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'right'}} className="right">
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                    <span className="borderballoon noom_cursor borderballoon_file"
                                                          onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <div className="focus_3">{e.content}</div>
                                                    <div className="borderballoon_le_cont">
                                                        <img className="upexam_float span_link_img" style={{width: 40}}
                                                             src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                             alt=""/>
                                                         <div className="span_link_div">
                                                             <span
                                                                 className="span_link file_link_img_t">{e.messageReturnJson.content}</span>
                                                         </div>
                                                    </div>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                     </Dropdown>
                                                </span>
                                                    <span className="talk_bubble_read"
                                                          onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                </div>
                                            </div>
                                        </li>;
                                    }

                                } else {
                                    //我收到的
                                    if (e.fromUser.colUtype == 'SGZH') {
                                        //蚂蚁君卡片
                                        messageTag =
                                            <li style={{'textAlign': 'left'}}>
                                                <div className="u-name">
                                                    <span>{fromUser}</span>
                                                    <span className="cart_time">{mesTime}</span>
                                                </div>
                                                <div className="talk-cont">
                                                    <span className="name">{userPhoneIcon}</span>
                                                    <div className="talk_le_bubble_box">
                                                        <span className="borderballoon_le noom_cursor noom_MYZcard"
                                                              onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                            <span className="bot"></span>
                                                            <span className="top"></span>
                                                            <div className="borderballoon_le_cont">
                                                                <img className="upexam_float" style={{width: 38}}
                                                                     src="../src/components/images/icon_view_details.png"
                                                                     onClick={showLargeImg} alt=""/>
                                                                <span
                                                                    className="span_link">{e.messageReturnJson.content}</span>
                                                                <i className="borderballoon_dingcorner_ri_no"></i>
                                                            </div>
                                                            <div className="file_noom">
                                                        <a className="noom_cursor  file_noom_line"
                                                           onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                            查看详情</a>
                                                    </div>
                                                        </span>
                                                        <span className="talk_bubble_ellipsis noom_repMsg">
                                                            <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                      placement="topCenter"
                                                                      onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                <Icon className="icon_ellipsis" type="ellipsis"/>
                                                            </Dropdown>
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                    } else {
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_le_bubble_box">
                                                    <span className="borderballoon_le noom_cursor"
                                                          onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                        <span className="bot"></span>
                                                        <span className="top"></span>
                                                        <div className="focus_3">{e.content}</div>
                                                        <img className="upexam_float span_link_img" style={{width: 40}}
                                                             src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                             alt=""/>
                                                        <span
                                                            className="span_link file_link_img_t">{e.messageReturnJson.content}</span>
                                                            <i className="borderballoon_dingcorner_ri_no"></i>
                                                        </span>
                                                    <span className="talk_bubble_ellipsis noom_repMsg">
                                                            <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                                      placement="topCenter"
                                                                      onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                                <Icon className="icon_ellipsis" type="ellipsis"/>
                                                            </Dropdown>
                                                        </span>
                                                </div>
                                            </div>
                                        </li>;
                                    }
                                }
                            } else if (e.messageReturnJson.messageType == "bigImgTag") {
                                //图片
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (e.toId == 138437) {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon borderballoon_file borderballoon_file_p">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <span className="send_img_cont">
                                                        <img onClick={_this.noomWatchImg.bind(this, attachment)}
                                                             src={attachment + '?' + MIDDLE_IMG} className="send_img"
                                                             alt={attachment}
                                                             onError={_this.imgOnError.bind(this, attachment)}
                                                        />
                                                    </span>
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                     </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon borderballoon_file borderballoon_file_p">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <span className="send_img_cont">
                                                        <img onClick={_this.noomWatchImg.bind(this, attachment)}
                                                             src={attachment + '?' + MIDDLE_IMG} className="send_img"
                                                             alt={attachment}
                                                             onError={_this.imgOnError.bind(this, attachment)}
                                                        />
                                                    </span>
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                     </Dropdown>
                                                </span>
                                                    <span className="talk_bubble_read"
                                                          onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                </div>
                                            </div>
                                        </li>;
                                    }

                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name">
                                            <span>{fromUser}</span>
                                            <span className="cart_time">{mesTime}</span>
                                        </div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <div className="talk_le_bubble_box">
                                                <span className="borderballoon_le borderballoon_file_p">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <span className="send_img_cont">
                                                        <img onClick={_this.noomWatchImg.bind(this, attachment)}
                                                             className="send_img" src={attachment + '?' + MIDDLE_IMG}
                                                             alt={attachment}
                                                             onError={_this.imgOnError.bind(this, attachment)}/>
                                                    </span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                            </div>
                                        </div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "littleAudio") {
                                //小视屏
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name">
                                            <span>{fromUser}</span>
                                            <span className="cart_time">{mesTime}</span>
                                        </div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <div className="talk_bubble_box">
                                                <span className="borderballoon_file_p borderballoon_le">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <span className="send_img_cont">
                                                        <Icon
                                                            onClick={this.littleAudioPlay.bind(this, e.messageReturnJson.address)}
                                                            className="noom_playIcon noom_cursor" type="play-circle-o"/>
                                                        <img
                                                            className="send_img_littleAudio"
                                                            src={e.messageReturnJson.addressCover + '?' + MIDDLE_IMG}
                                                            onError={_this.imgOnError.bind(this, e.messageReturnJson.addressCover)}/>
                                                    </span>
                                                    <i className="borderballoon_dingcorner_le_no"></i>
                                                </span>
                                                <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                     </Dropdown>
                                                </span>
                                                <span className="talk_bubble_read"
                                                      onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                            </div>
                                        </div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name">
                                            <span>{fromUser}</span>
                                            <span className="cart_time">{mesTime}</span>
                                        </div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <div className="talk_le_bubble_box">
                                                <span className="borderballoon_le borderballoon_file_p">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <span className="send_img_cont">
                                                        <Icon
                                                            onClick={this.littleAudioPlay.bind(this, e.messageReturnJson.address)}
                                                            className="noom_playIcon noom_cursor" type="play-circle-o"/>
                                                        <img
                                                            className="send_img_littleAudio"
                                                            src={e.messageReturnJson.addressCover + '?' + MIDDLE_IMG}
                                                            onError={_this.imgOnError.bind(this, e.messageReturnJson.addressCover)}/>
                                                    </span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                            </div>
                                        </div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "videoTag") {
                                //语音
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (e.toId == 138437) {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name"><span>{fromUser}</span><span
                                                className="cart_time">{mesTime}</span></div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon noom_cursor noom_audio"
                                                      onClick={this.audioPlay.bind(this, attachment, '_right')}>
                                                    <audio id={attachment}>
                                                        <source src={attachment} type="audio/mpeg"></source>
                                                    </audio>
                                                    <span className="audio_right" id={attachment + '_audio'}></span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name"><span>{fromUser}</span><span
                                                className="cart_time">{mesTime}</span></div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon noom_cursor noom_audio"
                                                      onClick={this.audioPlay.bind(this, attachment, '_right')}>
                                                    <audio id={attachment}>
                                                        <source src={attachment} type="audio/mpeg"></source>
                                                    </audio>
                                                    <span className="audio_right" id={attachment + '_audio'}></span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                                    <span className="talk_bubble_read"
                                                          onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                </div>
                                            </div>
                                        </li>;
                                    }

                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name">
                                            <span>{fromUser}</span>
                                            <span className="cart_time">{mesTime}</span>
                                        </div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <div className="talk_le_bubble_box">
                                                <span className="borderballoon_le noom_cursor"
                                                      onClick={this.audioPlay.bind(this, attachment, '_left')}>
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <audio id={attachment}>
                                                        <source src={attachment} type="audio/mpeg"></source>
                                                    </audio>
                                                    <span className="audio_left" id={attachment + '_audio'}></span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </span>
                                                <span className="talk_bubble_ellipsis noom_repMsg">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                            </div>
                                        </div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "fileUpload") {
                                //文件
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    if (e.toId == 138437) {
                                        messageTag = <li style={{'textAlign': 'right'}} className="right">
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon noom_cursor borderballoon_file"
                                                      onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <div className="borderballoon_le_cont">
                                                        <img className="upexam_float span_link_img" style={{width: 38}}
                                                             src={styleImg}
                                                             alt=""/>
                                                        <div className="span_link_div">
                                                            <span className="span_link">{fileName}</span>
                                                            <span
                                                                className="span_link password_ts">{fileLength}kb</span>
                                                        </div>
                                                        <img id={fileUid} style={{display: "none"}} src={filePath}
                                                             onClick={showLargeImg} alt=""/>
                                                    </div>
                                                    <div className="file_noom">
                                                        <a className="noom_cursor  file_noom_line"
                                                           onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                            <Icon type="eye"/>预览</a>
                                                        <a href={filePath} target="_blank" title="下载"
                                                           download={filePath}
                                                           className="downfile_noom file_noom_line">
                                                            <Icon type="download"/>下载</a>
                                                        <Dropdown overlay={menu}
                                                                  onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                            <a className="ant-dropdown-link file_noom_line"
                                                               href="javascript:;">
                                                              <Icon type="bars"/>更多
                                                            </a>
                                                        </Dropdown>
                                                    </div>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                            </span>
                                                </div>
                                            </div>
                                        </li>;
                                    } else {
                                        messageTag = <li style={{'textAlign': 'right'}} className="right">
                                            <div className="u-name">
                                                <span>{fromUser}</span>
                                                <span className="cart_time">{mesTime}</span>
                                            </div>
                                            <div className="talk-cont">
                                                <span className="name">{userPhoneIcon}</span>
                                                <div className="talk_bubble_box">
                                                <span className="borderballoon noom_cursor borderballoon_file"
                                                      onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <div className="borderballoon_le_cont">
                                                        <img className="upexam_float span_link_img" style={{width: 38}}
                                                             src={styleImg}
                                                             alt=""/>
                                                        <div className="span_link_div">
                                                            <span className="span_link">{fileName}</span>
                                                            <span
                                                                className="span_link password_ts">{fileLength}kb</span>
                                                        </div>
                                                        <img id={fileUid} style={{display: "none"}} src={filePath}
                                                             onClick={showLargeImg} alt=""/>
                                                    </div>
                                                    <div className="file_noom">
                                                        <a className="noom_cursor  file_noom_line"
                                                           onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                            <Icon type="eye"/>预览</a>
                                                        <a href={filePath} target="_blank" title="下载"
                                                           download={filePath}
                                                           className="downfile_noom file_noom_line">
                                                            <Icon type="download"/>下载</a>
                                                        <Dropdown overlay={menu}
                                                                  onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                            <a className="ant-dropdown-link file_noom_line"
                                                               href="javascript:;">
                                                              <Icon type="bars"/>更多
                                                            </a>
                                                        </Dropdown>
                                                    </div>
                                                </span>
                                                    <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={this.state.msgMenu} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                            </span>
                                                    <span className="talk_bubble_read"
                                                          onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                                </div>
                                            </div>
                                        </li>;
                                    }

                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name">
                                            <span>{fromUser}</span>
                                            <span className="cart_time">{mesTime}</span>
                                        </div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <div className="talk_le_bubble_box">
                                                <span className="borderballoon_le noom_cursor"
                                                      onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    <div className="borderballoon_le_cont">
                                                        <img className="upexam_float" style={{width: 38}}
                                                             src={styleImg}
                                                             onClick={showLargeImg} alt=""/>
                                                        <div className="span_link_div">
                                                            <span className="span_link">{fileName}</span>
                                                            <span
                                                                className="span_link password_ts">{fileLength}kb</span>
                                                        </div>
                                                        <i className="borderballoon_dingcorner_ri_no"></i>
                                                    </div>
                                                    <div className="file_noom">
                                                        <a className="noom_cursor  file_noom_line"
                                                           onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                            <Icon type="eye"/>预览</a>
                                                        <a href={filePath} target="_blank" title="下载"
                                                           download={filePath} className="downfile_noom file_noom_line">
                                                            <Icon type="download"/>下载</a>
                                                        <Dropdown overlay={menu}
                                                                  onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                            <a className="ant-dropdown-link file_noom_line"
                                                               href="javascript:;">
                                                                <Icon type="bars"/>更多
                                                            </a>
                                                        </Dropdown>
                                                    </div>
                                                </span>
                                                <span className="talk_bubble_ellipsis">
                                                    <Dropdown overlay={msgMenuLeft} trigger={['click']}
                                                              placement="topCenter"
                                                              onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                                        <Icon className="icon_ellipsis" type="ellipsis"/>
                                                    </Dropdown>
                                                </span>
                                            </div>
                                        </div>
                                    </li>;
                                }
                            }
                        }
                    } else {
                        if (e.toId == 138437) {
                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                <div className="u-name">
                                    <span>{fromUser}</span>
                                    <span className="cart_time">{mesTime}</span>
                                </div>
                                <div className="talk-cont">
                                    <span className="name">{userPhoneIcon}</span>
                                    <div className="talk_bubble_box">
                                    <span className="borderballoon">{e.content}
                                        <i className="borderballoon_dingcorner_le_no"></i>
                                    </span>
                                        <span className="talk_bubble_ellipsis">
                                        <Dropdown overlay={this.state.msgMenu} trigger={['click']} placement="topCenter"
                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                        </Dropdown>
                                    </span>
                                    </div>
                                </div>
                            </li>;
                        } else {
                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                <div className="u-name">
                                    <span>{fromUser}</span>
                                    <span className="cart_time">{mesTime}</span>
                                </div>
                                <div className="talk-cont">
                                    <span className="name">{userPhoneIcon}</span>
                                    <div className="talk_bubble_box">
                                    <span className="borderballoon">{e.content}
                                        <i className="borderballoon_dingcorner_le_no"></i>
                                    </span>
                                        <span className="talk_bubble_ellipsis">
                                        <Dropdown overlay={this.state.msgMenu} trigger={['click']} placement="topCenter"
                                                  onVisibleChange={this.getMesUUid.bind(this, e.uuid, e)}>
                                            <Icon className="icon_ellipsis" type="ellipsis"/>
                                        </Dropdown>
                                    </span>
                                        <span className="talk_bubble_read"
                                              onClick={this.checkTalkReaders.bind(this, e)}>{e.readStateStr}</span>
                                    </div>
                                </div>
                            </li>;
                        }

                    }
                    messageTagArray.push(messageTag);
                }
                // _this.setState({imgArr});
            }
            currentReturnCount = messageTagArray.length;
            var sendBtn;
            var emotionInput;
            if (antGroup.state.optType == "sendMessage" && isEmpty(antGroup.state.currentUser.userName) == false) {
                welcomeTitle = antGroup.state.currentUser.userName;
                sendBtn = <Button onClick={antGroup.sendMessage}>
                    <div>发送<p className="password_ts">(Enter)</p></div>
                </Button>;
                if (antGroup.state.currentUser.colUtype != "SGZH") {
                    emotionInput = <Row className="group_send">
                        <Col className="group_send_talk">
                            <EmotionInputComponents onKeyDown={this.checkKeyType}></EmotionInputComponents>
                        </Col>
                        <Col className="group_send_btn">
                            {sendBtn}
                        </Col>
                    </Row>;
                    $('#groupTalk').removeClass('noom_MYJ');
                } else {
                    $('#groupTalk').addClass('noom_MYJ');
                }
            } else {
                $('#groupTalk').removeClass('noom_MYJ');
                welcomeTitle = antGroup.state.currentGroupObj.name;
                sendBtn = <Button value="groupSend" onClick={antGroup.sendMessage}>
                    <div>发送<p className="password_ts">(Enter)</p></div>
                </Button>
                emotionInput = <Row className="group_send">
                    <Col className="group_send_talk">
                        <EmotionInputComponents onKeyDown={this.checkKeyType}></EmotionInputComponents>
                    </Col>
                    <Col className="group_send_btn">
                        {sendBtn}
                    </Col>
                </Row>;
            }
            tabComponent = <Tabs
                hideAdd
                ref="personCenterTab"
                activeKey={this.state.activeKey}
                animated={false}
                defaultActiveKey={this.state.defaultActiveKey}
                transitionName=""  //禁用Tabs的动画效果
            >
                {/*<TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">*/}
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div id="personTalk">
                        <i style={{display: groupSetting}} title="群设置" className="iconfont groupTalkSetting noom_cursor"
                           onClick={this.gopTalkSetClick}>&#xe675;</i>
                        <div className="group_talk 44" id="groupTalk"
                             onMouseOver={this.handleScrollType.bind(this, Event)}
                             onScroll={this.handleScroll}>
                            <ul>
                                {/*消息内容主体*/}
                                {messageTagArray}
                            </ul>
                        </div>
                        {emotionInput}
                    </div>
                </TabPane>
            </Tabs>;
        } else {
            tabComponent = <div className="userinfo_bg_1"><span>科技改变未来，教育成就梦想</span></div>;
        }
        var returnToolbarInMoveModal = <div className="public—til—blue">
            <div className="ant-tabs-right"><Button onClick={antGroup.returnParentAtMoveModal}><Icon
                type="left"/></Button></div>
        </div>;


        return (
            <div>
                <div className="group_cont">
                    {userPhoneCard}
                    {tabComponent}
                    <ul style={{display: 'none'}}>
                        <li className="imgLi">
                            {imgArr}
                        </li>
                    </ul>
                </div>

                {/*侧边栏*/}
                <div className="read_panel" ref="dingPanel">
                    <div className="ding_top">
                        <Icon type="close" className="d_mesclose" onClick={this.levMesDetil}/>
                    </div>
                    <div className="ding_inner">
                        <Card>
                            <Tabs activeKey={this.state.mesReadActiveKey} onTabClick={this.onTabClick}>
                                <TabPane tab="已读列表" key="1">
                                    <Table className="group_table_u person_group"
                                           showHeader={false}
                                           animated={false}
                                           scroll={{x: true,}}
                                           columns={userGroupsColumns} dataSource={this.state.readMenuMebs}
                                           pagination={false}
                                    />
                                </TabPane>
                                <TabPane tab="未读列表" key="2">
                                    <Table className="group_table_u person_group" showHeader={false} scroll={{x: true,}}
                                           columns={userGroupsColumns} dataSource={this.state.noReadMenuMebs}
                                           pagination={false}
                                    />
                                </TabPane>
                            </Tabs>
                        </Card>
                    </div>
                </div>

                {/*发送文件model*/}
                <Modal
                    visible={antGroup.state.cloudFileUploadModalVisible}
                    title="上传文件"
                    className="modol_width"
                    maskClosable={false} //设置不允许点击蒙层关闭
                    onCancel={antGroup.cloudFileUploadModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>

                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={antGroup.cloudFileUploadModalHandleCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" className="login-form-button"
                                    onClick={antGroup.uploadFile}
                                    disabled={this.state.sendFileButton}
                            >
                                发送
                            </Button>
                        </div>
                    ]}
                >
                    <Row>
                        <Col span={4}>上传文件：</Col>
                        <Col span={20}>
                            <div>
                                <GroupFileUploadComponents ref="fileUploadCom"
                                                           fatherState={antGroup.state.cloudFileUploadModalVisible}
                                                           callBackParent={antGroup.handleFileSubmit}/>
                            </div>
                            <div style={{display: progressState}}>
                                <Progress percent={antGroup.state.uploadPercent} width={80} strokeWidth={4}/>
                            </div>
                        </Col>

                    </Row>
                </Modal>

                {/*保存到我的蚁盘model*/}
                <Modal title="我的文件"
                       visible={antGroup.state.saveFileModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={antGroup.moveFileModalHandleCancel}
                       footer={null}
                >
                    <div className="move_file">
                        <Row>
                            <Col span={24}>
                                {returnToolbarInMoveModal}
                                <Table columns={targetDirColumns} showHeader={false}
                                       dataSource={antGroup.state.targetDirDataArray}
                                       pagination={{
                                           total: antGroup.state.totalCount,
                                           pageSize: getPageSize(),
                                           onChange: antGroup.pageOnChange
                                       }}
                                       scroll={{y: 300}}/>
                            </Col>
                        </Row>
                    </div>
                </Modal>

                <Modal title="文件详情"
                       visible={this.state.checkFileModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={this.checkFileModalHandleCancel}
                       footer={null}
                       className="file_icon_new"
                >
                    <Row>
                        <Col span={24}>
                            <div style={{marginBottom: 16}} className="file_icon_new_p">
                                <Button
                                    type="primary"
                                    onClick={this.saveShareFile}
                                    disabled={!hasSelected}
                                >
                                    保存到蚁盘
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <div className="move_file_clearfix">
                        <Row>
                            <Col span={24}>

                                <div className="file_icon_new_clearfix">
                                    <Table rowSelection={rowSelection} columns={fileDetilColumns}
                                           dataSource={data_noom}
                                           pagination={false}/>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Modal>

                <Modal title="转发消息" className="cloud_share_Modal"
                       visible={this.state.relayMsgModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={this.relayMsgModalHandleCancel}
                       onOk={this.sendMegToOthers}
                       width={400}
                >
                    <div>
                        <Row>
                            <Col span={12} className="share_til">选择好友：</Col>
                        </Row>
                        <Row>
                            <Col span={23} className="upexam_float cloud_share_cont">
                                <Collapse bordered={false} activeKey={this.state.RMsgActiveKey}
                                          onChange={this.collapseChange}>
                                    <Panel header="最近联系人" key="2">
                                        <CheckboxGroup options={this.state.userMessageData}
                                                       value={this.state.checkedRecentConnectOptions}
                                                       onChange={this.recentConnectOptionsOnChange}
                                        />
                                    </Panel>
                                    <Panel header="我的群组" key="1">
                                        <CheckboxGroup options={this.state.groupOptions}
                                                       value={this.state.checkedGroupOptions}
                                                       onChange={this.groupOptionsOnChange}/>
                                    </Panel>
                                    <Panel header="我的好友" key="0">
                                        <CheckboxGroup options={this.state.concatOptions}
                                                       value={this.state.checkedConcatOptions}
                                                       onChange={this.concatOptionsOnChange}/>
                                    </Panel>
                                    <Panel header="组织架构" key="3">
                                        <CheckboxGroup options={this.state.structureOptions}
                                                       value={this.state.checkedsSructureOptions}
                                                       onChange={this.roleOptionsOnChange}/>
                                    </Panel>
                                </Collapse>
                            </Col>
                        </Row>
                    </div>
                </Modal>

                <EditDingModal
                    isShow={this.state.makeDingModalIsShow}
                    closeDingModel={this.closeDingModel}
                    msgContent={this.state.msgContent}
                    dingSelectedRowKeys={this.state.dingSelectedRowKeys}
                    dingSelectedNames={this.state.dingSelectedNames}
                    dingUuid={this.state.dingUuid}
                    dingMsgReturnSuc={this.dingMsgReturnSuc}
                />
                <Modal title={null}
                       visible={antGroup.state.videoPlayModel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={true} //设置不允许点击蒙层关闭
                       onCancel={antGroup.videoPlayerModalHandleCancel}
                       footer={null}
                       className='noomVideoPlayer'
                >
                    {antGroup.state.videoPlayer}
                </Modal>
            </div>
        );
    },
});

export default AntGroupTabComponents;
