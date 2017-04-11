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
                    _this.setState({toUserAccountData: res.response,toUserAccount: res.response.colAccount})
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
                <div class="ques_list_new">
                    <img   src={this.state.toUserAccountData.avatar} width="40dp" height="40dp" />
                    <span  class="user_name_003">{this.state.toUserAccountData.userName}</span>
                    <Button type="primary"  onClick={this.resetUserPassword } >重置密码</Button>
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
                <Row style={{height: 100}}>
                    <Col xs={{span: 2, offset: 1}} lg={{span: 6, offset: 2}}></Col>
                    <Col xs={{span: 12, offset: 1}} lg={{span: 6, offset: 2}}>
                        <span class="ant-input-wrapper"><input class="ant-input" ref="input1" type="text" placeholder={this.state.placeholder} /></span>
                    </Col>
                    <Col xs={{span: 4, offset: 1}} lg={{span: 6, offset: 2}}>
                        <Button type="primary" icon="search" onClick={this.searhAccess}>Search</Button>
                    </Col>
                    <Col xs={{span: 2, offset: 1}} lg={{span: 6, offset: 2}}></Col>
                </Row>
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




