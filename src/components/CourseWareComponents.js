import React, { PropTypes } from 'react';
import { Card, Col, Row,Checkbox,Collapse,Icon,Button,Pagination} from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
const Panel = Collapse.Panel;

function callback(key) {
  console.log(key);
}

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;


var courseWare;
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
const CourseWareComponents = React.createClass({

  getInitialState() {
    courseWare = this;
    return {
        courseListState:[],
        activeKey:[],
        currentPage:1,
        totalCount:0
    };
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
            //alert("1111:"+result+"=="+status);
            service.requesting = false;
            if (status == "success") {
                listener.onResponse(result);
            } else {
                listener.onError(result);
            }
        }, "json");
    },

  getTeachPlans(ident,teachScheduleId,optType){
      alert("ccc:"+ident+"==="+teachScheduleId+"===="+optType);
      var param;
      if(optType=="bySchedule"){
          param = {
              "method":'getMaterialsBySheduleId',
              "scheduleId":teachScheduleId,
              "pageNo":"1"
          };
          this.doWebService(JSON.stringify(param), {
              onResponse : function(ret) {
                  console.log("teachMSG:"+ret.msg);
                  courseWareList=new Array();
                  var response = ret.response;
                  var count=0;
                  response.forEach(function (e) {
                      var id = e.id;
                      var fileName = e.name;
                      var userName = e.user.userName;
                      var path = e.path;
                      var pdfPath = e.pdfPath;
                      var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                      var pointId = e.pointId;
                      var createTime = e.createTime;
                      // console.log(uId+"==========="+colName+"=="+colFileType);
                      // var courseInfo = {"uId":uId,"colName":colName,"colFileType":colFileType};
                      //courseWare.handlePanel(courseInfo);
                      activeKey.push(fileName);
                      courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointId,createTime]);
                      count++;
                  });

                  courseWare.buildPanels(courseWareList);
                  courseWare.setState({courseListState:courseWareList});
                  courseWare.setState({totalCount:count});
              },
              onError : function(error) {
                  alert(error);
              }

          });
      }else{
          param = {
              "method":'getMaterialsByKnowledgePointId',
              "pointId":teachScheduleId,
              "type":"0",
              "pageNo":"1",
          };
          this.doWebService(JSON.stringify(param), {
              onResponse : function(ret) {
                  console.log("teachMSG:"+ret.msg);
                  courseWareList=new Array();
                  var response = ret.response;
                  var count=0;
                  response.forEach(function (e) {
                      var id = e.id;
                      var fileName = e.name;
                      var userName = e.user.userName;
                      var path = e.path;
                      var pdfPath = e.pdfPath;
                      var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                      var pointId = e.pointId;
                      var createTime = e.createTime;
                      // console.log(uId+"==========="+colName+"=="+colFileType);
                      // var courseInfo = {"uId":uId,"colName":colName,"colFileType":colFileType};
                      //courseWare.handlePanel(courseInfo);
                      activeKey.push(fileName);
                      courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointId,createTime]);
                      count++;
                  });

                  courseWare.buildKonwledgePanels(courseWareList);
                  courseWare.setState({courseListState:courseWareList});
                  courseWare.setState({totalCount:count});
              },
              onError : function(error) {
                  alert(error);
              }

          });
      }
  },

    onChange(page) {
        console.log(page);
        this.setState({
            currentPage: page,
        });
    },

    /*handlePanel:function (courseInfo) {

        this.setState({courseListState:courseWareList});
        this.buildPanels();
    },*/

    showModal:function (e) {
        var currentSchedule = e.target.value;
        alert("111"+currentSchedule+","+this.refs.useKnowledgeComponents);
        this.refs.useKnowledgeComponents.showModal(currentSchedule,"courseWare");
    },

    buildPanels:function (courseWareList) {
        coursePanelChildren = courseWareList.map((e, i)=> {
            return <Panel header={<span><Icon type="file-pdf" size="large"/>&nbsp;&nbsp;&nbsp;&nbsp;{e[1]}</span> }  key={e[1]}>
                    <pre>
                         <span>文件类型：{e[5]}</span>
                         <span>课件名称：{e[1]}</span>
                         <span>所在知识点：{e[6]}</span>
                         <span>创建人：{e[2]}</span>
                         <span>上传时间：{e[7]}</span>
                         <a href={e[3]}>下载</a>
                         <Button style={{ float:'right'}} type="primary"  icon="share-alt"  value={e[1]} onClick="this.downLoadFile(e[3])">下载</Button>
                    </pre>
            </Panel>
        });
        //courseWare.setState({activeKey:activeKey});
    },
/*    downLoadFile:function (hrefAddress) {
        alert(hrefAddress);
        window.location.href=hrefAddress;
    },*/

    buildKonwledgePanels:function (courseWareList) {
        coursePanelChildren = courseWareList.map((e, i)=> {
            return <Panel header={<span><Icon type="file-ppt" size="large"/>&nbsp;&nbsp;&nbsp;&nbsp;{e[1]}</span> }  key={e[1]}>
                    <pre>
                         <span>文件类型：{e[5]}</span>
                         <span>课件名称：{e[1]}</span>
                         <span>所在知识点：{e[6]}</span>
                         <span>创建人：{e[2]}</span>
                         <span>上传时间：{e[7]}</span>
                            

                            <div>
                                <a href={e[3]}>下载</a>
                                <Button style={{ float:'right'}} type="primary"  icon="share-alt"  value={e[0]} onClick={this.showModal}>使用</Button>
                            </div>

                    </pre>
            </Panel>
        });
        //courseWare.setState({activeKey:activeKey});
    },

  /*componentDidMount(){
    alert("1111");
    courseWare.getTeachPlans(23836,5237);
  },*/

  render: function () {
    return (
        <div>
            <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
            <Collapse defaultActiveKey={activeKey} ref="collapse" onChange={callback}>
                {coursePanelChildren}
            </Collapse>
            <Pagination total={courseWare.state.totalCount}  current={courseWare.state.currentPage} onChange={this.onChange}/>
        </div>
    );
  },

});

export default CourseWareComponents;
