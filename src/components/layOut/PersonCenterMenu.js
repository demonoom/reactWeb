import React, { PropTypes,Link } from 'react';
import { Table } from 'antd';

var mMenu;
const columns = [{
    title: 'option',
    dataIndex: 'option',
    key: 'option',
}];

const data = [{
    key: 'myResource',
    option: '我的资源',
},{
  key: 'mySubject',
  option: '我的题目',
},{
  key: 'myFavorite',
  option: '我的收藏',
},{
  key: 'myLike',
  option: '我的关注',
},{
  key: 'myLiveVideos',
  option: '我的直播课',
},{
  key: 'findStudentPassword',
  option: '找回学生密码',
}];

const PersonCenterMenu = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
    };
  },

  render() {
    return (
        <div>
          <div className="menu_til">个人中心</div>
            <Table showHeader={false} columns={columns} dataSource={data}  className="yichao_menu"/>
        </div>
    );
  },
});
export default PersonCenterMenu;