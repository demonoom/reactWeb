import React, {PropTypes, Link} from 'react';
import {Table, Badge, Button, Icon, Switch, Modal, Row, Col, Progress} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty, SMALL_IMG, MIDDLE_IMG, LARGE_IMG} from '../../utils/Const';
import {formatMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
import {isToday} from '../../utils/utils';

var mMenu;
var noomSelectRowKey;
// const ButtonGroup = Button.Group;
const columns = [{
    title: 'messageContent',
    dataIndex: 'messageContent',
    key: 'messageContent',
}];

var messageData = [];
var userMessageData = [];
var uuid;
const MessageMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {
            badgeShow: false,
            tableIsClick: false,
            show: true,  //红点显示与隐藏
        };
    },

    componentDidMount() {
        // this.props.toWhichCharObj();
        mMenu.getUserRecentMessages(true);
    },

    componentWillReceiveProps(nextProps) {
        if (isEmpty(noomSelectRowKey)) {
            //noomSelectRowKey没有值
            if (isEmpty(nextProps) == false && (typeof(nextProps.userJson) != "undefined")) {

                var num;
                messageData.forEach(function (v, i) {
                    if (v.key == nextProps.userJson.key) {
                        num = v.noomReadState
                    }
                });
                if (isEmpty(num) && num != 0) {
                    //没有找到那条消息,是一条新消息
                    num = 1
                } else {
                    //找到了拿到那个数字要加一
                    if (uuid != nextProps.userJson.uuid) {
                        num += 1;
                    } else {
                        num = num;
                    }
                }
                uuid = nextProps.userJson.uuid;


                if (nextProps.userJson.messageToType == 1) {
                    //个人消息
                    if (nextProps.userJson.fromUser.colUid != this.state.selectRowKey) {
                        nextProps.userJson.noomReadState = num;
                    }
                } else {
                    //群组消息
                    if (nextProps.userJson.key != this.state.selectRowKey) {
                        nextProps.userJson.noomReadState = num
                    }
                }
                //清空userMessageData
                userMessageData.splice(0);
                var index = mMenu.checkUserJsonIsExist(nextProps.userJson);
                //index=-1说明来的是以前不在列表中的新消息，直接置顶。
                //否则说明来的是本来就在列表里的人发送的消息，index是那个人在messageData中的位置
                // nextProps.userJson.isNew = true;
                if (index == -1) {
                    messageData.splice(0, 0, nextProps.userJson);
                } else {
                    // messageData[index] = nextProps.userJson;
                    // messageData.splice(0, 0, nextProps.userJson);
                    //排序
                    messageData.splice(index, 1);
                    messageData.splice(0, 0, nextProps.userJson);
                }
                mMenu.showMessageData();
            }
            if (isEmpty(nextProps) == false && isEmpty(nextProps.isSearch) == false) {
                if (nextProps.isSearch) {
                    //调用点击用户函数
                    var obj = {
                        fromUser: nextProps.userJson.fromUser,
                        key: nextProps.userJson.key,
                        messageType: nextProps.userJson.messageToType
                    };
                    mMenu.turnToMessagePage(obj);
                    //把nextProps.isSearch变回去
                    mMenu.props.changeIsSearch();
                }
            }
            if (isEmpty(nextProps) == false && isEmpty(nextProps.isSearchGroup) == false) {
                if (nextProps.isSearchGroup) {
                    //调用点击用户函数
                    var obj = {
                        fromUser: nextProps.userJson.fromUser,
                        key: nextProps.userJson.key,
                        messageType: nextProps.userJson.messageToType,
                        toChatGroup: nextProps.userJson.toChatGroup
                    };
                    mMenu.turnToMessagePage(obj);

                    //把nextProps.isSearch变回去
                    mMenu.props.changeIsSearchGroup();
                }
            }
        } else {
            //noomSelectRowKey有值    当点击左侧的时候会赋值   到这里滞空
            console.log(messageData);
            noomSelectRowKey = null;
        }
        // noomSelectRowKey = null;
        //看看它的key
        // if (isEmpty(nextProps.userJson) == false) {
        //     console.log(nextProps.userJson);
        //     ;
        // }
    },

    componentWillUnmount() {
        this.props.changeMesTabClick();
        noomSelectRowKey = null;
    },

    checkUserJsonIsExist(newMessageObj) {
        var index = -1;
        //遍历原来的messageData,如果新进来的消息的key与原来的messageData里的某条消息key相等，将index制成原来那个消息在messageData里的位置并返回
        for (var i = 0; i < messageData.length; i++) {
            var messageObj = messageData[i];
            if (messageObj.key == newMessageObj.key) {
                index = i;
                break;
            }
        }
        return index;
    },

    /**
     * 获取用户最新消息列表
     */
    getUserRecentMessages(flag) {
        userMessageData.splice(0);
        messageData.splice(0);
        var propsUserJson = mMenu.props.userJson;
        if (isEmpty(propsUserJson) == false) {
            messageData.push(propsUserJson);
        }
        var param = {
            "method": 'getUserRecentMessages',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var i = 0;
                if (isEmpty(response) == false || isEmpty(messageData) == false) {
                    //messageData.splice(0);
                    response.forEach(function (e) {
                        //如果这条消息的来源是我自己,就直接讲readState制成1
                        if (e.fromUser.colUid == sessionStorage.getItem("ident")) {
                            e.readState = 1;
                        }
                        //临时处理
                        /*if(e.toType==1){

                        }*/
                        mMenu.setMessageArrayForOnePerson(e);
                    });
                    mMenu.showMessageData(flag);
                    /*if(isEmpty(userMessageData)==false && mMenu.state.tableIsClick==false){
                        mMenu.props.onLoad(userMessageData[0]);
                    }*/
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
        // if (isEmpty(mMenu.props.isPersonCenter) == false) {
        //     if (mMenu.props.isPersonCenter) {
        //         //调用点击用户函数
        //         var obj = {
        //             fromUser: propsUserJson.fromUser,
        //             key: propsUserJson.key,
        //             messageType: propsUserJson.messageToType
        //         };
        //         // console.log(nextProps.userJson);
        //         // console.log('2323232323232323');
        //         // var obj = {
        //         //     fromUser:
        //         //     key:
        //         //     messageType:
        //         // }
        //         mMenu.turnToMessagePage(obj);
        //         //把nextProps.isSearch变回去
        //         mMenu.props.changeIsPersonCenter();
        //     }
        // }
    },

    /**
     * 渲染用户最新消息列表
     */
    showMessageData(flag) {
        if (flag) {
            this.props.toWhichCharObj();
        }
        //不管是第一次进来通过get还是消息过来通过willReceiveProps，都会经过这里
        //在这里对比messageData的不同，决定给哪一些加圆点
        userMessageData.splice(0);
        messageData.forEach(function (message) {
            var fromUser = message.fromUser;
            var colUid = fromUser.colUid;
            var contentArray = message.contentArray;
            var messageType = message.messageToType;
            var toChatGroup = message.toChatGroup;
            var noomReadState = message.noomReadState;   //noomReadState为0是未读  1是已读   如果是0就要显示红点
            if (!noomReadState) {
                var redPoint = 0;
            } else {
                var redPoint = noomReadState;
            }
            // var isNew = message.isNew;
            // var tipPoint;
            // if(isNew == true){
            //     tipPoint = <b className="mes_alert_show mes_opt" id={colUid}></b>;
            // }else{
            //     tipPoint = null;
            // }
            var badgeCount = 0;
            if (isEmpty(contentArray) == false && contentArray.length > 0) {
                // 只显示具有消息内容的数据,且只显示最后一条消息记录
                var lastContentInfo = contentArray[contentArray.length - 1];
                var lastContentText = lastContentInfo.content;
                var lastCreateTime = lastContentInfo.createTime;
                var imgTag;
                if (messageType == 1) {
                    //个人栏
                    imgTag = <div>
                                <span className="antnest_user">
                                    <img src={fromUser.avatar + '?' + SMALL_IMG}
                                         height="38"></img>
                                    {/*{tipPoint}*/}
                                    {/*<b className="mes_alert_show mes_opt" id={colUid}></b>*/}
                                </span>
                        <div className="mes_u_l">
                            <div><span className="message_name">{fromUser.userName}</span><span
                                className="time right_ri time_w">{lastCreateTime}</span></div>
                            <div className="message_cont_w">{lastContentText}</div>
                        </div>
                    </div>;
                } else {
                    var arr = toChatGroup.avatar.split("#");
                    var membersCount = arr.length;
                    var groupMemebersPhoto = [];
                    for (var i = 0; i < membersCount; i++) {
                        // var member = toChatGroup.members[i];
                        var memberAvatarTag = <img src={arr[i] + '?' + SMALL_IMG}></img>;
                        groupMemebersPhoto.push(memberAvatarTag);
                        if (i >= 3) {
                            break;
                        }
                    }
                    var groupMemebersPhotoTag = <div
                        className="maaee_group_face upexam_float">{groupMemebersPhoto}</div>;
                    switch (groupMemebersPhoto.length) {
                        case 1:
                            groupMemebersPhotoTag =
                                <div className="maaee_group_face1 upexam_float">{groupMemebersPhoto}</div>;
                            break;
                        case 2:
                            groupMemebersPhotoTag =
                                <div className="maaee_group_face2 upexam_float">{groupMemebersPhoto}</div>;
                            break;
                        case 3:
                            groupMemebersPhotoTag =
                                <div className="maaee_group_face3 upexam_float">{groupMemebersPhoto}</div>;
                            break;
                        case 4:
                            groupMemebersPhotoTag =
                                <div className="maaee_group_face upexam_float">{groupMemebersPhoto}</div>;
                            break;
                    }

                    imgTag = <div>
                        {groupMemebersPhotoTag}
                        <div className="mes_u_l">
                            <div><span className="message_name">{toChatGroup.name}</span><span
                                className="time right_ri time_w">{lastCreateTime}</span></div>
                            <div className="message_cont_w">{lastContentText}</div>
                        </div>
                    </div>;
                }
                var messageContentTag = <Badge className='noomFinish' dot={mMenu.state.badgeShow} count={redPoint}>
                    <div>
                        {imgTag}
                    </div>
                </Badge>;
                var userJson;
                if (messageType == 1) {
                    userJson = {
                        key: colUid,
                        "fromUser": fromUser,
                        messageContent: messageContentTag,
                        "messageType": messageType,
                        "redPoint": redPoint
                    };
                } else {
                    userJson = {
                        key: toChatGroup.chatGroupId,
                        "fromUser": fromUser,
                        messageContent: messageContentTag,
                        "messageType": messageType,
                        "toChatGroup": toChatGroup
                    };
                }
                if (messageType == 1) {
                    if (colUid != parseInt(sessionStorage.getItem("ident")) && colUid != 120024) {
                        //屏蔽群通知者120024
                        userMessageData.push(userJson);
                    }
                } else {
                    userMessageData.push(userJson);
                }
            }
            // if (i == 0) {
            //     if (messageType == 1) {
            //         mMenu.setState({selectRowKey: colUid});
            //     }else{
            //         mMenu.setState({selectRowKey: toChatGroup.chatGroupId});
            //     }
            // }
            // i++;
        })
        mMenu.setState({"userMessageData": userMessageData});

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
            //noomReadState为0是未读  1是已读
            if (messageObj.readState == 0) {
                var noomReadState = 1;
            } else {
                var noomReadState = false
            }


            var isCurrentDay = isToday(messageObj.createTime);
            var createTime;
            if (isCurrentDay) {
                //如果是当天的消息，只显示时间
                createTime = formatHM(messageObj.createTime);
            } else {
                //非当天时间，显示的是月-日
                createTime = formatMD(messageObj.createTime);
            }
            var messageIndex = -1;
            var messageToType = messageObj.toType;
            var contentJson = {"content": content, "createTime": createTime};
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
                messageIndex = mMenu.checkMessageIsExist(colUid);
                //个人消息
                if (messageIndex == -1) {
                    var contentArray = [contentJson];
                    var userJson = {
                        key: colUid,
                        "fromUser": showUser,
                        contentArray: contentArray,
                        "messageToType": messageToType,
                        "noomReadState": noomReadState,
                        // "isNew":true
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
                    messageIndex = mMenu.checkMessageIsExist(messageObj.toChatGroup.chatGroupId);
                    if (messageIndex == -1) {
                        var contentArray = [contentJson];
                        var userJson = {
                            key: chatGroupId,
                            "fromUser": fromUser,
                            contentArray: contentArray,
                            "messageToType": messageToType,
                            "toChatGroup": toChatGroup,
                            "noomReadState": noomReadState,
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
     * 设置当前选中行的背景颜色
     * @param record
     * @param index
     * @returns {string}
     */
    getRowClassName(record, index) {
        if (record.key == mMenu.state.selectRowKey) {
            return "tableRow";
        }
    },

    /**
     * table被点击时的回调
     * record是点击的那个人的信息
     * @param record
     * @param index
     */
    turnToMessagePage(record, index) {
        messageData.forEach(function (v, i) {
            //遍历messageData,去改变他的noomReadState,然后调用渲染方法showMessageData就能够消去红点
            if (v.key == record.key) {
                v.noomReadState = false;
            }
        });
        mMenu.setState({selectRowKey: record.key, badgeShow: false, tableIsClick: true});
        mMenu.props.onUserClick(record);
        noomSelectRowKey = record.key;
        this.showMessageData();
        //根据id找到点击的那一个的b标签,设置它的样式为隐藏
        // var bOpt = document.getElementById(record.key);
        // bOpt.className = 'mes_alert mes_opt';
    },

    render() {
        return (
            <div>
                <div className="menu_til">消息动态</div>
                <Table className="message_menu" showHeader={false} columns={columns}
                       dataSource={mMenu.state.userMessageData}
                       rowClassName={mMenu.getRowClassName}
                       onRowClick={mMenu.turnToMessagePage}
                       pagination={false}
                />
            </div>
        );
    },
});
export default MessageMenu;