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
        courseListState:this.props.courseList,
        activeKey:[],
        currentPage:1,
        totalCount:0,
        ident:'',
        teachScheduleId:'',
        optType:'',
        knowledgeName:''
    };
  },

    doWebService : function(data,listener) {
        var service = this;
        //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
        this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
        // this.WEBSERVICE_URL = "http://192.168.1.115:8080/Excoord_For_Education/webservice";
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

  initCourseWareList(){
      courseWare.setState({courseListState:[]});
      courseWare.setState({totalCount:0});
  },

  getTeachPlans(ident,teachScheduleId,optType,pageNo,knowledgeName){
      // alert("ccc:"+ident+"==="+teachScheduleId+"===="+optType);
      courseWare.setState({
          ident:ident,
          teachScheduleId:teachScheduleId,
          optType:optType,
          knowledgeName:knowledgeName
      })
      var param;
      if(optType=="bySchedule"){
          param = {
              "method":'getMaterialsBySheduleId',
              "scheduleId":teachScheduleId,
              "pageNo":pageNo
          };
          this.doWebService(JSON.stringify(param), {
              onResponse : function(ret) {
                  console.log("teachMSG:"+ret.msg);
                  courseWareList=new Array();
                  var response = ret.response;
                  response.forEach(function (e) {
                      var id = e.id;
                      var fileName = e.name;
                      var userName = e.user.userName;
                      var path = e.path;
                      var pdfPath = e.pdfPath;
                      var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                      var pointId = e.point.content;
                      var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                     // alert(e.createTime);//1476 0186 7700 0
                      var fileTypeLogo;
                      var htmlPath="";
                      if(fileType=="ppt"){
                          fileTypeLogo = "icon_geshi icon_ppt";
                          htmlPath = e.htmlPath;
                      }else if(fileType=="mp4"){
                          fileTypeLogo = "icon_geshi icon_mp4";
                      }else if(fileType=="flv"){
                          fileTypeLogo = "icon_geshi icon_flv";
                      }else if(fileType=="pdf"){
                          fileTypeLogo = "icon_geshi icon_pdf";
                      }else if(fileType=="pptx"){
                          fileTypeLogo = "icon_geshi icon_pptx";
                          htmlPath = e.htmlPath;
                      }
                      var createTime = courseWare.getLocalTime(e.createTime);
                      // console.log(uId+"==========="+colName+"=="+colFileType);
                      // var courseInfo = {"uId":uId,"colName":colName,"colFileType":colFileType};
                      //courseWare.handlePanel(courseInfo);
                      activeKey.push(fileName);
                      courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointId,createTime,fileTypeLogo,htmlPath,collectCount]);
                  });
                  courseWare.buildPanels(courseWareList);
                  courseWare.setState({courseListState:courseWareList});
                  var pager = ret.pager;
                  courseWare.setState({totalCount:parseInt(pager.pageCount)*15});
              },
              onError : function(error) {
                  alert(error);
              }

          });
      }else{
          param = {
              "method":'getMaterialsByKnowledgePointId',
              "userId":"-1",
              "pointId":teachScheduleId,
              "type":"-1",
              "pageNo":pageNo,
          };
          this.doWebService(JSON.stringify(param), {
              onResponse : function(ret) {
                  console.log("teachMSG:"+ret.msg);
                  courseWareList=new Array();
                  var response = ret.response;
                  response.forEach(function (e) {
                      var id = e.id;
                      var fileName = e.name;
                      var userName = e.user.userName;
                      var path = e.path;
                      var pdfPath = e.pdfPath;
                      var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                      var pointId = e.pointId;
                      var createTime = courseWare.getLocalTime(e.createTime);
                      var fileTypeLogo;
                      var type = e.type;
                      var htmlPath="";
                      var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                      if(fileType=="ppt"){
                          fileTypeLogo = "icon_geshi icon_ppt";
                          htmlPath = e.htmlPath;
                      }else if(fileType=="mp4"){
                          fileTypeLogo = "icon_geshi icon_mp4";
                      }else if(fileType=="flv"){
                          fileTypeLogo = "icon_geshi icon_flv";
                      }else if(fileType=="pdf"){
                          fileTypeLogo = "icon_geshi icon_pdf";
                      }else if(fileType=="pptx"){
                          fileTypeLogo = "icon_geshi icon_pptx";
                          htmlPath = e.htmlPath;
                      }
                      activeKey.push(fileName);
                      courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointId,createTime,fileTypeLogo,htmlPath,type,collectCount]);
                  });
                  courseWare.buildKonwledgePanels(courseWareList);
                  courseWare.setState({courseListState:courseWareList});
                  var pager = ret.pager;
                  courseWare.setState({totalCount:parseInt(pager.pageCount)*15});
              },
              onError : function(error) {
                  alert(error);
              }

          });
      }
  },
    getLocalTime:function (nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
        return newDate;
    },

    onChange(page) {
        console.log(page);
        courseWare.getTeachPlans(courseWare.state.ident,courseWare.state.teachScheduleId,courseWare.state.optType,page)
        this.setState({
            currentPage: page,
        });

    },

    /*handlePanel:function (courseInfo) {

        this.setState({courseListState:courseWareList});
        this.buildPanels();
    },*/

    showModal:function (e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var currentSchedule = target.value;
         // alert("111"+currentSchedule+","+this.refs.useKnowledgeComponents);
        this.refs.useKnowledgeComponents.showModal(currentSchedule,"courseWare",courseWare.state.knowledgeName);
    },

    buildPanels:function (courseWareList) {
        coursePanelChildren = courseWareList.map((e, i)=> {
            var eysOnButton ;
            if(e[9]!=null && e[9]!="" && typeof(e[9])!="undefined" ){
                // eysOnButton = <Button style={{ float:'right'}} icon="eye-o" title="查看" value={e[9]} onClick={courseWare.viewFile}></Button>
                eysOnButton = <a href={e[9]} target="_blank" title="查看"  style={{ float:'right'}}><Button icon="eye-o"/></a>
            }
            return <Panel header={<span><span type="" className={e[8]}></span><span>{e[1]}</span> </span>}  key={e[1]}>
                    <pre>
					 <div className="bnt2_tex">
                         <span><span className="col1">文件类型：</span><span className="col2">{e[5]}</span></span>
                         <span><span className="col1">课件名称：</span><span className="col2">{e[1]}</span></span>
                         <span><span className="col1">所在知识点：</span><span className="col2">{e[6]}</span></span>
                         <span><span className="col1">创建人：</span><span className="col2">{e[2]}</span></span>
                         {/*<span><span className="col1">所在学校：</span><span className="col2">上海七宝中学</span></span>*/}
                         <span><span className="col1">上传时间：</span><span className="col2">{e[7]}</span></span>
                         <span><span className="col1">点赞次数：</span><span className="col2">{e[10]}</span></span>
					</div>
					<div className="bnt2_right">
                         <Button style={{ float:'right'}} icon="delete" title="删除" value={e[1]} onClick=""></Button>
                         {/*<Button style={{ float:'right'}} icon="download" title="下载"  value={e[3]} onClick={courseWare.downLoadFile}></Button>*/}
                        <a href={e[3]} target="_blank" title="下载"   style={{ float:'right'}}><Button icon="download"/></a>
                         {eysOnButton}
					</div>
                    </pre>
            </Panel>
        });
        //courseWare.setState({activeKey:activeKey});
    },

    downLoadFile:function (e) {
        // alert("123"+e);
        // window.location.href=e.target.value;
        window.open(e.target.value);
    },

    viewFile:function (e) {
        // alert("123"+e);
        window.location.href=e.target.value;
        // window.open(e.target.value);
    },

    buildKonwledgePanels:function (courseWareList) {
        coursePanelChildren = courseWareList.map((e, i)=> {
            var eysOnButton ;
            // var useButton;
            if(e[9]!=null && e[9]!=""){
                // eysOnButton = <Button style={{ float:'right'}} icon="eye-o" title="查看" value={e[9]} onClick={courseWare.viewFile}></Button>
                eysOnButton = <a href={e[9]} target="_blank" title="查看"  style={{ float:'right'}} ><Button icon="eye-o"/></a>
            }
            /*if(e[10]!=null && e[10]!="" && e[10]==3){
                useButton=<Button value={e[0]} style={{ float:'right'}} type=""  onClick={this.showModal}>引用微课</Button>
            }*/
            return <Panel header={<span><span type="" className={e[8]}></span><span>{e[1]}</span> </span>}  key={e[1]}>
                    <pre>
					<div className="bnt2_tex">
                         <span>文件类型：{e[5]}</span>
                         <span>课件名称：{e[1]}</span>
                         <span>所在知识点：{e[6]}</span>
                         <span>创建人：{e[2]}</span>
                         <span>上传时间：{e[7]}</span>
                         <span>点赞次数：{e[11]}</span>
                      </div>       

                            <div className="bnt2_right">
                                {/*<Button value={e.sid} onClick="" className="right_ri">引用微课</Button>*/}
                                <a href={e[3]} target="_blank" title="下载"  style={{ float:'right'}}><Button icon="download"/></a>
                                {/*<Button style={{ float:'right'}} icon="download"  title="下载" value={e[3]} onClick={courseWare.downLoadFile}></Button>*/}
                                <Button style={{ float:'right'}} type=""  icon="export" title="使用"  value={e[0]} onClick={this.showModal}></Button>
                                {eysOnButton}
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
            <div>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <Collapse defaultActiveKey={activeKey} ref="collapse" onChange={callback}>
                    {coursePanelChildren}
                </Collapse>
            </div>
            <Pagination total={courseWare.state.totalCount} pageSize={15} current={courseWare.state.currentPage} onChange={this.onChange}/>
        </div>
    );
  },

});

export default CourseWareComponents;
