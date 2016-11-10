import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

var subjectForm;
const SubjectForm = Form.create()(React.createClass({

  getInitialState() {
    subjectForm = this;
    return {
      visible: false,
      optType:'add',
    };
  },
  handleSubmit(e) {
    e.preventDefault();
    alert("====:"+this.props.optType);
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(values=="delete"){
        this.setState({ visible: false });
      }else{
        if (err) {
          return;
        }
        console.log("courseName:"+values.courseName)
        console.log('Received values of form: ', values);
        values.scheduleId=values.courseName;
        this.props.callbackParent(values);
      }
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
              题目&nbsp;
            </span>
          )}
          hasFeedback
        >
          {getFieldDecorator('courseName', {
            rules: [{ required: true, message: '请输入题目!' }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" className="login-form-button">
            确定
          </Button>
          <Button type="primary" htmlType="reset" className="login-form-button" onClick={this.handleCancel}>
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
    };
    //this.setState({ visible: this.props.modalVisible });
  },
  showModal(openType) {
    this.setState({
      visible: true,
      optType:openType,
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
          <SubjectForm optType={this.state.optType}  callbackParent={this.handleEmail}></SubjectForm>
        </Modal>
      </div>
    );
  },
});
export  default TeachingComponents;

