import React, {PropTypes} from 'react';
import {Button, Radio,Progress} from 'antd';
import {Modal} from 'antd';
import { Row, Col, Checkbox,Slider,Select,Tag} from 'antd';
import {message} from 'antd';
import TextboxioComponentForAnswer  from '../textboxioComponents/TextboxioComponentForAnswer';
import SubjectVideoUploadComponents from '../SubjectVideoUploadComponents';
import SubjectAnalysisContent from './SubjectAnalysisContent';
import SubjectContent from '../textboxioComponents/SubjectContent';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty,AUDIO_SUBJECT_ALLOWED} from "../../utils/Const";
import SelectKnowledgeModal from './SelectKnowledgeModal';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const Option = Select.Option;

var mulitiAnswer = new Array('A');
var subjectUpload;
var uploadFileList = [];

var children = [];

/**
 * 题目上传组件
 * 2018-1-30启用
 */
const SubjectUploadComponent = React.createClass({
    getInitialState() {
        subjectUpload = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            visible: false,
            subjectName: '',
            singleAnswer: 'A',
            mulitiAnswerDefaultValue: 'A',
            correctAnswerValue: "正确",
            useSameScheduleForCorrect: true,
            mulitiAnswerOptions:[
                {label: 'A', value: 'A'},
                {label: 'B', value: 'B'},
                {label: 'C', value: 'C'},
                {label: 'D', value: 'D'},
            ],
            singleAnswerOptions:[
                <Radio key="A" value="A">A</Radio>,
                <Radio key="B" value="B">B</Radio>,
                <Radio key="C" value="C">C</Radio>,
                <Radio key="D" value="D">D</Radio>
            ],
            sliderValue:4,
            singleSliderValue:4,
            subjectVideoModalVisible:false, //音频文件上传窗口的默认状态（隐藏Modal窗口）
            uploadPercent:0,    //上传进度的初始值
            subjectType:'C',    //默认的题目类型为单选题C
            pageNo:1,   //查询知识点的页码
            conditionKeyOfKnowledge:'',  //查询知识点的关键字
            knowledges:[],  //题目的知识点
            subjectAnalysisModalVisible:false,  //题目的解析窗口状态
            subjectVisibility:'all',    //题目可见性，默认全部可见
            knowledgeChildren:[],
            knowledgeResponse:[],
            selectKnowledgeModalIsShow:false,
            tags:[]
        };
    },

    /**
     * 设置当前题目上传组件的Modal显示状态为true，即显示窗口
     */
    showModal() {
        // this.getKnowledgeInfosByConditionKey(this.state.pageNo,this.state.conditionKeyOfKnowledge);
        console.log("showUpload");
        this.setState({
            visible: true,tags:[]
        });
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
     * 完成页面内容的初始化操作，设置一些关键state回到初始值
     */
    initPage(){
        if(isEmpty(subjectContentEditor)==false){
            subjectContentEditor.content.set('');
        }
        if(isEmpty(mytextareaAnswerEditor)==false){
            mytextareaAnswerEditor.content.set('');
        }
        if(isEmpty(subjectAnalysisContentEditor)==false){
            subjectAnalysisContentEditor.content.set('');
        }
        this.setState({
            singleAnswer: 'A',
            mulitiAnswerDefaultValue: 'A',
            correctAnswerValue: "正确",
            mulitiAnswerOptions:[
                {label: 'A', value: 'A'},
                {label: 'B', value: 'B'},
                {label: 'C', value: 'C'},
                {label: 'D', value: 'D'},
            ],
            singleAnswerOptions:[
                <Radio key="A" value="A">A</Radio>,
                <Radio key="B" value="B">B</Radio>,
                <Radio key="C" value="C">C</Radio>,
                <Radio key="D" value="D">D</Radio>
            ],
            sliderValue:4,
            singleSliderValue:4,
            knowledges:[],
            analysisContent:''
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
     * 多选题答案的checkbox选项发生改变时的响应函数
     * @param checkedValues
     */
    mulitiAnswerOnChange: function (checkedValues) {
        mulitiAnswer = checkedValues;
        this.setState({mulitiAnswerDefaultValue: checkedValues});
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
     * 插入音频
     */
    insertVideo(attachment){
        var id = "audioTag"+parseInt(Math.random()*1000);
        var iTagId = "iTag"+parseInt(Math.random()*1000);
        var newContent ='<span class="adiuo_p_play"><i id="'+iTagId+'" class="audio_left" onclick="javascript:var isPaused=document.getElementById(\''+id+'\').paused;if(isPaused){ document.getElementById(\''+id+'\').play();document.getElementById(\''+iTagId+'\').className=\'audio_left_run\'; }else{ document.getElementById(\''+id+'\').pause();document.getElementById(\''+iTagId+'\').className=\'audio_left\'; }"></i><audio onended="javascript:document.getElementById(\''+iTagId+'\').className=\'audio_left\'" id="'+id+'" style="display: none"  controls="controls" width="200" height="30" src="'+attachment+'"></audio></span>';
        subjectContentEditor.content.insertHtmlAtCursor(newContent);
    },

    /**
     * 显示音频上传窗口
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
     * 音频文件上传完成后的回调
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
                url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
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
        this.setState({subjectType:e.target.value});
    },

    /**
     * 点击题目的保存按钮时的响应函数
     * @param e
     */
    saveButtonOnClick(e) {
        e.preventDefault();
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;

        // var subjectName = mytextareaCorrectEditor.content.get();
        var subjectName = this.refs.subjectContent.getSubjectContent();
        subjectName = subjectName.replace(/\+/g, "%2B"); //将+号替换为十六进制
        var answer =this.getSubjectAnswerByType();
        var subjectParamArray = this.props.params.split("#");
        var ScheduleOrSubjectId = subjectParamArray[1];
        var optType = subjectParamArray[3];
        var knowledgeName = subjectParamArray[4];
        if (ScheduleOrSubjectId == null || ScheduleOrSubjectId == "") {
            ScheduleOrSubjectId = sessionStorage.getItem("lastClickMenuId");
            knowledgeName = sessionStorage.getItem("lastClickMenuName");
        }
        var isLinkToSchedule = this.state.useSameScheduleForCorrect;
        var alterNativeAnswerCount = 4;
        if(this.state.subjectType == "C"){
            alterNativeAnswerCount = this.state.singleSliderValue;
        }else if(this.state.subjectType == "MC"){
            alterNativeAnswerCount = this.state.sliderValue;
        }
        //题目归属的学校id，如果全部可见，则学校id为0
        var ownerSchoolid=0;
        if(this.state.subjectVisibility=='school'){
            ownerSchoolid=this.state.loginUser.schoolId;
        }
        var knowledges=[];
        for(var i=0;i<this.state.tags.length;i++){
            var tag = this.state.tags[i];
            knowledges.push(tag.name);
        }
        var batchAddSubjectBeanJson = {
            "textTigan": subjectName,
            "textAnswer": answer,
            // "score": 0,
            "userId": this.state.loginUser.colUid,
            "type": this.state.subjectType,
            "knowledges":knowledges,
            "analysisContent":this.state.analysisContent,
            "alterNativeAnswerCount":alterNativeAnswerCount,
            "ownerSchoolid":ownerSchoolid
        };
        if (optType == "bySubjectId") {
            batchAddSubjectBeanJson.knowledgePointId = ScheduleOrSubjectId;
        }
        //完成基础的非空验证
        if (isEmpty(subjectName)) {
            message.warning("请输入题目");
        } else if (isEmpty(answer)) {
            message.warning("请输入答案");
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
                for (var i = 0; i < mulitiAnswer.length; i++) {
                    answer += mulitiAnswer[i];
                }
                break;
            case "J":
                answer = this.state.correctAnswerValue;
                break;
            case "S":
                answer = mytextareaAnswerEditor.content.get();
                answer = answer.replace(/\+/g, "%2B"); //将+号替换为十六进制
                break;
        }
        return answer;
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

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    //children.splice(0);
                    var response = ret.response;
                    children.splice(0);
                    _this.setState({knowledgeResponse:response});
                    response.forEach(function (knowledgeInfo) {
                        var knowledgeId = knowledgeInfo.knowledgeId;
                        var knowledgeName = knowledgeInfo.knowledgeName;
                        children.push(<Option key={knowledgeId}>{knowledgeName}</Option>);
                    });
                    _this.setState({"knowledgeChildren":children});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    searchKnowledge(searchCondition){
        console.log("searchCondition:"+searchCondition);
        // children.splice(0);
        this.getKnowledgeInfosByConditionKey(this.state.pageNo,searchCondition);
    },

    filterKnowledge(inputValue,option){
        console.log("inputValue:"+inputValue);
        //this.getKnowledgeInfosByConditionKey(1,inputValue);
    },

    /**
     * 题目所属知识点发生改变时的响应函数
     * @param value
     */
    handleChange(value) {
        console.log(`selected ${value}`);
        this.setState({"knowledges":value});
        this.getKnowledgeInfosByConditionKey(this.state.pageNo,value);
    },

    selectKnowledge(value){
        console.log("sel"+value);
    },

    /**
     * 显示题目解析窗口
     */
    showAnalysisModal(){
        this.setState({"subjectAnalysisModalVisible":true});
    },

    /**
     * 题目解析窗口关闭
     */
    subjectAnalysisModalHandleCancel(){
        this.setState({"subjectAnalysisModalVisible":false});
    },

    /**
     * 添加题目的解析内容
     */
    addAnalysisContent(){
        var analysisContent = this.refs.subjectAnalysisContentComponent.getSubjectAnalysisContent();
        console.log(analysisContent);
        this.setState({analysisContent,subjectAnalysisModalVisible:false});
    },

    /**
     * 题目可见性选项改变时的响应函数
     */
    subjectVisibilityOnChange(e){
        this.setState({"subjectVisibility":e.target.value});
    },

    showSelectKnowledgeModal(){
        this.state.tags.splice(0);
        this.setState({"selectKnowledgeModalIsShow":true});
    },

    closeSelectKnowledgeModal(tags){
        // var tags = this.state.tags;
        // newTags.forEach(function (newTag) {
        //     tags.push(newTag);
        // });
        var _this = this;
        console.log("close:"+tags);
        // this.setState({"tags":tags});
        _this.state.tags.splice(0);
        if(isEmpty(tags)==false){
            tags.forEach(function (tag) {
                _this.state.tags.push(tag);
            })
        }
        _this.setState({"selectKnowledgeModalIsShow":false});
    },

    handleClose(removedTag){
        var tags = this.state.tags;
        for (var i = 0; i < tags.length; i++) {
            if (tags[i].key == removedTag.key) {
                tags.splice(i, 1);
            }
        }
        this.setState(tags);
    },

    /**
     * 页面元素的渲染操作
     * @returns {XML}
     */
    render() {
        var buttons = <div>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.saveButtonOnClick}>
                保存并继续添加
            </Button>
            <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.saveButtonOnClick}>
                保存并返回列表
            </Button>
        </div>;
        //插入音频按钮
        var audioButton = <Button className="row-t-f roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'single')}>插入音频</Button>;
        var answerComponent = null;

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
                            <RadioGroup onChange={this.singleAnswerOnChange}
                                        defaultValue={this.state.singleAnswer}>
                                {this.state.singleAnswerOptions}
                            </RadioGroup>
                        </div>
                    </Row>
                </Col>
            </Row>;
            audioButton = <Button className="roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'single')}>插入音频</Button>;
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
                                           defaultValue={this.state.mulitiAnswerDefaultValue}
                                           value={this.state.mulitiAnswerDefaultValue}
                                           onChange={this.mulitiAnswerOnChange}/>
                        </div>
                    </Row>
                </Col>
            </Row>;
            audioButton = <Button className="roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'mulitiSelect')}>插入音频</Button>
        } else if (this.state.subjectType == "J") {
            answerComponent = <Row>
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
            </Row>;
            audioButton = <Button className="roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'correct')}>插入音频</Button>;
        } else if (this.state.subjectType == "S") {
            answerComponent =<Row>
                <Col span={3} className="ant-form-item-label">
                    <span className="font-14">答案：</span>
                </Col>
                <Col span={20}>
                    <div className="ant-form-item-control">
                        <TextboxioComponentForAnswer/>
                    </div>
                </Col>
            </Row>;
            audioButton = <Button className="roe-t-f-left" onClick={this.showVideoUploadModal.bind(this,'simpleAnswer')}>插入音频</Button>;
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
            <div className="toobar right_ri ">
                <Button type="primary" icon="plus-circle" onClick={this.showModal} title="上传题目" className="add_study add_study-b">添加题目</Button>
                <Modal
                    visible={this.state.visible}
                    title="添加题目"
                    width="860px"
                    height="636px"
                    className="ant-modal-width"
                    onCancel={this.handleCancel}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div >
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
                                <SubjectContent ref="subjectContent"/>
                                {/*className="row-t-f roe-t-f-left"*/}
                                <Button className="row-t-f" onClick={this.showAnalysisModal}>题目解析</Button>
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
                                <Button className="ding_modal_top" onClick={this.showSelectKnowledgeModal}>选择知识点</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={3} className="ant-form-item-label row-t-f">
                                <span className="font-14">可见性：</span>
                            </Col>
                            <Col span={20}  className="select_knoledge_top2">
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
                            <Button type="primary" htmlType="submit" className="login-form-button"
                                    onClick={this.uploadFile}>
                                发送
                            </Button>
                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={this.subjectVideoModalHandleCancel}>
                                取消
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
                    visible={this.state.subjectAnalysisModalVisible}
                    title="题目解析"
                    className="modol_width queanswer_modol_width"
                    maskClosable={false} //设置不允许点击蒙层关闭
                    onCancel={this.subjectAnalysisModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                            <Button type="primary" htmlType="submit" className="login-form-button"
                                    onClick={this.addAnalysisContent}>
                                确定
                            </Button>
                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={this.subjectAnalysisModalHandleCancel}>
                                取消
                            </Button>
                        </div>
                    ]}
                >
                    <Row>
                        <Col span={2}>题目解析：</Col>
                        <Col span={22}>
                            <SubjectAnalysisContent analysisContent={this.state.analysisContent} ref="subjectAnalysisContentComponent"></SubjectAnalysisContent>
                        </Col>

                    </Row>
                </Modal>

                <SelectKnowledgeModal isShow={this.state.selectKnowledgeModalIsShow}  initTags={this.state.tags}
                                      closeSelectKnowledgeModal={this.closeSelectKnowledgeModal}></SelectKnowledgeModal>


            </div>
        );
    },
});

export default SubjectUploadComponent;
