import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message,Steps,Icon,Progress,Modal,Input,notification} from 'antd';
import { Checkbox,Card,Row,Col,Radio } from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {isEmpty} from '../../utils/utils';
import {showLargeImg} from '../../utils/utils';
import ImageAnswerUploadComponents from './ImageAnswerUploadComponents';

const Step = Steps.Step;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
var exmSubmitResultJsonArray=[];
var time;
const TestAnswerComponents = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
            tipModalVisible:false,
        };
    },

    componentDidMount(){
        var _this = this;
        _this.getExmPaperInfo();
        _this.getRTime();
    },

    componentWillReceiveProps(){
        var _this = this;
        _this.getExmPaperInfo();
    },

    /**
     * 获取本次试卷的详细信息
     */
    getExmPaperInfo(){
        var _this = this;
        var paper = _this.props.paper;
        var title = paper.title;
        var attachmentsArray=[];
        var attachments = paper.attachments;
        attachments.forEach(function (attachment) {
            var path=attachment.path;
            var imgObj = <img  className="topics_zanImg" src={path}  onClick={showLargeImg}/>;
            attachmentsArray.push(imgObj);
        });
        _this.setState({attachmentsArray,title});
    },

    /**
     * 获取学生在此次考试中提交的答案结果信息
     *
     * @param ident 学生id
     * @param exmId 考试id
     * @return JSONObject  里面带参数paper　为 ExmPaper对象  参数:results为 List<ExmSubmitResult>  对象
     * @throws Exception
     */
    getStudentExmSubmitedResults(){
        var _this = this;
        var param = {
            "method": 'getStudentExmSubmitedResults',
            "ident": _this.props.studentObj.colUid,
            "exmId": _this.props.exmId
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    var paper = response.paper;
                    var resultsArray = response.results;
                    var questionTypes = paper.questionTypes;
                    var mainCardArray=[];
                    questionTypes.forEach(function (questionType) {
                        var typeTitle = questionType.title;
                        var questions = questionType.questions;
                        var cardArray=[];
                        for(var i=1;i<=questions.length;i++){
                            var question = questions[i-1];
                            var questionId = question.id;
                            var type = question.type;
                            var title = question.title;
                            var score = question.score;
                            switch (type){
                                case 0:
                                    _this.buildChoiceCard(questionId,i,score,cardArray,resultsArray);
                                    break;
                                case 1:
                                    _this.buildCorrectCard(questionId,i,score,cardArray,resultsArray);
                                    break;
                                case 2:
                                    _this.buildFillBlankCard(questionId,i,score,cardArray,resultsArray);
                                    break;
                                case 3:
                                    _this.buildFillBlankCard(questionId,i,score,cardArray,resultsArray);
                                    break;
                            }
                        }
                        var mainCard=<Card className="exam-particulars_cont" key={typeTitle} title={typeTitle} >
                            {cardArray}
                        </Card>;
                        mainCardArray.push(mainCard);
                    });
                    _this.setState({
                        mainCardArray
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    buildChoiceCard(questionId,number,score,cardArray,resultsArray){
        var charArray=[];
        var textAnswer;
        resultsArray.forEach(function (result) {
            if(result.questionId == questionId){
                textAnswer = result.textAnswer;
            }
        });
        if(isEmpty(textAnswer)==false){
            for(var i=0;i<textAnswer.length;i++){
                var selectedValue = questionId+"#"+textAnswer.charAt(i);
                charArray.push(selectedValue);
            }
        }
        var _this = this;
        var selectAnswerOptions =  _this.buildSelectOptionsArray(questionId);
        var everyRow=<Card key={questionId}>
            <Row>
                <Col span={24}>{number}.&nbsp;&nbsp;({score}分)</Col>
            </Row>
            <Row>
                <Col span={24}>
                    <CheckboxGroup options={selectAnswerOptions} defaultValue={charArray} onChange={_this.subjectAnswerOnChange} />
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    /**
     * 构建判断题的选项
     * @param questionId
     * @param number
     * @param score
     * @param cardArray
     */
    buildCorrectCard(questionId,number,score,cardArray,resultsArray){
        var _this = this;
        var textAnswer;
        var selectedValue;
        resultsArray.forEach(function (result) {
            if(result.questionId == questionId){
                textAnswer = result.textAnswer;
            }
        });
        if(isEmpty(textAnswer)==false){
            selectedValue = questionId+"#"+textAnswer;
        }
        var everyRow=<Card key={questionId}>
            <Row>
                <Col span={24}>{number}.&nbsp;&nbsp;({score}分)</Col>
            </Row>
            <Row>
                <Col span={24}>
                    <RadioGroup key={questionId} defaultValue={selectedValue} onChange={_this.correctAnswerOnChange}>
                        <Radio value={questionId+"#1"}>正确</Radio>
                        <Radio value={questionId+"#0"}>错误</Radio>
                    </RadioGroup>
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    /**
     * 构建填空和简答题的选项
     * @param questionId
     * @param number
     * @param score
     * @param cardArray
     */
    buildFillBlankCard(questionId,number,score,cardArray,resultsArray){
        var _this = this;
        var textAnswer;
        var imageAnswer;
        resultsArray.forEach(function (result) {
            if(result.questionId == questionId){
                textAnswer = result.textAnswer;
                imageAnswer = result.imageAnswer;
            }
        });
        var fileList =[];
        if(isEmpty(imageAnswer)==false){
            var fileJson = {
                uid: questionId + "#imageAnswer#",
                url: imageAnswer,
            }
            fileList.push(fileJson);
        }
        var everyRow=<Card key={questionId} >

            <Row>
                <Col span={4}>{number}.&nbsp;&nbsp;<span className="exam-particulars_time ">({score}分)</span></Col>
                <Col span={20}>
                    <Input id={questionId+"#Input"} placeholder="输入答案"  defaultValue={textAnswer} onChange={_this.blankAnswerOnChange} />
                </Col>
            </Row>
            <Row className="yinyong3">
                <Col span={4}></Col>
                <Col span={20}>
                    <ImageAnswerUploadComponents params={questionId+"#imageAnswer"}
                                                 fileList={fileList}
                                                 callBackParent={_this.getImgAnswerList}>
                    </ImageAnswerUploadComponents>
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    /**
     * 获取题目的图片答案
     */
    getImgAnswerList(file,questionInfo,isRemoved){
        var imageAnswer = file.response;
        if(isEmpty(isRemoved)==false && isRemoved=="removed"){
            imageAnswer = "";
        }
        // var fileList = [];
        // fileList.push(file);
        // this.setState({fileList});
        //题目图片答案的图片来源
        var questionInfoArray = questionInfo.split("#");
        var questionId=questionInfoArray[0];
        var exmSubmitResultJson = {questionId,imageAnswer};
        var answerType="imageAnswer";
        this.buildExmSubmitResultJsonArray(exmSubmitResultJson,answerType);
    },

    /**
     * 判断题选项改变响应
     */
    correctAnswerOnChange(e){
        var target = e.target;
        /*if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }*/
        var subjectInfo = target.value;
        var subjectInfoArray = subjectInfo.split("#");
        //当前答案所属答题卡名称
        var questionId = subjectInfoArray[0];
        //当前题目的单选选项（正确/错误）
        var textAnswer = subjectInfoArray[1];
        var exmSubmitResultJson = {questionId,textAnswer};
        var answerType="textAnswer";
        this.buildExmSubmitResultJsonArray(exmSubmitResultJson,answerType);
    },

    /**
     * 填空题文本域响应函数
     * @param e
     */
    blankAnswerOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var subjectInfo = target.id;
        var subjectInfoArray = subjectInfo.split("#");
        //通过组件id获取的答题卡信息
        var questionId= subjectInfoArray[0];
        //填空题答案
        var textAnswer = target.value;
        //封装题目的所属答题卡、编号信息和题目分值
        var exmSubmitResultJson = {questionId,textAnswer};
        var answerType="textAnswer";
        this.buildExmSubmitResultJsonArray(exmSubmitResultJson,answerType);
    },

    /**
     * 创建选择题选项的数组
     * @param num
     * @param answerTitle
     */
    buildSelectOptionsArray(questionId){
        var selectAnswerOptions=[];
        for (var i = 1; i <= 6; i++) {
            var optionJson;
            switch (i) {
                case 1:
                    optionJson = {label: 'A', value: questionId+"#A"};
                    break;
                case 2:
                    optionJson = {label: 'B', value: questionId+"#B"};
                    break;
                case 3:
                    optionJson = {label: 'C', value: questionId+"#C"};
                    break;
                case 4:
                    optionJson = {label: 'D', value: questionId+"#D"};
                    break;
                case 5:
                    optionJson = {label: 'E', value: questionId+"#E"};
                    break;
                case 6:
                    optionJson = {label: 'F', value: questionId+"#F"};
                    break;
            }
            selectAnswerOptions.push(optionJson);
        }
        return selectAnswerOptions;
    },

    subjectAnswerOnChange(checkedValues){
        var textAnswer='';
        var questionId;
        for(var i=0;i<checkedValues.length;i++){
            var currentSelectStr = checkedValues[i];
            var currentSelectArray = currentSelectStr.split("#");
            //当前题目所属的答题卡标题
            questionId = currentSelectArray[0];
            //当前题目的选择
            var choice = currentSelectArray[1];
            textAnswer+=choice;
        }
        var exmSubmitResultJson = {questionId,textAnswer};
        var answerType="textAnswer";
        this.buildExmSubmitResultJsonArray(exmSubmitResultJson,answerType);
    },

    /**
     * 构建/刷新试卷提交结果对象数组
     */
    buildExmSubmitResultJsonArray(exmSubmitResultJsonForAdd,answerType){
        var isExistSameQuestion=false;
        for(var i=0;i<exmSubmitResultJsonArray.length;i++){
            var exmSubmitResultJson = exmSubmitResultJsonArray[i];
            if(exmSubmitResultJson.questionId == exmSubmitResultJsonForAdd.questionId){
                if(answerType=="textAnswer"){
                    exmSubmitResultJson.textAnswer = exmSubmitResultJsonForAdd.textAnswer;
                    isExistSameQuestion=true;
                }else if(answerType=="imageAnswer"){
                    exmSubmitResultJson.imageAnswer = exmSubmitResultJsonForAdd.imageAnswer;
                    isExistSameQuestion=true;
                }
                break;
            }
        }
        if(isExistSameQuestion==false){
            exmSubmitResultJsonArray.push(exmSubmitResultJsonForAdd);
        }
        //试卷答题卡改变时,做一个更新标记,退出答题窗口时,提醒用户退出,并调用保存试卷答题卡的操作
        this.props.onAnswerCardChange(true);
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false});
    },

    answerPaper(){
        this.getStudentExmSubmitedResults();
        this.setState({"tipModalVisible":true});
    },

    submitAnswer(){
        var _this = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var exmId = _this.props.exmId;
        for(var i=0;i<exmSubmitResultJsonArray.length;i++){
            var exmSubmitResultJson = exmSubmitResultJsonArray[i];
            exmSubmitResultJson.userId = loginUser.colUid;
            exmSubmitResultJson.exmId = exmId;
        }
        var param = {
            "method": 'submitExm',
            "resultsJson": exmSubmitResultJsonArray,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    if(response){
                        message.success("答题卡提交成功");
                    }else{
                        message.error("答题卡提交失败");
                    }
                    _this.tipModalHandleCancel();
                    _this.props.onAnswerCardChange(false);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getRTime(){
        var _this = this;
        // console.log("examEndTime"+_this.props.examEndTime);
        var EndTime= new Date(_this.props.examEndTime);
        var NowTime = new Date();
        var t = EndTime.getTime() - NowTime.getTime();
        var h = Math.floor(t / 1000 / 60 / 60 % 24);
        var m = Math.floor(t / 1000 / 60 % 60);
        var s = Math.floor(t / 1000 % 60);

        var toEndTime=h + "时"+ m + "分"+s + "秒";
        console.log("toEndTime:"+toEndTime);
        if(h<=0 && m==10 && s == 0){
            notification.open({
                message: '考试用时提醒',
                description: '距离考试结束还剩10分钟,考试完成时,如未提交答题卡,系统会自动提交答题卡!',
                icon: <Icon type="meh"  style={{ color: '#108ee9' , top:'-7px', position:'relative' }}/>,
                duration:10
            });
            time = setTimeout(_this.getRTime,1000);
        }else{
            if(h<=0 && m <=0 && s <=0){
                clearTimeout(time);
                message.warning("考试结束");
                _this.submitAnswer();
                _this.props.returnTestList('autoSubmit');
            }else{
                time = setTimeout(_this.getRTime,1000);
            }
        }
        this.setState({toEndTime});
    },

    render() {
        var modalTitle = this.state.title+"答题卡";
        return (
            <div className="level_list_pa">
                <div className="exam-particulars_title">
                    <p>
                        {this.state.title} <Button icon="file-text" className=" exam_right_a" onClick={this.answerPaper}>答题卡</Button>
                    </p>
                    <p>
                        <span>距离考试结束还剩:{this.state.toEndTime}</span>
                    </p>
                </div>
                <div className="st_exam">
                    {this.state.attachmentsArray}
                </div>
                <Modal className="st_modal_exam"
                    visible={this.state.tipModalVisible}
                    title={modalTitle}
                    onCancel={this.tipModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[<Button onClick={this.submitAnswer}>提交</Button>]}>
                    <div style={{height:'400px', overflow:'auto'}}>
                        {this.state.mainCardArray}
                    </div>
                    <div>
                        
                    </div>
                </Modal>
            </div>
        );
    },
});

export default TestAnswerComponents;
