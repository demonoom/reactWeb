import React, { PropTypes } from 'react';
import { Form, Icon, Input, Button, message,Tabs,Switch} from 'antd';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
import { doWebService } from '../WebServiceHelper';
import {doWebService_CloudClassRoom} from '../utils/CloudClassRoomURLUtils';
import {SimpleWebsocketConnection} from '../utils/simple_websocket_connection.js';
import {isEmpty,setLocalLanaguage,getMessageFromLanguage, getLocalFromLanguage} from '../utils/utils';
import HeaderComponents from '../components/HeaderComponents';
//国际化
import {IntlProvider, addLocaleData} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';

var code;
var loginComponent;
var loginFailedCount=0;
window.simpleMS=null;
var machineId=null;
const Login = Form.create()(React.createClass({

    getInitialState() {
        loginComponent = this;
        addLocaleData([...en, ...zh]);
        return {
            code: '',
            isValidateCode:false,
            loginFailedCount:0
        };
    },

    componentWillMount() {
        simpleMS = new SimpleWebsocketConnection();
        simpleMS.connect();
        machineId = loginComponent.createMachineId();
    },

    createMachineId() {
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

    createCode(){
        code = "";
        var codeLength = 4; //验证码的长度
        var codeChars = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); //所有候选组成验证码的字符，当然也可以用中文的
        for(var i = 0; i < codeLength; i++)
        {
            var charNum = Math.floor(Math.random() * 52);
            code += codeChars[charNum];
        }
        loginComponent.setState({code:code});
    },

    componentDidMount(){
        var _this = this;
        //true：使用英文显示   false：使用中文显示
        if (isEmpty(sessionStorage.getItem("language"))) {
            setLocalLanaguage(false);
        }
        _this.getLoginTeachSystemEwm();
        _this.createCode();
        simpleMS.msgWsListener = {
            onError: function (errorMsg) {

            }, onWarn: function (warnMsg) {

            }, onMessage: function (info) {
                var command = info.command;
                if (isEmpty(command) == false && command == "allowLoginTeachSystem") {
                    var data = info.data;
                    var uuid = data.uuid;
                    var user = data.user;
                    if(uuid == machineId){
                        _this.loginSystem(user);
                    }
                    console.log("data==============>"+data);
                }
            }
        };
    },

    doWebService : function(data,listener) {
        var service = this;
        //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
        this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
        if (service.requesting) {
            return;
        }
        service.requesting = true;
        $.post(service.WEBSERVICE_URL, {
            params : data
        }, function(result, status) {
            service.requesting = false;
            if (status == "success") {
                listener.onResponse(result);
            } else {
                listener.onError(result);
            }
        }, "json");
    },

    loginValidate(userName,userPassword){
        var _this = this;
        var param = {
            "method":'login',
            "username":userName,
            "password":userPassword
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                var response = ret.response;
                if(ret.msg=="用户不存在！"|| ret.msg=="对不起，密码不正确！"){
                    loginFailedCount++;
                    loginComponent.setState({loginFailedCount:loginFailedCount});
                    message.error("用户名或密码错误,请重新输入！");
                }else if(ret.msg=="调用成功"){
                    if(response.colValid!=1){
                        loginFailedCount++;
                        loginComponent.setState({loginFailedCount:loginFailedCount});
                        message.error("用户已被禁用,请联系管理员！");
                    }else if(response.colUtype!="TEAC" && response.colUtype!="STUD" ){
                        loginFailedCount++;
                        loginComponent.setState({loginFailedCount:loginFailedCount});
                        message.error("用户身份不正确,请重新输入！");
                    }else{
                        sessionStorage.setItem("pd",userPassword)
                        _this.loginSystem(response);
                    }
                }
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },

    loginSystem(user){
        console.log(user);
        console.log('user');
        loginComponent.setState({loginFailedCount:0});
        sessionStorage.setItem("ident", user.colUid);
        var loginUserJson = JSON.stringify(user);
        sessionStorage.setItem("loginUser",loginUserJson);
        sessionStorage.setItem("loginPassword",user.colPasswd);
        // var machineId = loginComponent.createMachineId();
        // sessionStorage.setItem("machineId",machineId);
        localStorage.setItem("machineId",machineId);
        loginComponent.getHistoryAccessPointId(user.colUid);
        if(user.colUtype == "TEAC"){
            location.hash="MainLayout";
        }else{
            location.hash="StudentMainLayout";
        }
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var param = {
            "method": 'AntTeacherLogin',
            "colAccount": user.colAccount,
            "colPasswd": user.colPasswd,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                sessionStorage.setItem("cloudClassRoomUser",JSON.stringify(response));
            },
            onError: function (error) {
                message.error(error);
            }
        });
        window.simpleMS = null;
    },

    findUserByAccount(){
        var _this = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var param = {
            "method": 'AntTeacherLogin',
            "colAccount": loginUser.colAccount,
            "colPasswd": sessionStorage.getItem("loginPassword"),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                sessionStorage.setItem("cloudClassRoomUser",JSON.stringify(response));
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     *语言切换的回调
     */
    checkoutLanguage(checked) {
        //在此处切换isDefineLanguage值
        setLocalLanaguage(checked);
        location.href="/#/login";
    },

    getHistoryAccessPointId(userId){
        var param = {
            "method":'getHistoryAccessPointId',
            "userId":userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                var response = ret.response;
                sessionStorage.setItem("openKeysStr",response);
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        loginComponent.props.form.validateFields((err, values) => {
            var inputCode=values.validateCode;
            if(loginComponent.state.loginFailedCount>2){
                if(inputCode.length <= 0)
                {
                    message.warning("请输入验证码！");
                }
                else if(inputCode.toUpperCase() != loginComponent.state.code.toUpperCase())
                {
                    message.warning("验证码输入有误！");
                    loginComponent.createCode();
                }
                else
                {
                    if (!err) {
                        loginComponent.loginValidate(values.userName,values.password);
                    }
                }
            }else{
                if (!err) {
                    loginComponent.loginValidate(values.userName,values.password);
                }
            }
        });
    },

    getLoginTeachSystemEwm(){
        var _this = this;
        var param = {
            "method": 'getLoginTeachSystemEwm',
            "uuid":machineId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var loginImg = <img src={response}/>;
                _this.setState({loginImg});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    render() {
        var defaultChecked;
        var userNameTip='Username';
        var passwordTip='password';
        if (isEmpty(localStorage.getItem("language"))) {
            //true是英文，false是中文
            //localStorage中没有语言，才用浏览器默认语言
            if (navigator.language == 'zh-CN') {
                defaultChecked = false;
                userNameTip = "请输入用户名";
                passwordTip='请输入密码';
            } else {
                defaultChecked = true;
                userNameTip = "Username";
                passwordTip='password';
            }
        } else {
            //根据localStorage中的来设置
            var lan = localStorage.getItem("language");
            if (lan == "zh-CN") {
                defaultChecked = false;
                userNameTip = "请输入用户名";
                passwordTip='请输入密码';
            } else {
                defaultChecked = true;
                userNameTip = "Username";
                passwordTip='password';
            }
        }

        var messageFromLanguage = getMessageFromLanguage();
        var local = getLocalFromLanguage();
        const { getFieldDecorator } = loginComponent.props.form;
        const formItemLayout = {
            labelCol: { span: 0 },
            wrapperCol: { span: 24 },
        };

        var codeDiv;
        if(loginComponent.state.loginFailedCount>=2){
            codeDiv = <FormItem {...formItemLayout} >
                {getFieldDecorator('validateCode',{
                    rules: [{ required: true, message: '请输入验证码!' }],
                })(

                    <Input  placeholder="请输入验证码" className="yz_input" />

                )}
                {


                    <div className="code" id="checkCode" onClick={loginComponent.createCode} >{loginComponent.state.code}</div>

                }
            </FormItem>;
        }else{
            codeDiv="";
        }

        return (
            <IntlProvider
                locale={local}
                messages={messageFromLanguage}
            >
                <div className="login_bg">
                    <div className="login_logo"><img src={('../../src/components/images/maaee.png')}/></div>
                    <div className="login_bg_cont">
                        <div className="login_bg_content">
                            <div className="card-container">
                                <Tabs type="card">
                                    <TabPane tab={<FormattedMessage
                                        id='scanLogin'
                                        description='扫码登录'
                                        defaultMessage='扫码登录'
                                    />} key="1">
                                        {this.state.loginImg}
                                        <div className="login_ewm">
                                            <FormattedMessage
                                                id='pleaseLogin'
                                                description='请使用小蚂蚁移动教学扫二维码登录'
                                                defaultMessage='请使用小蚂蚁移动教学扫二维码登录'
                                            />
                                        </div>
                                    </TabPane>
                                    <TabPane tab={<FormattedMessage
                                        id='PasswordLogin'
                                        description='密码登录'
                                        defaultMessage='密码登录'
                                    />}
                                             key="2">
                                        <Form onSubmit={loginComponent.handleSubmit} className="login-form">
                                            <FormItem {...formItemLayout} >
                                                {getFieldDecorator('userName',{
                                                    rules: [{ required: true, message: userNameTip }],
                                                })(
                                                    <Input addonBefore={<Icon type="user" />} placeholder={userNameTip}/>
                                                )}
                                            </FormItem>
                                            <FormItem {...formItemLayout} >
                                                {getFieldDecorator('password',{
                                                    rules: [{ required: true, message: passwordTip }],
                                                })(
                                                    <Input addonBefore={<Icon type="lock" />} type="password" placeholder={passwordTip}/>
                                                )}
                                            </FormItem>
                                            {codeDiv}

                                            <div className="login_buton">
                                                <Button type="primary" htmlType="submit" className="login-form-button login_buton">
                                                    <FormattedMessage
                                                        id='login'
                                                        description='登录'
                                                        defaultMessage='登录'
                                                    />
                                                </Button>
                                            </div>

                                        </Form>
                                    </TabPane>

                                </Tabs>
                                <div className="switchStyle">
                                    <Switch checkedChildren="En" unCheckedChildren="中"
                                         onChange={this.checkoutLanguage}
                                        defaultChecked={defaultChecked}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </IntlProvider>
        );
    },
}));

export default Login;
<script type="text/javascript">
    tabs_takes.init("tabs");
</script>