/**
 * Created by madapeng on 17-4-5.
 */
import {message, Input, Col, Row, Button, Breadcrumb, Icon} from 'antd';

import React from 'react';
import {doWebService} from '../WebServiceHelper';

class ResetStudentAccountKey extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // define this.state in constructor
            ident: sessionStorage.getItem("ident"),
            visible: true,
            placeholder: '请输入要重置密码的帐号！',
            method: 'getUserFavorite',
            data: [],
            value: '',
            toUserAccount: '',
            toUserAccountData: {}
        };
        this.templatehtml= ''
        this.searhAccess = this.searhAccess.bind(this);
        this.resetUserPassword = this.resetUserPassword.bind(this);

    }

    searhAccess() {
        var _this = this;
        var param = {
            "method": 'getUserByAccount',
            "account": this.refs['input1'].value,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    if (!res.response) {

                        message.warn('没有此学生或工号错误！');
                    }else{

                    _this.setState({toUserAccountData: res.response,toUserAccount: res.response.colUid})
                    }
                } else {
                    message.error(res.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    resetUserPassword() {
       
        var _this = this;
        var param = {
            "method": 'resetUserPassword',
            "operatorUserId": this.state.ident,
            "toBeChangeUserId": this.state.toUserAccount,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    _this.setState({toUserAccountData:[],toUserAccount: ""});
                    message.info("更换成功！");
                } else {
                    message.error(res.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    getTemplate() {

        if (this.state.toUserAccount) {
            this.templatehtml = <div id="template">
			<div className="ques_list_qus">
                <div className="password_cow ant-row ant-form-item">
                    <span className="ant-form-item-control attention_img"><img  src={this.state.toUserAccountData.avatar} width="40dp" height="40dp" /></span>
                    <span className="ant-form-item-control_2">{this.state.toUserAccountData.userName}</span>
                    <span className="ant-form-item-control_3 right_ri"><Button type="primary" className="reset_btn" onClick={this.resetUserPassword } >重置密码</Button></span>
                </div>
				</div>
            </div>;
        }

    }

    render() {

        this.getTemplate();

        return (<div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">找回学生密码</Breadcrumb.Item>
                </Breadcrumb>
                <Row style={{height: 100}}/>
                 <div className="ques_list_new">
                        <div className="password_cow ant-row ant-form-item">
						    <span className="right_look">查找账号：</span>
							<span className="reset_wi"><input className="ant-input reset_wi_hei" ref="input1" type="text" placeholder={this.state.placeholder} /></span>
							<span className="right_ri"><Button type="primary" icon="search" className="reset_btn" onClick={this.searhAccess}>Search</Button></span>
						</div>
                        
                </div>
                <Row>
                    <Col span={3}></Col>
                    <Col span={18}>
                        { this.templatehtml }
                    </Col>
                    <Col span={3}></Col>

                 </Row>
            </div>
        );
    }
}

export default ResetStudentAccountKey;




