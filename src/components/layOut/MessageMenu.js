import React, {PropTypes, Link} from 'react';
import {Table, Badge} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';

var mMenu;
const columns = [{
    title: 'messageContent',
    dataIndex: 'messageContent',
    key: 'messageContent',
}];

var messageData = [];
var userMessageData = [];
const MessageMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {
            badgeShow: false
        };
    },

    componentDidMount(){
        mMenu.getUserRecentMessages();
    },

    /**
     * 获取用户最新消息列表
     */
    getUserRecentMessages(){
        userMessageData.splice(0);
        messageData.splice(0);
        var propsUserJson = mMenu.props.userJson;
        if(isEmpty(propsUserJson)==false){
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
                if (isEmpty(response) == false || isEmpty(messageData)==false) {
                    //messageData.splice(0);
                    response.forEach(function (e) {
                        //临时处理
                        /*if(e.toType==1){

                        }*/
                        mMenu.setMessageArrayForOnePerson(e);
                    });
                    messageData.forEach(function (message) {
                        var fromUser = message.fromUser;
                        var colUid = fromUser.colUid;
                        var contentArray = message.contentArray;
                        var messageType = message.messageToType;
                        var toChatGroup = message.toChatGroup;
                        if (isEmpty(contentArray) == false && contentArray.length > 0) {
                            // 只显示具有消息内容的数据,且只显示最后一条消息记录
                            var lastContentInfo = contentArray[contentArray.length - 1];
                            var lastContentText = lastContentInfo.content;
                            var lastCreateTime = lastContentInfo.createTime;
                            var imgTag;
                            if (messageType == 1) {
                                imgTag = <div>
                                    <img src={fromUser.avatar} className="antnest_38_img" height="38"></img>
                                    <div>{fromUser.userName}</div>
                                </div>;
                            } else {
                                imgTag = <div>
                                    <img src={toChatGroup.avatar} className="antnest_38_img" height="38"></img>
                                    <div>{toChatGroup.name}</div>
                                </div>;
                            }
                            var messageContentTag = <Badge dot={mMenu.state.badgeShow}>
                                <div>
                                    {imgTag}
                                    <div>{lastContentText}</div>
                                    <div>{lastCreateTime}</div>
                                </div>
                            </Badge>;
                            var userJson;
                            if (messageType == 1) {
                                userJson = {
                                    key: colUid,
                                    "fromUser": fromUser,
                                    messageContent: messageContentTag,
                                    "messageType": messageType
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
                            if(messageType==1){
                                if (colUid != parseInt(sessionStorage.getItem("ident"))) {
                                    userMessageData.push(userJson);
                                }
                            }else{
                                userMessageData.push(userJson);
                            }
                        }
                        if (i == 0) {
                            if (messageType == 1) {
                                mMenu.setState({selectRowKey: colUid});
                            }else{
                                mMenu.setState({selectRowKey: toChatGroup.chatGroupId});
                            }
                        }
                        i++;
                    })
                    mMenu.setState({"userMessageData": userMessageData});
                    if(isEmpty(userMessageData)==false){
                        mMenu.props.onLoad(userMessageData[0]);
                    }
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
    setMessageArrayForOnePerson(messageObj){
        var fromUser = messageObj.fromUser;
        var content = messageObj.content;
        var colUid = fromUser.colUid;
        var createTime = getLocalTime(messageObj.createTime);
        var messageIndex = -1;
        var messageToType = messageObj.toType;
        var contentJson = {"content": content, "createTime": createTime};
        if (messageToType == 1) {
            messageIndex = mMenu.checkMessageIsExist(colUid);
        }else{
            messageIndex = mMenu.checkMessageIsExist(messageObj.toChatGroup.chatGroupId);
        }
        if (messageToType == 1) {
            //个人消息
            if (messageIndex == -1) {
                var contentArray = [contentJson];
                var userJson = {
                    key: colUid,
                    "fromUser": fromUser,
                    contentArray: contentArray,
                    "messageToType": messageToType
                };
                messageData.push(userJson);
            } else {
                messageData[messageIndex].contentArray.push(contentJson);
            }
        } else {
            //群组消息
            var toChatGroup = messageObj.toChatGroup;
            var chatGroupId = toChatGroup.chatGroupId;
            var groupName = toChatGroup.name;
            if (messageIndex == -1) {
                var contentArray = [contentJson];
                var userJson = {
                    key: chatGroupId,
                    "fromUser": fromUser,
                    contentArray: contentArray,
                    "messageToType": messageToType,
                    "toChatGroup": toChatGroup
                };
                messageData.push(userJson);
            } else {
                messageData[messageIndex].contentArray.push(contentJson);
            }
        }

    },

    checkMessageIsExist(userId){
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
    getRowClassName(record, index){
        if (record.key == mMenu.state.selectRowKey) {
            return "tableRow";
        }
    },

    turnToMessagePage(record, index){
        mMenu.setState({selectRowKey: record.key, badgeShow: false});
        mMenu.props.onUserClick(record);
    },

    render() {
        return (
            <div>
                <div className="menu_til">消息动态</div>
                <Table showHeader={false} columns={columns} dataSource={mMenu.state.userMessageData}
                       rowClassName={mMenu.getRowClassName}
                       onRowClick={mMenu.turnToMessagePage}
                />
            </div>
        );
    },
});
export default MessageMenu;