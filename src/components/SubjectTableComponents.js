import React, { PropTypes } from 'react';
import { Table, Button,Icon } from 'antd';
import reqwest from 'reqwest';

const columns = [{
  title: '出题人',
  dataIndex: 'name',
}, {
  title: '内容',
  dataIndex: 'content',
},
  {
  title: '题型',
  dataIndex: 'subjectType',
  filters: [{
    text: '单选题',
    value: '单选题',
  }, {
    text: '多选题',
    value: '多选题',
  }, {
    text: '判断题',
    value: '判断题',
  }, {
    text: '简答题',
    value: '简答题',
  }, {
    text: '材料题',
    value: '材料题',
  },],
    onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
},
  {
  title: '分值',
  dataIndex: 'subjectScore',
}, {
  title: '操作',
  dataIndex: 'subjectOpt',
},
];

const data = [];
for (let i = 0; i < 46; i++) {
  if(i%2==0){
    data.push({
      key: i,
      name: `Edward King ${i}`,
      content: '学习内容',
      subjectType: `单选题`,
      subjectScore:`5`,
      subjectOpt:<Button><Icon type="edit"/></Button>,
    });
  }else{
    data.push({
      key: i,
      name: `王老师 ${i}`,
      content: '判断题学习内容',
      subjectType: `判断题`,
      subjectScore:`2`,
      subjectOpt:<Button><Icon type="edit"/></Button>,
    });
  }
}

const SUbjectTable = React.createClass({
  getInitialState() {
    return {
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
    };
  },
  start() {
    this.setState({ loading: true });
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  },
  onSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  },
  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <div>
          <span style={{ marginLeft: 8 }}>{hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}</span>
        </div>
        <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
      </div>
    );
  },
});

export default SUbjectTable;
