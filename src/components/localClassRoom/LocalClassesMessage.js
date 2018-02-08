import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, message, Row,Col,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
const { TextArea } = Input;

/**
 * 本地课堂组件
 */
var connection = null;
var parentMs = null;
const LocalClassesMessage = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            barrageMessageContent:''
        };
    },

    componentDidMount(){
        parentMs=this.props.ms;
        this.listenClassMessage();
    },

    componentWillReceiveProps(nextProps){
        parentMs=nextProps.ms;
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
            },
        }
    },

    componentDidMount() {

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
            var loginUser = {colUid:24491,colAccount:'TE24491'};
            var messageToType="3";
            var vid = sessionStorage.getItem("vid");
            var userId = sessionStorage.getItem("userId");
            var messageJson = {
                'content': this.state.barrageMessageContent, "createTime": createTime, 'fromUser': loginUser,
                "toId": vid, "command": "message", "hostId": userId,
                "uuid": uuid, "toType": messageToType, "attachment": '',
            };
            var commandJson = {"command": "message", "data": {"message": messageJson}};
            parentMs.send(commandJson);
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
        var _this = this;
        var messageTagArray = [];
        var messageTag = <li style={{'textAlign': 'right'}}>
            <div>
                <span>zhangsan</span>
                <span>2018-2-7</span>
            </div>
            <div>
                <span></span>
                <div>
                    <span>消息内容
                           <i></i>
                    </span>
                </div>
            </div>
        </li>;
        messageTagArray.push(messageTag);

        return (
            <div>
                <div id="personTalk" style={{height:'900px',marginLeft:'18px'}}>
                    <div>
                        <ul>
                            {/*消息内容主体*/}
                            {messageTagArray}
                        </ul>
                    </div>
                    <div>
                        <div>
                            <Input value={this.state.barrageMessageContent} onChange={this.messageContentChange}/>
                        </div>
                        <div>
                            <Button onClick={this.sendBarrageMessage}>
                                <div>发送<p >(Enter)</p></div>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default LocalClassesMessage;
