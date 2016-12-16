import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Menu, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { doWebService } from '../WebServiceHelper';

var userPasswordModify;
const UserPasswordModifyComponents = React.createClass({

  getInitialState() {
    userPasswordModify = this;
    return {
      visible:false,
    };
  },

  //修改备课信息
  modifyUserPassword(){
      var oldPassword = this.refs.oldPassword.refs.input.value;
      var newPassword = this.refs.newPassword.refs.input.value;
      var confirmPassword = this.refs.confirmPassword.refs.input.value;
      if(this.isEmpty(oldPassword) || this.isEmpty(newPassword) || this.isEmpty(confirmPassword)){
        alert("请输入密码!");
      }else if(newPassword != confirmPassword){
        alert("请确保两次输入的新密码一致!");
      }else{
        var param = {
          "method":'changePassword',
          "ident":sessionStorage.getItem("ident"),
          "newPassword":newPassword
        };
        doWebService(JSON.stringify(param), {
          onResponse : function(ret) {
            console.log(ret.msg);
            if(ret.msg=="调用成功" && ret.response==true){
              alert("密码修改成功，请重新登录");
              sessionStorage.removeItem("openKeysStr");
              sessionStorage.removeItem("ident");
              location.hash="Login";
            }else{
              alert("密码修改失败");
            }
            userPasswordModify.setState({ visible: false });
          },
          onError : function(error) {
            alert(error);
          }
        });
      }
  },
  //系统非空判断
  isEmpty(content){
    if(content==null || content=="" || typeof(content)=="undefined"){
      return true;
    }else{
      return false;
    }
  },
  showModal() {
    userPasswordModify.setState({visible: true});
  },

  handleCancel(e) {
    userPasswordModify.setState({ visible: false});
  },

  render() {
    return (
        <Modal
            visible={userPasswordModify.state.visible}
            title="修改密码"
            onCancel={userPasswordModify.handleCancel}
            className="modol_width"
            transitionName=""  //禁用modal的动画效果
            footer={[
              <Button type="primary" htmlType="submit" className="login-form-button" onClick={userPasswordModify.modifyUserPassword}  >确定</Button>,
              <Button type="ghost" htmlType="reset" className="login-form-button" onClick={userPasswordModify.handleCancel} >取消</Button>
            ]}
        >
          <Row className="ant-form-item">
              <Col span={6} className="right_look">原密码：</Col>
              <Col span={14}>
                  <Input ref="oldPassword" />
              </Col>
          </Row>
          <Row className="ant-form-item password_line">
            <Col span={6}></Col>
            <Col span={14} className="password_ts">
              如忘记原密码，请联系系统管理员进行密码重置
            </Col>
          </Row>
          <Row className="ant-form-item password_cow">
            <Col span={6} className="right_look">新密码：</Col>
            <Col span={14}>
              <Input ref="newPassword"/>
            </Col>
          </Row>
          <Row className="ant-form-item password_cow">
            <Col span={6} className="right_look">确认新密码：</Col>
            <Col span={14}>
              <Input ref="confirmPassword"/>
            </Col>
          </Row>

        </Modal>
    );
  },
});
export  default UserPasswordModifyComponents;

