import React, {PropTypes} from 'react';
import {Tabs, Button, Radio} from 'antd';
import {Modal} from 'antd';
import {Input, Select, Row, Col, Checkbox,Progress,Slider,Tag} from 'antd';
import {message} from 'antd';
import TextboxioComponentForSingleByModify from '../textboxioComponents/TextboxioComponentForSingleByModify';
import TextboxioComponentForMulitiSelectByModify from '../textboxioComponents/TextboxioComponentForMulitiSelectByModify';
import TextboxioComponentForCorrectByModify from '../textboxioComponents/TextboxioComponentForCorrectByModify';
import TextboxioComponentForSimpleAnswerByModify from '../textboxioComponents/TextboxioComponentForSimpleAnswerByModify';
import TextboxioComponentForAnswerByModify from '../textboxioComponents/TextboxioComponentForAnswerByModify';
import SubjectVideoUploadComponents from '../SubjectVideoUploadComponents';
import SubjectContentEditor from '../textboxioComponents/SubjectContentEditor';
import SubjectAnalysisContentEditor from './SubjectAnalysisContentEditor';
import TextboxioComponentForAnswer from '../textboxioComponents/TextboxioComponentForAnswer';
import {isEmpty,AUDIO_SUBJECT_ALLOWED} from "../../utils/Const";
import {doWebService} from '../../WebServiceHelper';
import SelectKnowledgeModal from './SelectKnowledgeModal';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
var mulitiAnswer = new Array('A');
//将要被修改的题目id
var sid;
var subjectUpload;
var uploadFileList = [];
/**
 * 题目修改组件
 * 2018-1-30启用
 */
