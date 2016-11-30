import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

var subjectForm;
var editSchuldeInfo;
var editSchuldeId="";
var editSchuldeName="";
const SubjectForm = Form.create()(React.createClass({

  getInitialState() {
    subjectForm = this;
    editSchuldeId="";
    editSchuldeName="";
    subjectForm.initFormInfo();
    return {
      visible: false,
      optType:'add',
      editSchuldeId:editSchuldeId,
      editSchuldeName:editSchuldeName,
    };
  },

  componentWillReceiveProps: function(nextProps) {
    // alert("componentWillUpdate");
    editSchuldeInfo = nextProps.editSchuldeInfo;
    if(editSchuldeInfo==null || editSchuldeInfo==""){
      subjectForm.setState({editSchuldeId:"",editSchuldeName:""});
    }else{
      var editInfoArray = editSchuldeInfo.split("#");
      if(editInfoArray!=null && editInfoArray.length!=0){
        editSchuldeId = editInfoArray[0];  //待修改的教学进度id
        editSchuldeName = editInfoArray[1]; //待修改的教学进度名称
        subjectForm.setState({editSchuldeId:editSchuldeId,editSchuldeName:editSchuldeName});
      }
    }
  },

  initFormInfo(){
    editSchuldeInfo = subjectForm.props.editSchuldeInfo;
    if(editSchuldeInfo==null || editSchuldeInfo==""){
      subjectForm.setState({editSchuldeId:"",editSchuldeName:""});
    }else {
      var editInfoArray = editSchuldeInfo.split("#");
      if(editInfoArray!=null && editInfoArray.length!=0){
        editSchuldeId = editInfoArray[0];  //待修改的教学进度id
        editSchuldeName = editInfoArray[1]; //待修改的教学进度名称
        subjectForm.setState({editSchuldeId:editSchuldeId,editSchuldeName:editSchuldeName});
      }
    }
  },

  doWebService : function(data,listener) {
    var service = this;
    //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
    this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
    // this.WEBSERVICE_URL = "http://192.168.1.115:8080/Excoord_For_Education/webservice";
    // this.WEBSERVICE_URL = "http://192.168.1.115:8080/Excoord_For_Education/webservice";
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
        subjectForm.props.callbackParent("cancel");
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
        subjectForm.props.callbackParent("cancel");
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    subjectForm.props.form.validateFieldsAndScroll((err, values) => {
      var ident = sessionStorage.getItem("ident");
      var scheduleName = values.courseName;
      if(subjectForm.props.optType=="edit"){
          // alert("edit"+scheduleName);
        subjectForm.updateSchedule(ident,scheduleName);
      }else{
        subjectForm.saveSchedule(ident,scheduleName);
      }
    });

  },
  handleCancel(e) {
    subjectForm.props.callbackParent("cancel");
  },
  checkConfirm(rule, value, callback) {
    const form = subjectForm.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },
  render() {
    const { getFieldDecorator } = subjectForm.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form horizontal onSubmit={subjectForm.handleSubmit}>

        <FormItem
          {...formItemLayout}
          label={(
            <span>
              名称&nbsp;
            </span>
          )}
          hasFeedbac

        >
          {getFieldDecorator('courseName')(
              <div style={{ marginBottom: 16 }}>
                <Input  defaultValue={subjectForm.state.editSchuldeName}/>
              </div>
          )}
        </FormItem>
        <div className="ant-modal-footer">
          <Button type="primary" htmlType="submit" className="login-form-button"  >
            确定
          </Button>
          <Button type="primary" htmlType="reset" className="login-form-button" onClick={subjectForm.handleCancel} >
            取消
          </Button>
        </div>
      </Form>
    );
  },
}));

const TeachingComponents = React.createClass({
  getInitialState() {
    return {
      loading: false,
      visible: false,
      editSchuldeId:0,
      editSchuldeInfo:editSchuldeInfo
    };
    //this.setState({ visible: this.props.modalVisible });
  },
  showModal(openType,editSchuldeInfo) {
    // alert("teaching:"+editSchuldeInfo);
    if(openType=="add"){
      editSchuldeInfo="";
    }
    this.setState({
      visible: true,
      optType:openType,
      editSchuldeInfo:editSchuldeInfo,
    });
  },
  handleOk() {
    this.setState({ visible: false });
  },
  handleCancel() {
    this.setState({ visible: false });
  },

  handleEmail: function(val){
    this.props.callbackParent();
    this.setState({ visible: false });
  },

  render() {
    return (
      <div >
        <Modal
          visible={this.state.visible}
          title="教学进度"
          onCancel={this.handleCancel}
		  className="modol_width"
        >
          <SubjectForm optType={this.state.optType} editSchuldeInfo={this.state.editSchuldeInfo} callbackParent={this.handleEmail}></SubjectForm>
        </Modal>
      </div>
    );
  },
});
export  default TeachingComponents;

