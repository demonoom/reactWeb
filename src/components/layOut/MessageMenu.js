import React, { PropTypes,Link } from 'react';
import { Table } from 'antd';

var mMenu;
const columns = [{
    title: 'messageContent',
    dataIndex: 'messageContent',
    key: 'messageContent',
}];

const data = [{
    key: '1',
    messageContent: '蚂蚁君 2017/5/5',
}];

const MessageMenu = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
    };
  },

  render() {
    return (
        <div>
          <div className="menu_til">消息动态</div>
            <Table showHeader={false} columns={columns} dataSource={data} className="yichao_menu"/>
        </div>
    );
  },
});
export default MessageMenu;