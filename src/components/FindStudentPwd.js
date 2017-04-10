/**
 * Created by madapeng on 17-4-5.
 */
import {  message, Input,Col,Row,Button,Breadcrumb,Icon} from 'antd';

import React from 'react';
import {doWebService} from '../WebServiceHelper';

class FindStudentPwd extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // define this.state in constructor
            ident: sessionStorage.getItem("ident"),
            visible: true,
            placeholder:'请输入要重置密码的帐号！',
            method: 'getUserFavorite',
            data: [],
            value:''
        };
    }

    SearhAccess( ) {
        debugger
        message.info(this.refs.input1.value)
    }

    render() {
        return (<div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">找回学生密码</Breadcrumb.Item>
                </Breadcrumb>
                <Row style={{height: 100}}/>
                <Row>
                    <Col xs={{span: 2, offset: 1}} lg={{span: 6, offset: 2}}></Col>
                    <Col xs={{span: 12, offset: 1}} lg={{span: 6, offset: 2}}>
                        <Input placeholder={this.state.placeholder} ref="input1"
                               onPressEnter={this.SearhAccess.bind(this)}/>
                    </Col>
                    <Col xs={{span: 4, offset: 1}} lg={{span: 6, offset: 2}}>
                        <Button type="primary" icon="search" onClick={this.SearhAccess.bind(this)}>Search</Button>
                    </Col>
                    <Col xs={{span: 2, offset: 1}} lg={{span: 6, offset: 2}}></Col>
                </Row>
            </div>
        );
    }
}

export default FindStudentPwd;
