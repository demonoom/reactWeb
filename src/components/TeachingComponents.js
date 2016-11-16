import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

var subjectForm;
const SubjectForm = Form.create()(React.createClass({

  getInitialState() {
    subjectForm = this;
    //alert(this.props.editSchuldeId);
    return {
      visible: false,
      optType:'add',
      editSchuldeId:this.props.editSchuldeId,
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

  saveSchedule(ident,scheduleName){
    var param = {
      "method":'addTeachSchedule',
      "ident":ident,
      "title":scheduleName
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response.colTsId!=null){
            alert("教学进度添加成功");
        }else{
            alert("教学进度添加失败");
        }
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    //alert("====:"+this.props.optType);
    this.props.form.validateFieldsAndScroll((err, values) => {
      var ident = "23836";
      var scheduleName = values.courseName;
      if(this.props.optType=="edit"){
          alert("edit"+scheduleName);
          //this.setState({ visible: false });

      }else{
        this.saveSchedule(ident,scheduleName);
        //alert("add"+values.courseName);
        /*if (err) {
          return;
        }
        console.log("courseName:"+values.courseName);
        values.scheduleId=values.courseName;
        //console.log('Received values of form: ', values);
        this.props.callbackParent(values);*/

      }
      this.props.callbackParent("cancel");
    });

  },
  /*handleCancel() {
    subjectForm.setState({ visible: false });
  },*/
  handleCancel(e) {
    this.props.callbackParent("cancel");
  },
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form horizontal onSubmit={this.handleSubmit}>

        <FormItem
          {...formItemLayout}
          label={(
            <span>
              名称&nbsp;
            </span>
          )}
          hasFeedback
        >
          {getFieldDecorator('courseName', {
            rules: [{ required: true, message: '请输入名称!' }],
          })(
            <Input defaultValue={this.props.editSchuldeId}/>
          )}
        </FormItem>
        <FormItem style={{text:'center'}}>
          <Button type="primary" htmlType="submit" className="login-form-button" >
            确定
          </Button>
          <Button type="primary" htmlType="reset" className="login-form-button" onClick={this.handleCancel} >
            取消
          </Button>
        </FormItem>
      </Form>
    );
  },
}));

const TeachingComponents = React.createClass({
  getInitialState() {
    //alert("===="+this.props.modalVisible);
    return {
      loading: false,
      visible: false,
      editSchuldeId:0,
    };
    //this.setState({ visible: this.props.modalVisible });
  },
  showModal(openType,editSchuldeId) {
    //alert("editSchuldeId:"+editSchuldeId);
    //this.refs.courseName.value=editSchuldeId;
    this.setState({
      visible: true,
      optType:openType,
      editSchuldeId:editSchuldeId,
    });
  },
  handleOk() {
    // this.setState({ loading: true });
    // setTimeout(() => {
    //   this.setState({ loading: false, visible: false });
    // }, 3000);
    this.setState({ visible: false });
  },
  handleCancel() {
    this.setState({ visible: false });
  },

  handleEmail: function(val){
    this.props.callbackParent(val);
    //this.setState({lessonCount: val});
    this.setState({ visible: false });
  },

  render() {
    return (
      <div>


        <Modal
          visible={this.state.visible}
          title="教学进度"
          onCancel={this.handleCancel}
          footer={[

          ]}
        >
          <SubjectForm optType={this.state.optType} editSchuldeId={this.state.editSchuldeId} callbackParent={this.handleEmail}></SubjectForm>
        </Modal>
      </div>
    );
  },
});
export  default TeachingComponents;

