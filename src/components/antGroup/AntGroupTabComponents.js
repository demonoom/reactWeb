import React, {PropTypes} from 'react';
import {Tabs, Breadcrumb, Icon, Card, Button, Row, Col, Table, Transfer} from 'antd';
import {Menu, Dropdown, message, Modal, Popover, Input, Collapse, notification, Progress} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import EmotionInputComponents from './EmotionInputComponents';
import {getPageSize} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {phone} from '../../utils/phone';
import {getImgName} from '../../utils/Const';
import {formatMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
import {isToday} from '../../utils/utils';
import {showLargeImg} from '../../utils/utils';
import {getLocalTime, SMALL_IMG, MIDDLE_IMG, LARGE_IMG} from '../../utils/Const'
import ConfirmModal from '../ConfirmModal';
import GroupFileUploadComponents from './GroupFileUploadComponents';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
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
var targetDirColumns = [{
    title: '文件夹名称',
    dataIndex: 'dirName',
}, {
    title: '操作',
    className: 'ant-table-selection-user schoolgroup_operate',
    dataIndex: 'moveDirOpt',
}
];


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
            totalCount: 0
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
     * 构建查看文件详细的table
     */
    buildFileDetilData(res) {
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
            //我要的key
            var key = fileSrc + '@' + fileName + '@' + fileLength;
            var imgTag = <div className="file_icon_cont">
                            <span className="file_icon_img">
                                <img src="../src/components/images/lALPBY0V4pdU_AxmZg_102_102.png"/>
                            </span>
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
        //清空上传文件数组
        uploadFileList.splice(0, uploadFileList.length);
        antGroup.setState({cloudFileUploadModalVisible: true, uploadPercent: 0, progressState: 'none'});
    },

    /**
     * 关闭上传文件弹窗
     */
    cloudFileUploadModalHandleCancel() {
        antGroup.setState({"cloudFileUploadModalVisible": false});
        this.refs.fileUploadCom.initFileUploadPage();
    },

    /**
     * 处理上传组件已上传的文件列表
     */
    handleFileSubmit(fileList) {
        if (fileList == null || fileList.length == 0) {
            uploadFileList.splice(0, uploadFileList.length);
        }
        for (var i = 0; i < fileList.length; i++) {
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj);
        }
    },

    /**
     * 发送文件的回调
     */
    uploadFile() {
        if (uploadFileList.length == 0) {
            message.warning("请选择上传的文件,谢谢！");
        } else {
            var formData = new FormData();
            for (var i = 0; i < uploadFileList.length; i++) {
                formData.append("file" + i, uploadFileList[i]);
                formData.append("name" + i, uploadFileList[i].name);
            }
            $.ajax({
                type: "POST",
                url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
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
                        if (ev.lengthComputable) {
                            var percent = 100 * ev.loaded / ev.total;
                            antGroup.setState({uploadPercent: Math.round(percent), progressState: 'block'});
                        }
                    };
                    return xhr;
                },
                success: function (responseStr) {
                    if (responseStr != "") {
                        var fileUrl = responseStr;
                        //fileUrl文件的路径，根据路径创建文件发送对象，ms.send,关闭模态框
                        //调用发送文件的方法
                        antGroup.sendFileToOthers(fileUrl);
                    }
                },
                error: function (responseStr) {
                    antGroup.setState({cloudFileUploadModalVisible: false});
                }
            });

        }
    },

    /**
     * 拿到文件路径，发送message
     */
    sendFileToOthers(url) {
        isSend = true;
        //文件名
        var name = uploadFileList[0].name;
        //文件大小
        var length = uploadFileList[0].size;
        //文件路径
        var path = url;

        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));

        var uuid = antGroup.createUUID();

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

        var createTime = (new Date()).valueOf();

        var messageJson = {
            'content': name, "createTime": createTime, 'fromUser': loginUser,
            "toId": antGroup.state.userIdOfCurrentTalk, "command": "message", "hostId": loginUser.colUid,
            "uuid": uuid, "toType": 1, "cloudFile": cloudFile
        };

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

    /**
     * 进入收发消息的窗口
     * @param user
     */
    turnToMessagePage(operatorObj, messageType, isTurnPage) {
        var _this = this;
        var userId;
        var messageList = [];
        ms.msgWsListener = {
            onError: function (errorMsg) {
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

            }, onMessage: function (info) {
                console.log(info);
                console.log('info');
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
                        // console.log(messageOfSinge);


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
                                if (("SGZH" == colUtype || isEmpty(groupObj) == false && groupObj.chatGroupId == e.toId )) {
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
                    } else if (command == "message") {
                        var data = info.data;
                        if (data.message.command == "biu_message") {
                            // var obj = JSON.parse(data.message.content);
                            _this.props.showAlert(true);
                        } else if (data.message.command == "message") {
                            if (data.message.fromUser.colUid !== _this.state.loginUser.colUid) {
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
                        }
                        ;
                        showImg = "";
                        messageOfSinge = data.message;
                        var fromUser = messageOfSinge.fromUser;
                        var colUtype = fromUser.colUtype;
                        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                        var content = messageOfSinge.content;
                        var uuidsArray = [];
                        var uuid = messageOfSinge.uuid;
                        console.log(messageOfSinge);
                        console.log('//判断是否是叮消息');
                        //判断是否是叮消息
                        //判断这条消息是我发出的，处理别的手机发送消息不同步的问题
                        if (messageOfSinge.fromUser.colUid == antGroup.state.loginUser.colUid) {
                            //     alert('我发出的');
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
                        if (isCurrentDay) {
                            //如果是当天的消息，只显示时间
                            createTime = formatHM(messageOfSinge.createTime);
                        } else {
                            //非当天时间，显示的是月-日
                            createTime = formatMD(messageOfSinge.createTime);
                        }
                        var contentJson = {"content": content, "createTime": createTime};
                        var contentArray = [contentJson];
                        if (messageOfSinge.toType == 1 && typeof (content) != 'undefined') {
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
                                            "biumes": biumes
                                        };
                                        messageList.push(messageShow);
                                        console.log(messageList);
                                    }
                                    if (isEmpty(messageOfSinge.toUser) == false) {
                                        var userJson = {
                                            key: messageOfSinge.toUser.colUid,
                                            // "fromUser": messageOfSinge.toUser,
                                            "fromUser": messageOfSinge.fromUser,
                                            contentArray: contentArray,
                                            "messageToType": 1
                                        };
                                        // if (isEmpty(isTurnPage)) {
                                        // }
                                        antGroup.props.onNewMessage(userJson);
                                    }
                                }

                            } else {
                                //我发出的
                                console.log('我发出的');
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
                                            "fileCreateUid": fileCreateUid
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
                                            "messageToType": 1
                                        };
                                        // if (isEmpty(isTurnPage)) {
                                        // }
                                        antGroup.props.onNewMessage(userJson);
                                        isSend = false;
                                    }
                                }
                            }
                        } else if (messageOfSinge.toType == 4 && typeof (content) != 'undefined') {
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
                                    "fileCreateUid": fileCreateUid
                                };
                                //messageList.splice(0, 0, messageShow);
                                messageList.push(messageShow);
                                var userJson = {
                                    key: messageOfSinge.toChatGroup.chatGroupId,
                                    // key: _this.state.loginUser.colUid,
                                    "fromUser": fromUser,
                                    "toChatGroup": messageOfSinge.toChatGroup,
                                    contentArray: contentArray,
                                    "messageToType": 4
                                };
                                // if (isEmpty(isTurnPage)) {
                                // }
                                antGroup.props.onNewMessage(userJson);
                            } else {
                                var userJson = {
                                    // key: messageOfSinge.toChatGroup.chatGroupId,
                                    key: _this.state.loginUser.colUid,
                                    "fromUser": fromUser,
                                    "toChatGroup": messageOfSinge.toChatGroup,
                                    contentArray: contentArray,
                                    "messageToType": 4
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
            var imgTags = [];
            var messageReturnJson = {};
            messageReturnJson = antGroup.changeImgTextToTag(messageOfSingle.content, imgTags, messageReturnJson);
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
                //
                var end = str.indexOf("]");
                var subStr = str.substring(start, end + 1);
                showContent = showContent.replace(subStr, "~");
                var imgUrl = getImgName(subStr);
                var localUrl = "../src/components/images/emotions/" + imgUrl;
                var subStrReplace = <span className='attention_img'><img src={localUrl}/></span>;
                imgTags.push(subStrReplace);
                var otherStr = str.substring(end + 1);
                if (otherStr.indexOf("[bexp_") != -1) {
                    antGroup.changeImgTextToTag(otherStr, imgTags);
                } else {
                    showImg += otherStr;
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
            // console.log(userJson);
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
        if (typeof(response) != "undefined" && response.length == 0) {
            notification.open({
                message: '',
                description: '没有更多消息了',
                icon: <Icon type="meh" style={{color: '#108ee9', top: '-7px', position: 'relative'}}/>,

            });
            //
        }
    },

    addMessageList(messages, firstOrLast) {
        if (isEmpty(firstOrLast) == false) {
            antGroup.state.messageList.unshift(messages[0]);
            antGroup.setState({messageList: antGroup.state.messageList});
        } else {
            antGroup.setState({messageList: antGroup.state.messageList.concat(messages)});
        }

        var gt = $('#groupTalk');
        if (isDirectToBottom == false) {
            if (isNewPage == true) {
                var nowHeight = gt[0].scrollHeight;
                console.log("nowHeight:" + nowHeight + "=======preHeight:" + preHeight);
                var newHeight = Number(nowHeight) - Number(preHeight);
                console.log("newHeight====>" + Number(newHeight));
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
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (("SGZH" == colUtype || groupObj.chatGroupId == e.toId ) && e.toType == 4) {
                                var uuid = e.uuid;
                                uuidsArray.push(uuid);
                                imgTagArray.splice(0);
                                showImg = "";
                                var content = e.content;
                                var imgTagArrayReturn = [];
                                var messageReturnJson = antGroup.getImgTag(e);
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
                                    "biumes": biumes
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
        //如果是图片直接用插件展示，否则交给iframe展示
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
            "user1Id": userObj.colUid,
            "user2Id": sessionStorage.getItem("ident"),
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
                    ret.response.forEach(function (e) {
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
                            var colUtype = fromUser.colUtype;
                            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
                            if (messageOfSinge.toType == 1) {
                                var uuid = messageOfSinge.uuid;
                                uuidsArray.push(uuid);
                                var content = messageOfSinge.content;
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
                                    "biumes": biumes
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
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({selectedRowKeys});
    },

    render() {
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
            console.log(messageList);
            console.log('渲染');
            if (isEmpty(messageList) == false && messageList.length > 0) {
                for (var i = messageList.length - 1; i >= 0; i--) {
                    var e = messageList[i];
                    if (isEmpty(e) == true) {
                        continue;
                    }
                    var content = e.content;
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
                                        messageTag = <li style={{'textAlign': 'right'}} className="right">
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon_le noom_cursor"
                                                onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                <div className="borderballoon_le_cont">
                                                <img className="upexam_float span_link_img" style={{width: 40}}
                                                     src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                     alt=""/>
                                                     <div className="span_link_div">
                                                         <span className="span_link file_link_img_t">{content}</span>
                                                     </div>
                                                 </div>
                                                <i className="borderballoon_dingcorner_ri_no"></i></span></div>
                                        </li>;
                                        // }
                                    } else if (isEmpty(expressionItem) == false) {
                                        //来自安卓的动态表情（安卓的动态表情的content里有“表情”两个字）
                                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span className="name">{userPhoneIcon}</span>
                                                <img src={expressionItem} style={{width: '100px', height: '100px'}}/>
                                                <span><i className="borderballoon_dingcorner_le_no"></i></span>
                                            </div>
                                        </li>;
                                    } else if (isEmpty(fileName) == false) {
                                        //发送的文件（content里带有文件名字）
                                        messageTag = <li style={{'textAlign': 'right'}} className="right">
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon noom_cursor borderballoon_file">
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                                <div className="borderballoon_le_cont"><div
                                                    className="span_link_div"><span
                                                    className="span_link">{fileName}</span><span
                                                    className="span_link password_ts">{fileLength}kb</span></div>
                                                <img className="upexam_float span_link_img" style={{width: 38}}
                                                     src="../src/components/images/maaee_link_file_102_102.png"
                                                     alt=""/>
                                                    </div>
                                                <img id={fileUid} style={{display: "none"}} src={filePath}
                                                     onClick={showLargeImg}
                                                     alt=""/>
                                            <div className="file_noom">
                                                    <a className="noom_cursor  file_noom_line"
                                                       onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}><Icon
                                                        type="eye"/>预览</a>
                                                    <a href={filePath} target="_blank" title="下载"
                                                       download={filePath}
                                                       className="downfile_noom file_noom_line"><Icon
                                                        type="download"/>下载</a>
                                                    <Dropdown overlay={menu}
                                                              onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                        <a className="ant-dropdown-link file_noom_line"
                                                           href="javascript:;">
                                                          <Icon type="bars"/>更多
                                                        </a>
                                                    </Dropdown>
                                                </div>
                                            </span></div>
                                        </li>;
                                    } else {
                                        //文字消息
                                        if (biumes == true) {
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name"><span>{fromUser}</span></div>
                                                <div className="talk-cont"><span
                                                    className="name">{userPhoneIcon}</span><span
                                                    className="borderballoon">{e.content}<i
                                                    className="borderballoon_dingcorner_le"></i></span></div>
                                            </li>;
                                        } else {
                                            messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                                <div className="u-name"><span>{fromUser}</span></div>
                                                <div className="talk-cont"><span
                                                    className="name">{userPhoneIcon}</span><span
                                                    className="borderballoon">{e.content}<i
                                                    className="borderballoon_dingcorner_le_no"></i></span></div>
                                            </li>;
                                        }
                                    }
                                } else {
                                    //我收到的
                                    if (isEmpty(attachment) == false) {
                                        //有内容的链接
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon_le noom_cursor"
                                                onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                 <span className="bot"></span>
                                                 <span className="top"></span>
                                                 <img className="upexam_float span_link_img" style={{width: 40}}
                                                      src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                      alt=""/>
                                                <span className="span_link file_link_img_t">{content}</span>
                                                <i className="borderballoon_dingcorner_ri_no"></i>
                                            </span>
                                            </div>
                                        </li>;
                                    } else if (isEmpty(fileName) == false) {
                                        //发送的文件（content里带有文件名字）
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><span
                                                className="borderballoon_le"
                                                // onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid)}><img
                                            >
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                                <div className="borderballoon_le_cont">
                                                    <img className="upexam_float" style={{width: 38}}
                                                         src="../src/components/images/maaee_link_file_102_102.png"
                                                         alt=""/>
                                                    <img id={fileUid} style={{display: "none"}} src={filePath}
                                                         onClick={showLargeImg}
                                                         alt=""/>
                                                    <span className="span_link">{fileName}</span>
                                                    <span className="span_link password_ts">{fileLength}kb</span>
                                                    <i className="borderballoon_dingcorner_ri_no"></i>
                                                </div>
                                                <div className="file_noom">
                                                    <a className="noom_cursor  file_noom_line"
                                                       onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}><Icon
                                                        type="eye"/>预览</a>
                                                    <a href={filePath} target="_blank" title="下载"
                                                       download={filePath}
                                                       className="downfile_noom file_noom_line"><Icon
                                                        type="download"/>下载</a>
                                                    <Dropdown overlay={menu}
                                                              onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                        <a className="ant-dropdown-link file_noom_line"
                                                           href="javascript:;">
                                                          <Icon type="bars"/>更多
                                                        </a>
                                                    </Dropdown>
                                                </div>
                                                </span>
                                            </div>
                                        </li>;
                                    } else if (isEmpty(expressionItem) == false) {
                                        //来自安卓的动态表情（安卓的动态表情的content里有“表情”两个字）
                                        messageTag = <li style={{'textAlign': 'left'}}>
                                            <div className="u-name"><span>{fromUser}</span></div>
                                            <div className="talk-cont"><span
                                                className="name">{userPhoneIcon}</span><img
                                                style={{width: '100px', height: '100px'}} src={expressionItem}/><span><i
                                                className="borderballoon_dingcorner_ri_no"></i></span></div>
                                        </li>;
                                    } else {
                                        if (biumes == true) {
                                            //叮消息有角标
                                            messageTag = <li style={{'textAlign': 'left'}}>
                                                <div className="u-name"><span>{fromUser}</span></div>
                                                <div className="talk-cont"><span
                                                    className="name">{userPhoneIcon}</span><span
                                                    className="borderballoon_le">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    {e.content}
                                                    <i className="borderballoon_dingcorner_ri"></i></span></div>
                                            </li>;
                                        } else {
                                            //普通消息无角标
                                            messageTag = <li style={{'textAlign': 'left'}}>
                                                <div className="u-name"><span>{fromUser}</span></div>
                                                <div className="talk-cont"><span
                                                    className="name">{userPhoneIcon}</span><span
                                                    className="borderballoon_le">
                                                    <span className="bot"></span>
                                                    <span className="top"></span>
                                                    {e.content}
                                                    <i className="borderballoon_dingcorner_ri_no"></i></span></div>
                                            </li>;
                                        }
                                    }
                                }
                            } else if (e.messageReturnJson.messageType == "imgTag") {
                                //context没有内容的消息
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><span
                                            className="borderballoon ">{e.imgTagArray}<i
                                            className="borderballoon_dingcorner_le_no"></i></span></div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le">{e.imgTagArray}<i
                                            className="borderballoon_dingcorner_ri_no"></i></span></div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "audioTag") {
                                //动态表情（iOS发来的，安卓发过来的表情里有“表情”两个汉字）
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span><img
                                            src={expressionItem} style={{width: '100px', height: '100px'}}/><span><i
                                            className="borderballoon_dingcorner_le_no"></i></span></div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span><img
                                            style={{width: '100px', height: '100px'}} src={expressionItem}/><span><i
                                            className="borderballoon_dingcorner_ri_no"></i></span></div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "linkTag") {
                                //没有内容的链接
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li style={{'textAlign': 'right'}} className="right">
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span><span
                                            className="borderballoon noom_cursor borderballoon_file"
                                            onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                            <div className="borderballoon_le_cont">
                                                <img className="upexam_float span_link_img" style={{width: 40}}
                                                     src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png"
                                                     alt=""/>
                                                     <div className="span_link_div">
                                                         <span className="span_link file_link_img_t">默认</span>
                                                     </div>
                                                 </div>
                                            <i className="borderballoon_dingcorner_ri_no"></i></span></div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le noom_cursor"
                                            onClick={this.readLink.bind(this, attachment, fileUid, fileCreateUid)}>
                                            <span className="bot"></span>
                                            <span className="top"></span>
                                            <img className="upexam_float span_link_img" style={{width: 40}}
                                                 src="../src/components/images/lALPBY0V4o8X1aNISA_72_72.png" alt=""/>
                                            <span className="span_link file_link_img_t">默认</span><i
                                            className="borderballoon_dingcorner_ri_no"></i></span></div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "bigImgTag") {
                                //图片
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span className="name">{userPhoneIcon}</span>
                                            <span className="borderballoon borderballoon_file borderballoon_file_p">
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                                <img onClick={showLargeImg} src={attachment + '?' + MIDDLE_IMG}
                                                     className="send_img" alt={attachment}/>
                                            </span>
                                            <span><i className="borderballoon_dingcorner_le_no"></i></span>
                                        </div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span>
                                            <span className="borderballoon_le borderballoon_file_p">
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                                <img onClick={showLargeImg} className="send_img"
                                                     src={attachment + '?' + MIDDLE_IMG} alt={attachment}/>
                                            </span>
                                            <span><i className="borderballoon_dingcorner_ri_no"></i></span>
                                        </div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "videoTag") {
                                //语音
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li className="right" style={{'textAlign': 'right'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
                                            <span className="borderballoon noom_cursor noom_audio"
                                                  onClick={this.audioPlay.bind(this, attachment, '_right')}>
                                            <audio id={attachment}>
                                                <source src={attachment} type="audio/mpeg"></source>
                                            </audio>
                                                <span className="audio_right" id={attachment + '_audio'}></span>
                                            <i className="borderballoon_dingcorner_ri_no"></i>
                                        </span>
                                        </div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont">
                                            <span className="name">{userPhoneIcon}</span>
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
                                        </div>
                                    </li>;
                                }
                            } else if (e.messageReturnJson.messageType == "fileUpload") {
                                //文件
                                if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                                    //我发出的
                                    messageTag = <li style={{'textAlign': 'right'}} className="right">
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span><span
                                            className="borderballoon noom_cursor borderballoon_file"
                                            onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                            <div className="borderballoon_le_cont"><div className="span_link_div"><span
                                                className="span_link">{fileName}</span><span
                                                className="span_link password_ts">{fileLength}kb</span></div>
                                                <img className="upexam_float span_link_img" style={{width: 38}}
                                                     src="../src/components/images/maaee_link_file_102_102.png"
                                                     alt=""/>
                                                <img id={fileUid} style={{display: "none"}} src={filePath}
                                                     onClick={showLargeImg}
                                                     alt=""/>
                                                    </div>
                                            <div className="file_noom">
                                                    <a className="noom_cursor  file_noom_line"
                                                       onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}><Icon
                                                        type="eye"/>预览</a>
                                                    <a href={filePath} target="_blank" title="下载"
                                                       download={filePath}
                                                       className="downfile_noom file_noom_line"><Icon
                                                        type="download"/>下载</a>
                                                    <Dropdown overlay={menu}
                                                              onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                            <a className="ant-dropdown-link file_noom_line"
                                                               href="javascript:;">
                                                              <Icon type="bars"/>更多
                                                            </a>
                                                        </Dropdown>
                                                </div>
                                            </span></div>
                                    </li>;
                                } else {
                                    //我收到的
                                    messageTag = <li style={{'textAlign': 'left'}}>
                                        <div className="u-name"><span>{fromUser}</span></div>
                                        <div className="talk-cont"><span
                                            className="name">{userPhoneIcon}</span><span
                                            className="borderballoon_le noom_cursor"
                                            onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}>
                                                <span className="bot"></span>
                                                <span className="top"></span>
                                            <div className="borderballoon_le_cont"><img
                                                className="upexam_float"
                                                style={{width: 38}}
                                                src="../src/components/images/maaee_link_file_102_102.png"
                                                alt=""/><img id={fileUid} style={{display: "none"}} src={filePath}
                                                             onClick={showLargeImg}
                                                             alt=""/><span
                                                className="span_link">{fileName}</span><span
                                                className="span_link password_ts">{fileLength}kb</span><i
                                                className="borderballoon_dingcorner_ri_no"></i></div>
                                        <div className="file_noom">
                                                    <a className="noom_cursor  file_noom_line"
                                                       onClick={this.watchFile.bind(this, filePath, fileUid, fileCreateUid, fileName)}><Icon
                                                        type="eye"/>预览</a>
                                                    <a href={filePath} target="_blank" title="下载"
                                                       download={filePath}
                                                       className="downfile_noom file_noom_line"><Icon
                                                        type="download"/>下载</a>
                                                    <Dropdown overlay={menu}
                                                              onVisibleChange={this.getCloudFile.bind(this, filePath, fileName, oriFileLength, fileCreateUid)}>
                                                        <a className="ant-dropdown-link file_noom_line"
                                                           href="javascript:;">
                                                          <Icon type="bars"/>更多
                                                        </a>
                                                    </Dropdown>
                                                </div>
                                        </span></div>
                                    </li>;
                                }
                            }
                        }
                    } else {
                        messageTag = <li className="right" style={{'textAlign': 'right'}}>
                            <div className="u-name"><span>{fromUser}</span></div>
                            <div className="talk-cont">
                                <span className="name">{userPhoneIcon}</span><span
                                className="borderballoon">{e.content}<i
                                className="borderballoon_dingcorner_le_no"></i></span>
                            </div>
                        </li>;
                    }
                    messageTagArray.push(messageTag);
                }
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
                }
            } else {
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
                defaultActiveKey={this.state.defaultActiveKey}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div id="personTalk">
                        <div className="group_talk 44" id="groupTalk"
                             onMouseOver={this.handleScrollType.bind(this, Event)}
                             onScroll={this.handleScroll}>
                            <ul>
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
                            <Button type="primary" htmlType="submit" className="login-form-button"
                                    onClick={antGroup.uploadFile}>
                                发送
                            </Button>
                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={antGroup.cloudFileUploadModalHandleCancel}>
                                取消
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
            </div>
        );
    },
});

export default AntGroupTabComponents;
