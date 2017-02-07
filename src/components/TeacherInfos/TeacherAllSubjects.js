import React, { PropTypes } from 'react';
import { Table, Button,Icon,Popover,Tooltip,message,Modal } from 'antd';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import SubjectEditTabComponents from '../SubjectEditTabComponents';
import { doWebService } from '../../WebServiceHelper';
const confirm = Modal.confirm;

const columns = [{
  title: '出题人',
  className:'ant-table-selection-user',
  dataIndex: 'name',
}, {
  title: '内容',
  className:'ant-table-selection-cont',
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
    className:'ant-table-selection-score3',
    dataIndex: 'subjectOpt',
  },
];

var data = [];
var subjectList=[];
var subTable;
const TeacherAllSubjects = React.createClass({
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
      data:data,
      subjectParams:''
    };
  },

  onSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  },

  getSubjectDataByKnowledge:function (ident,ScheduleOrSubjectId,pageNo,isOwmer) {
    var param = {
      "method":'getUserSubjectsByKnowledgePoint',
      "ident":'23836',
      "pointId":'4340',
      "isOwmer":'Y',
      "pageNo":'1'
    };

    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList.splice(0);
        data.splice(0);
        var response = ret.response;
        if(response==null || response.length==0){
          subTable.setState({totalCount:0});
        }else {
          response.forEach(function (e) {
            console.log("getSubjectDataByKnowledge:"+e);
            var key = e.id;
            var name=e.user.userName;
            var content=<Popover  placement="topLeft" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.content}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
            var subjectType=e.typeName;
            var subjectScore=e.score;
            var answer = e.answer;
            var userId = e.user.colUid;
            // var submitTime = subTable.getLocalTime(e.createTime);
            var subjectOpt=<Button style={{ }} type=""  value={e.id} onClick={subTable.showModal}  icon="export" title="使用" ></Button>;
            if(userId==sessionStorage.getItem("ident")){
              subjectOpt=<div><Button style={{ }} type=""  value={e.id} onClick={subTable.showModal}  icon="export" title="使用" className="score3_i"></Button><Button style={{ }} type=""  value={e.id+"#"+e.typeName} onClick={subTable.showModifySubjectModal}  icon="edit" title="修改" className="score3_i"></Button><Button style={{ }} type=""  value={e.id} onClick={subTable.delMySubjects}  icon="delete" title="删除" className="score3_i" ></Button></div>;
            }else{
              subjectOpt=<Button style={{ }} type=""  value={e.id} onClick={subTable.showModal}  icon="export" title="使用" ></Button>;
            }
            data.push({
              key: key,
              name: name,
              content: content,
              // submitTime:submitTime,
              subjectType:subjectType,
              subjectScore:subjectScore,
              subjectOpt:subjectOpt,
              answer:answer
            });
            var pager = ret.pager;
            subTable.setState({totalCount:parseInt(pager.pageCount)*15});
          });
        }
      },
      onError : function(error) {
        message.error(error);
      }

    });
  },


  componentDidMount(){
    subTable.getSubjectDataByKnowledge();
  },

  pageOnChange(pageNo) {
    console.log(pageNo);
    subTable.initGetSubjectInfo(this.state.subjectParams,pageNo);
    this.setState({
      currentPage: pageNo,
    });
  },

  subjectEditCallBack(){
    subTable.getSubjectDataByKnowledge(sessionStorage.getItem("ident"),subTable.state.ScheduleOrSubjectId,subTable.state.currentPage,"Y");
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
          <SubjectEditTabComponents ref="subjectEditTabComponents" subjectEditCallBack={subTable.subjectEditCallBack}></SubjectEditTabComponents>
          <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
          <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={{ total:subTable.state.totalCount,pageSize: 15,onChange:subTable.pageOnChange }} scroll={{ y: 400}}/>
        </div>
    );
  },
});

export default TeacherAllSubjects;
