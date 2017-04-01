import React, { PropTypes } from 'react';
import { Form, Icon, Input, Button, Checkbox,message } from 'antd';
const FormItem = Form.Item;
import { doWebService } from '../WebServiceHelper';

var code;
var loginComponent;
var loginFailedCount=0;
const Login = Form.create()(React.createClass({

    getInitialState() {
        loginComponent = this;
        return {
            code: '',
            isValidateCode:false,
            loginFailedCount:0,
        };
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
        //var checkCode = document.getElementById("checkCode");
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
        loginComponent.createCode();
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
                    }else if(response.colUtype!="TEAC"){
                        loginFailedCount++;
                        loginComponent.setState({loginFailedCount:loginFailedCount});
                        message.error("用户身份不正确,请重新输入！");
                    }else{
                        loginComponent.setState({loginFailedCount:0});
                        sessionStorage.setItem("ident", response.colUid);
                        var loginUserJson = JSON.stringify(response);
                        sessionStorage.setItem("loginUser",loginUserJson);
                        var machineId = loginComponent.createMachineId();
                        sessionStorage.setItem("machineId",machineId);
                        loginComponent.getHistoryAccessPointId(response.colUid);
                        location.hash="MainLayout";
                    }
                }
            },
            onError : function(error) {
                message.error(error);
            }
        });
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
    render() {
        const { getFieldDecorator } = loginComponent.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 16 },
        };

        var codeDiv;
        if(loginComponent.state.loginFailedCount>=2){
            codeDiv = <FormItem {...formItemLayout} label="验证码">
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
            <div className="login_bg">
			<div className="login_logo"><img src={('../../src/components/images/maaee.png')}/></div>
			<div className="login_bg_cont">
				<div className="login_duxing"></div>
			 	<div className="login_bg_content">
					<div className="login_welcome">欢迎登录</div>
						<Form onSubmit={loginComponent.handleSubmit} className="login-form">
							<FormItem {...formItemLayout} label="用户名">
								{getFieldDecorator('userName',{
                                    rules: [{ required: true, message: '请输入用户名!' }],
                                })(
									<Input addonBefore={<Icon type="user" />} placeholder="请输入用户名"/>
								)}
							</FormItem>
							<FormItem {...formItemLayout} label="密&nbsp;&nbsp;&nbsp;码">
								{getFieldDecorator('password',{
                                    rules: [{ required: true, message: '请输入密码!' }],
                                })(
									<Input addonBefore={<Icon type="lock" />} type="password" placeholder="请输入密码"/>
								)}
							</FormItem>
                            {codeDiv}

							<div className="login_buton">
								<Button type="primary" htmlType="submit" className="login-form-button login_buton">
									登录
								</Button>
							</div>

						</Form>
						</div>
					</div>
			<div className="login_bottom"></div>
			<div className="login_sun"></div>
            </div>

        );
    },
}));

export default Login;
