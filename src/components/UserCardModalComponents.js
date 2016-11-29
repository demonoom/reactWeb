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
      <div className="layout_logo">
        <img src={require('./images/user.png')}  onClick={this.showModal}/>
       {/* <Button type="primary" onClick={this.showModal}>
          Open modal dialog
        </Button>*/}
        <Modal
          visible={this.state.visible}
          title={<p className="user_cont1"> <img className="img_us" src={require('./images/user.png')}  onClick={this.showModal}/><span>丹丹</span><img src={require('./images/user.png')} className="blur"/><br/></p>} 
          onOk={this.handleOk}
          onCancel={this.handleCancel}
		  className="model_wi"
          footer={[
            <Button key="sendMessage" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
              发消息
            </Button>,
            <Button key="space" type="primary" size="large" loading={this.state.loading} onClick={this.handleOk}>
              Ta的空间
            </Button>,
          ]}
        >
          <p className="user_cont model_to"><span className="name">学校名称：</span><span className="name1"></span></p>
          <p className="user_cont"><span className="name">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</span><span className="name1">小蚂蚁</span></p>
          <p className="user_cont"><span className="name">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span><span className="name1">一年级</span></p>
          <p className="user_cont"><span className="name">班&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span><span className="name1">一班</span></p>
          <p className="user_cont"><span className="name">地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;区：</span><span className="name1">西安市</span></p>
        </Modal>
      </div>
    );
  },
});
export  default UserCardModalComponents;

