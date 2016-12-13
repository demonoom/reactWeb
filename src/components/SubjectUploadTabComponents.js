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
var data=[];
var uploadFileList=[];
const SubjectUploadTabComponents = Form.create()(React.createClass({
    getInitialState() {
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
    handleCancel() {
        this.setState({ visible: false });
    },

    handleEmail: function(val){
        this.props.callbackParent(val);
        //this.setState({lessonCount: val});
    },

    sliderOnChange(value) {
        console.log("sliderValue:"+value)
        this.setState({
            markSelected: value,
        });
    },

    selectHandleChange:function (value) {
        console.log(`selected ${value}`);
        this.setState({score:value});
    },

    saveSubject(batchAddSubjectBeanJson){
        var param = {
            "method":'batchAddSubjects',
            "batchAddSubjectBeanJson":[batchAddSubjectBeanJson],
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.response==true){
                    alert("题目添加成功");
                }else{
                    alert("题目添加失败");
                }
            },
            onError : function(error) {
                alert(error);
            }
        });
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
        this.setState({score:1});
        if(!this.isEmpty(this.refs.subjectNameInput)){
            this.refs.subjectNameInput.refs.input.value="";
        }
        if(!this.isEmpty(this.refs.singleAnswer)){
            this.refs.singleAnswer.state.value="A";
        }
        if(!this.isEmpty(this.refs.scoreDefined)){
            this.refs.scoreDefined.refs.input.value="";
        }
        if(!this.isEmpty(this.refs.simpleAnswerInput)){
            this.refs.simpleAnswerInput.refs.input.value="";
        }
        this.setState({scoreChecked:false,scoreInputState:true,scoreDisable:false,mulitiAnswerDefaultValue:['A'],correctAnswerValue:"正确"});
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
        data=[];
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        // alert(currentButton);
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = this.state.markSelected;
            var score = this.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(this.state.scoreDisable==true){
                score =this.refs.scoreDefined.refs.input.value;
            }
            var subjectName = values.subjectName;
            var answer = this.state.singleAnswer;
            // alert("params:"+this.props.params);
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            //完成基础的非空验证
            if(this.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(this.isEmpty(answer)){
                alert("请输入答案");
            }else if(this.isEmpty(score) || score==0){
                alert("请选择分值");
            }else{
                var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"C"};
                if(optType=="bySubjectId"){
                    batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
                }
                //完成题目的新增操作
                this.saveSubject(batchAddSubjectBeanJson);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    this.setState({ visible: false,score:1});
                }
                //重新初始化页面
                this.initPage();
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
        data=[];
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var score = this.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(this.state.scoreDisable==true){
                score =this.refs.scoreDefined.refs.input.value;
            }
            var subjectName = values.subjectName;
            var answer = mulitiAnswer;
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":mulitiAnswer,"score":score,"userId":ident,"type":"MC"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(this.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(this.isEmpty(answer)){
                alert("请输入答案");
            }else if(this.isEmpty(score) || score==0){
                alert("请选择分值");
            }else{
                this.saveSubject(batchAddSubjectBeanJson);
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
        data=[];
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = this.state.markSelected;
            var score = this.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(this.state.scoreDisable==true){
                score =this.refs.scoreDefined.refs.input.value;
            }
            var subjectName = values.subjectName;
            var answer = this.state.correctAnswerValue;
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"J"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(this.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(this.isEmpty(answer)){
                alert("请输入答案");
            }else if(this.isEmpty(score) || score==0){
                alert("请选择分值");
            }else {
                this.saveSubject(batchAddSubjectBeanJson);
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
        data=[];
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = this.state.markSelected;
            var score = this.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(this.state.scoreDisable==true){
                score =this.refs.scoreDefined.refs.input.value;
            }
            var subjectName = values.subjectName;
            var answer = this.refs.simpleAnswerInput.refs.input.value;
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"S"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(this.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(this.isEmpty(answer)){
                alert("请输入答案");
            }else if(this.isEmpty(score) || score==0){
                alert("请选择分值");
            }else {
                this.saveSubject(batchAddSubjectBeanJson);
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
                        this.addNormalMaterial(fileUrl,uploadFileList[0].name);
                        this.setState({ visible: false });
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
        data=[];
        //获取当前点击的是哪个按钮
        var currentButton = target.textContent;
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var score = this.state.score;
            //如果选择分数的下拉列表处于不可用状态，则选择文本框中的自定义分值作为成绩
            if(this.state.scoreDisable==true){
                score =this.refs.scoreDefined.refs.input.value;
            }
            var subjectName = values.subjectName;
            var answer = this.state.singleAnswer;
            var subjectParamArray = this.props.params.split("#");
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"S"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            //完成基础的非空验证
            if(this.isEmpty(subjectName)){
                alert("请输入题目");
            }else if(this.isEmpty(answer)){
                alert("请输入答案");
            }else if(this.isEmpty(score) || score==0){
                alert("请选择分值");
            }else {
                //this.saveSubject(batchAddSubjectBeanJson);
                if(currentButton=="保存并返回列表"){
                    //关闭并返回题目列表页面
                    this.setState({ visible: false,score:1});
                }
            }
            //重新初始化页面
            this.initPage();
        });
    },

    tabOnChange(key) {
        // alert(key);
        this.setState({activeKey: key});
    },

    render() {
        const { getFieldDecorator } = this.props.form;
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

        const subjectItem=[];
        subjectItem.push(<FormItem
            {...formItemLayout}
            label={(<span>题目</span>)}
            hasFeedback>
            {getFieldDecorator('subjectName', {
                rules: [{ required: true, message: '请输入题目!' }],
            })(
                <div>
                   {/* <Input type="textarea" ref="subjectNameInput" defaultValue={this.state.subjectName} rows={4}/>*/}
                    {/*<CkEditorWithWordPasterComponents key="ckeditor"/>*/}
                    <CkEditorWithWordPasterComponents1></CkEditorWithWordPasterComponents1>
                   {/* <RichEditorComponents></RichEditorComponents>*/}
                </div>
            )}
        </FormItem>);

        const scoreItem=[];
        scoreItem.push(<FormItem
            {...formItemLayout}
            label={(<span>分值</span>)}
            hasFeedback>
            {getFieldDecorator('score')(
                <div>
                    <Row>
                        <Col span={6}>
                            {/*value={this.state.score}*/}
                            <Select  ref="scoreSelect" style={{ width: 100 }} disabled={this.state.scoreDisable} onChange={this.selectHandleChange}>
                                {children}
                            </Select>
                        </Col>
						<Col span={8} className="right_ri"><span><Input ref="scoreDefined" placeholder="请输入自定义分值" disabled={this.state.scoreInputState}  /></span></Col>
                        <Col span={6} className="right_ri"><Checkbox onChange={this.scoreSelectTypeOnChange} ref="scoreCheckBox" checked={this.state.scoreChecked} value="defined">自定义:</Checkbox></Col>
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
                <Button  type="primary" icon="plus" onClick={this.showModal} title="上传题目" className="add_study">添加题目</Button>
                <Modal
                    visible={this.state.visible}
                    title="添加题目"
					width="620px"
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
                                {subjectItem}
                                <FormItem
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
                                {subjectItem}
                                <FormItem
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
                                {subjectItem}
                                <FormItem
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
                                {subjectItem}
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('answer', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <div>
                                            <Input type="textarea" ref="simpleAnswerInput"  defaultValue={this.state.simpleAnswerValue}  rows={4}  />
                                        </div>
                                    )}
                                </FormItem>
                                {scoreItem}
                            </Form>
                        </div></TabPane>

                        {/*<TabPane tab="材料题" key="材料题"><div>
                            <Form horizontal>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>材料文件</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('materialFile', {
                                        rules: [{ required: true, message: '请上传材料!' }],
                                    })(
                                        <div>
                                            <FileUploadComponents callBackParent={this.handleFileSubmit}/>
                                        </div>
                                    )}
                                </FormItem>
                                {subjectItem}
                                <FormItem
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
                                <FormItem className="ant-modal-footer">
                                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.materialHandleSubmit}>
                                        保存并继续添加
                                    </Button>
                                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.materialHandleSubmit}>
                                        保存并返回列表
                                    </Button>
                                </FormItem>
                            </Form>
                        </div></TabPane>*/}
                    </Tabs>
                </Modal>
            </div>
        );
    },
}));

export default SubjectUploadTabComponents;
