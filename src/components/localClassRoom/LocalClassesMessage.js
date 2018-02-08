import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, message, Row,Col,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
const { TextArea } = Input;

/**
 * 本地课堂组件
 */

const LocalClassesMessage = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
        };
    },

    componentDidMount(){
        this.listenClassMessage();
    },

    listenClassMessage(){
        var _this = this;
        var connection = _this.props.connection;
        connection.clazzWsListener = {

            onError: function (errorMsg) {
                //强制退出课堂
                message.error(errorMsg);
                // window.close();
            },

            onWarn: function (warnMsg) {
                message.warn(warnMsg);
            },
            // 显示消息
            onMessage: function (info) {
                console.log("=========课堂信息==========="+info);
                var data = info.data;
                switch (info.command) {
                    case'simpleClassDanmu': // 弹幕
                        var message = info.data.message;
                        console.log("simpleClassDanmu:"+message);
                        break;

                    case 'classDanmu':
                        var message = info.data.message;
                        console.log("classDanmu:"+message);
                        break;
                }
            }
        };
    },

    componentDidMount() {

    },

    handleScrollType(e) {
        //scrollType = "defined";
    },

    handleScroll(e) {
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
        // isSend = true;
        // this.messageSendByType(sendType);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        var messageTagArray = [];
        var messageTag = <li className="right" style={{'textAlign': 'right'}}>
            <div className="u-name">
                <span>zhangsan</span>
                <span className="cart_time">2018-2-7</span>
            </div>
            <div className="talk-cont">
                <span className="name"></span>
                <div className="talk_bubble_box">
                                    <span className="borderballoon">消息内容
                                        <i className="borderballoon_dingcorner_le_no"></i>
                                    </span>
                </div>
            </div>
        </li>;
        messageTagArray.push(messageTag);

        return (
            <div>
                <div id="personTalk" style={{height:'900px',marginLeft:'18px'}}>
                    <div className="group_talk 44" id="groupTalk"
                         onMouseOver={this.handleScrollType.bind(this, Event)}
                         onScroll={this.handleScroll}>
                        <ul>
                            {/*消息内容主体*/}
                            {messageTagArray}
                        </ul>
                    </div>
                    <Row className="group_send">
                        <Col className="group_send_talk">
                            <Input />
                        </Col>
                        <Col className="group_send_btn">
                            <Button value="groupSend" onClick={this.sendMessage}>
                                <div>发送<p className="password_ts">(Enter)</p></div>
                            </Button>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
});

export default LocalClassesMessage;
