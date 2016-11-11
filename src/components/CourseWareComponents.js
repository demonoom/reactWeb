import React, { PropTypes } from 'react';
import { Card, Col, Row,Checkbox,Collapse,Icon,Button,Pagination} from 'antd';
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

  getTeachPlans(ident,teachScheduleId){
      //alert("ccc:"+ident+"==="+teachScheduleId);
      var param = {
          "method":'getTeachPlans',
          "ident":ident,
           "teachScheduleId":teachScheduleId,
          "pageNo":"1"
      };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("teachMSG:"+ret.msg);
          courseWareList=new Array();
        var response = ret.response;
          var count=0;
        response.forEach(function (e) {
          var uId = e.colUid;
          var colName = e.colName;
          var colFileType = e.colFileType;
          console.log(uId+"==========="+colName+"=="+colFileType);
            var courseInfo = {"uId":uId,"colName":colName,"colFileType":colFileType};
            //courseWare.handlePanel(courseInfo);
            activeKey.push(courseInfo.colName);
            courseWareList.push([courseInfo.uId,courseInfo.colName,courseInfo.colFileType]);
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

    buildPanels:function (courseWareList) {
        coursePanelChildren = courseWareList.map((e, i)=> {
            return <Panel header={<span><Icon type="file-ppt" size="large"/>&nbsp;&nbsp;&nbsp;&nbsp;{e[1]}</span> }  key={e[1]}>
                    <pre>
                         文件类型:{e[2]}
                         课件名称:{e[1]}
                         所在知识点：自然地理
                         创建人：张老师
                         上传时间：2016-1-1
                         <Button>使用</Button>
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
            <Collapse defaultActiveKey={activeKey} ref="collapse" onChange={callback}>
                {coursePanelChildren}
            </Collapse>
            <Pagination total={courseWare.state.totalCount}  current={courseWare.state.currentPage} onChange={this.onChange}/>
        </div>
    );
  },

});

export default CourseWareComponents;
