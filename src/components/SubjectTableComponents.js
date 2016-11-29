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
//   {
//   title: '上传时间',
//   dataIndex: 'submitTime',
// },
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
var subjectList=[];
var subTable;
const SUbjectTable = React.createClass({
  getInitialState() {
    subTable = this;
    return {
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      count:0,
      totalCount:0,
      optType:'',
      ScheduleOrSubjectId:'',
      ident:'',
      knowledgeName:'',
      currentPage:1,
      data:data
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
    // this.WEBSERVICE_URL = "http://192.168.1.115:8080/Excoord_For_Education/webservice";
    // if (service.requesting) {
    //   return;
    // }
    // service.requesting = true;
    $.post(service.WEBSERVICE_URL, {
      params : data
    }, function(result, status) {
      // service.requesting = false;
      if (status == "success") {
        listener.onResponse(result);
      } else {
        listener.onError(result);
      }
    }, "json");
  },

  getSubjectData(ident,ScheduleOrSubjectId,pageNo,optType,knowledgeName){
    data=[];
    // alert("ccc:"+ident+"==="+ScheduleOrSubjectId+",,,,"+optType);
    subTable.setState({optType:optType,knowledgeName:knowledgeName,ScheduleOrSubjectId:ScheduleOrSubjectId});
    if(optType=="bySchedule"){
      subTable.getSubjectDataBySchedule(ident,ScheduleOrSubjectId,pageNo);
    }else{
      subTable.getSubjectDataByKnowledge(ident,ScheduleOrSubjectId,pageNo);
    }
  },

  getSubjectDataBySchedule:function (ident,ScheduleOrSubjectId,pageNo) {
    //alert("getSubjectDataBySchedule:"+ident+"==="+ScheduleOrSubjectId);
    var param = {
      "method":'getClassSubjects',
      "ident":ident,
      "teachScheduleId":ScheduleOrSubjectId,
      "pageNo":pageNo
    };

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        // subjectList=new Array();
        subjectList.splice(0,subjectList.length);
        data.splice(0,data.length);
        var response = ret.response;
        response.forEach(function (e) {
          console.log("eeeeee:"+e);
          var key = e.sid;
          var name=e.colName;
          var content=<article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article>;
          var subjectType=e.typeName;
          var subjectScore=e.score;
          // <SubjectEditTabComponents editParams={e.sid+"#"+e.typeName+"#"+e.shortContent+"#"+e.score}></SubjectEditTabComponents>
          var subjectOpt=<div className="smallclass"><span className="toobar"><Button value={e.sid} title="删除" onClick={subTable.deleteSubject}><Icon type="delete"/></Button></span></div>;
          // var submitTime = e.submitTime;
          data.push({
            key: key,
            name: name,
            content: content,
            // submitTime:submitTime,
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
    // alert("editSubject:"+e.target.value);

  },

  //删除教学进度下的题目
  deleteSubject:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    alert("deleteSubject:"+target.value);
    var subjectIds = target.value;
    var param = {
      "method":'deleteScheduleSubjects',
      "ident":sessionStorage.getItem("ident"),
      "scheduleId":subTable.state.ScheduleOrSubjectId,
      "subjectIds":subjectIds
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
          alert("题目删除成功");
        }else{
          alert("题目删除失败");
        }
        subTable.getSubjectDataBySchedule(sessionStorage.getItem("ident"),subTable.state.ScheduleOrSubjectId,subTable.state.currentPage);
      },
      onError : function(error) {
        alert(error);
      }
    });
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
          // var submitTime = subTable.getLocalTime(e.createTime);
          var subjectOpt=<Button style={{ }} type=""  value={key} onClick={subTable.showModal}  icon="export" title="使用" ></Button>;
          data.push({
            key: key,
            name: name,
            content: content,
            // submitTime:submitTime,
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

  /*getLocalTime:function (nS) {
    // var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
    // return newDate;
    var newDate = new Date();
    newDate.setTime(nS);
    console.log("localDate："+newDate.toLocaleDateString())
    return newDate.toLocaleDateString();
  },*/

  componentDidMount(){
    subTable.initGetSubjectInfo();
  },

  componentWillReceiveProps(){
    subTable.initGetSubjectInfo();
  },

  initGetSubjectInfo:function (currentPageNo) {
    // alert("params in subjectTable:"+subTable.props.params);
    var subjectParamArray = subTable.props.params.split("#");
    var ident = subjectParamArray[0];
    var ScheduleOrSubjectId = subjectParamArray[1];
    var pageNo=1;
    if(currentPageNo==null || currentPageNo==""){
      pageNo = subjectParamArray[2];
    }else{
      pageNo=currentPageNo;
    }
    var optType = subjectParamArray[3];
    var knowledgeName = subjectParamArray[4];
    subTable.getSubjectData(ident,ScheduleOrSubjectId,pageNo,optType,knowledgeName);
  },

  showModal:function (e) {
    var currentKnowledge = e.target.value;
    // alert(currentKnowledge);
    //alert("111"+currentSchedule+","+this.refs.useKnowledgeComponents);
    subTable.refs.useKnowledgeComponents.showModal(currentKnowledge,"knowledgeSubject",subTable.state.knowledgeName);
  },

  pageOnChange(pageNo) {
    console.log(pageNo);
    subTable.initGetSubjectInfo(pageNo);
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
