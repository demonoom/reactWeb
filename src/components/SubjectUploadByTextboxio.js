import React, {PropTypes} from 'react';
import {Tabs, Button, Radio,Progress} from 'antd';
import {Modal} from 'antd';
import {Input, Select, Row, Col, Checkbox,Slider} from 'antd';
import {message} from 'antd';
import TextboxioComponentForSingle from './textboxioComponents/TextboxioComponentForSingle'
import TextboxioComponentForMulitiSelect from './textboxioComponents/TextboxioComponentForMulitiSelect';
import TextboxioComponentForCorrect from './textboxioComponents/TextboxioComponentForCorrect';
import TextboxioComponentForSimpleAnswer from './textboxioComponents/TextboxioComponentForSimpleAnswer';
import TextboxioComponentForAnswer  from './textboxioComponents/TextboxioComponentForAnswer';
import SubjectVideoUploadComponents from './SubjectVideoUploadComponents';
import {doWebService} from '../WebServiceHelper';
import {isEmpty,AUDIO_SUBJECT_ALLOWED} from "../utils/Const";
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

var mulitiAnswer = new Array('A');
var subjectUpload;
var uploadFileList = [];
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
            singleAnswerOptions:[
                <Radio key="A" value="A">A</Radio>,
                <Radio key="B" value="B">B</Radio>,
                <Radio key="C" value="C">C</Radio>,
                <Radio key="D" value="D">D</Radio>
            ],
            sliderValue:4,
            singleSliderValue:4,
            subjectVideoModalVisible:false,
            uploadPercent:0,
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
            singleSliderValue:4
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
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        var ident = sessionStorage.getItem("ident");
        var score = this.state.score;
        //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
        if (this.state.scoreDisable == true) {
            score =this.refs.scoreDefined.refs.input.value;
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
                "type": "C",
                "alterNativeAnswerCount":this.state.singleAnswerOptions.length
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
            score =this.refs.scoreDefined.refs.input.value;
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
            // score = this.state.scoreDefinedValue;
            score =this.refs.scoreDefined.refs.input.value;
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
            score =this.refs.scoreDefined.refs.input.value;
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
        var _this = this;
        console.log("insertVideo");
        var id = "audioTag"+parseInt(Math.random()*1000);
        var iTagId = "iTag"+parseInt(Math.random()*1000);
        // var attachment = "http://60.205.86.217/upload5/2017-12-04/19/dd68da27-dd1c-4ecd-8677-50d2af9cfc5a.mp3";
        // var newContent ="<span class='adiuo_p_play'><i class='audio_left' onclick='javascript:document.getElementById('\'audioTag\').play()'></i><audio  id='audiotag' style='display: none'  controls='controls' width='200' height='30' src='"+attachment+"'></audio></span>";
        var newContent ='<span class="adiuo_p_play"><i id="'+iTagId+'" class="audio_left" onclick="javascript:var isPaused=document.getElementById(\''+id+'\').paused;if(isPaused){ document.getElementById(\''+id+'\').play();document.getElementById(\''+iTagId+'\').className=\'audio_left_run\'; }else{ document.getElementById(\''+id+'\').pause();document.getElementById(\''+iTagId+'\').className=\'audio_left\'; }"></i><audio onended="javascript:document.getElementById(\''+iTagId+'\').className=\'audio_left\'" id="'+id+'" style="display: none"  controls="controls" width="200" height="30" src="'+attachment+'"></audio></span>';
        switch(this.state.currentSubjectType){
            case "single":
                mytextareaSingleEditor.content.insertHtmlAtCursor(newContent);
                break;
            case "mulitiSelect":
                mytextareaMulitiEditor.content.insertHtmlAtCursor(newContent);
                break;
            case "correct":
                mytextareaCorrectEditor.content.insertHtmlAtCursor(newContent);
                break;
            case "simpleAnswer":
                mytextareaSimpleAnswerEditor.content.insertHtmlAtCursor(newContent);
                break;
        }
    },

    playAudio(){
        console.log("1111");
    },

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
        //插入音频按钮
        var audioButton = <Button className="row-t-f" onClick={this.showVideoUploadModal.bind(this,'single')}>插入音频</Button>;
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
            audioButton = <Button className="row-t-f" onClick={this.showVideoUploadModal.bind(this,'single')}>插入音频</Button>;
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
            audioButton = <Button onClick={this.showVideoUploadModal.bind(this,'mulitiSelect')}>插入音频</Button>
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
            audioButton = <Button onClick={this.showVideoUploadModal.bind(this,'correct')}>插入音频</Button>;
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
            audioButton = <Button onClick={this.showVideoUploadModal.bind(this,'simpleAnswer')}>插入音频</Button>;
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
                                    {audioButton}
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
                                            <Slider min={4} max={8} defaultValue={this.state.singleSliderValue} value={this.state.singleSliderValue} onChange={this.singleSliderChange} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <div className="ant-form-item-control">
                                            <RadioGroup onChange={this.singleAnswerOnChange} ref="singleAnswer"
                                                        defaultValue={this.state.singleAnswer}>
                                                {this.state.singleAnswerOptions}
                                            </RadioGroup>
                                        </div>
                                    </Row>
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
                                        {audioButton}
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
                                        {audioButton}
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
                                        {audioButton}
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

            </div>
        );
    },
});

export default SubjectUploadTabComponents;
