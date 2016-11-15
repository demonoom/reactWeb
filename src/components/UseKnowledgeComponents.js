import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

const KnowledgeComponentstForm = Form.create()(React.createClass({
  getInitialState() {
    return {

    };
  },
  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
    });
  },
  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form horizontal onSubmit={this.handleSubmit}>
        <FormItem
          {...formItemLayout}
          label="课时"
        >
          <Select defaultValue="1"  style={{ width: '100%' }}>
            <Option value="1">第1课时</Option>
            <Option value="2">第2课时</Option>
            <Option value="3">第3课时</Option>
            <Option value="4">第4课时</Option>
          </Select>
        </FormItem>
      </Form>
    );
  },
}));

const UseKnowledgeComponents = React.createClass({
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
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  },
  handleCancel() {
    this.setState({ visible: false });
  },
  render() {
    return (
      <div className="toobar">

        <Button type="primary" icon="share-alt" onClick={this.showModal}></Button>
        <Modal
          visible={this.state.visible}
          title="使用至"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
              提交
            </Button>,
          ]}
        >
          <KnowledgeComponentstForm></KnowledgeComponentstForm>
        </Modal>
      </div>
    );
  },
});
export  default UseKnowledgeComponents;

