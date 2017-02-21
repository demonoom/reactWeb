import React, { PropTypes } from 'react';
import { Modal, Button,message,Transfer } from 'antd';
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
const selectAnswerOptions = [];
//答题卡
var cardChild;
var cardChildTagArray=[];
//答题卡数组
var cardChildArray=[];
var uploadFileList=[];
var options=new Array();
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
            correctAnswerValue:'',     //判断题的答案
            examPagerModalVisible:false,        //上传试卷图片的Modal窗口的状态
            spinLoading:false,      //上传试卷图片过程中的加载动画
            examPagerUrl:'',        //试卷图片的上传地址
            examPagerTitle:'',      //试卷标题
            answerCardArray:[],     //答题卡的数组
            exmQuestionArray:[],    //答题卡中题目的数组
            selectedKnowledge:'',   //选中的知识点
            defaultSelected:[],     //默认选中的知识点
            mockData: [],       //所属知识点穿梭框左侧备选数据
            targetKeys: [],     //所属知识点穿梭框右侧已选数据
            bindKnowledgeBtnInfo:'',     //当前点击的“所属知识点”按钮相关的答题卡、题目信息
            analysisModalVisible:false,      //添加解析窗口状态
            analysisContent:'',      //添加解析文本域的内容
            uploadImgOptSource:'',      //图片上传的操作来源，包括试卷标题的图片上传、图片解析的上传、图片题目的上传
            addAnalysisBtnInfo:'',      //添加按钮的所属题目信息
            analysisUrl:''      //图片解析的url路径
        };
    },
    /**
     * 保存试卷信息
     * @param paperJson
     */
    createExamPager(paperJson){
        var param = {
            "method": 'createExmPaper',
            "paperJson": paperJson
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("组卷成功");
                } else {
                    message.error("组卷失败");
                }
                //createExamPager.props.callbackParent();
                // 回到试卷列表
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
    saveExampager(e) {
        e.preventDefault();
        //创建者id
        var ident = sessionStorage.getItem("ident");
        //试卷标题
        var examPagerTitle = createExamPager.state.examPagerTitle;
        //上传文件的附件url
        var examPagerUrl = createExamPager.state.examPagerUrl;
        //创建时间
        var createTime = (new Date()).valueOf();
        // 试卷的附件--图片
        var attachments=[{path:examPagerUrl}];
        //封装试卷基本信息 *******************************
        var paperJson={title:examPagerTitle,userId:ident,createTime:createTime,attachments:attachments};
        //封装试卷的题目信息questionTypes,数据从cardChildArray中获取，包括了答题卡和题目的信息
        // ############################
        var questionTypesArray=[];
        for(var i =0;i<cardChildArray.length;i++){
            var cardChildJson = cardChildArray[i];
            //大题标题(老师自定义的)
            var title = cardChildJson.answerTitle;
            // 大题类型
            var type;
            var answerSubjectType = cardChildJson.answerSubjectType;
            if(answerSubjectType=="selectAnswer"){
                type=0;
            }else if(answerSubjectType=="correct"){
                type=1;
            }else if(answerSubjectType=="fillBlanks"){
                type=2;
            }else if(answerSubjectType=="simpleAnswer"){
                type=3;
            }
            //封装大题题型信息 *******************************
            var questionTypes = {title:title,type:type};
            // 大题对应的题目内容 ############################
            var questions=[];
            for(var j=0;j<cardChildJson.cardSubjectAnswerArray.length;j++){
                var subjectDivJson = cardChildJson.cardSubjectAnswerArray[j];
                //小题的标题(方式是 大题标题加上小题位置作为小题的标题)
                var questionTitle=title+subjectDivJson.index;
                // 小题对应的分数
                var score = subjectDivJson.score;
                // 文字正确答案
                var textAnswer = subjectDivJson.textAnswer;
                // 图片正确答案
                var imageAnswer = "";
                // 冗余ExmQuestionType的类型，用于查询操作好操作
                var questionType = type;
                // 文字解析
                var textAnalysis = subjectDivJson.textAnalysis;
                // 图片解析
                var imageAnalysis= subjectDivJson.imageAnalysis;
                // 所属知识点
                var points = subjectDivJson.points;
                var questionsJson = {score:score,title:questionTitle,textAnswer:textAnswer,imageAnswer:imageAnswer,type:questionType,textAnalysis:textAnalysis,imageAnalysis:imageAnalysis,points:points};
                questions.push(questionsJson);
            }
            //将所有的题目进行封装
            questionTypes.questions=questions;
            questionTypesArray.push(questionTypes);
        }
        paperJson.questionTypes = questionTypesArray;
        console.log(paperJson);
        // createExamPager.createExamPager(paperJson);
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
    /**
     * 在答题卡中的答案、分值等改变时，在题目的json对象中，增加对应的答案和分值等信息
     * 该函数会在每个答题卡元素的事件响应函数中进行调用
     * @param subjectJson 需要更新的题目信息,包括题型、所属答题卡等信息
     * @param optType 操作方式，即更新的是答案、分值、关联的知识点等
     */
    refreshCardChildArray(subjectJson,optType){
        // var cardChildJson = {'answerTitle':answerTitle,'answerSubjectType':answerSubjectType,
        // 'answerCount':answerCount,'answerScore':answerScore,'cardSubjectAnswerArray':cardSubjectAnswerArray};
        // var subjectJson = {answerCardTitle:answerCardTitle,subjectNum:subjectNum,subjectAnswer:subjectAnswer};
        for(var i =0;i<cardChildArray.length;i++){
            var cardChildJson = cardChildArray[i];
            //找到对应的答题卡
            if(subjectJson.answerCardTitle == cardChildJson.answerTitle && subjectJson.answerSubjectType == cardChildJson.answerSubjectType){
                //找到对应的题目编号
                for(var j=0;j<cardChildJson.cardSubjectAnswerArray.length;j++){
                    // var subjectDivJson = {"index":i,"divContent":subjectDiv};
                    var subjectDivJson = cardChildJson.cardSubjectAnswerArray[j];
                    if(subjectJson.subjectNum == subjectDivJson.index){
                        if(optType=="setAnswer"){
                            //找到对应的题目编号后，设置答案
                            subjectDivJson.textAnswer = subjectJson.subjectAnswer;
                            break;
                        }else if(optType=="setScore"){
                            //找到对应的题目后，设置题目的分值
                            subjectDivJson.score = subjectJson.subjectScore;
                            break;
                        }else if(optType=="setPoints"){
                            //设置关联的知识点
                            subjectDivJson.points = subjectJson.points;
                        }else if(optType=="setAnalysis"){
                            //设置解析内容，包括文字解析和图片解析
                            subjectDivJson.textAnalysis = subjectJson.textAnalysis;
                            subjectDivJson.imageAnalysis = subjectJson.imageAnalysis;
                        }
                    }
                }
            }
        }
    },
    /**
     * 设置答题卡时的题型单选事件响应函数
     */
    subjectTypeOnChange(e){
        console.log('radio checked', e.target.value);
        createExamPager.setState({
            subjectTypeValue: e.target.value,
        });
    },
    /**
     * 答题卡中答案操作时的响应函数
     * @param checkedValues
     */
    subjectAnswerOnChange(checkedValues){
        console.log('checked = ', checkedValues);
        var subjectAnswer='';
        //当前题目所属的答题卡标题
        var answerCardTitle;
        //当前题目的编号
        var subjectNum;
        for(var i=0;i<checkedValues.length;i++){
            var currentSelectStr = checkedValues[i];
            var currentSelectArray = currentSelectStr.split("#");
            //当前题目所属的答题卡标题
            answerCardTitle = currentSelectArray[0];
            //当前题目的编号
            subjectNum = currentSelectArray[1];
            //当前题目的选择
            var choice = currentSelectArray[3];
            //当前答题卡的题型
            var answerSubjectType = currentSelectArray[4];
            subjectAnswer+=choice;
            console.log("subjectAnswer:"+subjectAnswer);
        }
        var subjectJson = {answerCardTitle:answerCardTitle,answerSubjectType:answerSubjectType,subjectNum:subjectNum,subjectAnswer:subjectAnswer};
        createExamPager.refreshCardChildArray(subjectJson,"setAnswer");
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
                    //题目类型
                    var answerSubjectType = cardChildJson.answerSubjectType;
                    if(deleteAnswerTitle == cartTitleInJson){
                        //已经找到对应的答题卡，接下来需要在答题卡的题目数组中再找出对应的题目编号
                        var cardSubjectAnswerArray = cardChildJson.cardSubjectAnswerArray;
                        for(var j = 0;j<cardSubjectAnswerArray.length;j++){
                            var cardSubjectJson = cardSubjectAnswerArray[j];
                            if(cardSubjectJson.index == deleteSubjectNum){
                                cardSubjectJson.divContent="";
                                cardSubjectAnswerArray.splice(deleteSubjectNum-1,1);
                                createExamPager.refreshSubjectIndexNo(deleteSubjectNum,deleteAnswerTitle,answerSubjectType);
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
     * 删除题目时，刷新题目的编号，保证题目的编号始终是连续且正确的
     */
    refreshSubjectIndexNo(startNo,answerTitle,answerSubjectType){
        for(var i=0;i<createExamPager.state.cardChildTagArray.length;i++){
            var cardChildJson = cardChildArray[i];
            var cartTitleInJson = cardChildJson.answerTitle;
            if(answerTitle == cartTitleInJson && answerSubjectType == cardChildJson.answerSubjectType){
                //已经找到对应的答题卡，接下来需要在答题卡的题目数组中再找出对应的题目编号
                var cardSubjectAnswerArray = cardChildJson.cardSubjectAnswerArray;
                for(var j = 1;j<cardSubjectAnswerArray.length+1;j++){
                    var cardSubjectJson = cardSubjectAnswerArray[j-1];
                    if(cardSubjectJson.index > startNo){
                        cardSubjectJson.index = cardSubjectJson.index-1;
                        var subjectDiv;
                        if(answerSubjectType=="selectAnswer"){
                            subjectDiv = createExamPager.buildChoiceSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="correct"){
                            subjectDiv = createExamPager.buildCorrectSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="fillBlanks"){
                            subjectDiv = createExamPager.buildFillBlankSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="simpleAnswer"){
                            subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }
                        var subjectDivJson = {"index":cardSubjectJson.index,"divContent":subjectDiv,"answerScore":cardSubjectJson.answerScore};
                    }else{
                        var subjectDiv;
                        if(answerSubjectType=="selectAnswer"){
                            subjectDiv = createExamPager.buildChoiceSubjectDivContent(j,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="correct"){
                            subjectDiv = createExamPager.buildCorrectSubjectDivContent(j,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="fillBlanks"){
                            subjectDiv = createExamPager.buildFillBlankSubjectDivContent(j,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="simpleAnswer"){
                            subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(j,answerTitle,answerSubjectType);
                        }
                        var subjectDivJson = {"index":j,"divContent":subjectDiv,"answerScore":cardSubjectJson.answerScore};
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
        var subjectInfo = e.target.id;
        var subjectInfoArray = subjectInfo.split("#");
        var answerCardTitle= subjectInfoArray[0];
        var subjectNum = parseInt(subjectInfoArray[1]);
        var answerSubjectType = subjectInfoArray[3];
        var subjectScore = parseInt(e.target.value);
        //封装题目的所属答题卡、编号信息和题目分值
        var subjectJson = {answerCardTitle:answerCardTitle,answerSubjectType:answerSubjectType,subjectNum:subjectNum,subjectScore:subjectScore};
        var optType="setScore";
        createExamPager.refreshCardChildArray(subjectJson,optType);

    },
    /**
     * 填空题文本域响应函数
     * @param e
     */
    blankOnChange(e){
        console.log("blankOnChange:"+e.target.value);
        var subjectInfo = e.target.id;
        var subjectInfoArray = subjectInfo.split("#");
        //通过组件id获取的答题卡信息
        var answerCardTitle= subjectInfoArray[0];
        var subjectNum = parseInt(subjectInfoArray[1]);
        var answerSubjectType = subjectInfoArray[3];
        //填空题答案
        var subjectAnswer = e.target.value;
        //封装题目的所属答题卡、编号信息和题目分值
        var subjectJson = {answerCardTitle:answerCardTitle,answerSubjectType:answerSubjectType,subjectNum:subjectNum,subjectAnswer:subjectAnswer};
        var optType = "setAnswer";
        createExamPager.refreshCardChildArray(subjectJson,optType);
    },

    /**
     * 创建选择题选项的数组
     * @param num
     * @param answerTitle
     */
    buildSelectOptionsArray(num,answerTitle,answerSubjectType){
        var choiceArray = [];
        selectAnswerOptions.splice(0, selectAnswerOptions.length);
        for (var i = 0; i < 6; i++) {
            var optionJson;
            switch (i) {
                case 0:
                    optionJson = {label: 'A', value: answerTitle + "#" + num + "#checkbox#A"+"#"+answerSubjectType};
                    break;
                case 1:
                    optionJson = {label: 'B', value: answerTitle + "#" + num + "#checkbox#B"+"#"+answerSubjectType};
                    break;
                case 2:
                    optionJson = {label: 'C', value: answerTitle + "#" + num + "#checkbox#C"+"#"+answerSubjectType};
                    break;
                case 3:
                    optionJson = {label: 'D', value: answerTitle + "#" + num + "#checkbox#D"+"#"+answerSubjectType};
                    break;
                case 4:
                    optionJson = {label: 'E', value: answerTitle + "#" + num + "#checkbox#E"+"#"+answerSubjectType};
                    break;
                case 5:
                    optionJson = {label: 'F', value: answerTitle + "#" + num + "#checkbox#F"+"#"+answerSubjectType};
                    break;
            }
            choiceArray.push(optionJson);
            selectAnswerOptions.push(choiceArray);
        }
    },

    /**
     * 创建答题卡中选择题的题目div
     */
    buildChoiceSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        createExamPager.buildSelectOptionsArray(num,answerTitle,answerSubjectType);
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}> {/*defaultValue={[answerTitle + "#" + num + "#checkbox#A"]}*/}
                    <CheckboxGroup options={selectAnswerOptions[num-1]} onChange={createExamPager.subjectAnswerOnChange} />
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
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
    buildCorrectSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <RadioGroup key={answerTitle+"#"+num+"#radio#"+answerSubjectType} onChange={createExamPager.correctAnswerOnChange}
                     defaultValue={createExamPager.state.correctAnswerValue}>
                        <Radio value={answerTitle+"#"+num+"#right#"+answerSubjectType}>正确</Radio>
                        <Radio value={answerTitle+"#"+num+"#error#"+answerSubjectType}>错误</Radio>
                    </RadioGroup>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
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
    buildFillBlankSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <Input  id={answerTitle+"#"+num+"#blank#"+answerSubjectType} type="textarea" rows={2} onChange={createExamPager.blankOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
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
    buildSimpleAnswerSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        var subjectDiv =<div key={num} data-key={num}>
            <Row>
                <Col span={1}>{num}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <Input  id={answerTitle+"#"+num+"#simpleAnswer#"+answerSubjectType} type="textarea" rows={5} onChange={createExamPager.blankOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}></Col>
                <Col span={5}>
                    <Button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal}>
                        所属知识点
                    </Button>
                </Col>
                <Col span={3}>
                    <Button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
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
     * 判断题答案单选按钮组操作时的响应函数
     * @param e
     */
    correctAnswerOnChange(e){
        var subjectInfo = e.target.value;
        var subjectInfoArray = subjectInfo.split("#");
        //当前答案所属答题卡名称
        var answerCardTitle = subjectInfoArray[0];
        //当前题目的编号
        var subjectNum = subjectInfoArray[1];
        //当前题目的单选选项（right/error）
        var subjectAnswer = subjectInfoArray[2];
        var answerSubjectType = subjectInfoArray[3];
        var subjectJson = {answerCardTitle:answerCardTitle,answerSubjectType:answerSubjectType,subjectNum:subjectNum,subjectAnswer:subjectAnswer};
        createExamPager.refreshCardChildArray(subjectJson,"setAnswer");
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
     * 创建答题卡数组
     * @param answerTitle
     * @param answerSubjectType
     * @param answerCount
     * @param answerScore
     */
    buildExamQuestionArray(answerTitle,answerSubjectType,answerCount,answerScore){
        //创建者id
        var ident = sessionStorage.getItem("ident");
        //答题卡json对象，最终保存时，将会保存该对象
        var answerCardType;
        if(answerSubjectType=="selectAnswer"){
            answerCardType=0;
        }else if(answerSubjectType=="correct"){
            answerCardType=1;
        }else if(answerSubjectType=="fillBlanks"){
            answerCardType=2;
        }else if(answerSubjectType=="simpleAnswer"){
            answerCardType=3;
        }
        //考题的数组
        for(var i=1;i<=answerCount;i++){
            // 小题的标题(方式是 大题标题加上小题位置作为小题的标题)
            var subjectTitle = answerTitle+i;
            var subjectJson={score:answerScore,title:subjectTitle,textAnswer:'',imageAnswer:'',type:answerCardType,textAnalysis:'',imageAnalysis:'',points:{}};
            //将初始的题目信息推入题目数组中
            createExamPager.state.exmQuestionArray.push(subjectJson);
        }
        var answerCardJson = {type:answerCardType,title:answerTitle,questions:createExamPager.state.exmQuestionArray};
        createExamPager.state.answerCardArray.push(answerCardJson);
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
                    subjectDiv = createExamPager.buildChoiceSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="correct"){
                    subjectDiv = createExamPager.buildCorrectSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="fillBlanks"){
                    subjectDiv = createExamPager.buildFillBlankSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="simpleAnswer"){
                    subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }

                var subjectDivJson = {"index":i,"divContent":subjectDiv,"answerScore":answerScore};
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
                    subjectDiv = createExamPager.buildChoiceSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="correct"){
                    subjectDiv = createExamPager.buildCorrectSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="fillBlanks"){
                    subjectDiv = createExamPager.buildFillBlankSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="simpleAnswer"){
                    subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }
                var subjectDivJson = {"index":i,"divContent":subjectDiv,"answerScore":answerScore};
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
    showModal(e) {
        var source = e.target.value;
        //保存图片上传操作的事件源
        createExamPager.setState({uploadImgOptSource:source});
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
                        //上传的操作来源
                        var optSource = createExamPager.state.uploadImgOptSource;
                        if(optSource=="analysisImg"){
                            //图片解析操作来源
                            createExamPager.setState({ examPagerModalVisible: false,spinLoading:false,analysisUrl:fileUrl });
                        }else if(optSource=="examPagerTitleImg"){
                            //试卷标题图片来源
                            createExamPager.setState({ examPagerModalVisible: false,spinLoading:false,examPagerUrl:fileUrl });
                        }
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
    /**
     * 试卷名称文本框内容改变的响应函数
     * @param e
     */
    examPagerTitleChange(e){
        createExamPager.setState({ examPagerTitle: e.target.value });
    },

    /**
     * 关闭绑定知识点窗口
     */
    bindKnowledgeModalHandleCancel(){
        createExamPager.setState({ bindKnowledgeModalVisible: false,bindKnowledgeBtnInfo:'' });
    },
    /**
     * 获取知识点列表
     */
    getLessonMenu(){
        var param = {
            "method":'getAllKnowledgePoints',
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                var optionContent;
                ret.response.forEach(function (e) {
                    optionContent={value: e.id,
                        label: e.content};
                    var childrendArray = new Array();
                    for(var i=0;i<e.children.length;i++){
                        var child = e.children[i];
                        var childrenContent = {value: child.id,label: child.content}
                        childrendArray.push(childrenContent);
                    }
                    optionContent.children=childrendArray;
                    options.push(optionContent);
                });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },

    /**
     * 显示绑定知识点的窗口
     */
    showBindKnowledgeModal(e) {
        // alert(e.target.value);
        //获取所有的知识点数据，作为弹窗的下拉列表数据
        createExamPager.getLessonMenu();
        //获取当前老师已绑定知识点，作为穿梭框备选数据
        createExamPager.getMock();
        createExamPager.setState({bindKnowledgeBtnInfo:e.target.value,bindKnowledgeModalVisible: true,defaultSelected:[]});
    },
    /**
     * 绑定知识点弹窗中，下拉列表内容选定时的响应函数
     * @param value
     * @param selectedOptions
     */
    cascaderOnChange(value, selectedOptions) {
        console.log("value:"+value, selectedOptions);
        createExamPager.setState({defaultSelected:value});
        var selectedKnowledge;
        if(value.length>=2){
            selectedKnowledge = value[1];
        }else{
            selectedKnowledge = value[0];
        }
        createExamPager.bindPointForTeacher(selectedKnowledge);
        createExamPager.setState({selectedKnowledge:selectedKnowledge});
    },

    /**
     * 修改当前老师的已绑定知识点
     * @param selectedKnowledge
     */
    bindPointForTeacher(selectedKnowledge){
        if(selectedKnowledge==null || selectedKnowledge==""){
            message.warning("请选择具体的知识点完成绑定");
        }else{
            var param = {
                "method":'bindPointForTeacher',
                "userId":sessionStorage.getItem("ident"),
                "pointId":selectedKnowledge
            };
            doWebService(JSON.stringify(param), {
                onResponse : function(ret) {
                    console.log(ret.msg);
                    if(ret.msg=="调用成功" && ret.response==true){
                        message.success("知识点绑定成功");
                    }else{
                        message.error("知识点绑定失败");
                    }
                    createExamPager.getMock();
                },
                onError : function(error) {
                    message.error(error);
                }
            });
        }
    },
    /**
     * 获取穿梭框中左侧的备选数据
     */
    getMock() {
        const targetKeys = [];
        const mockData = [];

        var param = {
            "method":'getUserRalatedPoints',
            "userId":sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                ret.response.forEach(function (e) {
                    var currentContent = e.content;
                    var currentId = e.id;
                    var childrenArray = e.children;
                    childrenArray.forEach(function (e) {
                        var childrenId = e.id;
                        var childrenContent = e.content;
                        const data = {
                            key: childrenId,
                            title: currentContent,
                            description: childrenContent
                        };
                        mockData.push(data);
                    });

                    /*if (data.chosen) {
                        targetKeys.push(data.key);
                    }*/

                });
                createExamPager.setState({ mockData, targetKeys });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },
    //穿梭框内容改变的响应函数
    transferHandleChange(targetKeys){
        createExamPager.setState({ targetKeys });
    },

    /**
     * 关联知识点窗口中的确定按钮响应函数
     */
    bindKnowledgeForCurrentSubject(){
        //alert(createExamPager.state.targetKeys.length);
        //当前选中的要关联的知识点id，在数组中
        //获取弹窗之前点击按钮的题目信息 state中
        //清除题目信息
        //答题卡和题目信息
        var bindKnowledgeBtnInfo = createExamPager.state.bindKnowledgeBtnInfo;
        var bindKnowledgeBtnInfoArray = bindKnowledgeBtnInfo.split("#");
        var answerCardTitle =bindKnowledgeBtnInfoArray[0];
        var answerSubjectType =bindKnowledgeBtnInfoArray[3];
        var subjectNum =bindKnowledgeBtnInfoArray[1];
        var subjectJson = {answerCardTitle:answerCardTitle,answerSubjectType:answerSubjectType,subjectNum:subjectNum,points:createExamPager.state.targetKeys};
        createExamPager.refreshCardChildArray(subjectJson,"setPoints");
        createExamPager.setState({ bindKnowledgeModalVisible: false,bindKnowledgeBtnInfo:'' });
    },

    /**
     * 弹出添加解析的窗口
     */
    showAnalysisModal(e){
        var subjectInfo = e.target.value;
        createExamPager.setState({analysisModalVisible:true,addAnalysisBtnInfo:subjectInfo,analysisUrl:''});
    },

    /**
     * 添加解析文本域内容改变响应函数
     */
    analysisOnChange(e){
        createExamPager.setState({analysisContent:e.target.value});
    },
    /**
     * 添加解析窗口关闭响应函数
     */
    analysisModalHandleCancel(){
        createExamPager.setState({analysisModalVisible:false,addAnalysisBtnInfo:'',analysisUrl:''});
    },
    /**
     * 向某个题目下添加解析，并关闭窗口
     * 添加的解析包括文本解析和图片解析
     */
    addAnalysisForCurrentSubject(){
        var addAnalysisBtnInfo = createExamPager.state.addAnalysisBtnInfo;
        var addAnalysisBtnInfoArray = addAnalysisBtnInfo.split("#");
        var answerCardTitle =addAnalysisBtnInfoArray[0];
        var answerSubjectType =addAnalysisBtnInfoArray[3];
        var subjectNum =addAnalysisBtnInfoArray[1];
        var analysisContent = createExamPager.state.analysisContent;
        //图片解析的文件路径
        var analysisUrl=createExamPager.state.analysisUrl;
        var subjectJson = {answerCardTitle:answerCardTitle,answerSubjectType:answerSubjectType,subjectNum:subjectNum,textAnalysis:analysisContent,imageAnalysis:analysisUrl};
        createExamPager.refreshCardChildArray(subjectJson,"setAnalysis");
        createExamPager.setState({analysisModalVisible:false,addAnalysisBtnInfo:'',analysisUrl:''});
    },

    render() {
        return (
            <div>
                <Modal
                    visible={createExamPager.state.analysisModalVisible}
                    title="添加解析"
                    onCancel={createExamPager.analysisModalHandleCancel}
                    //className="modol_width"
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <Button type="primary" htmlType="submit" className="login-form-button" onClick={createExamPager.addAnalysisForCurrentSubject}  >确定</Button>,
                        <Button type="ghost" htmlType="reset" className="login-form-button" onClick={createExamPager.analysisModalHandleCancel} >取消</Button>
                    ]}
                >
                    <Row>
                        <Col span={3} className="right_look">文本答案：</Col>
                        <Col span={18}>
                            <Input type="textarea" rows={5} onChange={createExamPager.analysisOnChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={3} className="right_look"></Col>
                        <Col span={18}>
                            <Button type="primary" icon="plus-circle" value="analysisImg" title="上传图片解析"
                                    className="add_study add_study—a" onClick={createExamPager.showModal}>上传图片解析</Button>
                        </Col>
                    </Row>

                </Modal>
                <Modal
                    visible={createExamPager.state.bindKnowledgeModalVisible}
                    title="知识点"
                    onCancel={createExamPager.bindKnowledgeModalHandleCancel}
                    //className="modol_width"
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <Button type="primary" htmlType="submit" className="login-form-button" onClick={createExamPager.bindKnowledgeForCurrentSubject}  >确定</Button>,
                        <Button type="ghost" htmlType="reset" className="login-form-button" onClick={createExamPager.bindKnowledgeModalHandleCancel} >取消</Button>
                    ]}
                >
                    <Row>
                        <Col span={6} className="right_look">知识点：</Col>
                        <Col span={14}>
                            <Cascader
                                ref="knowledgeSelect" className="knowledge_inp"
                                options={options}
                                onChange={createExamPager.cascaderOnChange}
                                value={createExamPager.state.defaultSelected}
                                placeholder="请选择知识点"
                                showSearch
                            />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Transfer
                                dataSource={createExamPager.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 200,
                                    height: 200,
                                }}
                                operations={['to right', 'to left']}
                                targetKeys={createExamPager.state.targetKeys}
                                onChange={createExamPager.transferHandleChange}
                                render={item => `${item.description}`}
                            />
                        </Col>
                    </Row>

                </Modal>
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
                            className="add_study add_study—a" value="examPagerTitleImg" onClick={createExamPager.showModal}>上传试卷图片</Button>
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
                           onClick={createExamPager.saveExampager}>
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

