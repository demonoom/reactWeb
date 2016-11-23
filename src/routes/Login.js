import React, { PropTypes } from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
const FormItem = Form.Item;

var code;
const Login = Form.create()(React.createClass({

    getInitialState() {
        return {
            code: '',
        };
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
        this.setState({code:code});
    },

    componentDidMount(){
        this.createCode();
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
        this.doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                var response = ret.response;
                if(ret.msg=="用户不存在！"|| ret.msg=="对不起，密码不正确！"){
                    alert("用户名或密码错误,请重新输入！");
                }else if(ret.msg=="调用成功"){
                    if(response.colValid!=1){
                        alert("用户已被禁用,请联系管理员！");
                    }else if(response.colUtype!="TEAC"){
                        alert("用户身份不正确,请重新输入！");
                    }else{
                        sessionStorage.setItem("ident", response.colUid);
                        location.hash="MainLayout";
                    }
                }
            },
            onError : function(error) {
                alert(error);
            }
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            var inputCode=values.validateCode;
            if(inputCode.length <= 0)
            {
                alert("请输入验证码！");
            }
            else if(inputCode.toUpperCase() != this.state.code.toUpperCase())
            {
                alert("验证码输入有误！");
                this.createCode();
            }
            else
            {
                if (!err) {
                    //console.log('Received values of form: ', values.userName+"\t"+values.password+"\t"+values.validateCode);
                    this.loginValidate(values.userName,values.password);
                }
            }
        });
    },
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 16 },
        };
        return (
            <div className="login_bg">
			<div className="login_logo"><img src={('../../src/components/images/maaee.png')}/></div>
			<div className="login_bg_cont">
				<div className="login_duxing"></div>
			 	<div className="login_bg_content">
					<div className="login_welcome">欢迎登录</div>
						<Form onSubmit={this.handleSubmit} className="login-form">
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
							<FormItem {...formItemLayout} label="验证码">
								{getFieldDecorator('validateCode',{
                                    rules: [{ required: true, message: '请输入验证码!' }],
                                })(
									
									<Input  placeholder="请输入验证码" className="yz_input" />
									
								)}
								{

										
										<div className="code" id="checkCode" onClick={this.createCode} >{this.state.code}</div>
	
									}
							</FormItem>
		
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
