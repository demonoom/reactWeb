import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { Upload,  message } from 'antd';
import CkEditorWithWordPasterComponents from  './CkEditorWithWordPasterComponents';
import CkEditorWithWordPasterComponents1 from  './CkEditorWithWordPasterComponents1';
import RichEditorComponents from  './RichEditorComponents';
import FileUploadComponents from './FileUploadComponents';
import RichEditorComponentsForMuliti from './RichEditorComponentsForMuliti';
import RichEditorComponentsForCorrect from './RichEditorComponentsForCorrect';
import RichEditorComponentsForSimpleAnswer from './RichEditorComponentsForSimpleAnswer';
import { doWebService } from '../WebServiceHelper';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const plainOptions = ['A', 'B', 'C','D','E'];


const TabPane = Tabs.TabPane;

/*滑动输入框数据范围定义*/
const marks = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: {
        style: {
            color: 'red',
        },
        label: <strong></strong>,
    },
};

const props = {
    name: 'file',
    showUploadList: true,
    // action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
    action: 'http://www.maaee.com/Excoord_Upload_Server/file/upload',
    beforeUpload(file) {
        //alert(file);
        data:{file}
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};
var mulitiAnswer = new Array();
// var data=new Array();
var uploadFileList=[];
var subjectUpload;
const SubjectUploadTabComponents = Form.create()(React.createClass({
    getInitialState() {
        subjectUpload = this;
        return {
            loading: false,
            visible: false,
            activeKey: '单选题',
            markSelected:6,
            score:1,
            subjectName:'',
            singleAnswer:'A',
            scoreChecked:false,
            scoreInputState:true,
            scoreDisable:false,
            mulitiAnswerDefaultValue:['A'],
            correctAnswerValue:"正确",
            useSameScheduleForSingle:false,
            useSameScheduleForMSelect:false,
            useSameScheduleForCorrect:false,
            useSameScheduleForSimpleAnswer:false,
        };
    },
    showModal() {
        subjectUpload.setState({
            visible: true,
        });
    },
    handleOk() {
        subjectUpload.setState({ visible: false });
    },
    handleCancel() {
        subjectUpload.setState({ visible: false });
    },

    handleEmail: function(val){
        subjectUpload.props.callbackParent(val);
        //subjectUpload.setState({lessonCount: val});
    },

    sliderOnChange(value) {
        console.log("sliderValue:"+value)
        subjectUpload.setState({
            markSelected: value,
        });
    },

    selectHandleChange:function (value) {
        console.log(`selected ${value}`);
        subjectUpload.setState({score:value});
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
        subjectUpload.setState({score:1});
        if(!subjectUpload.isEmpty(UE.getEditor("container"))){
            UE.getEditor("container").setContent("");
        }
        if(!subjectUpload.isEmpty(UE.getEditor("mulitiContainer"))){
            UE.getEditor("mulitiContainer").setContent("");
        }
        if(!subjectUpload.isEmpty(UE.getEditor("correctContainer"))){
            UE.getEditor("correctContainer").setContent("");
        }
        if(!subjectUpload.isEmpty(UE.getEditor("simpleAnswerContainer"))){
            UE.getEditor("simpleAnswerContainer").setContent("");
        }
        if(!subjectUpload.isEmpty(subjectUpload.refs.singleAnswer)){
            subjectUpload.refs.singleAnswer.state.value="A";
        }
        if(!subjectUpload.isEmpty(subjectUpload.refs.scoreDefined)){
            subjectUpload.refs.scoreDefined.refs.input.value="";
        }
        if(!subjectUpload.isEmpty(subjectUpload.refs.simpleAnswerInput)){
            subjectUpload.refs.simpleAnswerInput.refs.input.value="";
        }
        subjectUpload.setState({scoreChecked:false,scoreInputState:true,scoreDisable:false,mulitiAnswerDefaultValue:['A'],correctAnswerValue:"正确"});
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
                        subjectUpload.getOrCreateTeachSchedule(userId,knowledgeName,subjectsIds);
                    }else{
                        alert("题目添加成功");
                    }
                }else{
                    alert("题目添加失败");
                }
            },
            onError : function(error) {
                alert(error);
            }
        });
    },

    /**
     * 根据tilte获取教学进度，如果没有会创建一个新的
     * @param userId   用户id
     * @param materiaIds 课件id
     * @param scheduleId 我的备课id
     */
    getOrCreateTeachSchedule(userId,title,subjectsIds){
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
                alert(error);
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
                    alert("题目添加成功");
                }
            },
            onError : function(error) {
                alert(error);
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
        // data=[];
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        // alert(currentButton);
        subjectUpload.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = subjectUpload.state.markSelected;
            var score = subjectUpload.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(subjectUpload.state.scoreDisable==true){
                score =subjectUpload.refs.scoreDefined.refs.input.value;
            }
            var subjectName = UE.getEditor("container").getContent();
            console.log("richContent:"+subjectName);
            // var subjectName = values.subjectName;
            var answer = subjectUpload.state.singleAnswer;
            // alert("params:"+subjectUpload.props.params);
            var subjectParamArray = subjectUpload.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var knowledgeName = subjectParamArray[4];
            var isLinkToSchedule=subjectUpload.state.useSameScheduleForSingle;
            alert("knowledgeName:"+knowledgeName+"\t"+isLinkToSchedule);
            //完成基础的非空验证
            if(subjectUpload.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(subjectUpload.isEmpty(answer)){
                alert("请输入答案");
            }else if(subjectUpload.isEmpty(score) || score==0){
                alert("请选择分值");
            }else{
                var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"C"};
                if(optType=="bySubjectId"){
                    batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
                }
                //完成题目的新增操作
                subjectUpload.saveSubject(batchAddSubjectBeanJson,knowledgeName,isLinkToSchedule);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    subjectUpload.setState({ visible: false,score:1});
                }
                //重新初始化页面
                subjectUpload.initPage();
            }
        });
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
        subjectUpload.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var score = subjectUpload.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(subjectUpload.state.scoreDisable==true){
                score =subjectUpload.refs.scoreDefined.refs.input.value;
            }
            var subjectName = UE.getEditor("mulitiContainer").getContent();
            var answer = mulitiAnswer;
            var subjectParamArray = subjectUpload.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":mulitiAnswer,"score":score,"userId":ident,"type":"MC"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(subjectUpload.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(subjectUpload.isEmpty(answer)){
                alert("请输入答案");
            }else if(subjectUpload.isEmpty(score) || score==0){
                alert("请选择分值");
            }else{
                subjectUpload.saveSubject(batchAddSubjectBeanJson);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    subjectUpload.setState({ visible: false,score:1});
                }
            }
            //重新初始化页面
            subjectUpload.initPage();
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
        subjectUpload.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = subjectUpload.state.markSelected;
            var score = subjectUpload.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(subjectUpload.state.scoreDisable==true){
                score =subjectUpload.refs.scoreDefined.refs.input.value;
            }
            var subjectName = UE.getEditor("correctContainer").getContent();
            var answer = subjectUpload.state.correctAnswerValue;
            var subjectParamArray = subjectUpload.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"J"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(subjectUpload.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(subjectUpload.isEmpty(answer)){
                alert("请输入答案");
            }else if(subjectUpload.isEmpty(score) || score==0){
                alert("请选择分值");
            }else {
                subjectUpload.saveSubject(batchAddSubjectBeanJson);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    subjectUpload.setState({ visible: false,score:1});
                }
            }
            //重新初始化页面
            subjectUpload.initPage();
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
        subjectUpload.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = subjectUpload.state.markSelected;
            var score = subjectUpload.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(subjectUpload.state.scoreDisable==true){
                score =subjectUpload.refs.scoreDefined.refs.input.value;
            }
            var subjectName = UE.getEditor("simpleAnswerContainer").getContent();
            var answer = subjectUpload.refs.simpleAnswerInput.refs.input.value;
            var subjectParamArray = subjectUpload.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"S"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(subjectUpload.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(subjectUpload.isEmpty(answer)){
                alert("请输入答案");
            }else if(subjectUpload.isEmpty(score) || score==0){
                alert("请选择分值");
            }else {
                subjectUpload.saveSubject(batchAddSubjectBeanJson);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    subjectUpload.setState({ visible: false,score:1});
                }
            }
            //重新初始化页面
            subjectUpload.initPage();
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
        var score = subjectUpload.state.score;
        var newScore = parseInt(score)+parseFloat(0.5);
        console.log("newScore:"+newScore)
        subjectUpload.setState({score:newScore});
    },

    mulitiAnswerOnChange:function (checkedValues) {
        mulitiAnswer=checkedValues;
        subjectUpload.setState({mulitiAnswerDefaultValue:checkedValues});
    },

    scoreSelectTypeOnChange(e){
        var checkStatus = e.target.checked;
        if(checkStatus==true){
            subjectUpload.setState({scoreInputState:false,scoreChecked:!subjectUpload.state.scoreChecked,scoreDisable:true,score:1});
        }else{
            subjectUpload.setState({scoreDisable:false,scoreInputState:true});
        }
        subjectUpload.setState({scoreChecked:!subjectUpload.state.scoreChecked});
    },

    correctAnswerOnChange(e){
        subjectUpload.setState({correctAnswerValue:e.target.value});
    },

    singleAnswerOnChange(e){
        subjectUpload.setState({singleAnswer:e.target.value});
    },

    handleFileSubmit(fileList){
        // alert("已上传文件："+fileList.length);
        for(var i=0;i<fileList.length;i++){
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj[0]);
        }
    },

    //点击保存按钮，文件上传
    uploadFile(){
        if(uploadFileList.length==0){
            alert("请选择上传的文件,谢谢！");
        }else{
            var formData = new FormData();
            formData.append("file",uploadFileList[0]);
            formData.append("name",uploadFileList[0].name);
            $.ajax({
                type: "POST",
                url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
                // url:"http://192.168.1.115:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData : false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType : false,
                success: function (responseStr) {
                    if(responseStr!=""){
                        var fileUrl=responseStr;
                        subjectUpload.addNormalMaterial(fileUrl,uploadFileList[0].name);
                        subjectUpload.setState({ visible: false });
                    }
                },
                error : function(responseStr) {
                    console.log("error"+responseStr);
                }
            });
        }
    },

    //材料题新增
    materialHandleSubmit(e) {
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
        subjectUpload.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var score = subjectUpload.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(subjectUpload.state.scoreDisable==true){
                score =subjectUpload.refs.scoreDefined.refs.input.value;
            }
            var subjectName = UE.getEditor("container").getContent();
            var answer = subjectUpload.state.singleAnswer;
            var subjectParamArray = subjectUpload.props.params.split("#");
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"S"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(subjectUpload.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(subjectUpload.isEmpty(answer)){
                alert("请输入答案");
            }else if(subjectUpload.isEmpty(score) || score==0){
                alert("请选择分值");
            }else {
                //subjectUpload.saveSubject(batchAddSubjectBeanJson);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    subjectUpload.setState({ visible: false,score:1});
                }
            }
            //重新初始化页面
            subjectUpload.initPage();
        });
    },

    tabOnChange(key) {
        // alert(key);
        // subjectUpload.initPage();
        subjectUpload.setState({activeKey: key});
    },

    //useSameSchedule
    checkBoxOnChangeForSingle(e) {
        console.log(`checked = ${e.target.checked}`);
        subjectUpload.setState({useSameScheduleForSingle: e.target.checked});
    },

    checkBoxOnChangeForMSelect(e) {
        console.log(`checked = ${e.target.checked}`);
        subjectUpload.setState({useSameScheduleForMSelect: e.target.checked});
    },

    checkBoxOnChangeForCorrect(e) {
        console.log(`checked = ${e.target.checked}`);
        subjectUpload.setState({useSameScheduleForCorrect: e.target.checked});
    },

    checkBoxOnChangeForSimpleAnswer(e) {
        console.log(`checked = ${e.target.checked}`);
        subjectUpload.setState({useSameScheduleForSimpleAnswer: e.target.checked});
    },

    render() {
        const { getFieldDecorator } = subjectUpload.props.form;
        const formItemLayout = {
            labelCol: { span: 4},
            wrapperCol: { span: 17 },
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
        scoreItem.push(<FormItem
            {...formItemLayout}
            label={(<span>分值</span>)}
            hasFeedback>
            {getFieldDecorator('score')(
                <div>
                    <Row>
                        <Col span={6}>
                            {/*value={subjectUpload.state.score}*/}
                            <Select  ref="scoreSelect" style={{ width: 100 }} disabled={subjectUpload.state.scoreDisable} onChange={subjectUpload.selectHandleChange}>
                                {children}
                            </Select>
                        </Col>
                        <Col span={8} className="right_ri"><span><Input ref="scoreDefined" placeholder="请输入自定义分值" disabled={subjectUpload.state.scoreInputState}  /></span></Col>
                        <Col span={6} className="right_ri"><Checkbox onChange={subjectUpload.scoreSelectTypeOnChange} ref="scoreCheckBox" checked={subjectUpload.state.scoreChecked} value="defined">自定义:</Checkbox></Col>
                    </Row>
                </div>
            )}
        </FormItem>);

        var currentActiveKey = subjectUpload.state.activeKey;
        var buttons =<div>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectUpload.singleHandleSubmit}>
                保存并继续添加
            </Button>
            <Button type="ghost" htmlType="submit" className="login-form-button" onClick={subjectUpload.singleHandleSubmit} >
                保存并返回列表
            </Button>
        </div>;
        if(currentActiveKey=="单选题"){
            buttons =<div>
                <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectUpload.singleHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={subjectUpload.singleHandleSubmit} >
                    保存并返回列表
                </Button>
            </div>;
        }else if(currentActiveKey=="多选题"){
            buttons =<div>
                <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectUpload.MulitiHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={subjectUpload.MulitiHandleSubmit} >
                    保存并返回列表
                </Button>
            </div>;
        }else if(currentActiveKey=="判断题"){
            buttons =<div>
                <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectUpload.correctHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={subjectUpload.correctHandleSubmit} >
                    保存并返回列表
                </Button>
            </div>;
        }else if(currentActiveKey=="简答题"){
            buttons =<div>
                <Button type="primary" htmlType="submit" className="login-form-button" onClick={subjectUpload.simpleAnswerHandleSubmit}>
                    保存并继续添加
                </Button>
                <Button type="ghost" htmlType="submit" className="login-form-button" onClick={subjectUpload.simpleAnswerHandleSubmit} >
                    保存并返回列表
                </Button>
            </div>;
        }

        return (
            <div className="toobar right_ri">
                <Button  type="primary" icon="plus" onClick={subjectUpload.showModal} title="上传题目" className="add_study">添加题目</Button>
                <Modal
                    visible={subjectUpload.state.visible}
                    title="添加题目"
                    width="920px"
                    className="ant-modal-width"
                    onCancel={subjectUpload.handleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                            {buttons}
                        </div>
                    ]}
                >
                    <Tabs
                        hideAdd
                        onChange={subjectUpload.tabOnChange}
                        defaultActiveKey={subjectUpload.state.activeKey}
                        onEdit={subjectUpload.onEdit}
                    >
                        <TabPane tab="单选题" key="单选题">
                            <Form horizontal className="ant-form-fo">
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectName')(
                                        <RichEditorComponents/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('answer')(
                                        <div>
                                            <RadioGroup onChange={subjectUpload.singleAnswerOnChange} ref="singleAnswer" defaultValue={subjectUpload.state.singleAnswer}>
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
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>引用</span>)}
                                    hasFeedback>
                                    { <Checkbox onChange={subjectUpload.checkBoxOnChangeForSingle}>同时引用到同名教学进度下</Checkbox>}
                                </FormItem>
                            </Form>
                        </TabPane>


                        <TabPane tab="多选题" key="多选题"><div>
                            <Form horizontal className="ant-form-fo">
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectNameM')(
                                        <RichEditorComponentsForMuliti/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('mulitiAnswer')(
                                        <div>
                                            <CheckboxGroup options={mulitiAnswerOptions} defaultValue={subjectUpload.state.mulitiAnswerDefaultValue} value={subjectUpload.state.mulitiAnswerDefaultValue} onChange={subjectUpload.mulitiAnswerOnChange} />
                                        </div>
                                    )}
                                </FormItem>
                                {scoreItem}
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>引用</span>)}
                                    hasFeedback>
                                    { <Checkbox onChange={subjectUpload.checkBoxOnChangeForMSelect}>同时引用到同名教学进度下</Checkbox>}
                                </FormItem>
                            </Form>
                        </div></TabPane>

                        <TabPane tab="判断题" key="判断题"><div>
                            <Form horizontal className="ant-form-fo">
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectNameM')(
                                        <RichEditorComponentsForCorrect/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('correctAnswer')(
                                        <div>
                                            <RadioGroup onChange={subjectUpload.correctAnswerOnChange} defaultValue={subjectUpload.state.correctAnswerValue} value={subjectUpload.state.correctAnswerValue}>
                                                <Radio key="正确" value="正确">正确</Radio>
                                                <Radio key="错误" value="错误">错误</Radio>
                                            </RadioGroup>
                                        </div>
                                    )}
                                </FormItem>
                                {scoreItem}
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>引用</span>)}
                                    hasFeedback>
                                    { <Checkbox onChange={subjectUpload.checkBoxOnChangeForCorrect}>同时引用到同名教学进度下</Checkbox>}
                                </FormItem>
                            </Form>
                        </div></TabPane>

                        <TabPane tab="简答题" key="简答题"><div>
                            <Form horizontal className="ant-form-fo">
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectNameM')(
                                        <RichEditorComponentsForSimpleAnswer/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('answer')(
                                        <div>
                                            <Input type="textarea" ref="simpleAnswerInput"  defaultValue={subjectUpload.state.simpleAnswerValue}  rows={4}  />
                                        </div>
                                    )}
                                </FormItem>
                                {scoreItem}
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>引用</span>)}
                                    hasFeedback>
                                    { <Checkbox onChange={subjectUpload.checkBoxOnChangeForSimpleAnswer}>同时引用到同名教学进度下</Checkbox>}
                                </FormItem>
                            </Form>
                        </div></TabPane>
                    </Tabs>
                </Modal>
            </div>
        );
    },
}));

export default SubjectUploadTabComponents;
