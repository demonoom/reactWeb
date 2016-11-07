import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';

const UserCardModalComponents = React.createClass({
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
      <div>
        <img src={require('./images/maaeeLogo.jpg')}  onClick={this.showModal}/>
       {/* <Button type="primary" onClick={this.showModal}>
          Open modal dialog
        </Button>*/}
        <Modal
          visible={this.state.visible}
          title="小蚂蚁"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="sendMessage" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
              发消息
            </Button>,
            <Button key="space" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
              Ta的空间
            </Button>,
          ]}
        >
          <p>学校名称：</p>
          <p>姓名：小蚂蚁</p>
          <p>年级:一年级</p>
          <p>班级:一班</p>
          <p>地区：西安市</p>
        </Modal>
      </div>
    );
  },
});
export  default UserCardModalComponents;

