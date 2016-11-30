import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

var subjectForm;
var editSchuldeInfo;
var editSchuldeId="";
var editSchuldeName="";

const TeachingComponents = React.createClass({

  getInitialState() {
    subjectForm = this;
    return {
      visible: false,
      optType:'add',
      editSchuldeId:editSchuldeId,
      editSchuldeName:editSchuldeName,
      loading: false,
    };
  },

  doWebService : function(data,listener) {
    var service = this;
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

  saveSchedule(ident,scheduleName){
    var param = {
      "method":'addTeachSchedule',
      "ident":ident,
      "title":scheduleName
    };
    subjectForm.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response.colTsId!=null){
            alert("教学进度添加成功");
        }else{
            alert("教学进度添加失败");
        }
        subjectForm.props.callbackParent();
        subjectForm.setState({ visible: false });
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  //修改教学进度
  updateSchedule(ident,scheduleName){
    var param = {
      "method":'updateTeachSchedule',
      "ident":ident,
      "scheduleId":subjectForm.state.editSchuldeId,
      "title":scheduleName
    };
    subjectForm.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
          alert("教学进度修改成功");
        }else{
          alert("教学进度修改失败");
        }
        subjectForm.props.callbackParent();
        subjectForm.setState({ visible: false });
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    var ident = sessionStorage.getItem("ident");
    var scheduleName = subjectForm.refs.editSchuldeName.refs.input.value;
    // alert("scheduleName:"+scheduleName);
    if(subjectForm.state.optType=="edit"){
      // alert("edit:"+scheduleName);
      subjectForm.updateSchedule(ident,scheduleName);
    }else{
      // alert("add:"+scheduleName);
      subjectForm.saveSchedule(ident,scheduleName);
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
      subjectForm.setState({visible: true,optType:openType,editSchuldeId:"",editSchuldeName:""});
    }else {
      var editInfoArray = editSchuldeInfo.split("#");
      if(editInfoArray!=null && editInfoArray.length!=0){
        editSchuldeId = editInfoArray[0];  //待修改的教学进度id
        editSchuldeName = editInfoArray[1]; //待修改的教学进度名称
        subjectForm.setState({visible: true,optType:openType,editSchuldeId:editSchuldeId,editSchuldeName:editSchuldeName});
      }
    }
  },

  handleEmail: function(val){
    subjectForm.props.callbackParent();
    subjectForm.setState({ visible: false });
  },

  render() {
    return (
          <Modal
              visible={subjectForm.state.visible}
              title="教学进度"
              onCancel={subjectForm.handleCancel}
              className="modol_width"
              footer={[
                <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectForm.handleSubmit}  >确定</Button>,
                <Button type="ghost" htmlType="reset" className="login-form-button" onClick={subjectForm.handleCancel} >取消</Button>
              ]}
          >
              <Form horizontal>

                <FormItem
                  label={(
                    <span>
                      名称&nbsp;
                    </span>
                  )}
                  hasFeedbac
                >
                  <div style={{ marginBottom: 16 }}>
                    <Input ref="editSchuldeName" defaultValue={subjectForm.state.editSchuldeName} />
                  </div>
                </FormItem>
              </Form>
          </Modal>
    );
  },
});
export  default TeachingComponents;

