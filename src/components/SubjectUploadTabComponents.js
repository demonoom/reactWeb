import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Form, Input, Select, Row, Col, Checkbox } from 'antd';
import {  message } from 'antd';
import CkEditorComponentForSingle from './ckeditorComponents/CkEditorComponentForSingle';
import CkEditorComponentForMuSelect from './ckeditorComponents/CkEditorComponentForMuSelect';
import CkEditorComponentForCorrect from './ckeditorComponents/CkEditorComponentForCorrect';
import CkEditorComponentForSimple from './ckeditorComponents/CkEditorComponentForSimple';
import CkEditorComponentForAnswer from './ckeditorComponents/CkEditorComponentForAnswer';
import { doWebService } from '../WebServiceHelper';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

var mulitiAnswer = new Array('A');
var subjectUpload;
const SubjectUploadTabComponents = Form.create()(React.createClass({
  getInitialState() {
    subjectUpload = this;
    return {
      loading: false,
      visible: false,
      activeKey: '单选题',
      score:1,
      subjectName:'',
      singleAnswer:'A',
      scoreChecked:false,
      scoreInputState:true,
      scoreDisable:false,
      mulitiAnswerDefaultValue:'A',
      correctAnswerValue:"正确",
      useSameScheduleForSingle:true,
      useSameScheduleForMSelect:true,
      useSameScheduleForCorrect:true,
      useSameScheduleForSimpleAnswer:true,
    };
  },
  showModal() {
    this.setState({
      visible: true,
    });
  },
  handleOk() {
    this.setState({ visible: false });
  },
  editorsInit(){
      if(this.state.activeKey=="单选题"){
        if(!this.isEmpty(CKEDITOR.instances['singleEditor'])){
          CKEDITOR.instances['singleEditor'].setData('');
        }
      }else if(this.state.activeKey=="多选题"){
        if(!this.isEmpty(CKEDITOR.instances['muEditor'])){
          CKEDITOR.instances['muEditor'].setData('');
        }
      }else if(this.state.activeKey=="判断题"){
        if(!this.isEmpty(CKEDITOR.instances['correctEditor'])){
          CKEDITOR.instances['correctEditor'].setData('');
        }
      }else if(this.state.activeKey=="简答题"){
        if(!this.isEmpty(CKEDITOR.instances['simpleEditor'])){
          CKEDITOR.instances['simpleEditor'].setData('');
        }
        if(!this.isEmpty(CKEDITOR.instances['answerEditor'])){
          CKEDITOR.instances['answerEditor'].setData('');
        }
      }
  },
  handleCancel() {
    this.setState({ visible: false });
    this.initPage();
  },

  handleEmail: function(val){
    this.props.callbackParent(val);
  },

  selectHandleChange:function (value) {
    console.log(`selected ${value}`);
    this.setState({score:value});
  },

  //系统非空判断
  isEmpty(content){
    if(content==null || content=="" || typeof(content)=="undefined"){
      return true;
    }else{
      return false;
    }
  },

  initPage(){
    this.editorsInit();
    this.setState({score:1,scoreDefinedValue:''});
    if(!this.isEmpty(this.refs.singleAnswer)){
      this.refs.singleAnswer.state.value="A";
    }
    if(!this.isEmpty(this.refs.scoreDefined)){
      this.refs.scoreDefined.refs.input.value="";
    }
    this.setState({scoreChecked:false,scoreInputState:true,scoreDisable:false,mulitiAnswerDefaultValue:'A',correctAnswerValue:"正确"});
  },

  //新增题目到知识点下
  saveSubject(batchAddSubjectBeanJson,knowledgeName,isLinkToSchedule){
    var param = {
      "method":'batchAddSubjects',
      "batchAddSubjectBeanJson":[batchAddSubjectBeanJson],
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.success==true){
          if(isLinkToSchedule==true){
            var subjectsIds = ret.response[0];
            var userId = sessionStorage.getItem("ident");
            subjectUpload.teachScheduleInfo(userId,knowledgeName,subjectsIds);
          }else{
            message.success("题目添加成功");
            subjectUpload.props.courseUploadCallBack();
          }
        }else{
          message.error("题目添加失败");
        }
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  //获取备课计划，如果没有会创建一个新的
  teachScheduleInfo(userId,title,subjectsIds){
    var param = {
      "method":'getOrCreateTeachSchedule',
      "userId":userId,
      "title":title,
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.success==true){
          var scheduleId = ret.response.colTsId;
          subjectUpload.copySubjects(subjectsIds,scheduleId);
        }
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
          message.success("题目添加成功");
          subjectUpload.props.courseUploadCallBack();
        }
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  //单选题新增
  singleHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    //获取当前点击的是哪个按钮
    var currentButton = target.textContent;
    var ident = sessionStorage.getItem("ident");
    var score = this.state.score;
    //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
    if(this.state.scoreDisable==true){
      score =this.state.scoreDefinedValue;
    }
    var subjectName = CKEDITOR.instances['singleEditor'].getData();
    subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
    var answer = this.state.singleAnswer;
    var subjectParamArray = this.props.params.split("#");
    var ident = subjectParamArray[0];
    var ScheduleOrSubjectId = subjectParamArray[1];
    var optType = subjectParamArray[3];
    var knowledgeName = subjectParamArray[4];
    if(ScheduleOrSubjectId==null || ScheduleOrSubjectId==""){
        ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
        knowledgeName = sessionStorage.getItem("lastClickMenuName");
    }
    var isLinkToSchedule=this.state.useSameScheduleForSingle;
    //完成基础的非空验证
    if(this.isEmpty(subjectName)){
      message.warning("请输入题目");
    }else if(this.isEmpty(answer)){
      message.warning("请输入答案");
    }else if(this.isEmpty(score) || score==0){
      message.warning("请选择分值");
    }else{
      var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"C"};
      if(optType=="bySubjectId"){
        batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
      }
      //完成题目的新增操作
      this.saveSubject(batchAddSubjectBeanJson,knowledgeName,isLinkToSchedule);
      if(currentButton=="保存并返回列表"){
        //关闭并返回题目列表页面
        this.setState({ visible: false,score:1});
      }
      //重新初始化页面
      this.initPage();
    }
  },
  //多选题新增
  MulitiHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    // data=[];
    //获取当前点击的是哪个按钮
    var currentButton = target.textContent;
    this.props.form.validateFieldsAndScroll((err, values) => {
      var ident = sessionStorage.getItem("ident");
      var score = this.state.score;
      //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
      if(this.state.scoreDisable==true){
        score =this.state.scoreDefinedValue;
      }
      var subjectName = CKEDITOR.instances['muEditor'].getData();
      subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
      //将获取的多选答案数组转换为字符串
      var answer = "";
      for(var i = 0;i<mulitiAnswer.length;i++){
        answer += mulitiAnswer[i];
      }
      var subjectParamArray = this.props.params.split("#");
      var ident = subjectParamArray[0];
      var ScheduleOrSubjectId = subjectParamArray[1];
      var optType = subjectParamArray[3];
      var knowledgeName = subjectParamArray[4];
      if(ScheduleOrSubjectId==null || ScheduleOrSubjectId==""){
        ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
        knowledgeName = sessionStorage.getItem("lastClickMenuName");
      }
      var isLinkToSchedule=this.state.useSameScheduleForMSelect;
      var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"MC"};
      if(optType=="bySubjectId"){
        batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
      }
      //完成基础的非空验证
      if(this.isEmpty(subjectName)){
        message.warning("请输入题目");
      }else if(this.isEmpty(answer)){
        message.warning("请输入答案");
      }else if(this.isEmpty(score) || score==0){
        message.warning("请选择分值");
      }else{
        this.saveSubject(batchAddSubjectBeanJson,knowledgeName,isLinkToSchedule);
        if(currentButton=="保存并返回列表"){
          //关闭并返回题目列表页面
          this.setState({ visible: false,score:1});
        }
      }
      //重新初始化页面
      this.initPage();
    });
  },
  //判断题新增
  correctHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    // data=[];
    //获取当前点击的是哪个按钮
    var currentButton = target.textContent;
    this.props.form.validateFieldsAndScroll((err, values) => {
      var ident = sessionStorage.getItem("ident");
      var score = this.state.score;
      //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
      if(this.state.scoreDisable==true){
        score =this.state.scoreDefinedValue;
      }
      var subjectName =  CKEDITOR.instances['correctEditor'].getData();
      subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
      var answer = this.state.correctAnswerValue;
      var subjectParamArray = this.props.params.split("#");
      var ident = subjectParamArray[0];
      var ScheduleOrSubjectId = subjectParamArray[1];
      var optType = subjectParamArray[3];
      var knowledgeName = subjectParamArray[4];
      if(ScheduleOrSubjectId==null || ScheduleOrSubjectId==""){
        ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
        knowledgeName = sessionStorage.getItem("lastClickMenuName");
      }
      var isLinkToSchedule=this.state.useSameScheduleForCorrect;
      var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"J"};
      if(optType=="bySubjectId"){
        batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
      }
      //完成基础的非空验证
      if(this.isEmpty(subjectName)){
        message.warning("请输入题目");
      }else if(this.isEmpty(answer)){
        message.warning("请输入答案");
      }else if(this.isEmpty(score) || score==0){
        message.warning("请选择分值");
      }else {
        this.saveSubject(batchAddSubjectBeanJson,knowledgeName,isLinkToSchedule);
        if(currentButton=="保存并返回列表"){
          //关闭并返回题目列表页面
          this.setState({ visible: false,score:1});
        }
      }
      //重新初始化页面
      this.initPage();
    });
  },

  //简答题新增
  simpleAnswerHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    // data=[];
    //获取当前点击的是哪个按钮
    var currentButton = target.textContent;
    this.props.form.validateFieldsAndScroll((err, values) => {
      var ident = sessionStorage.getItem("ident");
      var score = this.state.score;
      //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
      if(this.state.scoreDisable==true){
        score =this.state.scoreDefinedValue;
      }
      var subjectName = CKEDITOR.instances['simpleEditor'].getData();
      subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
      // var answer = this.refs.simpleAnswerInput.refs.input.value;
      var answer = CKEDITOR.instances['answerEditor'].getData();
      answer = answer.replace(/\+/g,"%2B"); //将+号替换为十六进制
      var subjectParamArray = this.props.params.split("#");
      var ident = subjectParamArray[0];
      var ScheduleOrSubjectId = subjectParamArray[1];
      var optType = subjectParamArray[3];
      var knowledgeName = subjectParamArray[4];
      if(ScheduleOrSubjectId==null || ScheduleOrSubjectId==""){
        ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
        knowledgeName = sessionStorage.getItem("lastClickMenuName");
      }
      var isLinkToSchedule=this.state.useSameScheduleForSimpleAnswer;
      var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"S"};
      if(optType=="bySubjectId"){
        batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
      }
      //完成基础的非空验证
      if(this.isEmpty(subjectName)){
        message.warning("请输入题目");
      }else if(this.isEmpty(answer)){
        message.warning("请输入答案");
      }else if(this.isEmpty(score) || score==0){
        message.warning("请选择分值");
      }else {
        this.saveSubject(batchAddSubjectBeanJson,knowledgeName,isLinkToSchedule);
        if(currentButton=="保存并返回列表"){
          //关闭并返回题目列表页面
          this.setState({ visible: false,score:1});
        }
      }
      //重新初始化页面
      this.initPage();
    });
  },

  coverOnChange(info) {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },

  addScore:function () {
    var score = this.state.score;
    var newScore = parseInt(score)+parseFloat(0.5);
    console.log("newScore:"+newScore)
    this.setState({score:newScore});
  },

  mulitiAnswerOnChange:function (checkedValues) {
    mulitiAnswer=checkedValues;
    this.setState({mulitiAnswerDefaultValue:checkedValues});
  },

  scoreSelectTypeOnChange(e){
    var checkStatus = e.target.checked;
    if(checkStatus==true){
      this.setState({scoreInputState:false,scoreChecked:!this.state.scoreChecked,scoreDisable:true,score:1});
    }else{
      this.setState({scoreDisable:false,scoreInputState:true});
    }
    this.setState({scoreChecked:!this.state.scoreChecked});
  },

  correctAnswerOnChange(e){
    this.setState({correctAnswerValue:e.target.value});
  },

  singleAnswerOnChange(e){
    this.setState({singleAnswer:e.target.value});
  },

  tabOnChange(key) {
    this.setState({activeKey: key});
    //重新初始化页面
    this.initPage();
  },

  checkBoxOnChangeForSingle(e) {
    console.log(`checked = ${e.target.checked}`);
    this.setState({useSameScheduleForSingle: e.target.checked});
  },

  checkBoxOnChangeForMSelect(e) {
    console.log(`checked = ${e.target.checked}`);
    this.setState({useSameScheduleForMSelect: e.target.checked});
  },

  checkBoxOnChangeForCorrect(e) {
    console.log(`checked = ${e.target.checked}`);
    this.setState({useSameScheduleForCorrect: e.target.checked});
  },

  checkBoxOnChangeForSimpleAnswer(e) {
    console.log(`checked = ${e.target.checked}`);
    this.setState({useSameScheduleForSimpleAnswer: e.target.checked});
  },

  //自定义分值文本框内容改变事件处理函数
  onScoreDefinedValueChange(e){
    this.setState({scoreDefinedValue:e.target.value});
  },

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 3},
      wrapperCol: { span: 20 },
    };

    const children = [];
    for (let i = 1; i <=10; i++) {
      children.push(<Option key={i} value={i}>{i}分</Option>);
    };

    const mulitiAnswerOptions = [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
      { label: 'C', value: 'C' },
      { label: 'D', value: 'D' },
      { label: 'E', value: 'E' },
    ];

    const scoreItem=[];
    scoreItem.push(<FormItem className="custom—top"
                             {...formItemLayout}
                             label={(<span>分值</span>)}
                             hasFeedback>
      {getFieldDecorator('score')(
        <div>
          <Row>
            <Col span={6}>
              {/*value={this.state.score}*/}
              <Select  ref="scoreSelect" defaultValue={subjectUpload.state.score} value={subjectUpload.state.score} style={{ width: 100 }} disabled={this.state.scoreDisable} onChange={this.selectHandleChange}>
                {children}
              </Select>
            </Col>

            <Col span={8} className="right_ri"><span><Input ref="scoreDefined" defaultValue={this.state.scoreDefinedValue} value={this.state.scoreDefinedValue}  onChange={this.onScoreDefinedValueChange} placeholder="请输入自定义分值" disabled={this.state.scoreInputState}  /></span></Col>
            <Col span={6} className="right_ri custom—1"><Checkbox onChange={this.scoreSelectTypeOnChange} ref="scoreCheckBox" checked={this.state.scoreChecked} value="defined">自定义:</Checkbox></Col>

          </Row>
        </div>
      )}
    </FormItem>);

    var currentActiveKey = this.state.activeKey;
    var buttons =<div>
      <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
        保存并继续添加
      </Button>
      <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit} >
        保存并返回列表
      </Button>
    </div>;
    if(currentActiveKey=="单选题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
          保存并继续添加
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit} >
          保存并返回列表
        </Button>
      </div>;
    }else if(currentActiveKey=="多选题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.MulitiHandleSubmit}>
          保存并继续添加
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.MulitiHandleSubmit} >
          保存并返回列表
        </Button>
      </div>;
    }else if(currentActiveKey=="判断题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.correctHandleSubmit}>
          保存并继续添加
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.correctHandleSubmit} >
          保存并返回列表
        </Button>
      </div>;
    }else if(currentActiveKey=="简答题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.simpleAnswerHandleSubmit}>
          保存并继续添加
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.simpleAnswerHandleSubmit} >
          保存并返回列表
        </Button>
      </div>;
    }

    return (
      <div className="toobar right_ri">
        <Button  type="primary" icon="plus-circle" onClick={this.showModal} title="上传题目" className="add_study add_study-b">添加题目</Button>
        <Modal
          visible={this.state.visible}
          title="添加题目"
          width="860px"
          height="636px"
          className="ant-modal-width"
          onCancel={this.handleCancel}
          transitionName=""  //禁用modal的动画效果
          footer={[
            <div>
              {buttons}
            </div>
          ]}
        >
          <Tabs
            hideAdd
            onChange={this.tabOnChange}
            defaultActiveKey={this.state.activeKey}
            onEdit={this.onEdit}
          >
            <TabPane tab="单选题" key="单选题">
              <Form horizontal className="ant-form-fo">
                <FormItem className="ant-form-word"
                          {...formItemLayout}
                          label={(<span>题目</span>)}
                          hasFeedback>
                  {getFieldDecorator('subjectName')(
                      <CkEditorComponentForSingle />
                  )}
                </FormItem>
                <FormItem className="custom—top"
                          {...formItemLayout}
                          label={(<span>答案</span>)}
                          hasFeedback>
                  {getFieldDecorator('answer')(
                    <div>
                      <RadioGroup onChange={this.singleAnswerOnChange} ref="singleAnswer" defaultValue={this.state.singleAnswer}>
                        <Radio key="A" value="A">A</Radio>
                        <Radio key="B" value="B">B</Radio>
                        <Radio key="C" value="C">C</Radio>
                        <Radio key="D" value="D">D</Radio>
                        <Radio key="E" value="E">E</Radio>
                      </RadioGroup>
                    </div>
                  )}
                </FormItem>
                {scoreItem}
              </Form>
            </TabPane>
            <TabPane tab="多选题" key="多选题"><div>
              <Form horizontal className="ant-form-fo">
                <FormItem className="ant-form-word"
                          {...formItemLayout}
                          label={(<span>题目</span>)}
                          hasFeedback>
                  {getFieldDecorator('subjectNameM')(
                    <CkEditorComponentForMuSelect/>
                  )}
                </FormItem>
                <FormItem className="custom—top"
                          {...formItemLayout}
                          label={(<span>答案</span>)}
                          hasFeedback>
                  {getFieldDecorator('mulitiAnswer')(
                    <div>
                      <CheckboxGroup options={mulitiAnswerOptions} defaultValue={this.state.mulitiAnswerDefaultValue} value={this.state.mulitiAnswerDefaultValue} onChange={this.mulitiAnswerOnChange} />
                    </div>
                  )}
                </FormItem>
                {scoreItem}
              </Form>
            </div></TabPane>
            <TabPane tab="判断题" key="判断题"><div>
              <Form horizontal className="ant-form-fo">
                <FormItem className="ant-form-word"
                          {...formItemLayout}
                          label={(<span>题目</span>)}
                          hasFeedback>
                  {getFieldDecorator('subjectNameM')(
                    <CkEditorComponentForCorrect/>
                  )}
                </FormItem>
                <FormItem className="custom—top"
                          {...formItemLayout}
                          label={(<span>答案</span>)}
                          hasFeedback>
                  {getFieldDecorator('correctAnswer')(
                    <div>
                      <RadioGroup onChange={this.correctAnswerOnChange} defaultValue={this.state.correctAnswerValue} value={this.state.correctAnswerValue}>
                        <Radio key="正确" value="正确">正确</Radio>
                        <Radio key="错误" value="错误">错误</Radio>
                      </RadioGroup>
                    </div>
                  )}
                </FormItem>
                {scoreItem}
              </Form>
            </div></TabPane>
            <TabPane tab="简答题" key="简答题"><div>
              <Form horizontal className="ant-form-fo">
                <FormItem className="ant-form-word"
                          {...formItemLayout}
                          label={(<span>题目</span>)}
                          hasFeedback>
                  {getFieldDecorator('subjectNameM')(
                    <CkEditorComponentForSimple/>
                  )}
                </FormItem>
                <FormItem className="custom—top"
                          {...formItemLayout}
                          label={(<span>答案</span>)}
                          hasFeedback>
                  {getFieldDecorator('answer')(
                    <div>
                      <CkEditorComponentForAnswer/>
                    </div>
                  )}
                </FormItem>
                {scoreItem}
              </Form>
            </div></TabPane>
          </Tabs>
        </Modal>
      </div>
    );
  },
}));

export default SubjectUploadTabComponents;
