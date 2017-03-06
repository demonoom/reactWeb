import React, {PropTypes} from 'react';
import {Tabs, Button, Radio} from 'antd';
import {Modal} from 'antd';
import {Input, Select, Row, Col, Checkbox} from 'antd';
import {message} from 'antd';
import TextboxioComponentForSingleByModify from './textboxioComponents/TextboxioComponentForSingleByModify';
import TextboxioComponentForMulitiSelectByModify from './textboxioComponents/TextboxioComponentForMulitiSelectByModify';
import TextboxioComponentForCorrectByModify from './textboxioComponents/TextboxioComponentForCorrectByModify';
import TextboxioComponentForSimpleAnswerByModify from './textboxioComponents/TextboxioComponentForSimpleAnswerByModify';
import TextboxioComponentForAnswerByModify from './textboxioComponents/TextboxioComponentForAnswerByModify';
import {doWebService} from '../WebServiceHelper';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
var mulitiAnswer = new Array('A');
//将要被修改的题目id
var sid;
var subjectUpload;
//定义多选题答案
const mulitiAnswerOptions = [
    {label: 'A', value: 'A'},
    {label: 'B', value: 'B'},
    {label: 'C', value: 'C'},
    {label: 'D', value: 'D'},
    {label: 'E', value: 'E'},
    {label: 'F', value: 'F'},
];
/**
 * 题目修改组件
 */
