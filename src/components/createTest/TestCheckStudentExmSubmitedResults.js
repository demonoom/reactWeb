import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message,Steps,Icon,Progress,Modal,Collapse,Card,Row,Col,Slider, Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
const Step = Steps.Step;
const Panel = Collapse.Panel;

var examsArray=[];
var TimeLineItemArray=[];
var questionScoreJsonArray = [];
const TestCheckStudentExmSubmitedResults = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
            tipModalVisible:false,
            scoreInputDisable:false,
        };
    },

    componentDidMount(){
        var _this = this;
        var userObj = JSON.parse(sessionStorage.getItem("loginUser"));
        var scoreInputDisableValue=false;
        if(userObj.colUtype=="STUD"){
            scoreInputDisableValue=true;
        }
        _this.setState({scoreInputDisable:scoreInputDisableValue});
        _this.getStudentExmSubmitedResults();
    },

    showLargeImg(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        $.openPhotoGallery(target);
        this.tipModalHandleCancel();
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
                    var attachments = paper.attachments;
                    var attachMentsArray=[];
                    if(typeof(attachments)!="undefined" ){
                        attachments.forEach(function (attachment) {
                            var attachMents = <span className="topics_zan">
                                <img className="topics_zanImg" src={attachment.path}  onClick={_this.showLargeImg}/>
                            </span>;
                            attachMentsArray.push(attachMents);
                        });
                    }
                    var paperId = paper.id;
                    var paperTitle = paper.title;
                    var questionTypes = paper.questionTypes;
                    var mainCardArray=[];
                    //总分
                    var totalScore=0;
                    //题目数量
                    var questionCount=0;
                    resultsArray.forEach(function (result) {
                        totalScore =parseFloat(totalScore) + parseFloat(result.score);
                    });
                    questionTypes.forEach(function (questionType) {
                        var typeTitle = questionType.title;
                        var questions = questionType.questions;
                        var cardArray=[];
                        questions.forEach(function (question) {
                            questionCount = questionCount + 1;
                            var questionId = question.id;
                            var type = question.type;
                            var title = question.title;
                            var no=title.split(" ")[1];
                            switch (type){
                                case 0:
                                    //cardTitle="选择";
                                    _this.buildChoiceCard(question,no,cardArray,resultsArray);
                                    break;
                                case 1:
                                    // cardTitle="判断";
                                    _this.buildCorrectCard(question,no,cardArray,resultsArray);
                                    break;
                                case 2:
                                    // cardTitle="填空";
                                    _this.buildFillBlankCard(question,no,cardArray,resultsArray);
                                    break;
                                case 3:
                                    // cardTitle="简答";
                                    _this.buildFillBlankCard(question,no,cardArray,resultsArray);
                                    break;
                            }
                        });
                        var mainCard=<Card className="exam-particulars_cont" key={typeTitle} title={typeTitle} >
                            {cardArray}
                        </Card>;
                        mainCardArray.push(mainCard);
                    });
                    _this.setState({
                        mainCardArray,questionCount,totalScore,attachMentsArray
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    buildChoiceCard(question,no,cardArray,results){
        var _this = this;
        //正确答案
        var type = question.type;
        var textAnswer = question.textAnswer;
        var questionId = question.id;
        var isExistSameQuestion=false;
        results.forEach(function (result) {
            if(questionId==result.questionId){
                isExistSameQuestion=true;
                var resultAnswer = result.textAnswer;
                var answerClassName;
                if(resultAnswer!=textAnswer){
                    answerClassName="exam_grade";
                }
                var everyRow=<Card key={type+no} className="upexam_topic">
                    <Row className="class_right">
                        <Col span={2}>题号</Col>
                        <Col span={14}>标准答案</Col>
                        <Col span={6}>学生答案</Col>
                    </Row>
                    <Row className="class_right">
                        <Col span={2}>{no}</Col>
                        <Col span={14}>{textAnswer}</Col>
                        <Col span={6} className={answerClassName}>{resultAnswer}</Col>
                    </Row>
                </Card>;
                cardArray.push(everyRow);
            }
        });
        if(results.length==0 || isExistSameQuestion==false){
            var everyRow=<Card key={type+no} className="upexam_topic">
                <Row className="class_right">
                    <Col span={2}>题号</Col>
                    <Col span={14}>标准答案</Col>
                    <Col span={6}>学生答案</Col>
                </Row>
                <Row className="class_right">
                    <Col span={2}>{no}</Col>
                    <Col span={14}>{textAnswer}</Col>
                    <Col span={6}></Col>
                </Row>
            </Card>;
            cardArray.push(everyRow);
        }
    },

    buildCorrectCard(question,no,cardArray,results){
        var _this = this;
        //正确答案
        var type = question.type;
        var textAnswerNo = question.textAnswer;
        var questionId = question.id;
        var textAnswer;
        switch (textAnswerNo){
            case "0":
                textAnswer="错误";
                break;
            case "1":
                textAnswer="正确";
                break;
        }
        var isExistSameQuestion=false;
        results.forEach(function (result) {
            if(questionId==result.questionId){
                isExistSameQuestion=true;
                var resultTextAnswer = result.textAnswer;
                var resultAnswer;
                switch (resultTextAnswer){
                    case "0":
                        resultAnswer="错误";
                        break;
                    case "1":
                        resultAnswer="正确";
                        break;
                }
                var everyRow=<Card key={type+no} className="upexam_topic">
                    <Row>
                        <Col span={2}>题号</Col>
                        <Col span={14}>标准答案</Col>
                        <Col span={6}>学生答案</Col>
                    </Row>
                    <Row>
                        <Col span={2}>{no}</Col>
                        <Col span={14}>{textAnswer}</Col>
                        <Col span={6}>{resultAnswer}</Col>
                    </Row>
                </Card>;
                cardArray.push(everyRow);
            }
        });
        if(results.length==0 || isExistSameQuestion==false){
            var everyRow=<Card key={type+no} className="upexam_topic">
                <Row>
                    <Col span={2}>题号</Col>
                    <Col span={14}>标准答案</Col>
                    <Col span={6}>学生答案</Col>
                </Row>
                <Row>
                    <Col span={2}>{no}</Col>
                    <Col span={14}>{textAnswer}</Col>
                    <Col span={6}></Col>
                </Row>
            </Card>;
            cardArray.push(everyRow);
        }
    },
    /**
     * 创建简答和填空的card
     * @param question
     * @param no
     * @param cardArray
     * @param results
     */
    buildFillBlankCard(question,no,cardArray,results){
        var _this = this;
        //正确答案
        var type = question.type;
        var textAnswer = question.textAnswer;
        var imageAnswer = question.imageAnswer;
        var score = question.score;
        var questionId = question.id;
        var imgObj;
        if(typeof(imageAnswer)!="undefined" && imageAnswer!=null && imageAnswer != ""){
            imgObj = <Row>
                <Col span={24}><img style={{width:'150px',height:'150px'}} src={imageAnswer}  onClick={_this.showLargeImg}/></Col>
            </Row>;
        }
        var isExistSameQuestion=false;
        results.forEach(function (result) {
            if(questionId==result.questionId){
                isExistSameQuestion=true;
                var resultAnswer = result.textAnswer;
                var resultImageAnswer = result.imageAnswer;
                var studentAnswerImgObj;
                if(typeof(resultImageAnswer)!="undefined" && resultImageAnswer!=null && resultImageAnswer != ""){
                    var resultImgArray=resultImageAnswer.split(",");
                    var imgTagArray=[];
                    resultImgArray.forEach(function (resultImg) {
                        if(typeof(resultImg)!="undefined" && resultImg!="" ){
                            var imgObj = <img style={{width:'150px',height:'150px'}} src={resultImg}  onClick={_this.showLargeImg}/>;
                            imgTagArray.push(imgObj);
                        }
                    });
                    studentAnswerImgObj = <Row>
                        <Col span={24}>{imgTagArray}</Col>
                    </Row>;
                }
                var everyRow=<Card key={type+no} className="upexam_topic">
                    <Row>
                        <Col span={12}>{no}.&nbsp;&nbsp;正确答案：（总分：{score}分）</Col>
                        <Col span={10}>得分
                            <Input id={questionId} disabled={_this.state.scoreInputDisable} placeholder="请输入" defaultValue={result.score} onChange={_this.scoreInputChange} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>{textAnswer}</Col>
                    </Row>
                    {imgObj}
                    <Row>
                        <Col span={24}>学生答案：{resultAnswer}</Col>
                    </Row>
                    {studentAnswerImgObj}
                </Card>;
                cardArray.push(everyRow);
            }
        });
        if(results.length==0 || isExistSameQuestion==false){
            var everyRow=<Card key={type+no} className="upexam_topic">
                <Row>
                    <Col span={24}>{no}.正确答案:(总分:{score}分)</Col>
                </Row>
                <Row>
                    <Col span={24}>{textAnswer}</Col>
                </Row>
                {imgObj}
                <Row>
                    <Col span={24}>学生答案:</Col>
                </Row>
            </Card>;
            cardArray.push(everyRow);
        }
    },

    scoreInputChange(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var questionId = target.id;
        //得分
        var score = target.value;
        //封装题目的所属答题卡、编号信息和题目分值
        var questionScoreJson = {questionId, score};
        this.buildQuestionScoreJsonArray(questionScoreJson);
    },

    /**
     * 构建/刷新试卷提交结果对象数组
     */
    buildQuestionScoreJsonArray(questionScoreJsonForAdd){
        var isExistSameQuestion=false;
        for(var i=0;i<questionScoreJsonArray.length;i++){
            var questionScoreJson = questionScoreJsonArray[i];
            if(questionScoreJson.questionId == questionScoreJsonForAdd.questionId){
                questionScoreJson.score = questionScoreJsonForAdd.score;
                isExistSameQuestion=true;
                break;
            }
        }
        if(isExistSameQuestion==false){
            questionScoreJsonArray.push(questionScoreJsonForAdd);
        }
    },

    showPaperAttachmentsModal(){
        this.setState({"tipModalVisible":true});
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false});
    },
    /**
     * 批改完成
     */
    batchCorrectExmResult(){
        var _this = this;
        var scoreStr="";
        for(var i=0;i<questionScoreJsonArray.length;i++){
            var questionScoreJson = questionScoreJsonArray[i];
            var questionId = questionScoreJson.questionId;
            var score = questionScoreJson.score;
            var questionScoreInfo = questionId+"@"+score;
            if(i==0){
                scoreStr=scoreStr+questionScoreInfo;
            }else{
                scoreStr=scoreStr+"#"+questionScoreInfo;
            }
        }
        var param = {
            "method": 'batchCorrectExmResult',
            "scores": scoreStr,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    if(response){
                        message.success("试卷批改成功");
                    }else{
                        message.error("试卷批改失败");
                    }
                }
                _this.props.onCheckButtonClick();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    render() {
        var batchCorrectExmResultButton;
        var userObj = JSON.parse(sessionStorage.getItem("loginUser"));
        if(this.props.checkExamComeFrom=="checkTest"){
            if(userObj.colUtype=="STUD"){
                batchCorrectExmResultButton="";
            }else{
                batchCorrectExmResultButton=<div>
                    <Button onClick={this.batchCorrectExmResult}>批改完成</Button>
                </div>;
            }
        }else{
            batchCorrectExmResultButton="";
        }
        return (
            <div className="level_list_pa"><a onClick={this.showPaperAttachmentsModal} className="ant-btn ant-btn-primary add_study">查看试卷</a>
                <div className="exam-particulars_title">
                  <p>{this.props.studentObj.userName}同学试题答案</p>
				  <p className="exam_grade">共计：{this.state.questionCount}题 得分{this.state.totalScore}分</p>
                </div>
                {this.state.mainCardArray}
                {batchCorrectExmResultButton}
                <Modal
                    visible={this.state.tipModalVisible}
                    title="试卷图片列表"
                    onCancel={this.tipModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[]}>
                    <div>
                        {this.state.attachMentsArray}
                    </div>
                </Modal>
            </div>
        );
    },
});

export default TestCheckStudentExmSubmitedResults;
