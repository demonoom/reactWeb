import React, { PropTypes } from 'react';
import { Table, Button,Icon } from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import SubjectEditTabComponents from './SubjectEditTabComponents';
import reqwest from 'reqwest';

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
const HomeWorkTableComponents = React.createClass({
  getInitialState() {
    subTable = this;
    return {
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      count:0,
      totalCount:0,
      currentPage:1,
      currentView:'homeWorkList',
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

  buildPageView(optSource){
    // alert("optSource:"+optSource);
    if(optSource=="查 看"){
      columns = [  {
        title: '内容',
        dataIndex: 'subjectContent',
		className:'ant-table-selection-cont3'
      },{
        title: '类型',
        className:'ant-table-selection-topic',
        dataIndex: 'subjectType',
      },{
        title: '分值',
        dataIndex: 'subjectScore',
		className:'ant-table-selection-score'
      },
      ];
    }else{
      columns = [ {
        title: '标题',
        dataIndex: 'title',
      },{
          title: '日期',
          dataIndex: 'useDate',
		  className:'ant-table-selection-smallclass',
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
    var optSource = target.textContent;
    var value = target.value;
    var valueArray=value.split("#");
    var ident=valueArray[0];
    var clazzId=valueArray[1];
    var dateTime=valueArray[2];
    var pageNo=1;
    subTable.buildPageView(optSource);
    subTable.getHomeworkSubjects(ident,clazzId,dateTime,pageNo);
    subTable.setState({currentView:'subjectDetailList',clazzId:clazzId,dateTime:dateTime});
    // alert("in getSubjectData");
  },

  // getSubject

  //点击导航时，进入的作业列表
  getDoneHomeworkList:function (ident,pageNo) {
    // alert("homttable ident:"+ident+",pageNo:"+pageNo);
    data=[];
    subTable.setState({currentView:'subjectList'});
    subTable.buildPageView();
    var param = {
      "method":'getUserHomeworkInfoList',
      "ident":ident,
      "pageNo":pageNo
    };

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList=new Array();
        var response = ret.response;
        response.forEach(function (e) {
          console.log("getDoneHomeworkList:"+e);
          var colCid = e.colCid;
          //班级编号
          var colClazzId = e.colClazzId;
          var clazzName = e.clazzName;
          var hcount = e.hcount;
          var colCourse = e.colCourse;
          //作业日期
          var useDate = e.useDate;
          var title = clazzName+" "+hcount+" "+colCourse+"作业";
          var key =ident+"#"+colClazzId+"#"+useDate;
          var subjectOpt=<Button type="button" value={key} text={key} onClick={subTable.getSubjectData}>查看</Button>;
          data.push({
              key:key,
              title:title,
              useDate:subTable.getLocalTime(useDate),
              subjectOpt:subjectOpt,
          });
        });
        var pager = ret.pager;
        subTable.setState({totalCount:parseInt(pager.pageCount)*15});
        subTable.setState({currentView:'homeWorkList'});
      },
      onError : function(error) {
        alert(error);
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

    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        subjectList=new Array();
        var response = ret.response;
        response.forEach(function (e) {
          console.log("getDoneHomeworkList:"+e);
          var id = e.id;
          var content = <article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article>;
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
        alert(error);
      }

    });
  },

  pageOnChange(pageNo) {
    console.log(pageNo);
    var currentView = subTable.state.currentView;
    if(currentView=="homeWorkList"){
      subTable.getDoneHomeworkList(sessionStorage.getItem("ident"),pageNo);
    }else{
      // subjectDetailList
      subTable.getHomeworkSubjects(sessionStorage.getItem("ident"),subTable.state.clazzId,subTable.state.dateTime,pageNo)
    }

    this.setState({
      currentPage: pageNo,
    });
  },

/*  componentDidMount(){
    getDoneHomeworkList("23836",1);
  },*/

  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div >
        <Table rowSelection={rowSelection} columns={columns}  dataSource={data} pagination={{ total:subTable.state.totalCount,pageSize: 15,onChange:subTable.pageOnChange }} scroll={{ y: 400}}/>
      </div>
    );
  },
});

export default HomeWorkTableComponents;
