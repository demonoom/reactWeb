import React, { PropTypes } from 'react';
import { Table, Button,Icon,Popover,Tooltip,message,Modal } from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import SubjectEditTabComponents from './SubjectEditTabComponents';
import { doWebService } from '../WebServiceHelper';
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
      data:data,
      subjectParams:''
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

  getSubjectData(ident,ScheduleOrSubjectId,pageNo,optType,knowledgeName,isOwmer){
    data=[];
    // alert("ccc:"+ident+"==="+ScheduleOrSubjectId+",,,,"+optType);
    subTable.setState({optType:optType,knowledgeName:knowledgeName,ScheduleOrSubjectId:ScheduleOrSubjectId});
    if(optType=="bySchedule"){
      subTable.getSubjectDataBySchedule(ident,ScheduleOrSubjectId,pageNo);
    }else{
      subTable.getSubjectDataByKnowledge(ident,ScheduleOrSubjectId,pageNo,isOwmer);
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

    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        // subjectList=new Array();
        subjectList.splice(0);
        data.splice(0);
        var response = ret.response;
        if(response==null || response.length==0){
          subTable.setState({totalCount:0});
        }else{
            response.forEach(function (e) {
              console.log("eeeeee:"+e);
              var key = e.sid;
              var name=e.colName;
              var content=<Popover placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.shortContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article></Popover>;
              //var content=<Tooltip title={<article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.shortContent}}></article></Tooltip>;
              var subjectType=e.typeName;
              var subjectScore=e.score;
              if(parseInt(e.score)<0)
              {
                subjectScore='--';
              }
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
        }
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }

    });
  },

  editSubject:function (e) {
    // alert("editSubject:"+e.target.value);

  },

  //删除备课计划下的题目
  deleteSubject:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    // alert("deleteSubject:"+target.value);
    var subjectIds = target.value;
    confirm({
      title: '确定要删除该题目?',
      onOk() {
          var param = {
            "method":'deleteScheduleSubjects',
            "ident":sessionStorage.getItem("ident"),
            "scheduleId":subTable.state.ScheduleOrSubjectId,
            "subjectIds":subjectIds
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
              subTable.getSubjectDataBySchedule(sessionStorage.getItem("ident"),subTable.state.ScheduleOrSubjectId,subTable.state.currentPage);
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
              subTable.getSubjectDataByKnowledge(sessionStorage.getItem("ident"),subTable.state.ScheduleOrSubjectId,subTable.state.currentPage,"Y");
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

  getSubjectDataByKnowledge:function (ident,ScheduleOrSubjectId,pageNo,isOwmer) {
    var param = {
      "method":'getUserSubjectsByKnowledgePoint',
      "ident":ident,
      "pointId":ScheduleOrSubjectId,
      "isOwmer":isOwmer,
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
            console.log("getSubjectDataByKnowledge:"+e);
            var key = e.id;
            var name=e.user.userName;
            var content=<Popover  placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.content}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
            var subjectType=e.typeName;
            var subjectScore=e.score;
            if(parseInt(e.score)<0)
            {
              subjectScore='--';
            }
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
        // alert(error);
        message.error(error);
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

  // componentWillReceiveProps(){
  //   subTable.initGetSubjectInfo();
  // },

  initGetSubjectInfo:function (subjectParams,currentPageNo) {
    // alert("params in subjectTable:"+subTable.props.params);
    var subjectParamArray = subTable.props.params.split("#");
    subTable.setState({subjectParams:subTable.props.params});
    if(subjectParams!=null && typeof(subjectParams)!="undefined" ){
      subjectParamArray = subjectParams.split("#");
      subTable.setState({subjectParams:subjectParams});
    }
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
    var dataFilter = subjectParamArray[5];
    var isOwmer="Y";
    if(dataFilter=="self"){
      isOwmer="Y";
    }else if(dataFilter=="other"){
      isOwmer="N";
    }
    subTable.getSubjectData(ident,ScheduleOrSubjectId,pageNo,optType,knowledgeName,isOwmer);
  },

  showModal:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      //e = window.event;
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var currentKnowledge = target.value;
    // alert(currentKnowledge);
    //alert("111"+currentSchedule+","+this.refs.useKnowledgeComponents);
    subTable.refs.useKnowledgeComponents.showModal(currentKnowledge,"knowledgeSubject",subTable.state.knowledgeName);
  },

  showModifySubjectModal:function (e) {
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      //e = window.event;
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var currentSubjectInfo = target.value;
    subTable.refs.subjectEditTabComponents.showModal(currentSubjectInfo);
    // alert(currentKnowledge);
    //alert("111"+currentSchedule+","+this.refs.useKnowledgeComponents);
    // subTable.refs.useKnowledgeComponents.showModal(currentKnowledge,"knowledgeSubject",subTable.state.knowledgeName);
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

export default SUbjectTable;