const SubjectEditComponents = React.createClass({
    /**
     * 题目组件窗口的初始化
     */
    getInitialState() {
        subjectUpload = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        console.log("==========getInitialState============");
        return {
            loginUser: loginUser,
            visible: false,
            mulitiAnswerOptions: [
                {label: 'A', value: 'A'},
                {label: 'B', value: 'B'},
                {label: 'C', value: 'C'},
                {label: 'D', value: 'D'},
            ],
            singleAnswerOptions: [
                <Radio key="A" value="A">A</Radio>,
                <Radio key="B" value="B">B</Radio>,
                <Radio key="C" value="C">C</Radio>,
                <Radio key="D" value="D">D</Radio>
            ],
            subjectType:'C',
            knowledges:[],
            pageNo:1,
            conditionKeyOfKnowledge:'',
            analysisModifyContent:'',
            sliderValue:4,
            singleSliderValue:4,
            subjectVisibility:'all',    //题目可见性，默认全部可见
            tags:[],
            selectKnowledgeModalIsShow:false
        };
    },

    componentDidMount(){
        if(isEmpty(this.refs.subjectContentEditor)==false){
            this.refs.subjectContentEditor.setContent(editorContent);
        }
    },

    /**
     * 显示题目修改窗口
     * 根据当前选定的题目类型，显示不同的tabPanel
     */
    showModal(currentSubjectInfo) {
        var currentSubjectInfoArray = currentSubjectInfo.split("#");
        var subjectId = currentSubjectInfoArray[0];
        var subjectTypeName = currentSubjectInfoArray[1];
        var subjectType="C";
        switch(subjectTypeName){
            case "单选题":
                subjectType="C";
                break;
            case "多选题":
                subjectType="MC";
                break;
            case "判断题":
                subjectType="J";
                break;
            case "简答题":
                subjectType="S";
                break;
        }
        this.setState({subjectId,subjectType});
        this.getSubjectLineById(subjectId, subjectType);
        this.getKnowledgeInfosByConditionKey(this.state.pageNo,this.state.conditionKeyOfKnowledge);
    },

    getSubjectLineById(subjectId, subjectType){
        var _this = this;
        sid = subjectId;
        var param = {
            "method": 'getSubjectLineById',
            "sid": subjectId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                editorContent = response.content;
                if(isEmpty(_this.refs.subjectContentEditor)==false){
                    _this.refs.subjectContentEditor.setContent(editorContent);
                }
                if (subjectType == "C") {
                    var choosens = response.choosens;
                    var singleAnswerOptions = [];
                    for (var i = 0; i < choosens.length; i++) {
                        var content = choosens[i].content;
                        var selectValue = <Radio key={content} value={content}>{content}</Radio>;
                        singleAnswerOptions.push(selectValue);
                    }
                    _this.setState({
                        singleAnswer: response.answer, "singleAnswerOptions": singleAnswerOptions,"singleSliderValue":choosens.length
                    });
                } else if (subjectType == "MC") {
                    var choosens = response.choosens;
                    var mulitiAnswerOptions = [];
                    for (var i = 0; i < choosens.length; i++) {
                        var content = choosens[i].content;
                        var selectValue = {label: content, value: content};
                        mulitiAnswerOptions.push(selectValue);
                    }
                    _this.setState({
                        mulitiAnswerDefaultValue: response.answer, "mulitiAnswerOptions": mulitiAnswerOptions,"sliderValue":choosens.length
                    });
                } else if (subjectType == "J") {
                    _this.setState({
                        correctAnswerValue: response.answer,
                    });
                } else if (subjectType == "S") {
                    answerContent = response.answer;
                }
                var tags = [];
                var knowledgeInfoList = response.knowledgeInfoList;
                if(isEmpty(knowledgeInfoList)==false){
                    knowledgeInfoList.forEach(function (knowledge) {
                        tags.push({key:knowledge.knowledgeId,name:knowledge.knowledgeName});
                        // knowledges.push(knowledge.knowledgeId);
                    });
                }
                var analysisContent="";
                if(isEmpty(response.analysisContent)==false){
                    analysisContent = response.analysisContent;
                    analysisEditContent = response.analysisContent;
                }
                var ownerSchoolid = response.ownerSchoolid;
                var subjectVisibility = "all";
                if(isEmpty(ownerSchoolid)==false && ownerSchoolid != '0' ){
                    subjectVisibility = "school";
                }
                _this.setState({
                    visible: true,tags,"analysisModifyContent":analysisContent,subjectVisibility
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据指定的关键字，获取指定的知识点集合
     * @param userId
     * @param title
     * @param subjectsIds
     */
    getKnowledgeInfosByConditionKey(pageNo,conditionKey){
        var _this = this;
        var param = {
            "method": 'getKnowledgeInfoListByConditionKey',
            "pageNo": pageNo,
            "conditionKey": conditionKey,
        };
        var knowledgeOptionArray = [];
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    // knowledgeOptionArray.splice(0);
                    response.forEach(function (knowledgeInfo) {
                        var knowledgeId = knowledgeInfo.knowledgeId;
                        var knowledgeName = knowledgeInfo.knowledgeName;
                        var optionObj = <Option key={knowledgeId}>{knowledgeName}</Option>;
                        knowledgeOptionArray.push(optionObj);
                    });
                    _this.setState({knowledgeOptionArray});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
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
        this.setState({score: value});
    },

    /**
     * 设置页面中元素为初始状态
     */
    initPage(){
        if(isEmpty(this.refs.subjectContentEditor)==false){
            this.refs.subjectContentEditor.setContent('');
        }
        if (isEmpty(this.refs.singleAnswer)==false) {
            this.refs.singleAnswer.state.value = "A";
        }
        this.setState({
            activeKey: "单选题",
            mulitiAnswerDefaultValue: 'A',
            correctAnswerValue: "正确"
        });
    },

    /**
     * 修改题目
     */
    modifySubject(content, answer,ownerSchoolid){
        var knowledges=[];
        for(var i=0;i<this.state.tags.length;i++){
            var tag = this.state.tags[i];
            knowledges.push(tag.name);
        }
        var param = {
            "method": 'modifySubject',
            "sid": sid,
            "content": content,
            "answer": answer,
            "score": "-1",
            "knowledgesStr":knowledges.toString(),
            "analysisContent":this.state.analysisModifyContent,
            "ownerSchoolid":ownerSchoolid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("题目修改成功");
                    subjectUpload.props.subjectEditCallBack();
                } else {
                    message.error("题目修改失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 多选题答案内容发生改变时的响应
     */
    mulitiAnswerOnChange: function (checkedValues) {
        mulitiAnswer = checkedValues;
        this.setState({mulitiAnswerDefaultValue: checkedValues});
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
     * 插入音频
     */
    insertVideo(attachment){
        var _this = this;
        console.log("insertVideo");
        var id = "audioTag"+parseInt(Math.random()*1000);
        var iTagId = "iTag"+parseInt(Math.random()*1000);
        var newContent ='<span class="adiuo_p_play"><i id="'+iTagId+'" class="audio_left" onclick="javascript:var isPaused=document.getElementById(\''+id+'\').paused;if(isPaused){ document.getElementById(\''+id+'\').play();document.getElementById(\''+iTagId+'\').className=\'audio_left_run\'; }else{ document.getElementById(\''+id+'\').pause();document.getElementById(\''+iTagId+'\').className=\'audio_left\'; }"></i><audio onended="javascript:document.getElementById(\''+iTagId+'\').className=\'audio_left\'" id="'+id+'" style="display: none"  controls="controls" width="200" height="30" src="'+attachment+'"></audio></span>';
        subjectContentForEdit.content.insertHtmlAtCursor(newContent);
    },

    /**
     * 显示插入音频窗口
     * @param subjectType
     */
    showVideoUploadModal(subjectType){
        if(isEmpty(this.refs.subjectVideoUpload)==false){
            this.refs.subjectVideoUpload.initFileUploadPage();
        }
        this.setState({subjectVideoModalVisible:true,"currentSubjectType":subjectType});
    },

    /**
     * 聊天语音播放的回调
     */
    audioPlay(id, direction) {
        document.getElementById(id).play();
        var timer = setInterval(function () {
            //播放开始，替换类名
            document.getElementById(id + '_audio').className = 'audio' + direction + '_run';
            if (document.getElementById(id).ended) {
                //播放结束，替换类名
                document.getElementById(id + '_audio').className = 'audio' + direction;
                window.clearInterval(timer);
            }
        }, 10)
    },

    /**
     * 音频文件上传成功后的回调
     * @param fileList
     */
    handleFileSubmit(fileList){
        if(fileList==null || fileList.length==0){
            uploadFileList.splice(0,uploadFileList.length);
        }
        for(var i=0;i<fileList.length;i++){
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            // uploadFileList.push(fileObj[0]);
            uploadFileList.push(fileObj);
        }
    },

    /**
     * 关闭音频文件上传窗口
     */
    subjectVideoModalHandleCancel(){
        this.setState({"subjectVideoModalVisible": false});
    },

    //点击保存按钮，向服务器保存选定的文件，并将文件的路径返回
    uploadFile() {
        var _this = this;
        if (uploadFileList.length == 0) {
            message.warning("请选择上传的文件,谢谢！");
        } else {
            var formData = new FormData();
            for (var i = 0; i < uploadFileList.length; i++) {
                formData.append("file" + i, uploadFileList[i]);
                formData.append("name" + i, uploadFileList[i].name);
            }
            $.ajax({
                type: "POST",
                url: "http://60.205.86.217:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData: false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType: false,
                xhr: function () {        //这是关键  获取原生的xhr对象  做以前做的所有事情
                    var xhr = jQuery.ajaxSettings.xhr();
                    xhr.upload.onload = function () {
                        _this.setState({progressState: 'none'});
                    }
                    xhr.upload.onprogress = function (ev) {
                        if (ev.lengthComputable) {
                            var percent = 100 * ev.loaded / ev.total;
                            _this.setState({uploadPercent: Math.round(percent), progressState: 'block'});
                        }
                    }
                    return xhr;
                },
                success: function (responseStr) {
                    if (responseStr != "") {
                        var fileUrl = responseStr;
                        _this.insertVideo(fileUrl);
                        _this.setState({"subjectVideoModalVisible": false});
                    }
                },
                error: function (responseStr) {
                    _this.setState({subjectVideoModalVisible: false});
                }
            });

        }
    },

    /**
     * 题目类型改变的响应
     */
    subjectTypeOnChange(e){
        message.warning("修改过程中禁止切换题型，谢谢！");
    },

    /**
     *题目修改按钮的响应函数
     */
    editButtonOnClick(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectName = subjectContentForEdit.content.get();
        var answer = this.getSubjectAnswerByType();
        //题目归属的学校id，如果全部可见，则学校id为0
        var ownerSchoolid=0;
        if(this.state.subjectVisibility=='school'){
            ownerSchoolid=this.state.loginUser.schoolId;
        }
        //完成基础的非空验证
        if (isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (isEmpty(answer)) {
            message.warning("请输入答案");
        } else {
            //完成题目的修改操作
            this.modifySubject(subjectName, answer,ownerSchoolid);
            this.setState({visible: false});
            //重新初始化页面
            this.initPage();
        }
    },

    /**
     * 根据题目类型，从不同的组件中获取对应的题目答案
     */
    getSubjectAnswerByType(){
        var answer = "";
        switch(this.state.subjectType){
            case "C":
                answer = this.state.singleAnswer;
                break;
            case "MC":
                //将获取的多选答案数组转换为字符串
                for (var i = 0; i < this.state.mulitiAnswerDefaultValue.length; i++) {
                    answer += this.state.mulitiAnswerDefaultValue[i];
                }
                break;
            case "J":
                answer = this.state.correctAnswerValue;
                break;
            case "S":
                answer = mytextareaAnswerModifyEditor.content.get();
                answer = answer.replace(/\+/g, "%2B"); //将+号替换为十六进制
                break;
        }
        return answer;
    },

    searchKnowledge(searchCondition){
        console.log("searchCondition:"+searchCondition);
        // children.splice(0);
        //this.getKnowledgeInfosByConditionKey(this.state.pageNo,searchCondition);
    },

    /**
     * 修改题目时，题目所属知识点发生改变时的响应函数
     * @param value
     */
    handleChange(value) {
        console.log(`selected ${value}`);
        this.setState({"knowledges":value});
    },

    modifyAnalysisContent(){
        var analysisModifyContent = subjectAnalysisContentModifyEditor.content.get();
        console.log(analysisModifyContent);
        this.setState({analysisModifyContent,subjectAnalysisModifyModalVisible:false});
    },

    /**
     * 显示题目解析窗口
     */
    showAnalysisModifyModal(){
        if(isEmpty(subjectAnalysisContentModifyEditor)==false){
            subjectAnalysisContentModifyEditor.content.set(this.state.analysisModifyContent);
        }
        this.setState({"subjectAnalysisModifyModalVisible":true});
    },

    /**
     * 题目解析窗口关闭
     */
    subjectAnalysisModifyModalHandleCancel(){
        this.setState({"subjectAnalysisModifyModalVisible":false});
    },

    /**
     * 单选题选项自定义数量变化处理函数
     * @param value
     */
    singleSliderChange(value){
        var selectArray=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var singleAnswerOptions=[];
        for(var i=0;i<value;i++){
            var selectValue = <Radio key={selectArray[i]} value={selectArray[i]}>{selectArray[i]}</Radio>;
            singleAnswerOptions.push(selectValue);
        }
        this.setState({"singleAnswerOptions":singleAnswerOptions,"singleSliderValue":value});
    },

    /**
     * 自定义多选题选项数量
     * @param value
     * @returns {string}
     */
    sliderChange(value) {
        var selectArray=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        var mulitiAnswerOptions=[];
        for(var i=0;i<value;i++){
            var selectValue = {label: selectArray[i], value: selectArray[i]};
            mulitiAnswerOptions.push(selectValue);
        }
        this.setState({"mulitiAnswerOptions":mulitiAnswerOptions,"sliderValue":value});
    },

    /**
     * 题目可见性选项改变时的响应函数
     */
    subjectVisibilityOnChange(e){
        this.setState({"subjectVisibility":e.target.value});
    },

    showSelectKnowledgeModal(){
        this.setState({"selectKnowledgeModalIsShow":true});
    },

    closeSelectKnowledgeModal(tags){
        // var tags = this.state.tags;
        // newTags.forEach(function (newTag) {
        //     tags.push(newTag);
        // });
        var _this = this;
        _this.state.tags.splice(0);
        // this.setState({"tags":tags});
        if(isEmpty(tags)==false){
            tags.forEach(function (tag) {
                _this.state.tags.push(tag);
            })
        }
        _this.setState({"selectKnowledgeModalIsShow":false});
    },

    /**
     * 修改题目时，可以直接删除已选的知识点
     * @param removedTag
     */
    handleClose(removedTag){
        var tags = this.state.tags;
        for (var i = 0; i < tags.length; i++) {
            if (tags[i].key == removedTag.key) {
                tags.splice(i, 1);
            }
        }
        console.log("handleClose:"+tags);
        this.setState(tags);
    },


    /**
     * 页面元素渲染
     */
    render() {
        //根据当前激活的面板的不同，向页面上渲染不同的保存按钮，用以完成不同类型题目的添加操作
        var buttons = <div>
           
            <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.handleCancel}>
                取消
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.editButtonOnClick}>
                保存
            </Button>
        </div>;
        var answerComponent = null;
        var audioButton = <Button className="row-t-f roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'single')}>插入音频</Button>;
        if (this.state.subjectType == "C") {
            answerComponent = <Row>
                <Col span={3} className="ant-form-item-label">
                    <span className="font-14">答案：</span>
                </Col>
                <Col span={20}>
                    <Row>
                        <Col span className="ant-form-item-label ant-form-item-control timu_line">
                            自定义答案选项数量：
                        </Col>
                        <Col span={12}>
                            <Slider min={4} max={8} defaultValue={this.state.singleSliderValue} value={this.state.singleSliderValue} onChange={this.singleSliderChange} />
                        </Col>
                    </Row>
                    <Row>
                        <div className="ant-form-item-control">
                            <RadioGroup onChange={this.singleAnswerOnChange} ref="singleAnswer"
                                        defaultValue={subjectUpload.state.singleAnswer}
                                        value={subjectUpload.state.singleAnswer}>
                                {this.state.singleAnswerOptions}
                            </RadioGroup>
                        </div>
                    </Row>
                </Col>
            </Row>;
            audioButton = <Button className="row-t-f roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'single')}>插入音频</Button>;
        } else if (this.state.subjectType == "MC") {
            answerComponent = <Row>
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
                                           defaultValue={subjectUpload.state.mulitiAnswerDefaultValue}
                                           value={subjectUpload.state.mulitiAnswerDefaultValue}
                                           onChange={this.mulitiAnswerOnChange}/>
                        </div>
                    </Row>
                </Col>
            </Row>;
            audioButton = <Button className="row-t-f roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'mulitiSelect')}>插入音频</Button>
        } else if (this.state.subjectType == "J") {
            answerComponent = <Row>
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
            </Row>;
            audioButton = <Button className="row-t-f roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'correct')}>插入音频</Button>;
        } else if (this.state.subjectType == "S") {
            answerComponent =<Row>
                <Col span={3} className="ant-form-item-label">
                    <span className="font-14">答案：</span>
                </Col>
                <Col span={20}>
                    <div className="ant-form-item-control">
                        <TextboxioComponentForAnswerByModify/>
                    </div>
                </Col>
            </Row>;
            audioButton = <Button className="row-t-f roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'simpleAnswer')}>插入音频</Button>;
        }

        //如果用户不在允许的权限列表中，将audioButton设置为null，不显示
        if(AUDIO_SUBJECT_ALLOWED.indexOf(sessionStorage.getItem("ident")) == -1){
            audioButton = null;
        }

        var tipInfo = <div className="binding_b_t">1、如果题目来源于word文档，建议使用office2007完成传题操作；<br/>
            2、文档中的自定义形状或剪贴画，请先使用截图工具截图替换后再进行粘贴上传；<br/>
            3、文档中的数学公式请单独粘贴上传</div>;

        //根据该状态值，来决定上传进度条是否显示
        var progressState = this.state.progressState;
        const {tags} = this.state;

        return (
            <div className="toobar right_ri">
                <Modal
                    visible={this.state.visible}
                    title="修改题目"
                    width="860px"
                    height="636px"
                    className="ant-modal-width add_modal_subject"
                    onCancel={this.handleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <div>
                            {buttons}
                        </div>
                    ]}
                >

                    <div>
                        <Row>
                            <Col span={3} className="ant-form-item-label">
                                <span className="font-14">题目类型：</span>
                            </Col>
                            <Col span={20} className="row-t-f">
                                <RadioGroup onChange={this.subjectTypeOnChange} value={this.state.subjectType}>
                                    <Radio value="C">单选题</Radio>
                                    <Radio value="MC">多选题</Radio>
                                    <Radio value="J">判断题</Radio>
                                    <Radio value="S">简答题</Radio>
                                </RadioGroup>
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

                        <Row className="row-t-f">
                            <Col span={3} className="ant-form-item-label">
                                <span className="font-14">题目：</span>
                            </Col>
                            <Col span={20}>
                                <SubjectContentEditor ref="subjectContentEditor"/>
                                <Button className="row-t-f" style={{marginTop:'15px', marginBottom:'15px'}} onClick={this.showAnalysisModifyModal}>题目解析</Button>
                                {audioButton}
                            </Col>
                        </Row>

                        {answerComponent}

                        <Row>
                            <Col span={3} className="ant-form-item-label row-t-f">
                                <span className="font-14">知识点：</span>
                            </Col>
                            <Col span={20} className="row-t-f">
                                <div className="select_knoledge_width upexam_float">
                                    {tags.map((tag, index) => {
                                        const isLongTag = tag.length > 20;
                                        const tagElem = (
                                            <Tag key={tag.key} closable={index !== -1}
                                                 afterClose={() => this.handleClose(tag)}>
                                                {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
                                            </Tag>
                                        );
                                        return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                    })}
                                </div>
                                <Button className="calmBorderRadius ding_modal_top roe-t-f-left" onClick={this.showSelectKnowledgeModal}>选择知识点</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={3} className="ant-form-item-label row-t-f">
                                <span className="font-14">可见性：</span>
                            </Col>
                            <Col span={20} className="row-t-f  select_knoledge_top2">
                                <RadioGroup onChange={this.subjectVisibilityOnChange} value={this.state.subjectVisibility}>
                                    <Radio value="all">全部可见</Radio>
                                    <Radio value="school">本校可见</Radio>
                                </RadioGroup>
                            </Col>
                        </Row>

                    </div>


                </Modal>

                <Modal
                    visible={this.state.subjectVideoModalVisible}
                    title="上传文件"
                    className="modol_width"
                    maskClosable={false} //设置不允许点击蒙层关闭
                    onCancel={this.subjectVideoModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                            
                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={this.subjectVideoModalHandleCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" className="login-form-button"
                                    onClick={this.uploadFile}>
                                发送
                            </Button>
                        </div>
                    ]}
                >
                    <Row>
                        <Col span={4}>上传文件：</Col>
                        <Col span={20}>
                            <div>
                                <SubjectVideoUploadComponents ref="subjectVideoUpload"
                                                              fatherState={this.state.subjectVideoModalVisible}
                                                              callBackParent={this.handleFileSubmit}/>
                            </div>
                            <div style={{display: progressState}}>
                                <Progress percent={this.state.uploadPercent} width={80} strokeWidth={4}/>
                            </div>
                        </Col>

                    </Row>
                </Modal>

                <Modal
                    visible={this.state.subjectAnalysisModifyModalVisible}
                    title="题目解析"
                    className="modol_width queanswer_modol_width queanswer_modol_widthchange"
                    maskClosable={false} //设置不允许点击蒙层关闭
                    onCancel={this.subjectAnalysisModifyModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                            
                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={this.subjectAnalysisModifyModalHandleCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" className="login-form-button"
                                    onClick={this.modifyAnalysisContent}>
                                确定
                            </Button>
                        </div>
                    ]}
                >
                    <Row>
                        <Col span={2}>解析：</Col>
                        <Col span={22}>
                            <SubjectAnalysisContentEditor ref="subjectAnalysisModifyContentEditor"></SubjectAnalysisContentEditor>
                        </Col>

                    </Row>
                </Modal>

                <SelectKnowledgeModal isShow={this.state.selectKnowledgeModalIsShow} initTags={this.state.tags}
                                      closeSelectKnowledgeModal={this.closeSelectKnowledgeModal}></SelectKnowledgeModal>

            </div>
        );
    },
});

export default SubjectEditComponents;
