import React, { PropTypes } from 'react';
import { Modal, Button } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
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
      loading: false,
      visible: false,
      menuList:[],
      schedule:'',
      currentSchedule:'',
    };
  },
  showModal(currentSchedule) {
      //alert("currentSchedule:"+currentSchedule);
      //当前点击的，计划应用的课件资源
      this.setState({currentSchedule:currentSchedule});
    knowledge.setState({
      visible: true,
    });
  },
  componentWillMount(){
    this.getLessonMenu();
  },

  handleSubmit(e) {
    e.preventDefault();
     alert(knowledge.state.schedule);
    /*this.props.form.validateFieldsAndScroll((err, values) => {
      alert(values);
      if (err) {
        return;
      }
      console.log('Received values of form: ', values);
    });*/
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
      "ident":'23836'
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

  render() {

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (


      <div>

       {/* <Button type="primary" icon="share-alt" onClick={this.showModal}></Button>*/}
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
              <Button key="submit" type="primary"  htmlType="submit"  size="large">
                提交
              </Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  },
});
export  default UseKnowledgeComponents;

