import React, { PropTypes } from 'react';
import { Modal, Button,message } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox,Table,Popover } from 'antd';
import { DatePicker } from 'antd';
import { doWebService } from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

var assignHomeWork;
var classList = [];
var scheduleData = [];
var knowledgeDate=[];
var subjectData = [];
var scheduleColumns = [ {
  title: '备课计划',
  dataIndex: 'scheduleName',

},
];

var subjectColumns = [ {
  title: '内容',
  className:'ant-table-selection-cont2',
  dataIndex: 'content'
}, {
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
];

// const plainOptions = [{label:'xx',value:1}];
var plainOptions = [];
var defaultCheckedList = [];
var sids="";
var clazzIds="";
var dateTime = "";
const AssignHomeWorkComponents = React.createClass({

  getInitialState() {
    assignHomeWork = this;
    sids="";
    clazzIds="";
    dateTime = "";
    assignHomeWork.getTeacherClasses(sessionStorage.getItem("ident"));
    return {
      visible: false,
      optType:'add',
      editSchuldeId:this.props.editSchuldeId,
      classCount:0,
      selectedRowKeys: [],  // Check here to configure the default column
      loading: false,
      scheduleCount:0,
      checkedList: [],
      indeterminate: true,
      checkAll: false,
      selectedSubjectKeys:[],
      subjectCount:0,
      subjectModalVisible:false,
      totalSubjectCount:0,
      currentScheduleId:0,
      isNewPage:false,
      classList:[]
    };
  },

  publishHomeworkSubject(ident,sids,clazzIds,dateTime){
    var param = {
      "method":'publishHomeworkSubject',
      "ident":ident,
      "sids":sids,
      "clazzIds":clazzIds,
      "dateTime":dateTime
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        if(ret.msg=="调用成功" && ret.response==true){
          // alert("作业布置成功");
          message.success("作业布置成功");
        }else{
          // alert("作业布置失败");
          message.error("作业布置失败");
        }
        assignHomeWork.props.callbackParent();
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  handleSubmit(e) {
    e.preventDefault();
    var ident=sessionStorage.getItem("ident");
    if(assignHomeWork.isEmpty(dateTime)){
      // alert("请选择日期");
      message.warning("请选择日期");
    }else if(assignHomeWork.isEmpty(clazzIds)){
      // alert("请选择班级");
      message.warning("请选择班级");
    }else if(assignHomeWork.isEmpty(sids)){
      // alert("请选择题目");
      message.warning("请选择题目");
    }else{
      assignHomeWork.publishHomeworkSubject(ident,sids,clazzIds,dateTime);
      //保存之后，将已选题目列表清空
      plainOptions = [];
    }
  },

  isEmpty(content){
    if(content==null || content=="null" || content=="" || typeof(content)=="undefined"){
      return true;
    }else{
      return false;
    }
  },

  /*handleCancel() {
   assignHomeWork.setState({ visible: false });
   },*/
  handleCancel(e) {
    // 保存之后，将已选题目列表清空
    plainOptions = [];
    assignHomeWork.props.callbackParent();
  },
  checkConfirm(rule, value, callback) {
    const form = this.props.form;
    if (value && this.state.passwordDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  },

  componentDidMount(){
    assignHomeWork.getTeacherClasses(sessionStorage.getItem("ident"));
    // assignHomeWork.getScheduleList();
  },

  //日期控件值改变时，获取当前选择的日期（第一个参数表示的是时间戳，第二个是YYYY-MM-dd格式的日期）
  assignDateOnChange(date, dateString) {
    if(assignHomeWork.isEmpty(date)){
      dateTime="";
    }
    dateTime = ""+date;
    console.log("assignDate:"+dateTime, dateString);
  },

  getTeacherClasses(ident){
    var param = {
      "method":'getTeacherClasses',
      "ident":ident,
    };

    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        var response = ret.response;
        classList.splice(0,classList.length);
        response.forEach(function (e) {
          console.log("getTeacherClasses:"+e);
          var classArray = e.split("#");
          var classId = classArray[0];
          var className = classArray[1];
          classList.push({label:className,value:classId})
        });
        assignHomeWork.getScheduleList();
        //assignHomeWork.getKnowledgeMenu();
        assignHomeWork.setState({classCount:classList.length});
        assignHomeWork.setState({classList:classList});
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }
    });
  },

  classListOnChange:function (checkedValues) {
    console.log('checked = ', checkedValues);
    clazzIds="";
    for(var i=0;i<checkedValues.length;i++){
      var checkedValue=checkedValues[i];
      if(i!=checkedValues.length-1){
        clazzIds+=checkedValue+",";
      }else{
        clazzIds+=checkedValue;
      }
    }
    //
  },

  //获取老师名下的备课计划
  getScheduleList(){
    var param = {
      "method":'getTeachScheduleByIdent',
      "ident":sessionStorage.getItem("ident")
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        ret.response.forEach(function (e) {
          var scheduleArray = e.split("#");
          var scheduleId = scheduleArray[0];
          var courseName = scheduleArray[1];
          scheduleData.push({
            key:scheduleId,
            scheduleName:courseName,
            scheduleOpt:'',
          });
        });
        assignHomeWork.setState({scheduleCount:scheduleData.length});
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }
    });
  },

  /*getKnowledgeMenu(){
    knowledgeDate.splice(0);
    var param = {
      "method":'getUserRalatedPoints',
      "userId":sessionStorage.getItem("ident"),
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        var count =0;
        ret.response.forEach(function (e) {
          count++;
          var scheduleId = scheduleArray[0];
          var courseName = scheduleArray[1];
          scheduleData.push({
            key:scheduleId,
            scheduleName:courseName,
            scheduleOpt:'',
          });
        });
        if(List==null || List.length==0){
          mMenu.setState({noHaveKnowledgeTip:<div className="binding_a">您目前还没有知识点，请先点击下方按钮绑定知识点</div>});
        }else{
          mMenu.buildMenuChildren(List);
          mMenu.setState({totalCount:count,noHaveKnowledgeTip:''});
        }
      },
      onError : function(error) {
        alert(error);
      }
    });
  },*/

  onScheduleSelectChange(selectedRowKeys) {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    var scheduleId = selectedRowKeys.key;
    subjectData=[];
    assignHomeWork.getSubjectDataBySchedule(sessionStorage.getItem("ident"),scheduleId,1);
    assignHomeWork.setState({ selectedRowKeys });
    assignHomeWork.setState({ currentScheduleId:scheduleId});
  },

  subjectListOnChange(checkedList) {
    this.setState({
      checkedList,
      indeterminate: !!checkedList.length && (checkedList.length < plainOptions.length),
      checkAll: checkedList.length === plainOptions.length,
    });
  },
  subjectListOnCheckAllChange(e) {
    assignHomeWork.setState({
      checkedList: e.target.checked ? defaultCheckedList : [],
      indeterminate: e.target.checked,
      checkAll: e.target.checked,
    });
  },

  //根据备课计划获取题目列表
  getSubjectDataBySchedule:function (ident,ScheduleOrSubjectId,pageNo) {
    var param = {
      "method":'getClassSubjects',
      "ident":ident,
      "teachScheduleId":ScheduleOrSubjectId,
      "pageNo":pageNo
    };

    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log("getSubjectDataMSG:"+ret.msg);
        var response = ret.response;
        response.forEach(function (e) {
          console.log("eeeeee:"+e);
          var key = e.id;
          var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>'+e.content+'<hr/><span class="answer_til answer_til_2">答案：</span>'+e.answer+'</div>';
          var content = <Popover placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: popOverContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
          var subjectType=e.typeName;
          subjectData.push({
            key: key+"^"+e.content+"^"+e.answer,
            content: content,
            subjectType:subjectType,
          });
          var pager = ret.pager;
          assignHomeWork.setState({totalSubjectCount:parseInt(pager.rsCount)});
        });
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }

    });
  },

  //题目表格行被选中时获取被选中项目
  onSubjectTableSelectChange(selectedSubjectKeys) {
    console.log('subject selectedRowKeys changed: ', selectedSubjectKeys);
    // assignHomeWork.buildSubjectCheckList(selectedSubjectKeys);
    this.setState({ selectedSubjectKeys });
  },

  buildSubjectCheckList(selectedSubjectKeys){
    plainOptions=[];
    //defaultCheckedList = [];
    var i = 0;
    sids="";
    selectedSubjectKeys.forEach(function (e) {
      var subjectArray = e.split("^");
      console.log("subjectArray[1]："+subjectArray[1])
      defaultCheckedList.push(subjectArray[0]);
      // <article id='contentHtml' className='content content_2' value={subjectArray[1]} dangerouslySetInnerHTML={{__html: subjectArray[1]}} ></article>
      var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>'+subjectArray[1]+'<hr/><span class="answer_til answer_til_2">答案：</span>'+subjectArray[2]+'</div>';
      var content = <Popover placement="rightTop"  content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html:popOverContent}}></article>}><article id='contentHtml' className='content content_2' dangerouslySetInnerHTML={{__html: subjectArray[1]}}></article></Popover>;
      plainOptions.push({label:content,value:subjectArray[0]});
      i++;
      if(i!=selectedSubjectKeys.length){
        sids+=subjectArray[0]+",";
      }else{
        sids+=subjectArray[0];
      }
    });
    assignHomeWork.setState({ checkedList:defaultCheckedList,checkAll:true });
  },

  //移除所有已选择的题目
  removeAllSelectedSubject(){
    if(assignHomeWork.state.checkedList.length==0){
      // alert("请选择题目后，再删除！");
      message.warning("请选择题目后，再删除！");
    }else{
      sids="";
      if(assignHomeWork.state.checkAll==true){
        plainOptions=[];
        defaultCheckedList=[];
        assignHomeWork.setState({selectedSubjectKeys:[]});
        assignHomeWork.setState({ checkedList:defaultCheckedList});
      }else{
        var i = 0;
        while(i<plainOptions.length){
          var checkedListJson = plainOptions[i];
          //判断是否是选中的checkBox
          if(assignHomeWork.removeCheckedList(checkedListJson.value)){
            plainOptions.splice(i,1);
            i=0;
          }else{
            i++;
          }
        }
        if(plainOptions.length==0){
          plainOptions=[];
          defaultCheckedList=[];
          assignHomeWork.setState({selectedSubjectKeys:[]});
          assignHomeWork.setState({ checkedList:defaultCheckedList});
        }else{
          var selectedKeys=[];
          defaultCheckedList.splice(0,defaultCheckedList.length);
          for(var i=0;i<plainOptions.length;i++){
            var checkedListJson = plainOptions[i];
            var key = checkedListJson.value;
            var labelValue = checkedListJson.label.props.value;
            selectedKeys.push(key+"^"+labelValue);
            defaultCheckedList.push(key);
            if(i!=plainOptions.length-1){
              sids+=key+",";
            }else{
              sids+=key;
            }
          }
          assignHomeWork.setState({selectedSubjectKeys:selectedKeys});
          assignHomeWork.setState({ checkedList:defaultCheckedList});
        }
      }
    }
  },

  removeCheckedList(checkedValue){
    for(var i=0;i<assignHomeWork.state.checkedList.length;i++){
      if(checkedValue==assignHomeWork.state.checkedList[i]){
        return true;
      }
    }
    return false;
  },


  showSubjectModal() {
    assignHomeWork.setState({
      subjectModalVisible: true,
    });
  },
  subjectModalHandleOk() {
    console.log('Clicked OK');
    assignHomeWork.buildSubjectCheckList(assignHomeWork.state.selectedSubjectKeys);
    assignHomeWork.setState({
      subjectModalVisible: false,
    });
  },
  subjectModalHandleCancel(e) {
    console.log(e);
    assignHomeWork.setState({
      subjectModalVisible: false,
    });
  },
  //设置禁用今天之前的日期
  /*  disabledDate(current) {
   return current && current.valueOf() < Date.now();
   },*/

  pageOnChange(pageNo) {
    console.log(pageNo);
    assignHomeWork.getSubjectDataBySchedule(sessionStorage.getItem("ident"),assignHomeWork.state.currentScheduleId,pageNo);
    this.setState({
      currentPage: pageNo,
    });
  },


  render() {
    const { loading, selectedSubjectKeys } = assignHomeWork.state;
    const subjectRowSelection = {
      selectedRowKeys:selectedSubjectKeys,
      onChange: assignHomeWork.onSubjectTableSelectChange,
    };
    const hasSelected = selectedSubjectKeys.length > 0;

    return (
        <div>
          <div className="ant-collapse ant-modal-footer homework">

            <Row className="ant-form-item">
              <Col span={3}>
                <span className="date_tr text_30">日期:</span>
              </Col>
              <Col span={21} className="ant-form-item-control">
                <span className="date_tr"><DatePicker onChange={assignHomeWork.assignDateOnChange} /></span>
              </Col>
            </Row>

            <Row className="ant-form-item">
              <Col span={3}>
                <span className="date_tr text_30">班级:</span>
              </Col>
              <Col span={21} className="ant-form-item-control">
                <span className="date_tr"><CheckboxGroup options={assignHomeWork.state.classList} onChange={assignHomeWork.classListOnChange}/></span>
              </Col>
            </Row>

            <Row className="date_tr ant-form-item">
              <Col span={3}>
                <span className="text_30">题目:</span>
              </Col>
              <Col span={21} className="ant-form-item-control">
                <div>
                  <Row>
                    <Col span={24}>
                      <div>
                        <Button type="add_study add_study-b" onClick={assignHomeWork.showSubjectModal}><Icon type="check-circle-o" />选择题目</Button>
                        <div className="class_bo">
                          <Checkbox
                              indeterminate={assignHomeWork.state.indeterminate}
                              onChange={assignHomeWork.subjectListOnCheckAllChange}
                              checked={assignHomeWork.state.checkAll}
                          >
                            全 选  <Button onClick={assignHomeWork.removeAllSelectedSubject}>删除已选题目</Button>
                          </Checkbox>
                        </div>
                        <br />
                        <CheckboxGroup options={plainOptions} defaultValue={assignHomeWork.state.checkedList} value={assignHomeWork.state.checkedList} onChange={assignHomeWork.subjectListOnChange} />
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>

          </div>

          <Row className="homework_out ant-modal-footer">
            <Col span={24}>
                 <span>
                   <Button type="primary" htmlType="submit" className="login-form-button class_right" onClick={assignHomeWork.handleSubmit}>
                    保存
                   </Button>
                   <Button type="ghost" htmlType="reset" className="login-form-button" onClick={this.handleCancel} >
                    取消
                   </Button>
                 </span>
            </Col>
          </Row>
          <Modal title="选择题目" className="choose_class" visible={assignHomeWork.state.subjectModalVisible}
                 onCancel={assignHomeWork.subjectModalHandleCancel}
                 transitionName=""  //禁用modal的动画效果
                 footer={[

                   <Button key="return" type="primary" size="large" onClick={assignHomeWork.subjectModalHandleOk}>确定</Button>,

                   <Button key="ok" type="ghost" size="large" onClick={assignHomeWork.subjectModalHandleCancel}>取消</Button>,

                 ]}
          >
            <Row style={{height:400}}>
              <Col span={7} className="ant-form"><Table size="small"  onRowClick={assignHomeWork.onScheduleSelectChange} selectedRowKeys={assignHomeWork.selectedRowKeys}  columns={scheduleColumns}  dataSource={scheduleData} scroll={{ y: 300}}/></Col>
              <Col span={17} className="col17_le 17_hei ant-form">
                <div className="17_hei1">
                  <Table rowSelection={subjectRowSelection} columns={subjectColumns} dataSource={subjectData} pagination={{ total:assignHomeWork.state.totalSubjectCount,pageSize: getPageSize(),onChange:assignHomeWork.pageOnChange }}  scroll={{ y: 300}}/>
                </div>
              </Col>
            </Row>
          </Modal>
        </div>
    );
  },
});
export  default AssignHomeWorkComponents;

