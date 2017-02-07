import React, { PropTypes } from 'react';
import { Modal, Button,message } from 'antd';
import { Form, Input, Select,Radio,Row,Col } from 'antd';
import { doWebService } from '../WebServiceHelper';
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

//一级菜单数组
let List=new Array();
//菜单元素，根据构建出来的该对象，对菜单进行生成
let options;
var knowledge;
const UseKnowledgeComponents = React.createClass({
  getInitialState() {
    knowledge = this;
    return {
      visible: false,
      menuList:[],
      schedule:'',//当前下拉列表选择的备课计划id
      currentKnowlege:'',
      optType:'',
      knowledgeName:'',
      selectOptions:[],
      useTypeValue:'currentKnowledge'
    };
  },
  showModal(currentKnowlege,optType,knowledgeName) {
    //当前点击的，计划应用的课件资源
    knowledgeName = knowledgeName;
    knowledge.setState({knowledgeName:knowledgeName});
    knowledge.setState({optType:optType});
    knowledge.setState({currentKnowlege:currentKnowlege});
    knowledge.setState({
      visible: true,
    });
    this.getLessonMenu();
  },

  initPage(){
    knowledge.setState({
      schedule:'',
      selectOptions:[],
      useTypeValue:'currentKnowledge'
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    if(knowledge.state.optType=="TeacherAllSubjects"){
      //个人中心题目列表的使用功能
      console.log("=====TeacherAllSubjects")
      knowledge.copySubjects(knowledge.state.currentKnowlege,knowledge.state.schedule);
    }else if(knowledge.state.optType=="TeacherAllCourseWare"){
      //个人中心资源列表的使用功能
      knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"),knowledge.state.currentKnowlege,knowledge.state.schedule);
    }else{
      //资源库的使用功能
      if(this.state.useTypeValue=="currentKnowledge"){
        //使用当前知识点作为备课计划
        var scheduleName = this.state.knowledgeName;
        knowledge.saveSchedule(sessionStorage.getItem("ident"),scheduleName);
      }else if(this.state.useTypeValue=="searchSchedule"){
        //使用至现有计划
        if(knowledge.state.optType=="courseWare"){
          knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"),knowledge.state.currentKnowlege,knowledge.state.schedule);
        }else{
          knowledge.copySubjects(knowledge.state.currentKnowlege,knowledge.state.schedule);
        }
      }else if(this.state.useTypeValue=="newSchedule"){
        //新建备课计划
        var inputObj = knowledge.refs.scheduleName;
        var scheduleName = inputObj.refs.input.value;
        knowledge.saveSchedule(sessionStorage.getItem("ident"),scheduleName);
      }
    }

    knowledge.initPage();
  },

  saveSchedule(ident,scheduleName){
    var param = {
      "method":'addTeachSchedule',
      "ident":ident,
      "title":scheduleName
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response.colTsId!=null){
          knowledge.setState({schedule:ret.response.colTsId});
          if(knowledge.state.optType=="courseWare"){
            knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"),knowledge.state.currentKnowlege,ret.response.colTsId);
          }else{
            knowledge.copySubjects(knowledge.state.currentKnowlege,knowledge.state.schedule);
          }
        }
      },
      onError : function(error) {
        message.error(error);
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
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
          message.success("课件使用成功");
        }else{
          message.error("课件使用失败");
        }
        knowledge.setState({
          visible: false,
        });
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  copySubjects(subjectsIds,scheduleId){
    var param = {
      "method":'copySubjects',
      "subjectsIds":subjectsIds,
      "teachScheduleId":scheduleId
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
          message.success("题目使用成功");
        }else{
          message.error("题目使用失败");
        }
        knowledge.setState({
          visible: false,
        });
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  handleCancel() {
    knowledge.initPage();
    this.setState({ visible: false });
  },

  getLessonMenu(){
    var param = {
      "method":'getTeachScheduleByIdent',
      "ident":sessionStorage.getItem("ident")
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        List.splice(0,List.length);
        ret.response.forEach(function (e) {
          var lessonArray = e.split("#");
          var scheduleId = lessonArray[0];
          var courseName = lessonArray[1];
          var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
          //console.log(lessonArray[0]+"-----------"+lessonArray[1]);
          //courseTimes需要作为当前备课计划下的资源数量进行显示（课件和题目的总和）
          var lessonInfo = {"scheduleId":scheduleId,"courseName":courseName,"courseTimes":courseTimes};
          List.push([ lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
          console.log("le:"+lessonInfo);
          //knowledge.handleMenu(lessonInfo);
          knowledge.setState({menuList:List});
        });
        knowledge.buildMenuChildren();
      },
      onError : function(error) {
      }
    });
  },

  handleMenu: function(lessonInfo){
    List.push([ lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
  },

  buildMenuChildren:function () {
    options = List.map((e, i)=> {
      if(i==0){
        knowledge.setState({schedule:e[0] });
      }
      return <Option key={e[0]} value={e[0]}>{e[1]}</Option>
    });
    knowledge.setState({selectOptions:options});
  },

  handleSchedule: function(e) {
    var value = e;
    this.setState({
      schedule: value
    });
  },

  useTypeOnChange(e) {
    this.setState({
      useTypeValue: e.target.value,
    });
  },

  render() {

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };

    var attach;
    if(knowledge.state.optType=="TeacherAllSubjects" || knowledge.state.optType=="TeacherAllCourseWare"){
      attach = <div className='ant-radio-group ant-radio-group-large'><Radio value="currentKnowledge">使用至现有计划：
        <Select defaultValue={knowledge.state.schedule} value={knowledge.state.schedule} key="teachSchedule" style={{ width: '100%' }} ref="teachSchedule" onChange={this.handleSchedule}>
          {knowledge.state.selectOptions}
        </Select></Radio></div>;
    }else{
      attach = <RadioGroup onChange={this.useTypeOnChange} value={this.state.useTypeValue}>
        <Radio value="currentKnowledge">使用当前知识点名称作为备课计划名称</Radio><br />
        <Radio value="searchSchedule">
          使用至现有计划：
          <Select defaultValue={knowledge.state.schedule} value={knowledge.state.schedule} key="teachSchedule" style={{ width: '100%' }} ref="teachSchedule" onChange={this.handleSchedule}>
            {knowledge.state.selectOptions}
          </Select>
        </Radio><br />
        <Radio value="newSchedule">新建备课计划:<Input ref="scheduleName"/></Radio>
      </RadioGroup>;
    }

    return (

        <div>
          <Modal
              visible={this.state.visible}
              title="使用至备课计划"
              onCancel={this.handleCancel}
              transitionName=""  //禁用modal的动画效果
              footer={[
                <Button key="submit" type="primary"  htmlType="submit"  size="large" onClick={this.handleSubmit}>提交</Button>
              ]}
          >
            <Form horizontal>
              <FormItem
                  {...formItemLayout}
              >
                {attach}
              </FormItem>
            </Form>
          </Modal>
        </div>
    );
  },
});
export  default UseKnowledgeComponents;

