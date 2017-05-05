import React, { PropTypes,Link } from 'react';
import { Table } from 'antd';

var mMenu;
const columns = [{
    title: 'option',
    dataIndex: 'option',
    key: 'option',
}];

const data = [{
    key: 'getAllTopic',
    option: '全部',
},{
  key: 'onlyTeacherTopic',
  option: '只看老师',
}];

const AntNestMenu = React.createClass({
  getInitialState() {
    mMenu = this;
    return {

    };
  },

  getAntNest(record, index){
    console.log("index:"+index+",key:"+record.key);
    mMenu.props.callbackParent(record.key);
  },

  render() {
    return (
        <div>
          <div className="menu_til">蚁巢</div>
            <Table  onRowClick={mMenu.getAntNest} showHeader={false} columns={columns} dataSource={data} />
        </div>
    );
  },
});
export default AntNestMenu;