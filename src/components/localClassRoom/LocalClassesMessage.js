import React, {PropTypes} from 'react';
import {isEmpty,showLargeImg} from '../../utils/utils';
import {getLocalTime,MESSAGE_TO_TYPE_ONlINE_CLASS} from '../../utils/Const';
import {Button, message, Row,Col,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
const { TextArea } = Input;

/**
 * 本地课堂组件
 */
var parentMs = null;
var messageLiArray=[];
var newMessageArray=[];
var imgArr=[];
var scrollType = "auto";
const LocalClassesMessage = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            barrageMessageContent:'',
            newMessageArray:[]
        };
    },

    componentDidMount(){
        parentMs=opener.window.ms==null?this.props.ms:opener.window.ms;
        console.log("parentMs at componentDidMount==>"+parentMs);
        this.listenClassMessage();
    },

    componentWillReceiveProps(nextProps){
        parentMs=opener.window.ms==null?nextProps.ms:opener.window.ms;
        console.log("parentMs at componentWillReceiveProps==>"+parentMs);
        this.listenClassMessage();
    },


    componentDidUpdate(){
        var gt = $('#groupTalk');
        if(scrollType=="auto"){
            gt.scrollTop(parseInt(gt[0].scrollHeight));
        }
    },

    listenClassMessage(){
        var _this = this;
        parentMs.msgWsListener = {
            onError: function (errorMsg) {
                message.error(errorMsg);
            }, onWarn: function (warnMsg) {
                message.warning(warnMsg);
            }, onMessage: function (info) {
                console.log("-------------------------->"+info);
                var infoCommand = info.command;
                if(infoCommand == "message"){
                    var messageData = info.data.message;
                    var messageCommand = messageData.command;
                    var messageToType = messageData.toType;
                    if(messageCommand == "message" && messageToType == MESSAGE_TO_TYPE_ONlINE_CLASS){
                        var messageFrom = "receive";
                        if(scrollType=="defined"){
                            var fromUser = messageData.fromUser;
                            if(fromUser.colUid != _this.state.loginUser.colUid){
                                newMessageArray.push(messageData);
                            }
                        }else{
                            newMessageArray.splice(0);
                        }
                        //向服务器发送响应，表示已经读取服务器的消息
                        var receivedCommand = {
                            "command": "message_read",
                            "data": {"messageUUID": messageData.uuid}
                        };
                        parentMs.send(receivedCommand);
                        _this.buildMessageLiArray(messageData,messageFrom);
                    }
                    _this.setState({newMessageArray});
                }
            }
        }
    },

    /**
     * 查看大图片
     * @param selectedRowKeys
     */
    noomWatchImg(id) {
        document.getElementById(id).click();
    },

    buildMessageLiArray(messageData,messageFrom){
        var content = messageData.content;
        var createTime = getLocalTime(messageData.createTime);
        var fromUser = messageData.fromUser;
        var avatar=null;
        if(isEmpty(fromUser.avatar)){
            avatar = <img src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" width="60" height="60" className="green" />;
        }else{
            avatar = <img src={fromUser.avatar} width="60" height="60" className="green" />;
        }
        var uuid = messageData.uuid;
        if(isEmpty(messageData.attachment)==false){
            var attachmentObj = messageData.attachment;
            if(attachmentObj.type == 1){
                var address = attachmentObj.address;
                content = <span>
                    <img src={address} alt={address} style={{width:'20%',height:'20%'}}
                         onClick={this.noomWatchImg.bind(this, address)} />
                </span>
                var imgObj = <span className="topics_zan"><img id={address}
                                                            className="topics_zanImg"
                                                            onClick={showLargeImg}
                                                            src={address}
                                                            alt={address}/>
                            </span>;
                imgArr.push(imgObj);
            }
        }
        var messageTag = null;
        if(fromUser.colUid == sessionStorage.getItem("userId")){
            messageTag = <li className="flex classroom_direction">
                <div className="classroom_user">{avatar}</div>
                <div className="class_talk_info_right">
                    <div className="classroom_name"><span className="classroom_time">{createTime}</span><span className="add_out">{fromUser.userName}</span></div>
                    <div className="classroom_info">{content}</div>
                </div>
            </li>;
        }else{
            messageTag = <li className="flex">
                <div className="classroom_user">{avatar}</div>
                <div className="class_talk_info">
                    <div className="classroom_name"><span>{fromUser.userName}</span><span className="add_out classroom_time">{createTime}</span></div>
                    <div className="classroom_info_left">{content}</div>
                </div>
            </li>;
        }
        messageLiArray.push(messageTag);
        this.setState({messageLiArray});
    },


    /**
     *发送文字信息的回调
     **/
    sendBarrageMessage(e) {
        if (isEmpty(this.state.barrageMessageContent) == false) {
            var uuid = this.createUUID();
            var createTime = (new Date()).valueOf();
            var messageToType=MESSAGE_TO_TYPE_ONlINE_CLASS;
            var vid = sessionStorage.getItem("vid");
            var userId = sessionStorage.getItem("userId");
            var messageJson = {
                'content': this.state.barrageMessageContent, "createTime": createTime, 'fromUser': this.state.loginUser,
                "toId": vid, "command": "message", "hostId": userId,
                "uuid": uuid, "toType": messageToType, "attachment": '',
            };
            var fromUser = this.state.loginUser;
            var commandJson = {"command": "message", "data": {"message": messageJson},fromUser};
            parentMs.send(commandJson);
            //每次当前用户发送消息时，设置页面的滚动方式为自动滚动
            scrollType = "auto";
            //因为当前用户自己发消息时，会直接刷新到消息区域的底部，所以不存在新消息通知，这里将新消息通知的数据清空
            newMessageArray.splice(0);
            this.setState({"barrageMessageContent":'',newMessageArray:[]});
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

    messageContentChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var barrageMessageContent = target.value;
        this.setState({barrageMessageContent});
    },

    /**
     * 本地课堂消息区域滚动响应函数
     * @param e
     */
    handleScroll(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var scrollTop = target.scrollTop;
        var scrollHeight = target.scrollHeight;
        var clientHeight = target.clientHeight;
        if (scrollHeight - scrollTop == clientHeight) {
            scrollType = "auto";
            console.log("到底了");
        }else{
            scrollType = "defined";
            console.log(scrollHeight - scrollTop);
        }
    },

    /**
     * 直接滚动到页面底部
     */
    scrollToBottom(){
        var gt = $('#groupTalk');
        gt.scrollTop(parseInt(gt[0].scrollHeight));
        newMessageArray.splice(0);
        this.setState({newMessageArray:[]});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var noDataTipImgObj = null;
        if(isEmpty(this.state.messageLiArray)){
            noDataTipImgObj = <img className="noDataTipImg" width={'240'} src={require('../images/noDataTipImg.png')}/>;
        }
        var newMessageTip=null;
        var newMessageLength = this.state.newMessageArray.length;
        //如果处于自定义滚动状态，且存在新消息，则提示存在N条新消息
        if(scrollType=="defined" && newMessageLength != 0){
            newMessageTip = <div><span onClick={this.scrollToBottom}>有{newMessageLength}条新消息</span></div>
        }
        return (
                <div id="personTalk" className="class_personTalk">
                    <h3 className="classroom_h3">互动讨论</h3>
                    {newMessageTip}
                    {noDataTipImgObj}
                    <ul className="class_talk_top" id="groupTalk" onScroll={this.handleScroll}>
                        {/*消息内容主体*/}
                        {this.state.messageLiArray}
                    </ul>
                    <ul style={{display: 'none'}}>
                        <li className="imgLi">
                            {imgArr}
                        </li>
                    </ul>
                    <div className="class_talk_bottom">
                        <Input className="class_send_input" value={this.state.barrageMessageContent} onChange={this.messageContentChange}/>
                        <Button onClick={this.sendBarrageMessage} className="class_send_btn">
                            发送
                        </Button>
                    </div>
                </div>
        );
    }
});

export default LocalClassesMessage;
