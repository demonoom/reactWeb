import React, { PropTypes } from 'react';
import { Modal, Button ,message} from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { doWebService } from '../WebServiceHelper';

var subjectForm;
var editSchuldeId="";
var editSchuldeName="";

const TeachingComponents = React.createClass({

  getInitialState() {
    subjectForm = this;
    return {
      visible: false,
      optType:'add',
      schuldeId:editSchuldeId,
      schuldeName:editSchuldeName,
      loading: false,
    };
  },

  saveSchedule(ident,scheduleName){
    var param = {
      "method":'addTeachSchedule',
      "ident":ident,
      "title":scheduleName
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response.colTsId!=null){
          // alert("备课计划添加成功");
          message.success("备课计划添加成功");
        }else{
          // alert("备课计划添加失败");
          message.error("备课计划添加失败");
        }
        subjectForm.props.callbackParent();
        subjectForm.setState({ visible: false });
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }
    });
  },

  //修改备课计划
  updateSchedule(ident,scheduleName){
    var param = {
      "method":'updateTeachSchedule',
      "ident":ident,
      "scheduleId":subjectForm.state.schuldeId,
      "title":scheduleName
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
          // alert("备课计划修改成功");
          message.success("备课计划修改成功")
        }else{
          // alert("备课计划修改失败");
          message.error("备课计划修改失败");
        }
        subjectForm.props.callbackParent();
        subjectForm.setState({ visible: false });
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    var ident = sessionStorage.getItem("ident");
    var scheduleName = subjectForm.refs.editSchuldeNameInput.refs.input.value;
    if(this.isEmpty(scheduleName)){
        message.warning("请输入备课名称！");
    }else{
        if(subjectForm.state.optType=="edit"){
          subjectForm.updateSchedule(ident,scheduleName);
        }else{
          subjectForm.saveSchedule(ident,scheduleName);
        }
    }
  },
  handleCancel(e) {
    subjectForm.setState({ visible: false });
  },

  showModal(openType,editSchuldeInfo) {
    if(openType=="add"){
      editSchuldeInfo="";
    }
    if(editSchuldeInfo==null || editSchuldeInfo==""){
      subjectForm.setState({visible: true,optType:openType,schuldeId:"",schuldeName:""});
      subjectForm.refs.editSchuldeNameInput.refs.input.value="";
    }else {
      var editInfoArray = editSchuldeInfo.split("#");
      if(editInfoArray!=null && editInfoArray.length!=0){
        editSchuldeId = editInfoArray[0];  //待修改的备课计划id
        editSchuldeName = editInfoArray[1]; //待修改的备课计划名称
        subjectForm.setState({visible: true,optType:openType,schuldeId:editSchuldeId,schuldeName:editSchuldeName});
        subjectForm.refs.editSchuldeNameInput.refs.input.value=editSchuldeName;
      }
    }

  },

  handleEmail: function(val){
    subjectForm.props.callbackParent();
    subjectForm.setState({ visible: false });
  },

  //系统非空判断
  isEmpty(content){
    if(content==null || content=="" || typeof(content)=="undefined"){
      return true;
    }else{
      return false;
    }
  },

  render() {
    return (
        <Modal
            visible={subjectForm.state.visible}
            title="备课计划"
            onCancel={subjectForm.handleCancel}
            className="modol_width"
            transitionName=""  //禁用modal的动画效果
            maskClosable={false} //设置不允许点击蒙层关闭
            footer={[
              <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectForm.handleSubmit}  >确定</Button>,
              <Button type="ghost" htmlType="reset" className="login-form-button" onClick={subjectForm.handleCancel} >取消</Button>
            ]}
        >
          <div className="ant-form-item">
            <Row>
              <Col span={6} className="right_look">
                <span>名称：</span>
              </Col>
              <Col span={14}><span><Input ref="editSchuldeNameInput" placeholder="请输入备课计划名称" defaultValue={subjectForm.state.schuldeName} /></span></Col>
            </Row>
          </div>
        </Modal>
    );
  },
});
export  default TeachingComponents;

