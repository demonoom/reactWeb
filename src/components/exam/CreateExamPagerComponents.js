import React, { PropTypes } from 'react';
import { Modal, Button,message } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox,Table,Popover,Spin } from 'antd';
import { DatePicker } from 'antd';
import { Card } from 'antd';
import { Radio } from 'antd';
import { doWebService } from '../../WebServiceHelper';
import FileUploadComponents from './FileUploadComponents';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

var createExamPager;
var plainOptions = [];
var sids = "";
var clazzIds = "";
var dateTime = "";
//答题卡数组，用来存放动态生成的答题卡Card对象
const selectAnswerOptions = [
    {label: 'A', value: 'A'},
    {label: 'B', value: 'B'},
    {label: 'C', value: 'C'},
    {label: 'D', value: 'D'},
    {label: 'E', value: 'E'},
    {label: 'F', value: 'F'},
];
//答题卡
var cardChild;
var cardChildTagArray=[];
//答题卡数组
var cardChildArray=[];
var uploadFileList=[];
const CreateExamPagerComponents = React.createClass({
    getInitialState() {
        createExamPager = this;
        sids = "";
        clazzIds = "";
        dateTime = "";
        return {
            visible: false,
            optType: 'add',
            editSchuldeId: createExamPager.props.editSchuldeId,
            checkedList: [],
            indeterminate: true,
            subjectTypeValue: 'selectAnswer',       //答题卡的题目类型，默认为选择题
            answerTitle:'选择题',      //默认的答题卡题目
            answerCount:2,      //每个答题卡上默认生成的题目数量，默认2个题目
            answerScore:2,      //每题的分值，默认2分
            cardList:[],        //答题卡中选择题的选项数组
            cardChildTagArray:[],       //答题卡标签的数组
            correctAnswerValue:'right',     //判断题的答案
            examPagerModalVisible:false,        //上传试卷图片的Modal窗口的状态
            spinLoading:false,      //上传试卷图片过程中的加载动画
            examPagerUrl:'',        //试卷图片的上传地址
            examPagerTitle:'',      //试卷标题
        };
    },

    createExamPager(ident, sids, clazzIds, dateTime){
        var param = {
            "method": 'publishHomeworkSubject',
            "ident": ident,
            "sids": sids,
            "clazzIds": clazzIds,
            "dateTime": dateTime
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    // alert("作业布置成功");
                    message.success("作业布置成功");
                } else {
                    // alert("作业布置失败");
                    message.error("作业布置失败");
                }
                createExamPager.props.callbackParent();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 完成组卷保存操作
     * @param e
     */
    handleSubmit(e) {
        e.preventDefault();
        //创建者id
        var ident = sessionStorage.getItem("ident");
        //试卷标题
        var examPagerTitle = createExamPager.state.examPagerTitle;
        //上传文件的附件url
        var examPagerUrl = createExamPager.state.examPagerUrl;
        if (createExamPager.isEmpty(dateTime)) {
            // alert("请选择日期");
            message.warning("请选择日期");
        } else if (createExamPager.isEmpty(clazzIds)) {
            // alert("请选择班级");
            message.warning("请选择班级");
        } else if (createExamPager.isEmpty(sids)) {
            // alert("请选择题目");
            message.warning("请选择题目");
        } else {
            createExamPager.createExamPager(ident, sids, clazzIds, dateTime);
            //保存之后，将已选题目列表清空
            plainOptions = [];
        }
    },

    isEmpty(content){
        if (content == null || content == "null" || content == "" || typeof(content) == "undefined") {
            return true;
        } else {
            return false;
        }
    },

    handleCancel(e) {
        // 保存之后，将已选题目列表清空
        plainOptions = [];
        createExamPager.props.callbackParent();
    },

    /**
     * 页面组件加载完成的回调函数
     */
    componentDidMount(){
    },

    //设置答题卡时的题型单选事件响应函数
    subjectTypeOnChange(e){
        console.log('radio checked', e.target.value);
        createExamPager.setState({
            subjectTypeValue: e.target.value,
        });
    },
    /**
     设置答题卡中的答题卡标题内容改变事件响应函数
     */
    answerTitleOnChange(e){
        createExamPager.setState({ answerTitle: e.target.value });
    },
    /**
     * 设置答题卡中的题目的数量文本框内容改变事件的响应函数
     * @param e
     */
    answerCountOnChange(e){
        createExamPager.setState({ answerCount: e.target.value });
    },
    /**
     * 设置答题卡中的题目的数量文本框内容改变事件的响应函数
     * @param e
     */
    answerScoreOnChange(e){
        createExamPager.setState({ answerScore: e.target.value });
    },
    /**
     * 判断当前要添加的答题卡的标题是否已经存在
     * @param answerTitle
     */
    checkCardTitleIsExist(answerTitle,answerSubjectType){
        var isExist = false;
        var answerTitleInCardChildJson;
        cardChildArray.map(function(item,i){
            answerTitleInCardChildJson = item;
            if(answerTitleInCardChildJson.answerTitle == answerTitle && answerTitleInCardChildJson.answerSubjectType == answerSubjectType){
                isExist = true;
                return;
            }
        },createExamPager)
        //如果答题卡的标题已经存在，则返回包含当前标题的json对象，否则返回false
        if(isExist==true){
            return answerTitleInCardChildJson;
        }else{
            return false;
        }
    },

    /**
     * 答题卡中的题目答案选中事件响应函数
     * @param checkedValues
     */
    answerInCardOnChange(e) {
        console.log('checked = ', e.target.value+","+e.target.key);
    },

    /**
     * 删除选中的题目
     * 注意编号要重新生成
     */
    deleteSubjectContentDiv(e){
        var selectedSubject = e.target.value;
        alert("selectedKey:"+selectedSubject);
        var deleteInfoArray = selectedSubject.split("#");
        var deleteAnswerTitle = deleteInfoArray[0];
        var deleteSubjectNum = parseInt(deleteInfoArray[1]);
        confirm({
            title: '确定要删除该题目?',
            content: '',
            onOk() {
                for(var i=0;i<createExamPager.state.cardChildTagArray.length;i++){
                    var cardChildJson = cardChildArray[i];
                    var cartTitleInJson = cardChildJson.answerTitle;
                    if(deleteAnswerTitle == cartTitleInJson){
                        //已经找到对应的答题卡，接下来需要在答题卡的题目数组中再找出对应的题目编号
                        var cardSubjectAnswerArray = cardChildJson.cardSubjectAnswerArray;
                        for(var j = 0;j<cardSubjectAnswerArray.length;j++){
                            var cardSubjectJson = cardSubjectAnswerArray[j];
                            if(cardSubjectJson.index == deleteSubjectNum){
                                cardSubjectJson.divContent="";
                                cardSubjectAnswerArray.splice(deleteSubjectNum-1,1);
                                createExamPager.refreshSubjectIndexNo(deleteSubjectNum,deleteAnswerTitle);
                                cardChildJson.answerCount = cardChildJson.answerCount-1;
                                message.success("题目删除成功");
                                break;
                            }
                        }
                    }
                }
                createExamPager.buildCardChildArray();
            },
            onCancel() {},
        });
    },

    /**
     * 刷新题目的编号
     */
    refreshSubjectIndexNo(startNo,answerTitle){
        for(var i=0;i<createExamPager.state.cardChildTagArray.length;i++){
            var cardChildJson = cardChildArray[i];
            var cartTitleInJson = cardChildJson.answerTitle;
            if(answerTitle == cartTitleInJson){
                //已经找到对应的答题卡，接下来需要在答题卡的题目数组中再找出对应的题目编号
                var cardSubjectAnswerArray = cardChildJson.cardSubjectAnswerArray;
                for(var j = 1;j<cardSubjectAnswerArray.length+1;j++){
                    var cardSubjectJson = cardSubjectAnswerArray[j-1];
                    if(cardSubjectJson.index > startNo){
                        cardSubjectJson.index = cardSubjectJson.index-1;
                        var subjectDiv = createExamPager.buildChoiceSubjectDivContent(cardSubjectJson.index,answerTitle);
                        var subjectDivJson = {"index":cardSubjectJson.index,"divContent":subjectDiv};
                    }else{
                        var subjectDiv = createExamPager.buildChoiceSubjectDivContent(j,answerTitle);
                        var subjectDivJson = {"index":j,"divContent":subjectDiv};
                    }
                    cardSubjectAnswerArray[j-1] = subjectDivJson;
                }
            }
        }
    },

    /**
     * 删除答题卡时的响应函数
     */
    deleteAnswerCard(e){
        var deleteCardInfo = e.target.value;
        var infoArray = deleteCardInfo.split("#");
        var deleteCardTitle = infoArray[0];
        var deleteSubjectType = infoArray[1];
        alert("删除选定答题卡"+deleteCardTitle+","+deleteSubjectType);
        confirm({
            title: '确定要删除该答题卡?',
            content: '',
            onOk() {
                for(var i=0;i<cardChildArray.length;i++){
                    var cardChildJson = cardChildArray[i];
                    var cartTitleInJson = cardChildJson.answerTitle;
                    var cartSubjectTypeInJson = cardChildJson.answerSubjectType;
                    if(deleteCardTitle == cartTitleInJson && cartSubjectTypeInJson==deleteSubjectType){
                        cardChildArray.splice(i,1);
                        break;
                    }
                }
                createExamPager.buildCardChildArray();
            },
            onCancel() {},
        });
    },

    /**
     * 删除全部答题卡时的响应函数，对应清除全部按钮
     */
    deleteAllCardChild(){
        confirm({
            title: '确定要清除全部答题卡?',
            content: '',
            onOk() {
                cardChildArray.splice(0,cardChildArray.length);
                createExamPager.buildCardChildArray();
            },
            onCancel() {},
        });
    },

    /**
     * 答题卡中的题目分值改变时的响应函数
     */
    subjectScoreOnChange(e){
        alert("subjectScoreOnChange"+e.target.id);
    },
    /**
     * 填空题文本域响应函数
     * @param e
     */
    blankOnChange(e){
        console.log("blankOnChange:"+e.target.value);
    },

    /**
     * 创建答题卡中选择题的题目div
     */
    buildChoiceSubjectDivContent(num,answerTitle){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <Checkbox value={answerTitle+"#"+num+"#checkbox#A"}  onChange={createExamPager.answerInCardOnChange} >A</Checkbox>
                    <Checkbox value={answerTitle+"#"+num+"#checkbox#B"}  onChange={createExamPager.answerInCardOnChange} >B</Checkbox>
                    <Checkbox value={answerTitle+"#"+num+"#checkbox#C"}  onChange={createExamPager.answerInCardOnChange} >C</Checkbox>
                    <Checkbox value={answerTitle+"#"+num+"#checkbox#D"}  onChange={createExamPager.answerInCardOnChange} >D</Checkbox>
                    <Checkbox value={answerTitle+"#"+num+"#checkbox#E"}  onChange={createExamPager.answerInCardOnChange} >E</Checkbox>
                    <Checkbox value={answerTitle+"#"+num+"#checkbox#F"}  onChange={createExamPager.answerInCardOnChange} >F</Checkbox>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input"} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button  onClick={createExamPager.deleteSubjectContentDiv}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button type="ghost" icon="plus-circle-o" htmlType="reset"
                            className="login-form-button" onClick={createExamPager.deleteSubjectContentDiv}>
                        解析
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={3}>
                    <Button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv}>
                        删除
                    </Button>
                </Col>
            </Row>
        </div>;
        return subjectDiv;
    },

    /**
     * 创建答题卡中判断题的题目div
     */
    buildCorrectSubjectDivContent(num,answerTitle){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <RadioGroup key={answerTitle+"#"+num+"#radio"} onChange={createExamPager.correctAnswerOnChange}
                                value={createExamPager.state.correctAnswerValue}>
                        <Radio value="right">正确</Radio>
                        <Radio value="error">错误</Radio>
                    </RadioGroup>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input"} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button  onClick={createExamPager.deleteSubjectContentDiv}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button type="ghost" icon="plus-circle-o" htmlType="reset"
                            className="login-form-button" onClick={createExamPager.deleteSubjectContentDiv}>
                        解析
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={3}>
                    <Button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv}>
                        删除
                    </Button>
                </Col>
            </Row>
        </div>;
        return subjectDiv;
    },

    /**
     * 创建答题卡中填空题的题目div
     */
    buildFillBlankSubjectDivContent(num,answerTitle){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <Input  id={answerTitle+"#"+num+"#blank"} type="textarea" rows={2} onChange={createExamPager.blankOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input"} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button  onClick={createExamPager.deleteSubjectContentDiv}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button type="ghost" icon="plus-circle-o" htmlType="reset"
                            className="login-form-button" onClick={createExamPager.deleteSubjectContentDiv}>
                        解析
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={3}>
                    <Button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv}>
                        删除
                    </Button>
                </Col>
            </Row>
        </div>;
        return subjectDiv;
    },

    /**
     * 创建答题卡中简答题的题目div
     */
    buildSimpleAnswerSubjectDivContent(num,answerTitle){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <Input  id={answerTitle+"#"+num+"#simpleAnswer"} type="textarea" rows={5} onChange={createExamPager.blankOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input"} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button  onClick={createExamPager.deleteSubjectContentDiv}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button type="ghost" icon="plus-circle-o" htmlType="reset"
                            className="login-form-button" onClick={createExamPager.deleteSubjectContentDiv}>
                        解析
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={3}>
                    <Button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv}>
                        删除
                    </Button>
                </Col>
            </Row>
        </div>;
        return subjectDiv;
    },

    correctAnswerOnChange(e){
        alert(e.target.value);
        createExamPager.setState({
            correctAnswerValue: e.target.value,
        });
    },

    /**
     * 创建Card组件的标记，最终在页面上显示cardChildTagArray中的内容
     */
    buildCardChildArray(){
        cardChildTagArray = cardChildArray.map((e, i)=> {
            var subjectArray=e.cardSubjectAnswerArray;
            return <Card key={e.answerTitle+"#"+e.answerSubjectType} title={e.answerTitle} extra={<Button title={e.answerTitle} value={e.answerTitle+"#"+e.answerSubjectType} icon="delete" onClick={createExamPager.deleteAnswerCard}>删除</Button>} style={{width: 650}}>
                {
                    subjectArray.map((item,j)=>item.divContent)
                }
            </Card>
        },createExamPager);
        createExamPager.setState({cardChildTagArray:cardChildTagArray});
    },

    /**
     * 根据答题卡结构的设定方式，生成对应的每个题目的答案
     */
    addAnswerCard(){
        //答题卡标题
        var answerTitle = createExamPager.state.answerTitle;
        //答题卡中的题目类型
        var answerSubjectType = createExamPager.state.subjectTypeValue;
        //答题卡中的题目数量
        var answerCount = parseInt(createExamPager.state.answerCount);
        var answerScore = parseInt(createExamPager.state.answerScore);
        var checkResult = createExamPager.checkCardTitleIsExist(answerTitle,answerSubjectType);
        if(checkResult==false){
            //答题卡中不存在当前要添加的答题卡title
            //答题卡中的题目编号数组
            var cardSubjectAnswerArray=[];
            for(var i=1;i<=answerCount;i++){
                var subjectDiv;
                if(answerSubjectType=="selectAnswer"){
                    subjectDiv = createExamPager.buildChoiceSubjectDivContent(i,answerTitle);
                }else if(answerSubjectType=="correct"){
                    subjectDiv = createExamPager.buildCorrectSubjectDivContent(i,answerTitle);
                }else if(answerSubjectType=="fillBlanks"){
                    subjectDiv = createExamPager.buildFillBlankSubjectDivContent(i,answerTitle);
                }else if(answerSubjectType=="simpleAnswer"){
                    subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(i,answerTitle);
                }

                var subjectDivJson = {"index":i,"divContent":subjectDiv};
                cardSubjectAnswerArray.push(subjectDivJson);
            }
            var cardChildJson = {'answerTitle':answerTitle,'answerSubjectType':answerSubjectType,'answerCount':answerCount,'answerScore':answerScore,'cardSubjectAnswerArray':cardSubjectAnswerArray};
            cardChildArray.push(cardChildJson);
        }else{
            var cardChildJsonWithExist = checkResult;
            //题目的总数量增加
            var newAnswerCount = cardChildJsonWithExist.answerCount+answerCount;
            cardChildJsonWithExist.answerCount = newAnswerCount;
            var cardSubjectAnswerArray=[];
            for(var i=1;i<=newAnswerCount;i++){
                var subjectDiv;
                if(answerSubjectType=="selectAnswer"){
                    subjectDiv = createExamPager.buildChoiceSubjectDivContent(i,answerTitle);
                }else if(answerSubjectType=="correct"){
                    subjectDiv = createExamPager.buildCorrectSubjectDivContent(i,answerTitle);
                }else if(answerSubjectType=="fillBlanks"){
                    subjectDiv = createExamPager.buildFillBlankSubjectDivContent(i,answerTitle);
                }else if(answerSubjectType=="simpleAnswer"){
                    subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(i,answerTitle);
                }
                var subjectDivJson = {"index":i,"divContent":subjectDiv};
                cardSubjectAnswerArray.push(subjectDivJson);
            }
            cardChildJsonWithExist.cardSubjectAnswerArray = cardSubjectAnswerArray;
        }
        createExamPager.buildCardChildArray();
    },

    /**
     * 图片上传窗口关闭响应函数
     */
    examPagerModalHandleCancel(){
        createExamPager.setState({ examPagerModalVisible: false,spinLoading:false });
    },

    /**
     * 弹出图片上传窗口
     */
    showModal() {
        uploadFileList.splice(0,uploadFileList.length);
        createExamPager.setState({
            spinLoading:false,examPagerModalVisible: true,
        });
        if(typeof(createExamPager.refs.fileUploadCom)!="undefined" ){
            //弹出文件上传窗口时，初始化窗口数据
            createExamPager.refs.fileUploadCom.initFileUploadPage();
        }
    },

    /**
     * 点击保存按钮，文件上传
     */
    uploadFile(){
        if(uploadFileList.length==0){
            message.warning("请选择上传的文件,谢谢！");
        }else{
            var formData = new FormData();
            formData.append("file",uploadFileList[0]);
            formData.append("name",uploadFileList[0].name);
            createExamPager.setState({spinLoading:true});
            $.ajax({
                type: "POST",
                url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData : false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType : false,
                success: function (responseStr) {
                    if(responseStr!=""){
                        var fileUrl=responseStr;
                        createExamPager.setState({ examPagerModalVisible: false,spinLoading:false,examPagerUrl:fileUrl });
                    }
                },
                error : function(responseStr) {
                    console.log("error"+responseStr);
                    createExamPager.setState({ examPagerModalVisible: false,spinLoading:false });
                }
            });

        }
    },

    handleFileSubmit(fileList){
        console.log("fileList:"+fileList.length);
        if(fileList==null || fileList.length==0){
            uploadFileList.splice(0,uploadFileList.length);
        }
        for(var i=0;i<fileList.length;i++){
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj[0]);
        }
    },

    examPagerTitleChange(e){
        createExamPager.setState({ examPagerTitle: e.target.value });
    },

    render() {
        return (
            <div>
                <div className="ant-collapse ant-modal-footer homework">

                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="date_tr text_30">试卷名称:</span>
                        </Col>
                        <Col span={15} className="ant-form-item-control">
                <span className="date_tr">
                    <Input ref="examPagerTitle" placeholder="请输入试卷名称" onChange={createExamPager.examPagerTitleChange}/>
                </span>
                        </Col>
                    </Row>

                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="text_30"></span>
                        </Col>
                        <Col span={3}>
                <span className="date_tr text_30">
                    <Button type="primary" icon="plus-circle" title="上传试卷图片"
                            className="add_study add_study—a" onClick={createExamPager.showModal}>上传试卷图片</Button>
                    <Modal
                        visible={createExamPager.state.examPagerModalVisible}
                        title="上传试卷图片"
                        className="modol_width"
                        onCancel={createExamPager.examPagerModalHandleCancel}
                        transitionName=""  //禁用modal的动画效果
                        footer={[
                            <div>
                                <Button type="primary" htmlType="submit" className="login-form-button" onClick={createExamPager.uploadFile}>
                                    保存
                                </Button>
                                <Button type="ghost" htmlType="reset" className="login-form-button" onClick={createExamPager.examPagerModalHandleCancel}>
                                    取消
                                </Button>
                            </div>
                        ]}
                    >
                        <Spin tip="试卷图片上传中..." spinning={createExamPager.state.spinLoading}>
                            <Row>
                                <Col span={4}>上传文件：</Col>
                                <Col span={20}>
                                    <div>
                                        <FileUploadComponents ref="fileUploadCom" fatherState={createExamPager.state.examPagerModalVisible} callBackParent={createExamPager.handleFileSubmit}/>
                                    </div>
                                </Col>
                            </Row>
                        </Spin>
                    </Modal>
                </span>
                        </Col>
                    </Row>

                    <Row className="date_tr ant-form-item">
                        <Col span={3}>
                            <span className="text_30">设置答题卡:</span>
                        </Col>
                    </Row>

                    <Row className="date_tr ant-form-item">
                        <Col span={3}>
                            <span className="text_30"></span>
                        </Col>
                        <Col span={21} className="ant-form-item-control">
                            <div>
                                <Row>
                                    <Col span={3}>
                                        <span className="text_30">标题:</span>
                                    </Col>
                                    <Col span={15}>
                                        <Input ref="answerTitle" defaultValue={"选择题"} placeholder="请输入答题卡标题" onChange={createExamPager.answerTitleOnChange}/>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={3}>
                                        <span className="text_30">题型:</span>
                                    </Col>
                                    <Col span={21}>
                                        <RadioGroup onChange={createExamPager.subjectTypeOnChange}
                                                    value={createExamPager.state.subjectTypeValue}>
                                            <Radio value="selectAnswer">选择</Radio>
                                            <Radio value="correct">判断</Radio>
                                            <Radio value="fillBlanks">填空</Radio>
                                            <Radio value="simpleAnswer">简答</Radio>
                                        </RadioGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col span={3}>
                                        <span className="text_30">题数:</span>
                                    </Col>
                                    <Col span={3}>
                                        <Input ref="answerCount" defaultValue={createExamPager.state.answerCount} onChange={createExamPager.answerCountOnChange}/>
                                    </Col>
                                    <Col span={1}>
                                        <span className="text_30"></span>
                                    </Col>
                                    <Col span={2}>
                                        <span className="text_30">分值:</span>
                                    </Col>
                                    <Col span={3}>
                                        <Input ref="answerScore" defaultValue={2} onChange={createExamPager.answerScoreOnChange}/>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                    <Row className="date_tr ant-form-item">
                        <Col span={3}>
                            <span className="text_30"></span>
                        </Col>
                        <Col span={12}>
                            <Button type="primary" htmlType="submit" className="login-form-button class_right"
                                    onClick={createExamPager.addAnswerCard}>
                                添加题目
                            </Button>
                            <Button type="ghost" htmlType="reset" className="login-form-button" onClick={createExamPager.deleteAllCardChild}>
                                清除全部
                            </Button>
                        </Col>
                    </Row>
                    <Row className="date_tr ant-form-item">
                        {createExamPager.state.cardChildTagArray}
                    </Row>
                </div>

                <Row className="homework_out ant-modal-footer">
                    <Col span={24}>
                 <span>
                   <Button type="primary" htmlType="submit" className="login-form-button class_right"
                           onClick={createExamPager.handleSubmit}>
                    保存
                   </Button>
                   <Button type="ghost" htmlType="reset" className="login-form-button" onClick={createExamPager.handleCancel}>
                    取消
                   </Button>
                 </span>
                    </Col>
                </Row>
            </div>
        );
    },
});
export  default CreateExamPagerComponents;

