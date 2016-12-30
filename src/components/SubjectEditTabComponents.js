import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Form, Input, Select, Row, Col, Checkbox } from 'antd';
import {   message } from 'antd';
import RichEditorComponents from  './RichEditorComponents';
import RichEditorComponentsForMuSelect from './RichEditorComponentsForMuSelect';
import RichEditorComponentsForCorrect from './RichEditorComponentsForCorrect';
import RichEditorComponentsForSimpleAnswer from './RichEditorComponentsForSimpleAnswer';
import RichEditorComponentsForAnswer from './RichEditorComponentsForAnswer';
import { doWebService } from '../WebServiceHelper';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
var mulitiAnswer = new Array('A');
//将要被修改的题目id
var sid;
var subjectUpload;
const SubjectEditTabComponents = React.createClass({
  getInitialState() {
    subjectUpload = this;
    return {
      loading: false,
      visible: false,
    };
  },
  showModal(currentSubjectInfo) {
    var currentSubjectInfoArray = currentSubjectInfo.split("#");
    var subjectId = currentSubjectInfoArray[0];
    var subjectType = currentSubjectInfoArray[1];
    subjectUpload.setState({
      activeKey: subjectType,
    });
    this.getSubjectLineById(subjectId,subjectType);
  },

  getSubjectLineById(subjectId,subjectType){
      sid = subjectId;
      var param = {
        "method":'getSubjectLineById',
        "sid":subjectId,
      };
      doWebService(JSON.stringify(param), {
        onResponse : function(ret) {
          var response = ret.response;
          if(subjectType=="单选题"){
            editorContent=response.colContent;
            subjectUpload.setState({
              singleAnswer:response.colAnswer,
            });
          }else if(subjectType=="多选题"){
            muEditorContent=response.colContent;
            subjectUpload.setState({
              mulitiAnswerDefaultValue:response.colAnswer,
            });
          }else if(subjectType=="判断题"){
            correctEditorContent=response.colContent;
            subjectUpload.setState({
              correctAnswerValue:response.colAnswer,
            });
          }else if(subjectType=="简答题"){
            simpleEditorContent=response.colContent;
            answerContent=response.colAnswer;
          }
          if(response.score>10){
            subjectUpload.setState({scoreInputState:false,scoreChecked:true,scoreDisable:true,score:1,scoreDefinedValue:response.score});
          }else{
            subjectUpload.setState({
              score:response.score,
              scoreDisable:false,
              scoreInputState:true
            });
          }
          subjectUpload.setState({
            visible: true
          });
        },
        onError : function(error) {
          message.error(error);
        }
      });
  },

  handleOk() {
    this.setState({ visible: false });
  },
  editorsInit(){
    if(this.state.activeKey=="单选题"){
      if(!this.isEmpty(UE.getEditor("singleContainer"))){
        UE.getEditor("singleContainer").setContent('');
      }
    }else if(this.state.activeKey=="多选题"){
      if(!this.isEmpty(UE.getEditor("muSelectContainer"))){
        UE.getEditor("muSelectContainer").setContent('');
      }
    }else if(this.state.activeKey=="判断题"){
      if(!this.isEmpty(UE.getEditor("correctContainer"))){
        UE.getEditor("correctContainer").setContent('');
      }
    }else if(this.state.activeKey=="简答题"){
      if(!this.isEmpty(UE.getEditor("simpleAnswerContainer"))){
        UE.getEditor("simpleAnswerContainer").setContent('');
      }
      if(!this.isEmpty(UE.getEditor("answerContainer"))){
        UE.getEditor("answerContainer").setContent('');
      }
    }
  },
  handleCancel() {
    this.setState({ visible: false,activeKey: "单选题" });
    this.editorsInit();
    pasterMgr.Init();
    pasterMgr.Config["PostUrl"] = "http://www.maaee.com/Excoord_For_Education/manage/subject/subject_upload.jsp";
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
    this.setState({activeKey: "单选题" ,scoreChecked:false,scoreInputState:true,scoreDisable:false,mulitiAnswerDefaultValue:'A',correctAnswerValue:"正确"});
    pasterMgr.Init();
    pasterMgr.Config["PostUrl"] = "http://www.maaee.com/Excoord_For_Education/manage/subject/subject_upload.jsp";
  },

  //修改题目
  modifySubject(content,answer,score){
    var param = {
      "method":'modifySubject',
      "sid":sid,
      "content":content,
      "answer":answer,
      "score":score,
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        if(ret.msg=="调用成功" && ret.response==true){
          message.success("题目修改成功");
          subjectUpload.props.subjectEditCallBack();
        }else{
          message.error("题目修改失败");
        }
      },
      onError : function(error) {
        message.error(error);
      }
    });
  },

  //单选题修改
  singleHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var ident = sessionStorage.getItem("ident");
    var score = this.state.score;
    //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
    if(this.state.scoreDisable==true){
      score =this.state.scoreDefinedValue;
    }
    var subjectName = UE.getEditor("singleContainer").getContent();
    subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
    var answer = this.state.singleAnswer;
    //完成基础的非空验证
    if(this.isEmpty(subjectName)){
      message.warning("请输入题目");
    }else if(this.isEmpty(answer)){
      message.warning("请输入答案");
    }else if(this.isEmpty(score) || score==0){
      message.warning("请选择分值");
    }else{
      //完成题目的修改操作
      this.modifySubject(subjectName,answer,score);
      this.setState({ visible: false,score:1});
      //重新初始化页面
      this.initPage();
    }
  },
  //多选题修改
  MulitiHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var ident = sessionStorage.getItem("ident");
    var score = this.state.score;
    //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
    if(this.state.scoreDisable==true){
      score =this.state.scoreDefinedValue;
    }
    var subjectName = UE.getEditor("muSelectContainer").getContent();
    subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
    var answer = mulitiAnswer;
    //完成基础的非空验证
    if(this.isEmpty(subjectName)){
      // alert("请输入题目");
      message.warning("请输入题目");
    }else if(this.isEmpty(answer)){
      // alert("请输入答案");
      message.warning("请输入答案");
    }else if(this.isEmpty(score) || score==0){
      // alert("请选择分值");
      message.warning("请选择分值");
    }else{
      this.modifySubject(subjectName,answer,score);
      this.setState({ visible: false,score:1});
    }
    //重新初始化页面
    this.initPage();
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
    var ident = sessionStorage.getItem("ident");
    var score = this.state.score;
    //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
    if(this.state.scoreDisable==true){
      score =this.state.scoreDefinedValue;
    }
    var subjectName = UE.getEditor("correctContainer").getContent();
    subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
    var answer = this.state.correctAnswerValue;
    //完成基础的非空验证
    if(this.isEmpty(subjectName)){
      message.warning("请输入题目");
    }else if(this.isEmpty(answer)){
      message.warning("请输入答案");
    }else if(this.isEmpty(score) || score==0){
      message.warning("请选择分值");
    }else {
      this.modifySubject(subjectName,answer,score);
      //关闭并返回题目列表页面
      this.setState({ visible: false,score:1});
    }
    //重新初始化页面
    this.initPage();
  },

  //简答题修改
  simpleAnswerHandleSubmit(e) {
    e.preventDefault();
    var target = e.target;
    if(navigator.userAgent.indexOf("Chrome") > -1){
      target=e.currentTarget;
    }else{
      target = e.target;
    }
    var ident = sessionStorage.getItem("ident");
    var score = this.state.score;
    //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
    if(this.state.scoreDisable==true){
      score =this.state.scoreDefinedValue;
    }
    var subjectName = UE.getEditor("simpleAnswerContainer").getContent();
    subjectName = subjectName.replace(/\+/g,"%2B"); //将+号替换为十六进制
    var answer = UE.getEditor("answerContainer").getContent();
    answer = answer.replace(/\+/g,"%2B"); //将+号替换为十六进制
    //完成基础的非空验证
    if(this.isEmpty(subjectName)){
      message.warning("请输入题目");
    }else if(this.isEmpty(answer)){
      message.warning("请输入答案");
    }else if(this.isEmpty(score) || score==0){
      message.warning("请选择分值");
    }else {
      this.modifySubject(subjectName,answer,score);
      this.setState({ visible: false,score:1});
    }
    //重新初始化页面
    this.initPage();
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
    if(key!=this.state.activeKey){
        message.warning("修改过程中禁止切换题型，谢谢！");
    }else{
        this.setState({activeKey: key});
    }
  },
  //自定义分值文本框内容改变事件处理函数
  onScoreDefinedValueChange(e){
      this.setState({scoreDefinedValue:e.target.value});
  },

  render() {
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

    scoreItem.push(
      <div>
          <Row>
            <Col span={4}>
              <span>分值</span>
            </Col>

            <Col span={6}>
              {/*value={this.state.score}*/}
              <Select  ref="scoreSelect" defaultValue={subjectUpload.state.score} value={subjectUpload.state.score} style={{ width: 100 }} disabled={this.state.scoreDisable} onChange={this.selectHandleChange}>
                {children}
              </Select>
            </Col>

            <Col span={8} className="right_ri"><span><Input ref="scoreDefined" defaultValue={this.state.scoreDefinedValue} value={this.state.scoreDefinedValue} onChange={this.onScoreDefinedValueChange} placeholder="请输入自定义分值" disabled={this.state.scoreInputState}  /></span></Col>
            <Col span={6} className="right_ri custom—1"><Checkbox onChange={this.scoreSelectTypeOnChange} ref="scoreCheckBox" checked={this.state.scoreChecked} value="defined">自定义:</Checkbox></Col>

          </Row>
      </div>
    )

    var currentActiveKey = subjectUpload.state.activeKey;
    var buttons =<div>
      <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
        保存
      </Button>
      <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel} >
        取消
      </Button>
    </div>;
    if(currentActiveKey=="单选题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
          保存
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel} >
          取消
        </Button>
      </div>;
    }else if(currentActiveKey=="多选题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.MulitiHandleSubmit}>
          保存
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel} >
          取消
        </Button>
      </div>;
    }else if(currentActiveKey=="判断题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.correctHandleSubmit}>
          保存
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel} >
          取消
        </Button>
      </div>;
    }else if(currentActiveKey=="简答题"){
      buttons =<div>
        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.simpleAnswerHandleSubmit}>
          保存
        </Button>
        <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel} >
          取消
        </Button>
      </div>;
    }

    return (
      <div className="toobar right_ri">
        <Modal
          visible={this.state.visible}
          title="修改题目"
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
            activeKey={this.state.activeKey}
            onEdit={this.onEdit}
          >
            <TabPane tab="单选题" key="单选题">
              <Row>
                  <Col span={4}>
                      <span>题目</span>
                  </Col>
                  <Col span={20}>
                    <RichEditorComponents/>
                  </Col>
              </Row>
              <Row>
                <Col span={4}>
                  <span>答案</span>
                </Col>
                <Col span={20}>
                    <div>
                      <RadioGroup onChange={this.singleAnswerOnChange} ref="singleAnswer" defaultValue={subjectUpload.state.singleAnswer} value={subjectUpload.state.singleAnswer}>
                        <Radio key="A" value="A">A</Radio>
                        <Radio key="B" value="B">B</Radio>
                        <Radio key="C" value="C">C</Radio>
                        <Radio key="D" value="D">D</Radio>
                        <Radio key="E" value="E">E</Radio>
                      </RadioGroup>
                    </div>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  {scoreItem}
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="多选题" key="多选题"><div>
                <Row>
                  <Col span={4}>
                    <span>题目</span>
                  </Col>
                  <Col span={20}>
                    <RichEditorComponentsForMuSelect/>
                  </Col>
                </Row>

              <Row>
                <Col span={4}>
                  <span>答案</span>
                </Col>
                <Col span={20}>
                  <div>
                    <CheckboxGroup options={mulitiAnswerOptions} defaultValue={subjectUpload.state.mulitiAnswerDefaultValue} value={subjectUpload.state.mulitiAnswerDefaultValue} onChange={this.mulitiAnswerOnChange} />
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={24}>
                  {scoreItem}
                </Col>
              </Row>
            </div></TabPane>
            <TabPane tab="判断题" key="判断题"><div>
              <Row>
                <Col span={4}>
                  <span>题目</span>
                </Col>
                <Col span={20}>
                  <RichEditorComponentsForCorrect/>
                </Col>
              </Row>

              <Row>
                <Col span={4}>
                  <span>答案</span>
                </Col>
                <Col span={20}>
                  <div>
                    <RadioGroup onChange={this.correctAnswerOnChange} defaultValue={subjectUpload.state.correctAnswerValue} value={subjectUpload.state.correctAnswerValue}>
                      <Radio key="正确" value="正确">正确</Radio>
                      <Radio key="错误" value="错误">错误</Radio>
                    </RadioGroup>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={24}>
                  {scoreItem}
                </Col>
              </Row>
            </div></TabPane>
            <TabPane tab="简答题" key="简答题"><div>

              <Row>
                <Col span={4}>
                  <span>题目</span>
                </Col>
                <Col span={20}>
                  <RichEditorComponentsForSimpleAnswer/>
                </Col>
              </Row>

              <Row>
                <Col span={4}>
                  <span>答案</span>
                </Col>
                <Col span={20}>
                  <div>
                    {/*<Input type="textarea" ref="simpleAnswerInput"  defaultValue={this.state.simpleAnswerValue}  rows={4}  />*/}
                    <RichEditorComponentsForAnswer/>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col span={24}>
                  {scoreItem}
                </Col>
              </Row>
            </div></TabPane>
          </Tabs>
        </Modal>
      </div>
    );
  },
});

export default SubjectEditTabComponents;
