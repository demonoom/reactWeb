import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox,Radio } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

//一级菜单数组
let List=new Array();
//菜单元素，根据构建出来的该对象，对菜单进行生成
let options;
var knowledge;
const UseKnowledgeComponents = React.createClass({
  getInitialState() {
    knowledge = this;
    return {
      loading: false,
      visible: false,
      menuList:[],
      schedule:'',
      currentKnowlege:'',
      optType:'',
      inputState:true,
      isNewSchedule:false,
      currentKnowledgeState:false,
      newScheduleState:false,
      knowledgeName:'',
    };
  },
  showModal(currentKnowlege,optType,knowledgeName) {
      // alert("currentKnowlege:"+currentKnowlege+",optType:"+optType);
      //当前点击的，计划应用的课件资源
    // alert("knowledgeName in user"+knowledgeName);
    knowledge.setState({knowledgeName:knowledgeName});
    knowledge.setState({optType:optType});
    knowledge.setState({currentKnowlege:currentKnowlege});
    knowledge.setState({
      visible: true,
    });
  },
  componentWillMount(){
    this.getLessonMenu();
  },

  handleSubmit(e) {
    e.preventDefault();
    if(this.state.isNewSchedule==true){
      var inputObj = knowledge.refs.scheduleName;
      var scheduleName = inputObj.refs.input.value;
      if(knowledge.state.currentKnowledgeState==true){
        scheduleName=knowledge.state.knowledgeName;
      }else{
        scheduleName = inputObj.refs.input.value;
      }
      knowledge.saveSchedule(sessionStorage.getItem("ident"),scheduleName);
      // currentKnowledgeState:false,
      // newScheduleState:false,
      /*if(knowledge.state.newScheduleState==true){
        var inputObj = knowledge.refs.scheduleName;

        alert("inputValue:"+scheduleName);
        //knowledge.saveSchedule(sessionStorage.getItem("ident"),scheduleName);
      }else{
        var scheduleName = inputObj.refs.input.value;
      }*/
    }else{
      // alert("使用");
      // alert(knowledge.state.currentKnowlege+"===:"+knowledge.state.schedule+",optType"+knowledge.state.optType);
      if(knowledge.state.optType=="courseWare"){
        knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"),knowledge.state.currentKnowlege,knowledge.state.schedule);
      }else{
        knowledge.copySubjects(knowledge.state.currentKnowlege,knowledge.state.schedule);
      }
    }
  },

  saveSchedule(ident,scheduleName){
    var param = {
      "method":'addTeachSchedule',
      "ident":ident,
      "title":scheduleName
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response.colTsId!=null){
          knowledge.setState({schedule:ret.response.colTsId});
          if(knowledge.state.optType=="courseWare"){
            knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"),knowledge.state.currentKnowlege,ret.response.colTsId);
          }else{
            knowledge.copySubjects(knowledge.state.currentKnowlege,knowledge.state.schedule);
          }
          // alert("知识点使用成功");
        }else{
          // alert("知识点使用失败");
        }
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  copyMaterialToSchedule(userId,materiaIds,scheduleId){
    var param = {
      "method":'copyMaterialToSchedule',
      "userId":userId,
      "materiaIds":materiaIds,
      "scheduleId":scheduleId
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.response){
            alert("知识点使用成功");
        }else{
            alert("知识点使用失败");
        }
        knowledge.setState({
          visible: false,
        });
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  copySubjects(subjectsIds,scheduleId){
    var param = {
      "method":'copySubjects',
      "subjectsIds":subjectsIds,
      "teachScheduleId":scheduleId
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.response){
          alert("知识点使用成功");
        }else{
          alert("知识点使用失败");
        }
        knowledge.setState({
          visible: false,
        });
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  handleOk() {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  },
  handleCancel() {
    this.setState({ visible: false });
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

  getLessonMenu(){
    //alert("kkk");
    var param = {
      "method":'getTeachScheduleByIdent',
      "ident":sessionStorage.getItem("ident")
    };
    this.doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        ret.response.forEach(function (e) {
          var lessonArray = e.split("#");
          var scheduleId = lessonArray[0];
          var courseName = lessonArray[1];
          var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
          //console.log(lessonArray[0]+"-----------"+lessonArray[1]);
          //courseTimes需要作为当前教学进度下的资源数量进行显示（课件和题目的总和）
          var lessonInfo = {"scheduleId":scheduleId,"courseName":courseName,"courseTimes":courseTimes};
          List.push([ lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
          console.log("le:"+lessonInfo);
          //knowledge.handleMenu(lessonInfo);
        });
        knowledge.buildMenuChildren();
      },
      onError : function(error) {
        //alert(error);
        //phone.finish();
      }
    });
  },

  handleMenu: function(lessonInfo){
    //lessonData.splice(0,lessonData.length);
    // alert("handleMenu");
    List.push([ lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
    // alert("ll:"+List.length);
  },

  buildMenuChildren:function () {
    //alert("buildMenuChildren"+List.length);
    options = List.map((e, i)=> {
        if(i==0){
            knowledge.setState({schedule:e[0] });
        }
      return <Option key={e[0]} value={e[0]}>{e[1]}</Option>
    });
  },

  handleSchedule: function(e) {
    var value = e;
   // alert("vvv:"+value);
    this.setState({
      schedule: value,
    });
  },

  checkBoxOnChange(e) {
    // currentKnowledgeState:false,
        // newScheduleState:false,
    console.log(`checked = ${e.target.checked}`);
    // currentKnowledgeState:false,
        // newScheduleState:false,
    var checkBoxValue = e.target.value;
    var inputObj = knowledge.refs.scheduleName;
    var currentKnowledgeState;
    var newScheduleState;
    if(checkBoxValue=="currentKnowledge"){
        if(e.target.checked==true){
          currentKnowledgeState=true;
        }else{
          currentKnowledgeState=false;
        }
        inputObj.refs.input.value="";
        knowledge.setState({inputState:true});
    }else{
      if(e.target.checked==true){
        newScheduleState=true;
      }else{
        newScheduleState=true;
      }
      knowledge.setState({inputState:false});
    }
    knowledge.setState({currentKnowledgeState:currentKnowledgeState,newScheduleState:newScheduleState});
    if(currentKnowledgeState==true || newScheduleState==true){
      knowledge.setState({isNewSchedule:true});
    }else{
      knowledge.setState({isNewSchedule:false});
    }
  },

  render() {

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (

      <div>
        <Modal
          visible={this.state.visible}
          title="使用至"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[

          ]}
        >
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormItem
                {...formItemLayout}
                label="教学进度"
            >
              <Select defaultValue={knowledge.state.schedule} key="teachSchedule" style={{ width: '100%' }} ref="teachSchedule" onChange={this.handleSchedule}>
                {options}
              </Select>
              <div>
                <Checkbox onChange={knowledge.checkBoxOnChange} value="currentKnowledge">使用当前知识点作为教学进度</Checkbox>
                <Checkbox onChange={knowledge.checkBoxOnChange} value="newSchedule">新建教学进度:<Input ref="scheduleName" disabled={this.state.inputState}/></Checkbox>
              </div>
              <div className="ant-modal-footer">
			  <Button key="submit" type="primary"  htmlType="submit"  size="large">提交</Button>
			  </div>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  },
});
export  default UseKnowledgeComponents;

