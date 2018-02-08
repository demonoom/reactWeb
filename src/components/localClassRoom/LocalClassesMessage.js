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
        var protocal = eval('(' + "{'command':'simpleClassDanmu','data':{'content':'"+content+"'}}" + ')');
        connection.send(protocal);
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
                            <Input />
                        </div>
                        <div>
                            <Button onClick={this.sendMessage}>
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
