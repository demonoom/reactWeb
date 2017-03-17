import React, { PropTypes } from 'react';
import { Table, Button,Icon,Popover,Tooltip,message,Modal } from 'antd';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import SubjectEditByTextboxioTabComponents from '../SubjectEditByTextboxioTabComponents';
import { doWebService } from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
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

  getUserSubjectsByUid:function (ident,pageNo) {
    var param = {
      "method":'getUserSubjectsByUid',
      "userId":ident,
      "pageNo":pageNo
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
            console.log("getUserSubjectsByUid:"+e);
            var key = e.id;
            var name=e.user.userName;
            var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>'+e.content+'<hr/><span class="answer_til answer_til_2">答案：</span>'+e.answer+'</div>';
            var content=<Popover  placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: popOverContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
            var subjectType=e.typeName;
            var subjectScore=e.score;
            if(parseInt(e.score)<0)
            {
              subjectScore='--';
            }
            var answer = e.answer;
            var userId = e.user.colUid;
            var subjectOpt=<div><Button style={{ }} type=""  value={e.id} onClick={subTable.showModal}  icon="export" title="使用" className="score3_i"></Button><Button style={{ }} type=""  value={e.id+"#"+e.typeName} onClick={subTable.showModifySubjectModal}  icon="edit" title="修改" className="score3_i"></Button><Button style={{ }} type=""  value={e.id} onClick={subTable.delMySubjects}  icon="delete" title="删除" className="score3_i" ></Button></div>;
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
            subTable.setState({totalCount:parseInt(pager.rsCount)});
          });
        }
      },
      onError : function(error) {
        message.error(error);
      }

    });
  },

  //页面组件加载完成后的回调函，用来向已加载的组件填充数据
  componentDidMount(){
    var initPageNo = 1;
    subTable.getUserSubjectsByUid(sessionStorage.getItem("ident"),initPageNo);
  },

  //列表分页响应事件
  pageOnChange(pageNo) {
    console.log("pageNo:"+pageNo);
    subTable.getUserSubjectsByUid(sessionStorage.getItem("ident"),pageNo);
    this.setState({
      currentPage: pageNo,
    });
  },
  //题目修改完成后的回调函数，用来刷新
  subjectEditCallBack(){
    subTable.getUserSubjectsByUid(sessionStorage.getItem("ident"),subTable.state.currentPage);
  },

  //删除资源库下的题目
  delMySubjects:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var subjectIds = target.value;
    confirm({
      title: '确定要删除该题目?',
      onOk() {
        var param = {
          "method":'delMySubjects',
          "userId":sessionStorage.getItem("ident"),
          "subjects":subjectIds
        };
        doWebService(JSON.stringify(param), {
          onResponse : function(ret) {
            console.log(ret.msg);
            if(ret.msg=="调用成功" && ret.response==true){
              // alert("题目删除成功");
              message.success("题目删除成功");
            }else{
              // alert("题目删除失败");
              message.error("题目删除失败");
            }
            subTable.getUserSubjectsByUid(sessionStorage.getItem("ident"),subTable.state.currentPage);
          },
          onError : function(error) {
            // alert(error);
            message.error(error);
          }
        });
      },
      onCancel() {},
    });
  },

  //题目修改功能
  showModifySubjectModal:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var currentSubjectInfo = target.value;
    subTable.refs.subjectEditTabComponents.showModal(currentSubjectInfo);
  },

  //弹出题目使用至备课计划的窗口
  showModal:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var currentKnowledge = target.value;
    subTable.refs.useKnowledgeComponents.showModal(currentKnowledge,"TeacherAllSubjects",subTable.state.knowledgeName);
  },

  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
        <div className='ant-tabs ant-tabs-top ant-tabs-line'>
		  <div className='ant-tabs-tabpane ant-tabs-tabpane-active'>
          <SubjectEditByTextboxioTabComponents ref="subjectEditTabComponents" subjectEditCallBack={subTable.subjectEditCallBack}></SubjectEditByTextboxioTabComponents>
          <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
          <Table columns={columns} dataSource={data} pagination={{ total:subTable.state.totalCount,pageSize: getPageSize(),onChange:subTable.pageOnChange }} scroll={{ y: 400}}/>
		  </div>
        </div>
    );
  },
});

export default TeacherAllSubjects;
