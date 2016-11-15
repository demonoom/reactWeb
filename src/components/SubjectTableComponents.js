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

var subjectList;
var subTable;
const SUbjectTable = React.createClass({
  getInitialState() {
    subTable = this;
    return {
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      count:0,
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

  getSubjectData(ident,teachScheduleId,pageNo){
    alert("ccc:"+ident+"==="+teachScheduleId);
    var param = {
      "method":'getClassSubjects',
      "ident":ident,
      "teachScheduleId":teachScheduleId,
      "pageNo":pageNo
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList=new Array();
        var response = ret.response;
        var count=0;
        response.forEach(function (e) {
          console.log("eeeeee:"+e);
          var key = e.sid;
          var name=e.colName;
          var content=<article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article>;
          var subjectType=e.typeName;
          var subjectScore=e.score;
          var subjectOpt=<Button><Icon type="edit"/></Button>;
          data.push({
            key: key,
            name: name,
            content: content,
            subjectType:subjectType,
            subjectScore:subjectScore,
            subjectOpt:subjectOpt,
          });
          count++;
          subTable.setState({count:count});
        });
      },
      onError : function(error) {
        alert(error);
      }

    });
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
