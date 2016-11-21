import React, { PropTypes } from 'react';
import { Table, Button,Icon } from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import SubjectEditTabComponents from './SubjectEditTabComponents';
import reqwest from 'reqwest';

const columns = [{
  title: '出题人',
  className:'ant-table-selection-user',
  dataIndex: 'name',
}, {
  title: '内容',
  dataIndex: 'content',
},
  {
  title: '题型',
  className:'ant-table-selection-topic',
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
  className:'ant-table-selection-score',
  dataIndex: 'subjectScore',
}, {
  title: '操作',
  className:'ant-table-selection-smallclass',
  dataIndex: 'subjectOpt',
},
];

var data = [];
var subjectList;
var subTable;
const SUbjectTable = React.createClass({
  getInitialState() {
    subTable = this;
    return {
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      count:0,
      totalCount:0,
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

  getSubjectData(ident,ScheduleOrSubjectId,pageNo,optType){
    data=[];
    // alert("ccc:"+ident+"==="+ScheduleOrSubjectId+",,,,"+optType);
    if(optType=="bySchedule"){
      subTable.getSubjectDataBySchedule(ident,ScheduleOrSubjectId,pageNo);
    }else{
      subTable.getSubjectDataByKnowledge(ident,ScheduleOrSubjectId,pageNo);
    }
  },

  getSubjectDataBySchedule:function (ident,ScheduleOrSubjectId,pageNo) {
    // alert("getSubjectDataBySchedule:"+ident+"==="+ScheduleOrSubjectId);
    var param = {
      "method":'getClassSubjects',
      "ident":ident,
      "teachScheduleId":ScheduleOrSubjectId,
      "pageNo":pageNo
    };

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList=new Array();
        var response = ret.response;
        response.forEach(function (e) {
          console.log("eeeeee:"+e);
          var key = e.sid;
          var name=e.colName;
          var content=<article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article>;
          var subjectType=e.typeName;
          var subjectScore=e.score;
          var subjectOpt=<div className="smallclass"><SubjectEditTabComponents editParams={e.sid+"#"+e.typeName+"#"+e.shortContent+"#"+e.score}></SubjectEditTabComponents><span className="toobar"><Button value={e.sid} onClick={subTable.deleteSubject}><Icon type="delete"/></Button></span><span className="toobar"><Button value={e.sid} onClick="">录制微课</Button></span></div>;
          data.push({
            key: key,
            name: name,
            content: content,
            subjectType:subjectType,
            subjectScore:subjectScore,
            subjectOpt:subjectOpt,
          });
          var pager = ret.pager;
          subTable.setState({totalCount:parseInt(pager.pageCount)*15});
        });
      },
      onError : function(error) {
        alert(error);
      }

    });
  },

  editSubject:function (e) {
    alert("editSubject:"+e.target.value);

  },

  deleteSubject:function (e) {
    alert("deleteSubject:"+e.target.value);
  },

  getSubjectDataByKnowledge:function (ident,ScheduleOrSubjectId,pageNo) {
    // alert("getSubjectDataByKnowledge:"+ident+"==="+ScheduleOrSubjectId);
    // alert(pageNo);
    var param = {
      "method":'getUserSubjectsByKnowledgePoint',
      "ident":ident,
      "pointId":ScheduleOrSubjectId,
      "isOwmer":"N",
      "pageNo":pageNo
    };

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList=new Array();
        var response = ret.response;
        response.forEach(function (e) {
          console.log("getSubjectDataByKnowledge:"+e);
          var key = e.id;
          var name=e.user.userName;
          var content=<article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article>;
          var subjectType=e.typeName;
          var subjectScore=e.score;
          var subjectOpt=<Button style={{ float:'right'}} type=""  value={key} onClick={subTable.showModal}>使用</Button>;
          data.push({
            key: key,
            name: name,
            content: content,
            subjectType:subjectType,
            subjectScore:subjectScore,
            subjectOpt:subjectOpt,
          });
          var pager = ret.pager;
          subTable.setState({totalCount:parseInt(pager.pageCount)*15});
        });
      },
      onError : function(error) {
        alert(error);
      }

    });
  },

  componentDidMount(){
    subTable.initGetSubjectInfo();
  },

  componentWillReceiveProps(){
    subTable.initGetSubjectInfo();
  },

  initGetSubjectInfo:function () {
    // alert("params in subjectTable:"+subTable.props.params);
    var subjectParamArray = subTable.props.params.split("#");
    var ident = subjectParamArray[0];
    var ScheduleOrSubjectId = subjectParamArray[1];
    var pageNo = subjectParamArray[2];
    var optType = subjectParamArray[3];
    subTable.getSubjectData(ident,ScheduleOrSubjectId,pageNo,optType);
  },

  showModal:function (e) {
    var currentKnowledge = e.target.value;
    // alert(currentKnowledge);
    //alert("111"+currentSchedule+","+this.refs.useKnowledgeComponents);
    subTable.refs.useKnowledgeComponents.showModal(currentKnowledge,"knowledgeSubject");
  },

  pageOnChange(pageNo) {
    console.log(pageNo);
    subTable.initGetSubjectInfo();
    this.setState({
      currentPage: pageNo,
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
      <div >
        <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
        <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={{ total:subTable.state.totalCount,pageSize: 15,onChange:subTable.pageOnChange }} scroll={{ y: 400}}/>
      </div>
    );
  },
});

export default SUbjectTable;