const SubjectEditByTextboxioTabComponents = React.createClass({
    /**
     * 题目组件窗口的初始化
     * @returns {{loading: boolean, visible: boolean}}
     */
    getInitialState() {
        subjectUpload = this;
        return {
            loading: false,
            visible: false,
        };
    },
    /**
     * 显示题目修改窗口
     * 根据当前选定的题目类型，显示不同的tabPanel
     */
    showModal(currentSubjectInfo) {
        var currentSubjectInfoArray = currentSubjectInfo.split("#");
        var subjectId = currentSubjectInfoArray[0];
        var subjectType = currentSubjectInfoArray[1];
        subjectUpload.setState({
            activeKey: subjectType,
        });
        this.getSubjectLineById(subjectId, subjectType);
    },

    getSubjectLineById(subjectId, subjectType){
        sid = subjectId;
        var param = {
            "method": 'getSubjectLineById',
            "sid": subjectId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (subjectType == "单选题") {
                    editorContent = response.content;
                    subjectUpload.setState({
                        singleAnswer: response.answer,
                    });
                } else if (subjectType == "多选题") {
                    muEditorContent = response.content;
                    subjectUpload.setState({
                        mulitiAnswerDefaultValue: response.answer,
                    });
                } else if (subjectType == "判断题") {
                    correctEditorContent = response.content;
                    subjectUpload.setState({
                        correctAnswerValue: response.answer,
                    });
                } else if (subjectType == "简答题") {
                    simpleEditorContent = response.content;
                    answerContent = response.answer;
                }
                if (response.score > 10) {
                    subjectUpload.setState({
                        scoreInputState: false,
                        scoreChecked: true,
                        scoreDisable: true,
                        score: 1,
                        scoreDefinedValue: response.score
                    });
                } else {
                    subjectUpload.setState({
                        score: response.score,
                        scoreDisable: false,
                        scoreInputState: true
                    });
                }
                subjectUpload.setState({
                    visible: true
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     *  初始化题目上传组件
     */
    editorsInit(){
        if (!this.isEmpty(mytextareaSingleModifyEditor)) {
            mytextareaSingleModifyEditor.content.set('');
        }
        if (!this.isEmpty(mytextareaMulitiSelectModifyEditor)) {
            mytextareaMulitiSelectModifyEditor.content.set('');
        }
        if (!this.isEmpty(mytextareaCorrectModifyEditor)) {
            mytextareaCorrectModifyEditor.content.set('');
        }
        if (!this.isEmpty(mytextareaSimpleAnswerModifyEditor)) {
            mytextareaSimpleAnswerModifyEditor.content.set('');
        }
        if (!this.isEmpty(mytextareaAnswerModifyEditor)) {
            mytextareaAnswerModifyEditor.content.set('');
        }
    },

    /**
     * 关闭题目修改窗口的响应函数
     */
    handleCancel() {
        this.setState({visible: false, activeKey: "单选题"});
        this.initPage();
    },
    /**
     * 分值下拉列表改变时的响应函数
     */
    selectHandleChange: function (value) {
        console.log(`selected ${value}`);
        this.setState({score: value});
    },

    /**
     * 系统非空判断
     */
    isEmpty(content){
        if (content == null || content == "" || typeof(content) == "undefined") {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 设置页面中元素为初始状态
     */
    initPage(){
        this.editorsInit();
        this.setState({score: 1, scoreDefinedValue: ''});
        if (!this.isEmpty(this.refs.singleAnswer)) {
            this.refs.singleAnswer.state.value = "A";
        }
        this.setState({
            activeKey: "单选题",
            scoreChecked: false,
            scoreInputState: true,
            scoreDisable: false,
            mulitiAnswerDefaultValue: 'A',
            correctAnswerValue: "正确"
        });
    },

    /**
     * 修改题目
     */
    modifySubject(content, answer, score){
        var param = {
            "method": 'modifySubject',
            "sid": sid,
            "content": content,
            "answer": answer,
            "score": score,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg);
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("题目修改成功");
                    subjectUpload.props.subjectEditCallBack();
                } else {
                    message.error("题目修改失败");
                }
                // this.initPage();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     *单选题修改
     */
    singleHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaSingleModifyEditor.content.get();
        // subjectName = subjectName.replace(/\+/g, "%2B"); //将+号替换为十六进制
        console.log("ttt:" + subjectName);
        var answer = this.state.singleAnswer;
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score == 0) {
            message.warning("请选择分值");
        } else {
            //完成题目的修改操作
            this.modifySubject(subjectName, answer, score);
            this.setState({visible: false, score: 1});
            //重新初始化页面
            this.initPage();
        }
    },
    /**
     * 多选题修改
     */
    MulitiHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaMulitiSelectModifyEditor.content.get();
        console.log("ttt:" + subjectName);
        //将获取的多选答案数组转换为字符串
        var answer = "";
        for (var i = 0; i < mulitiAnswer.length; i++) {
            answer += mulitiAnswer[i];
        }
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score == 0) {
            message.warning("请选择分值");
        } else {
            this.modifySubject(subjectName, answer, score);
            this.setState({visible: false, score: 1});
        }
        //重新初始化页面
        this.initPage();
    },
    /**
     *判断题修改
     */
    correctHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaCorrectModifyEditor.content.get();
        console.log("ttt:" + subjectName);
        var answer = this.state.correctAnswerValue;
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score == 0) {
            message.warning("请选择分值");
        } else {
            this.modifySubject(subjectName, answer, score);
            //关闭并返回题目列表页面
            this.setState({visible: false, score: 1});
        }
        //重新初始化页面
        this.initPage();
    },

    /**
     *简答题修改
     */
    simpleAnswerHandleSubmit(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score = this.state.scoreDefinedValue;
        }
        var subjectName = mytextareaSimpleAnswerModifyEditor.content.get();
        console.log("ttt:" + subjectName);
        var answer = mytextareaAnswerModifyEditor.content.get();
        console.log("ttt answer:" + answer);
        //完成基础的非空验证
        if (this.isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (this.isEmpty(answer)) {
            message.warning("请输入答案");
        } else if (this.isEmpty(score) || score == 0) {
            message.warning("请选择分值");
        } else {
            this.modifySubject(subjectName, answer, score);
            this.setState({visible: false, score: 1});
        }
        //重新初始化页面
        this.initPage();
    },
    /**
     * 多选题答案内容发生改变时的响应
     */
    mulitiAnswerOnChange: function (checkedValues) {
        mulitiAnswer = checkedValues;
        this.setState({mulitiAnswerDefaultValue: checkedValues});
    },
    /**
     * 自定义分值的checkbox选中时的响应函数
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
     * 判断题答案的RadioGroup选中时的响应
     */
    correctAnswerOnChange(e){
        this.setState({correctAnswerValue: e.target.value});
    },
    /**
     *单选题答案的RadioGroup选中时的响应
     */
    singleAnswerOnChange(e){
        this.setState({singleAnswer: e.target.value});
    },
    /**
     * tabPanel切换时的响应函数
     * 在修改题目的窗口中，不允许用户切换到其他界面
     */
    tabOnChange(key) {
        if (key != this.state.activeKey) {
            message.warning("修改过程中禁止切换题型，谢谢！");
        } else {
            this.setState({activeKey: key});
        }
    },
    /**
     *自定义分值文本框内容改变事件处理函数
     */
    onScoreDefinedValueChange(e){
        this.setState({scoreDefinedValue: e.target.value});
    },
    /**
     * 页面元素渲染
     */
    render() {
        //定义分值下拉列表的内容
        const children = [];
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
                        <div className="ant-form-item-control">
                            {/*value={this.state.score}*/}
                            <Select ref="scoreSelect" defaultValue={subjectUpload.state.score}
                                    value={subjectUpload.state.score} style={{width: 100}}
                                    disabled={this.state.scoreDisable} onChange={this.selectHandleChange}>
                                {children}
                            </Select>


                            <Col span={8} className="right_ri"><span><Input ref="scoreDefined"
                                                                            defaultValue={this.state.scoreDefinedValue}
                                                                            value={this.state.scoreDefinedValue}
                                                                            onChange={this.onScoreDefinedValueChange}
                                                                            placeholder="请输入自定义分值"
                                                                            disabled={this.state.scoreInputState}/></span></Col>
                            <Col span={6} className="right_ri custom—1"><Checkbox
                                onChange={this.scoreSelectTypeOnChange} ref="scoreCheckBox"
                                checked={this.state.scoreChecked} value="defined">自定义:</Checkbox></Col>
                        </div>
                    </Col>
                </Row>
            </div>
        )
        //根据当前激活的面板的不同，向页面上渲染不同的保存按钮，用以完成不同类型题目的添加操作
        var currentActiveKey = subjectUpload.state.activeKey;
        var buttons = <div>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.singleHandleSubmit}>
                保存
            </Button>
            <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel}>
                取消
            </Button>
        </div>;
        if (currentActiveKey == "单选题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.singleHandleSubmit}>
                    保存
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel}>
                    取消
                </Button>
            </div>;
        } else if (currentActiveKey == "多选题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.MulitiHandleSubmit}>
                    保存
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel}>
                    取消
                </Button>
            </div>;
        } else if (currentActiveKey == "判断题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.correctHandleSubmit}>
                    保存
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel}>
                    取消
                </Button>
            </div>;
        } else if (currentActiveKey == "简答题") {
            buttons = <div>
                <Button type="primary" htmlType="submit" className="login-form-button"
                        onClick={this.simpleAnswerHandleSubmit}>
                    保存
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel}>
                    取消
                </Button>
            </div>;
        }

        var tipInfo = <div className="binding_b_t">1、如果题目来源于word文档，建议使用office2007完成传题操作；<br/>
            2、文档中的自定义形状或剪贴画，请先使用截图工具截图替换后再进行粘贴上传；<br/>
            3、文档中的数学公式请单独粘贴上传</div>;

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
                                <Col span={3} className="ant-form-item-label">
                                    <span className="font-14">题目：</span>
                                </Col>
                                <Col span={20}>
                                    <TextboxioComponentForSingleByModify/>
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
                                                    defaultValue={subjectUpload.state.singleAnswer}
                                                    value={subjectUpload.state.singleAnswer}>
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
                        <TabPane tab="多选题" key="多选题">
                            <div>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">题目：</span>
                                    </Col>
                                    <Col span={20}>
                                        <TextboxioComponentForMulitiSelectByModify/>
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
                                            <CheckboxGroup options={mulitiAnswerOptions}
                                                           defaultValue={subjectUpload.state.mulitiAnswerDefaultValue}
                                                           value={subjectUpload.state.mulitiAnswerDefaultValue}
                                                           onChange={this.mulitiAnswerOnChange}/>
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
                        <TabPane tab="判断题" key="判断题">
                            <div>
                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">题目：</span>
                                    </Col>
                                    <Col span={20}>
                                        <TextboxioComponentForCorrectByModify/>
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
                                                        defaultValue={subjectUpload.state.correctAnswerValue}
                                                        value={subjectUpload.state.correctAnswerValue}>
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
                                        <TextboxioComponentForSimpleAnswerByModify/>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={3} className="ant-form-item-label">
                                        <span className="font-14">答案：</span>
                                    </Col>
                                    <Col span={20}>
                                        <div className="ant-form-item-control">
                                            <TextboxioComponentForAnswerByModify/>
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

export default SubjectEditByTextboxioTabComponents;
