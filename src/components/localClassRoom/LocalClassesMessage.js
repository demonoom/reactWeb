import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {getLocalTime} from '../../utils/Const';
import {Button, message, Row,Col,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
const { TextArea } = Input;

/**
 * 本地课堂组件
 */
var parentMs = null;
var messageLiArray=[];
const LocalClassesMessage = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            barrageMessageContent:''
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
                    if(messageCommand == "message" && messageToType == "3"){
                        var messageFrom = "receive";
                        _this.buildMessageLiArray(messageData,messageFrom);
                    }
                }
            }
        }
    },

    buildMessageLiArray(messageData,messageFrom){
        var content = messageData.content;
        var createTime = getLocalTime(messageData.createTime);
        var fromUser = messageData.fromUser;
        var avatar=null;
        if(isEmpty(fromUser.avatar)){
            avatar = <img src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" width="60" height="60" class="green" />;
        }else{
            avatar = <img src={fromUser.avatar} width="60" height="60" class="green" />;
        }
        var uuid = messageData.uuid;
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
        // messageLiArray.splice(0,0,messageTag);
        messageLiArray.push(messageTag);
        this.setState({messageLiArray});
    },

    componentDidMount() {

    },

    componentDidUpdate(){
        var gt = $('#groupTalk');
        gt.scrollTop(parseInt(gt[0].scrollHeight));
    },

    handleScrollType(e) {
    },

    handleScroll(e) {
    },

    /**
     *发送文字信息的回调
     **/
    sendBarrageMessage(e) {
        if (isEmpty(this.state.barrageMessageContent) == false) {
            var uuid = this.createUUID();
            var createTime = (new Date()).valueOf();
            //var loginUser = {colUid:24491,colAccount:'TE24491',userName:'邹长亮'};
            var messageToType="3";
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
            this.setState({"barrageMessageContent":''});
            // this.buildMessageLiArray(messageJson);
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
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
                <div id="personTalk" className="class_personTalk">
                    <h3 className="classroom_h3">互动讨论</h3>
                    <img className="noDataTipImg" width={'240'} src={require('../images/noDataTipImg.png')}/>
                    <ul className="class_talk_top" id="groupTalk">
                        {/*消息内容主体*/}
                        {this.state.messageLiArray}
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
