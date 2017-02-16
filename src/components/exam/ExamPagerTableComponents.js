import React, { PropTypes } from 'react';
import { Table, Button,Popover,message } from 'antd';
import { doWebService } from '../../WebServiceHelper';

var columns = [ {
  title: '标题',
  dataIndex: 'title',
}, {
  title: '操作',
  className:'ant-table-selection-topic',
  dataIndex: 'subjectOpt',
},
];

var data = [];
var subjectList;
var subTable;
const ExamPagerTableComponents = React.createClass({
  getInitialState() {
    subTable = this;
    this.getExamPagerList(sessionStorage.getItem("ident"),1);
    return {
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      count:0,
      totalCount:0,
      currentPage:1,
      currentView:'examPagerList',
      clazzId:'',
      dateTime:''
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

  buildPageView(optSource){
    if(optSource=="查看"){
      columns = [  {
        title: '内容',
        dataIndex: 'subjectContent',
		className:'ant-table-selection-cont3'
      },{
        title: '类型',
        className:'ant-table-selection-topic',
        dataIndex: 'subjectType',
      },/*{
        title: '分值',
        dataIndex: 'subjectScore',
		className:'ant-table-selection-score'
      },*/
      ];
    }else{
      columns = [ {
        title: '试卷名称',
        dataIndex: 'title',
      },{
        title: '操作',
        className:'ant-table-selection-topic',
        dataIndex: 'subjectOpt',
      },
      ];
    }
  },

  //点击查看时,进入题目列表
  getSubjectData(e,handler){
    //alert("===getSubjectData==="+e);
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      //e = window.event;
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    data=[];
    var value = target.value;
    var valueArray=value.split("#");
    var ident=valueArray[0];
    var clazzId=valueArray[1];
    var dateTime=valueArray[2];
    var optSource = valueArray[3];
    var pageNo=1;
    subTable.buildPageView(optSource);
    subTable.getHomeworkSubjects(ident,clazzId,dateTime,pageNo);
    subTable.setState({currentView:'subjectDetailList',clazzId:clazzId,dateTime:dateTime});
    // alert("in getSubjectData");
  },

  // getSubject

  //点击导航时，进入的试卷列表
  getExamPagerList:function (ident,pageNo) {
    // alert("homttable ident:"+ident+",pageNo:"+pageNo);
    data=[];
    subTable.setState({currentView:'subjectList',totalCount:0});
    subTable.buildPageView();
    var param = {
      "method":'getUserExmPapers',
      "ident":ident,
      "pageNo":pageNo,

    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        subjectList=new Array();
        var response = ret.response;
        response.forEach(function (e) {
          console.log("getExamPagerList:"+e);
          //试卷id
          var pagerId = e.id;
          //试卷名称
          var pagerTitle = e.title;
          var subjectOpt=<Button type="button" value={pagerId} text={pagerId} onClick={subTable.getSubjectData}  icon="edit"></Button>;
          data.push({
              key:pagerId,
              title:pagerTitle,
              subjectOpt:subjectOpt,
          });
        });
        var pager = ret.pager;
        subTable.setState({totalCount:parseInt(pager.pageCount)*15});
        subTable.setState({currentView:'examPagerList'});
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }

    });
  },

  getLocalTime:function (nS) {
    // var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
    // return newDate;
    var newDate = new Date();
    newDate.setTime(nS);
    console.log("localDate："+newDate.toLocaleDateString())
    return newDate.toLocaleDateString();
  },

  //点击作业列表中的查看时，进入题目列表
  getHomeworkSubjects:function (ident,clazzId,dateTime,pageNo) {
    // alert("homttable getHomeworkSubjects ident:"+ident+",clazzId:"+clazzId+",dateTime:"+dateTime);
    var param = {
      "method":'getHomeworkSubjects',
      "ident":ident,
      "clazzId":clazzId,
      "dateTime":dateTime,
      "pageNo":pageNo
    };

    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList=new Array();
        var response = ret.response;
        response.forEach(function (e) {
          console.log("getExamPagerList:"+e);
          var id = e.id;
          var content = <Popover  placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.content}}></article>}><article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
          var subjectType = e.subjectType;
          var typeName = e.typeName;
          var score = e.score;
          data.push({
            key:id,
            subjectContent:content,
            subjectType:typeName,
            subjectScore:score,
          });
        });
        var pager = ret.pager;
        subTable.setState({totalCount:parseInt(pager.pageCount)*15});
        subTable.setState({currentView:'subjectList'});
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }

    });
  },

  pageOnChange(pageNo) {
    console.log(pageNo);
    var currentView = subTable.state.currentView;
    if(currentView=="examPagerList"){
      subTable.getExamPagerList(sessionStorage.getItem("ident"),pageNo);
    }else{
      // subjectDetailList
      subTable.getHomeworkSubjects(sessionStorage.getItem("ident"),subTable.state.clazzId,subTable.state.dateTime,pageNo)
    }

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
        <Table columns={columns}  dataSource={data} pagination={{ total:subTable.state.totalCount,pageSize: 15,onChange:subTable.pageOnChange }} scroll={{ y: 400}}/>
      </div>
    );
  },
});

export default ExamPagerTableComponents;
