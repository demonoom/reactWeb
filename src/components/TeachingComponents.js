import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

const SubjectForm = Form.create()(React.createClass({
  getInitialState() {
    return {
      visible: false
    };
  },
  handleSubmit(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      console.log("nickName:"+values.nickname)
      console.log('Received values of form: ', values);
      this.props.callbackParent(values);
    });
    this.setState({ visible: false });
  },
  handleCancel() {
    this.setState({ visible: false });
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
          {getFieldDecorator('nickname', {
            rules: [{ required: true, message: '请输入题目!' }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="课时"
        >
          {getFieldDecorator('courseTimes', {
            rules: [{ required: true, message: '请选择课时!' }],
          })(
            <Select placeholder="请选择课时" style={{ width: '100%' }}>
              <Option value="0">0节课时</Option>
              <Option value="1">1节课时</Option>
              <Option value="2">2节课时</Option>
              <Option value="3">3节课时</Option>
              <Option value="4">4节课时</Option>
            </Select>
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
    return {
      loading: false,
      visible: false,
    };
  },
  showModal() {
    this.setState({
      visible: true,
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
  },

  render() {
    return (
      <div>

        <Button type="primary" icon="plus" onClick={this.showModal}>添加教学进度</Button>
        <Modal
          visible={this.state.visible}
          title="教学进度"
          onCancel={this.handleCancel}
          footer={[

          ]}
        >
          <SubjectForm  callbackParent={this.handleEmail}></SubjectForm>
        </Modal>
      </div>
    );
  },
});
export  default TeachingComponents;

