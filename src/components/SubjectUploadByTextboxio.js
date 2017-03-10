import React, {PropTypes} from 'react';
import {Tabs, Button, Radio} from 'antd';
import {Modal} from 'antd';
import {Input, Select, Row, Col, Checkbox,Slider} from 'antd';
import {message} from 'antd';
import TextboxioComponentForSingle from './textboxioComponents/TextboxioComponentForSingle'
import TextboxioComponentForMulitiSelect from './textboxioComponents/TextboxioComponentForMulitiSelect';
import TextboxioComponentForCorrect from './textboxioComponents/TextboxioComponentForCorrect';
import TextboxioComponentForSimpleAnswer from './textboxioComponents/TextboxioComponentForSimpleAnswer';
import TextboxioComponentForAnswer  from './textboxioComponents/TextboxioComponentForAnswer';
import {doWebService} from '../WebServiceHelper';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

var mulitiAnswer = new Array('A');
var subjectUpload;
/**
 * 题目上传组件
 */
const SubjectUploadTabComponents = React.createClass({
    getInitialState() {
        subjectUpload = this;
        return {
            loading: false,
            visible: false,
            activeKey: '单选题',
            score: -1,
            subjectName: '',
            singleAnswer: 'A',
            scoreChecked: false,
            scoreInputState: true,
            scoreDisable: false,
            mulitiAnswerDefaultValue: 'A',
            correctAnswerValue: "正确",
            useSameScheduleForSingle: true,
            useSameScheduleForMSelect: true,
            useSameScheduleForCorrect: true,
            useSameScheduleForSimpleAnswer: true,
            mulitiAnswerOptions:[
                {label: 'A', value: 'A'},
                {label: 'B', value: 'B'},
                {label: 'C', value: 'C'},
                {label: 'D', value: 'D'},
            ],
            sliderValue:4

        };
    },
    /**
     * 设置当前题目上传组件的Modal显示状态为true，即显示窗口
     */
    showModal() {
        this.setState({
            visible: true,
        });
    },
    /**
     * 初始化当前组件内使用到的富文本编辑器
     */
    editorsInit(){
        if (this.state.activeKey == "单选题") {
            if (!this.isEmpty(mytextareaSingleEditor)) {
                mytextareaSingleEditor.content.set('');
            }
        } else if (this.state.activeKey == "多选题") {
            if (!this.isEmpty(mytextareaMulitiEditor)) {
                mytextareaMulitiEditor.content.set('');
            }
        } else if (this.state.activeKey == "判断题") {
            if (!this.isEmpty(mytextareaCorrectEditor)) {
                mytextareaCorrectEditor.content.set('');
            }
        } else if (this.state.activeKey == "简答题") {
            if (!this.isEmpty(mytextareaSimpleAnswerEditor)) {
                mytextareaSimpleAnswerEditor.content.set('');
            }
            if (!this.isEmpty(mytextareaAnswerEditor)) {
                mytextareaAnswerEditor.content.set('');
            }
        }
    },
    /**
     * Modal窗口关闭响应函数
     */
    handleCancel() {
        this.setState({visible: false});
        this.initPage();
    },

    /**
     * 题目分值改变时的响应函数
     * @param value
     */
    selectHandleChange: function (value) {
        this.setState({score: value});
    },

    /**
     * 系统非空判断
     * @param content
     * @returns {boolean}
     */
    isEmpty(content){
        if (content == null || content == "" || typeof(content) == "undefined") {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 完成页面内容的初始化操作，设置一些关键state回到初始值
     */
    initPage(){
        this.editorsInit();
        this.setState({score: -1, scoreDefinedValue: ''});
        if (!this.isEmpty(this.refs.singleAnswer)) {
            this.refs.singleAnswer.state.value = "A";
        }
        if (!this.isEmpty(this.refs.scoreDefined)) {
            this.refs.scoreDefined.refs.input.value = "";
        }
        this.setState({
            scoreChecked: false,
            scoreInputState: true,
            scoreDisable: false,
            mulitiAnswerDefaultValue: 'A',
            correctAnswerValue: "正确",
            mulitiAnswerOptions:[
                {label: 'A', value: 'A'},
                {label: 'B', value: 'B'},
                {label: 'C', value: 'C'},
                {label: 'D', value: 'D'},
            ],

            sliderValue:4
        });
    },

    /**
     * 新增题目到知识点下
     * @param batchAddSubjectBeanJson
     * @param knowledgeName
     * @param isLinkToSchedule
     */
    saveSubject(batchAddSubjectBeanJson, knowledgeName, isLinkToSchedule){
        var param = {
            "method": 'batchAddSubjects',
            "batchAddSubjectBeanJson": [batchAddSubjectBeanJson],
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    if (isLinkToSchedule == true) {
                        var subjectsIds = ret.response[0];
                        var userId = sessionStorage.getItem("ident");
                        subjectUpload.teachScheduleInfo(userId, knowledgeName, subjectsIds);
                    } else {
                        message.success("题目添加成功");
                        subjectUpload.props.courseUploadCallBack();
                    }
                } else {
                    message.error("题目添加失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取当前老师的备课计划，如果没有会创建一个新的
     * @param userId
     * @param title
     * @param subjectsIds
     */
    teachScheduleInfo(userId, title, subjectsIds){
        var param = {
            "method": 'getOrCreateTeachSchedule',
            "userId": userId,
            "title": title,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var scheduleId = ret.response.colTsId;
                    subjectUpload.copySubjects(subjectsIds, scheduleId);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 复制题目到指定的备课计划下
     * @param subjectsIds
     * @param scheduleId
     */
    copySubjects(subjectsIds, scheduleId){
        var param = {
            "method": 'copySubjects',
            "subjectsIds": subjectsIds,
            "teachScheduleId": scheduleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("题目添加成功");
                    subjectUpload.props.courseUploadCallBack();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 单选题新增
     * @param e
     */
    singleHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        // mytextareaSingleEditor.mode.set("code");
        // mytextareaSingleEditor.mode.set("design");
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaSingleEditor.content.get();
        subjectName = subjectName.replace(/\+/g, "%2B"); //将+号替换为十六进制
        var answer = this.state.singleAnswer;
        var subjectParamArray = this.props.params.split("#");
        var ident = subjectParamArray[0];
        var ScheduleOrSubjectId = subjectParamArray[1];
        var optType = subjectParamArray[3];
        var knowledgeName = subjectParamArray[4];
        if (ScheduleOrSubjectId == null || ScheduleOrSubjectId == "") {
            ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
            knowledgeName = sessionStorage.getItem("lastClickMenuName");
        }
        var isLinkToSchedule = this.state.useSameScheduleForSingle;
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score <= 0) {
            message.warning("请选择分值");
        } else {
            var batchAddSubjectBeanJson = {
                "textTigan": subjectName,
                "textAnswer": answer,
                "score": score,
                "userId": ident,
                "type": "C"
            };
            if (optType == "bySubjectId") {
                batchAddSubjectBeanJson.knowledgePointId = ScheduleOrSubjectId;
            }
            //完成题目的新增操作
            this.saveSubject(batchAddSubjectBeanJson, knowledgeName, isLinkToSchedule);
            if (currentButton == "保存并返回列表") {
                //关闭并返回题目列表页面
                this.setState({visible: false, score: 1});
            }
            //重新初始化页面
            this.initPage();
        }
    },
    /**
     * 多选题新增
     * @param e
     * @constructor
     */
    MulitiHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaMulitiEditor.content.get();
        subjectName = subjectName.replace(/\+/g, "%2B"); //将+号替换为十六进制
        //将获取的多选答案数组转换为字符串
        var answer = "";
        for (var i = 0; i < mulitiAnswer.length; i++) {
            answer += mulitiAnswer[i];
        }
        var subjectParamArray = this.props.params.split("#");
        var ident = subjectParamArray[0];
        var ScheduleOrSubjectId = subjectParamArray[1];
        var optType = subjectParamArray[3];
        var knowledgeName = subjectParamArray[4];
        if (ScheduleOrSubjectId == null || ScheduleOrSubjectId == "") {
            ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
            knowledgeName = sessionStorage.getItem("lastClickMenuName");
        }
        var isLinkToSchedule = this.state.useSameScheduleForMSelect;
        var batchAddSubjectBeanJson = {
            "textTigan": subjectName,
            "textAnswer": answer,
            "score": score,
            "userId": ident,
            "type": "MC",
            "alterNativeAnswerCount":this.state.mulitiAnswerOptions.length
        };
        if (optType == "bySubjectId") {
            batchAddSubjectBeanJson.knowledgePointId = ScheduleOrSubjectId;
        }
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score <= 0) {
            message.warning("请选择分值");
        } else {
            this.saveSubject(batchAddSubjectBeanJson, knowledgeName, isLinkToSchedule);
            if (currentButton == "保存并返回列表") {
                //关闭并返回题目列表页面
                this.setState({visible: false, score: 1});
            }
            //重新初始化页面
            this.initPage();
        }
    },
    /**
     * 判断题新增
     * @param e
     */
    correctHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaCorrectEditor.content.get();
        subjectName = subjectName.replace(/\+/g, "%2B"); //将+号替换为十六进制
        var answer = this.state.correctAnswerValue;
        var subjectParamArray = this.props.params.split("#");
        var ident = subjectParamArray[0];
        var ScheduleOrSubjectId = subjectParamArray[1];
        var optType = subjectParamArray[3];
        var knowledgeName = subjectParamArray[4];
        if (ScheduleOrSubjectId == null || ScheduleOrSubjectId == "") {
            ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
            knowledgeName = sessionStorage.getItem("lastClickMenuName");
        }
        var isLinkToSchedule = this.state.useSameScheduleForCorrect;
        var batchAddSubjectBeanJson = {
            "textTigan": subjectName,
            "textAnswer": answer,
            "score": score,
            "userId": ident,
            "type": "J"
        };
        if (optType == "bySubjectId") {
            batchAddSubjectBeanJson.knowledgePointId = ScheduleOrSubjectId;
        }
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score <= 0) {
            message.warning("请选择分值");
        } else {
            this.saveSubject(batchAddSubjectBeanJson, knowledgeName, isLinkToSchedule);
            if (currentButton == "保存并返回列表") {
                //关闭并返回题目列表页面
                this.setState({visible: false, score: 1});
            }
            //重新初始化页面
            this.initPage();
        }
    },

    /**
     * 简答题新增
     * @param e
     */
    simpleAnswerHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaSimpleAnswerEditor.content.get();
        subjectName = subjectName.replace(/\+/g, "%2B"); //将+号替换为十六进制
        var answer = mytextareaAnswerEditor.content.get();
        answer = answer.replace(/\+/g, "%2B"); //将+号替换为十六进制
        var subjectParamArray = this.props.params.split("#");
        var ident = subjectParamArray[0];
        var ScheduleOrSubjectId = subjectParamArray[1];
        var optType = subjectParamArray[3];
        var knowledgeName = subjectParamArray[4];
        if (ScheduleOrSubjectId == null || ScheduleOrSubjectId == "") {
            ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
            knowledgeName = sessionStorage.getItem("lastClickMenuName");
        }
        var isLinkToSchedule = this.state.useSameScheduleForSimpleAnswer;
        var batchAddSubjectBeanJson = {
            "textTigan": subjectName,
            "textAnswer": answer,
            "score": score,
            "userId": ident,
            "type": "S"
        };
        if (optType == "bySubjectId") {
            batchAddSubjectBeanJson.knowledgePointId = ScheduleOrSubjectId;
        }
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score <= 0) {
            message.warning("请选择分值");
        } else {
            this.saveSubject(batchAddSubjectBeanJson, knowledgeName, isLinkToSchedule);
            if (currentButton == "保存并返回列表") {
                //关闭并返回题目列表页面
                this.setState({visible: false, score: 1});
            }
            //重新初始化页面
            this.initPage();
        }
    },

    /**
     * 多选题答案的checkbox选项发生改变时的响应函数
     * @param checkedValues
     */
    mulitiAnswerOnChange: function (checkedValues) {
        mulitiAnswer = checkedValues;
        this.setState({mulitiAnswerDefaultValue: checkedValues});
    },
    /**
     * 分值类型改变时的响应函数
     * 即：选择分值和自定义分值直接的切换响应
     * @param e
     */
    scoreSelectTypeOnChange(e){
        var checkStatus = e.target.checked;
        if (checkStatus == true) {
            this.setState({
                scoreInputState: false,
                scoreChecked: !this.state.scoreChecked,
                scoreDisable: true,
                score: 1
            });
        } else {
            this.setState({scoreDisable: false, scoreInputState: true});
        }
        this.setState({scoreChecked: !this.state.scoreChecked});
    },
    /**
     * 判断题答案的radioGroup选项发生改变时的响应函数
     * @param e
     */
    correctAnswerOnChange(e){
        this.setState({correctAnswerValue: e.target.value});
    },
    /**
     * 单选答案的radioGroup选项发生改变时的响应函数
     * @param e
     */
    singleAnswerOnChange(e){
        this.setState({singleAnswer: e.target.value});
    },
    /**
     * tab面板切换时的响应函数，主要用来设置当前处于激活状态的面板和初始化页面
     * @param key
     */
    tabOnChange(key) {
        subjectUpload.setState({activeKey: key});
        //重新初始化页面
        this.initPage();
    },

    /**
     * 自定义分值文本框内容改变事件处理函数
     * @param e
     */
    onScoreDefinedValueChange(e){
        this.setState({scoreDefinedValue: e.target.value});
    },
    /**
     * 自定义多选题选项数量
     * @param value
     * @returns {string}
     */
    sliderChange(value) {
        var selectArray=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        console.log("selectArrayLength:"+selectArray.length);
        var returnValue = selectArray[value];
        var mulitiAnswerOptions=[];
        for(var i=0;i<value;i++){
             var selectValue = {label: selectArray[i], value: selectArray[i]};
            mulitiAnswerOptions.push(selectValue);
        }
        this.setState({"mulitiAnswerOptions":mulitiAnswerOptions,"sliderValue":value});
    },

    /**
     * 页面元素的渲染操作
     * @returns {XML}
     */
    render() {
        //定义分值下拉列表的内容
        const children = [];
        children.push(<Option key={-1} value={-1}>请选择</Option>);
        for (let i = 1; i <= 10; i++) {
            children.push(<Option key={i} value={i}>{i}分</Option>);
        }
        ;

        //定义分数组件，因为各个tabPanel面板中都需要存在分值，所以统一定义
        const scoreItem = [];
        scoreItem.push(
            <div>
                <Row className="row-t-f">
                    <Col span={3} className="ant-form-item-label">
                        <span className="font-14">分值：</span>
                    </Col>

                    <Col span={20}>
                        <div>
                            <Row>
                                <Col span={6}>
                                    <Select ref="scoreSelect" defaultValue={subjectUpload.state.score}
                                            value={subjectUpload.state.score} style={{width: 100}}
                                            disabled={this.state.scoreDisable} onChange={this.selectHandleChange}>
                                        {children}
                                    </Select>
                                </Col>

                                <Col span={8} className="right_ri"><span><Input ref="scoreDefined"
                                                                                defaultValue={this.state.scoreDefinedValue}
                                                                                value={this.state.scoreDefinedValue}
                                                                                onChange={this.onScoreDefinedValueChange}
                                                                                placeholder="请输入自定义分值"
                                                                                disabled={this.state.scoreInputState}/></span></Col>
                                <Col span={6} className="right_ri custom—1"><Checkbox
                                    onChange={this.scoreSelectTypeOnChange} ref="scoreCheckBox"
                                    checked={this.state.scoreChecked} value="defined">自定义:</Checkbox></Col>

                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        )
        //根据当前激活的面板的不同，向页面上渲染不同的保存按钮，用以完成不同类型题目的添加操作
        var currentActiveKey = this.state.activeKey;
        var buttons = <div>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
                保存并继续添加
            </Button>
            <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
                保存并返回列表
            </Button>
        </div>;
        if (currentActiveKey == "单选题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.singleHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
                    保存并返回列表
                </Button>
            </div>;
        } else if (currentActiveKey == "多选题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.MulitiHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.MulitiHandleSubmit}>
                    保存并返回列表
                </Button>
            </div>;
        } else if (currentActiveKey == "判断题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.correctHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.correctHandleSubmit}>
                    保存并返回列表
                </Button>
            </div>;
        } else if (currentActiveKey == "简答题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.simpleAnswerHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button"
                        onClick={this.simpleAnswerHandleSubmit}>
                    保存并返回列表
                </Button>
            </div>;
        }

        var tipInfo = <div className="binding_b_t">1、如果题目来源于word文档，建议使用office2007完成传题操作；<br/>
                2、文档中的自定义形状或剪贴画，请先使用截图工具截图替换后再进行粘贴上传；<br/>
                3、文档中的数学公式请单独粘贴上传</div>;

        return (
            <div className="toobar right_ri">
                <Button type="primary" icon="plus-circle" onClick={this.showModal} title="上传题目"
                        className="add_study add_study-b">添加题目</Button>
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

                            <Row>
                                <Col span={3} className="ant-form-item-label">
                                    <span className="font-14">题目：</span>
                                </Col>
                                <Col span={20}>
                                    <TextboxioComponentForSingle />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} className="ant-form-item-label">
                                    <span className="font-14">温馨提示：</span>
                                </Col>
                                <Col span={20}>
                                    {tipInfo}
                                </Col>
                            </Row>

                            <Row>
                                <Col span={3} className="ant-form-item-label">
                                    <span className="font-14">答案：</span>
                                </Col>
                                <Col span={20}>
                                    <div className="ant-form-item-control">
                                        <RadioGroup onChange={this.singleAnswerOnChange} ref="singleAnswer"
                                                    defaultValue={this.state.singleAnswer}>
                                            <Radio key="A" value="A">A</Radio>
                                            <Radio key="B" value="B">B</Radio>
                                            <Radio key="C" value="C">C</Radio>
                                            <Radio key="D" value="D">D</Radio>
                                            <Radio key="E" value="E">E</Radio>
                                            <Radio key="F" value="F">F</Radio>
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
                        <TabPane tab="多选题" key="多选题">
                            <div>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">题目：</span>
                                    </Col>
                                    <Col span={20}>
                                        <TextboxioComponentForMulitiSelect/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">温馨提示：</span>
                                    </Col>
                                    <Col span={20}>
                                        {tipInfo}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">答案：</span>
                                    </Col>
                                    <Col span={20}>
                                        <Row>
                                            <Col span className="ant-form-item-label ant-form-item-control timu_line">
                                                自定义答案选项数量：
                                            </Col>
                                            <Col span={12}>

                                                <Slider min={4} max={8} defaultValue={this.state.sliderValue} value={this.state.sliderValue} onChange={this.sliderChange} />

                                            </Col>
                                        </Row>
                                        <Row>
                                            <div className="ant-form-item-control">
                                                <CheckboxGroup options={this.state.mulitiAnswerOptions}
                                                               defaultValue={this.state.mulitiAnswerDefaultValue}
                                                               value={this.state.mulitiAnswerDefaultValue}
                                                               onChange={this.mulitiAnswerOnChange}/>
                                            </div>
                                        </Row>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={24}>
                                        {scoreItem}
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                        <TabPane tab="判断题" key="判断题">
                            <div>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">题目：</span>
                                    </Col>
                                    <Col span={20}>
                                        <TextboxioComponentForCorrect/>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">温馨提示：</span>
                                    </Col>
                                    <Col span={20}>
                                        {tipInfo}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">答案：</span>
                                    </Col>
                                    <Col span={20}>
                                        <div className="ant-form-item-control">
                                            <RadioGroup onChange={this.correctAnswerOnChange}
                                                        defaultValue={this.state.correctAnswerValue}
                                                        value={this.state.correctAnswerValue}>
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
                            </div>
                        </TabPane>
                        <TabPane tab="简答题" key="简答题">
                            <div>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">题目：</span>
                                    </Col>
                                    <Col span={20}>
                                        <TextboxioComponentForSimpleAnswer/>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">答案：</span>
                                    </Col>
                                    <Col span={20}>
                                        <div className="ant-form-item-control">
                                            <TextboxioComponentForAnswer/>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">温馨提示：</span>
                                    </Col>
                                    <Col span={20}>
                                        {tipInfo}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        {scoreItem}
                                    </Col>
                                </Row>
                            </div>
                        </TabPane>
                    </Tabs>
                </Modal>
            </div>
        );
    },
});

export default SubjectUploadTabComponents;
