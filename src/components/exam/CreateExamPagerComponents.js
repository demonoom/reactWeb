import React, { PropTypes } from 'react';
import { Modal, message,Transfer } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox,Table,Popover,Spin,Progress } from 'antd';
import { DatePicker } from 'antd';
import { Card } from 'antd';
import { Radio } from 'antd';
import { doWebService } from '../../WebServiceHelper';
import FileUploadComponents from './FileUploadComponents';
import AntUploadComponents from './AntUploadComponents';
import AntUploadForAnalysisOfCreateComponents from './AntUploadForAnalysisOfCreateComponents';
import UploadExamPagerComponents from './UploadExamPagerComponents';
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

var createExamPager;
//答题卡数组，用来存放动态生成的答题卡Card对象
const selectAnswerOptions = [];
//答题卡数组
var cardChildArray=[];
var cardChildTagArray = [];
var uploadFileList=[];
var options=new Array();
const CreateExamPagerComponents = React.createClass({
    getInitialState() {
        createExamPager = this;
        return {
            visible: false,
            optType: 'add',
            editSchuldeId: createExamPager.props.editSchuldeId,
            checkedList: [],
            indeterminate: true,
            subjectTypeValue: '0',       //答题卡的题目类型，默认为选择题
            answerTitle:'',      //默认的答题卡题目
            answerCount:2,      //每个答题卡上默认生成的题目数量，默认2个题目
            answerScore:2,      //每题的分值，默认2分
            cardList:[],        //答题卡中选择题的选项数组
            cardChildTagArray:[],       //答题卡标签的数组
            correctAnswerValue:'',     //判断题的答案
            examPagerModalVisible:false,        //上传试卷图片的Modal窗口的状态
            spinLoading:false,      //上传试卷图片过程中的加载动画
            examPagerUrl:[],        //试卷图片的上传地址
            examPagerImgTag:[],     //试卷图片对应的img标记的数组，用来在页面上显示多个
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
            uploadImgOptSource:'examPagerTitleImg',      //图片上传的操作来源，包括试卷标题的图片上传、图片解析的上传、图片题目的上传
            addAnalysisBtnInfo:'',      //添加按钮的所属题目信息
            analysisUrl:'',      //图片解析的url路径
            currentImgAnswerInfo:'',        //当前点击图片答案按钮对应的题目信息
            imageAnswerArray:[],     //存放所有图片答案的数组（该数组会使用字符串作为内容索引）
            imageAnswerUrl:'',      //图片答案的文件路径
            analysisImgTag:'',      //图片解析的标记
            uploadPercent:0,    //文件上传进度百分比值
            analysisFileList:[], //图片解析的文件json数组
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
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("组卷成功");
                } else {
                    message.error("组卷失败");
                }
                createExamPager.props.callbackParent();
                // 回到试卷列表
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    convertUndefinedToNull(source,sourceType){
        if(typeof(source)=="undefined"){
            if(sourceType=="array"){
                return [];
            }else{
                return "";
            }
        }else{
            return source;
        }
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
        var examPagerTitle = createExamPager.convertUndefinedToNull(createExamPager.state.examPagerTitle);
        if(createExamPager.isEmpty(examPagerTitle)){
            message.warning("请输入试卷名称",5);
            return;
        }
        //上传文件的附件url
        var examPagerUrl = createExamPager.convertUndefinedToNull(createExamPager.state.examPagerUrl,"array");
        if(createExamPager.isEmpty(examPagerUrl) || examPagerUrl.length<=0){
            message.warning("请上传试卷图片",5);
            return;
        }
        //创建时间
        var createTime = (new Date()).valueOf();
        // 试卷的附件--图片
        var attachments=[];
        for(var i=0;i<examPagerUrl.length;i++){
            var pathJson = {path:examPagerUrl[i]};
            attachments.push(pathJson);
        }
        //封装试卷基本信息 *******************************
        var paperJson={title:examPagerTitle,userId:ident,createTime:createTime,attachments:attachments};
        //封装试卷的题目信息questionTypes,数据从cardChildArray中获取，包括了答题卡和题目的信息
        // ############################
        var questionTypesArray=[];
        if(createExamPager.isEmpty(cardChildArray) || cardChildArray.length<=0){
            message.warning("请设置试卷的答题卡",5);
            return;
        }
        for(var i =0;i<cardChildArray.length;i++){
            var cardChildJson = cardChildArray[i];
            //大题标题(老师自定义的)
            var title = createExamPager.convertUndefinedToNull(cardChildJson.answerTitle);
            // 大题类型
            var type = createExamPager.convertUndefinedToNull(cardChildJson.answerSubjectType);
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
                if(isNaN(score) || score==0){
                    message.warning("请以数字的形式输入"+title+"下第"+subjectDivJson.index+"题的分数",5);
                    return;
                }
                // 文字正确答案
                var textAnswer = createExamPager.convertUndefinedToNull(subjectDivJson.textAnswer);
                // 图片正确答案
                var imageAnswer = createExamPager.convertUndefinedToNull(subjectDivJson.imageAnswer);
                if(type=="0" || type=="1"){
                    if(createExamPager.isEmpty(textAnswer)){
                        message.warning("请选择/输入"+title+"下第"+subjectDivJson.index+"题的答案",5);
                        return;
                    }
                }else{
                    //填空和简答题中，文本答案和图片答案至少要有一个
                    if(createExamPager.isEmpty(textAnswer) && createExamPager.isEmpty(imageAnswer)){
                        message.warning("请选择/输入"+title+"下第"+subjectDivJson.index+"题的答案",5);
                        return;
                    }
                }
                // 冗余ExmQuestionType的类型，用于查询操作好操作
                var questionType = type;
                // 文字解析
                var textAnalysis = createExamPager.convertUndefinedToNull(subjectDivJson.textAnalysis);
                // 图片解析
                var imageAnalysis= createExamPager.convertUndefinedToNull(subjectDivJson.imageAnalysis);
                // 所属知识点
                var points = createExamPager.convertUndefinedToNull(subjectDivJson.points,"array");
                var questionsJson = {score:score,title:questionTitle,textAnswer:textAnswer,imageAnswer:imageAnswer,type:questionType,textAnalysis:textAnalysis,imageAnalysis:imageAnalysis,points:points};
                questions.push(questionsJson);
            }
            //将所有的题目进行封装
            questionTypes.questions=questions;
            questionTypesArray.push(questionTypes);
        }
        paperJson.questionTypes = questionTypesArray;
        console.log(paperJson);
        cardChildArray.splice(0);
        createExamPager.createExamPager(paperJson);
    },

    isEmpty(content){
        if (content == null || content == "null" || content == "" || typeof(content) == "undefined") {
            return true;
        } else {
            return false;
        }
    },

    /**
     * 取消组卷操作，返回试卷列表
     * @param e
     */
    handleCancel(e) {
        createExamPager.props.callbackParent();
    },

    /**
     * 在答题卡中的答案、分值等改变时，在题目的json对象中，增加对应的答案和分值等信息
     * 该函数会在每个答题卡元素的事件响应函数中进行调用
     * @param subjectJson 需要更新的题目信息,包括题型、所属答题卡等信息
     * @param optType 操作方式，即更新的是答案、分值、关联的知识点等
     */
    refreshCardChildArray(subjectJson,optType){
        for(var i =0;i<cardChildArray.length;i++){
            var cardChildJson = cardChildArray[i];
            //找到对应的答题卡
            if(subjectJson.answerCardTitle == cardChildJson.answerTitle && subjectJson.answerSubjectType == cardChildJson.answerSubjectType){
                //找到对应的题目编号
                for(var j=0;j<cardChildJson.cardSubjectAnswerArray.length;j++){
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
                            var pointJsonArray = [];
                            for(var i=0;i<subjectJson.points.length;i++){
                                var id= subjectJson.points[i];
                                var pointJson = {"id":id};
                                pointJsonArray.push(pointJson);
                            }
                            subjectDivJson.points=pointJsonArray;
                        }else if(optType=="setAnalysis"){
                            //设置解析内容，包括文字解析和图片解析
                            subjectDivJson.textAnalysis = subjectJson.textAnalysis;
                            subjectDivJson.imageAnalysis = subjectJson.imageAnalysis;
                        }else if(optType=="setImageAnswer"){
                            //设置题目的图片答案
                            subjectDivJson.imageAnswer=subjectJson.imageAnswer;
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
                for(var i=0;i<cardChildArray.length;i++){
                    var cardChildJson = cardChildArray[i];
                    var cartTitleInJson = cardChildJson.answerTitle;
                    //题目类型
                    var answerSubjectType = cardChildJson.answerSubjectType;
                    if(deleteAnswerTitle == cartTitleInJson){
                        //已经找到对应的答题卡，接下来需要在答题卡的题目数组中再找出对应的题目编号
                        var cardSubjectAnswerArray = cardChildJson.cardSubjectAnswerArray;
                        if(cardSubjectAnswerArray.length==1){
                            //如果删除的题目所属的答题卡中只剩下最后一道题，则直接删除当前的答题卡
                            cardChildArray.splice(i,1);
                        }else{
                            //答题卡中存在多道题时，删除选定题目
                            for(var j = 0;j<cardSubjectAnswerArray.length;j++){
                                var cardSubjectJson = cardSubjectAnswerArray[j];
                                if(cardSubjectJson.index == deleteSubjectNum){
                                    cardSubjectJson.divContent="";
                                    cardSubjectAnswerArray.splice(j,1);
                                    //createExamPager.refreshSubjectIndexNo(deleteSubjectNum,deleteAnswerTitle,answerSubjectType);
                                    cardChildJson.answerCount = cardChildJson.answerCount-1;
                                    message.success("题目删除成功");
                                    break;
                                }
                            }
                            /*for(var j = 0;j<cardSubjectAnswerArray.length;j++){
                                var cardSubjectJson = cardSubjectAnswerArray[j];
                                if(cardSubjectJson.index > deleteSubjectNum){
                                    cardSubjectJson.index=cardSubjectJson.index-1;
                                }
                            }*/
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
                        if(answerSubjectType=="0"){
                            subjectDiv = createExamPager.buildChoiceSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="1"){
                            subjectDiv = createExamPager.buildCorrectSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="2"){
                            subjectDiv = createExamPager.buildFillBlankSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="3"){
                            subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(cardSubjectJson.index,answerTitle,answerSubjectType);
                        }
                        var subjectDivJson = {"index":cardSubjectJson.index,"divContent":subjectDiv,"score":cardSubjectJson.answerScore};
                    }else{
                        var subjectDiv;
                        if(answerSubjectType=="0"){
                            subjectDiv = createExamPager.buildChoiceSubjectDivContent(j,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="1"){
                            subjectDiv = createExamPager.buildCorrectSubjectDivContent(j,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="2"){
                            subjectDiv = createExamPager.buildFillBlankSubjectDivContent(j,answerTitle,answerSubjectType);
                        }else if(answerSubjectType=="3"){
                            subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(j,answerTitle,answerSubjectType);
                        }
                        var subjectDivJson = {"index":j,"divContent":subjectDiv,"score":cardSubjectJson.answerScore};
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
        selectAnswerOptions.splice(0);
        for (var i = 0; i < 100; i++) {
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
        var subjectDiv =<div key={num} data-key={num} className="topic_bor">
            <Row className="ant-form-item">
                <Col span={3} className="right_upexam"><span className="upexam_number">{num}</span>答案：</Col>
                <Col span={18} className="upexam_le_te">
                    <CheckboxGroup options={selectAnswerOptions[num-1]} onChange={createExamPager.subjectAnswerOnChange} />
                </Col>
                <div className="topic_del_ri">
                    <button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv} className="btn_gray_exam examination_btn_gray">															                        <i className="iconfont btn_gray_exam_del">&#xe62f;</i>
                    </button>
                </div>
            </Row>
            <Row className="ant-form-item">
                <Col span={3}  className="right_upexam">分值：</Col>
                <Col span={12}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row className="ant-form-item topic_bor_pa">
                <Col span={3}></Col>
                <Col span={18} className="upexam_le_te">
                    <button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal} className="examination_btn_gray">
                        所属知识点
                    </button>
					<button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
                        解析
                    </button>
                </Col>
               
            </Row>

        </div>;
        return subjectDiv;
    },

    /**
     * 创建答题卡中判断题的题目div
     */
    buildCorrectSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        var subjectDiv =<div key={num} data-key={num} className="topic_bor">
            <Row className="ant-form-item">
                <Col span={3} className="right_upexam"><span className="upexam_number">{num}</span>答案：</Col>
                <Col span={18} className="upexam_le_te">
                    <RadioGroup key={answerTitle+"#"+num+"#radio#"+answerSubjectType} onChange={createExamPager.correctAnswerOnChange}
                     defaultValue={createExamPager.state.correctAnswerValue}>
                        <Radio value={answerTitle+"#"+num+"#1#"+answerSubjectType}>正确</Radio>
                        <Radio value={answerTitle+"#"+num+"#0#"+answerSubjectType}>错误</Radio>
                    </RadioGroup>
                </Col>
                <div className="topic_del_ri">
                    <button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv} className="btn_gray_exam examination_btn_gray">															                        <i className="iconfont btn_gray_exam_del">&#xe62f;</i>
                    </button>
                </div>
            </Row>
            <Row className="ant-form-item">
                <Col span={3} className="right_upexam">分值：</Col>
                <Col span={12}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row className="ant-form-item topic_bor_pa">
                <Col span={3}></Col>
                <Col span={18} className="upexam_le_te">
                    <button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal} className="examination_btn_gray">
                        所属知识点
                    </button>
					<button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
                        解析
                    </button>
                </Col>
                
            </Row>
           
        </div>;
        return subjectDiv;
    },

    /**
     * 创建答题卡中填空题的题目div
     */
    buildFillBlankSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        var subjectDiv =<div key={num} data-key={num} className="topic_bor">
            <Row className="ant-form-item">
                <Col span={3} className="right_upexam"><span className="upexam_number">{num}</span>答案：</Col>
                <Col span={18}>
                    <Input  id={answerTitle+"#"+num+"#blank#"+answerSubjectType} type="textarea" rows={2} onChange={createExamPager.blankOnChange}/>
                </Col>
                <div className="topic_del_ri">
                    <button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv} className="btn_gray_exam examination_btn_gray">															                        <i className="iconfont btn_gray_exam_del">&#xe62f;</i>
                    </button>
                </div>
            </Row>
            <Row className="ant-form-item">
                <Col span={3} >图片答案：</Col>
                <Col span={12} className="upexam_le_te">
                    <AntUploadComponents key={answerTitle+"#"+num+"#imageAnswer#"+answerSubjectType} params={answerTitle+"#"+num+"#imageAnswer#"+answerSubjectType} callBackParent={createExamPager.getImgAnswerList}></AntUploadComponents>
                </Col>
            </Row>
            <Row className="ant-form-item">
                <Col span={3}>分值：</Col>
                <Col span={12}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row className="ant-form-item topic_bor_pa">
                <Col span={3}></Col>
                <Col span={18} className="upexam_le_te">
                    <button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal} >
                        所属知识点
                    </button>
					<button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
                        解析
                    </button>
                </Col>
            </Row>
        </div>;
        return subjectDiv;
    },

    /**
     * 创建答题卡中简答题的题目div
     */
    buildSimpleAnswerSubjectDivContent(num,answerTitle,answerSubjectType,answerScore){
        var subjectDiv =<div key={num} data-key={num} className="topic_bor">
            <Row className="ant-form-item">
                <Col span={3} className="right_upexam"><span className="upexam_number">{num}</span>答案：</Col>
                <Col span={18}>
                    <Input  id={answerTitle+"#"+num+"#simpleAnswer#"+answerSubjectType} type="textarea" rows={5} onChange={createExamPager.blankOnChange}/>
                </Col>
                <div className="topic_del_ri">
                    <button key={answerTitle+"#"+num+"delBtn"} value={answerTitle+"#"+num} onClick={createExamPager.deleteSubjectContentDiv} className="btn_gray_exam examination_btn_gray">															                        <i className="iconfont btn_gray_exam_del">&#xe62f;</i>
                    </button>
                </div>
            </Row>
            <Row className="ant-form-item">
                <Col span={3} >图片答案：</Col>
                <Col span={12} className="upexam_le_te">
                    <AntUploadComponents key={answerTitle+"#"+num+"#imageAnswer#"+answerSubjectType} params={answerTitle+"#"+num+"#imageAnswer#"+answerSubjectType} callBackParent={createExamPager.getImgAnswerList}></AntUploadComponents>
                </Col>
            </Row>
            <Row className="ant-form-item">
                <Col span={3}>分值：</Col>
                <Col span={12}>
                    <Input id={answerTitle+"#"+num+"#input#"+answerSubjectType} defaultValue={answerScore} onChange={createExamPager.subjectScoreOnChange}/>
                </Col>
            </Row>
            <Row className="ant-form-item topic_bor_pa">
                <Col span={3}></Col>
                <Col span={18} className="upexam_le_te">
                    <button value={answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType}  onClick={createExamPager.showBindKnowledgeModal}>
                        所属知识点
                    </button>
					<button value={answerTitle+"#"+num+"#analysis#"+answerSubjectType}  onClick={createExamPager.showAnalysisModal}>
                        解析
                    </button>
                </Col>
                <Col span={13}>
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
        //当前题目的单选选项（正确/错误）
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
            // className="topic_del_ri"
            return <Card key={e.answerTitle+"#"+e.answerSubjectType} title={e.answerTitle} className="upexam_topic" extra={<button title={e.answerTitle} value={e.answerTitle+"#"+e.answerSubjectType} icon="delete" onClick={createExamPager.deleteAnswerCard} className="btn_gray_exam examination_btn_gray">															                        <i className="iconfont btn_gray_exam_del">&#xe62f;</i></button>} style={{width: 650}}>
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
        var answerCardType=answerSubjectType;
        //考题的数组
        for(var i=1;i<=answerCount;i++){
            // 小题的标题(方式是 大题标题加上小题位置作为小题的标题)
            var subjectTitle = answerTitle+i;
            var subjectJson={score:answerScore,title:subjectTitle,textAnswer:'',imageAnswer:'',type:answerCardType,textAnalysis:'',imageAnalysis:'',points:[]};
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
        //试卷名称
        /*var examPagerTitle = createExamPager.convertUndefinedToNull(createExamPager.state.examPagerTitle);
        if(createExamPager.isEmpty(examPagerTitle)){
            message.warning("请输入试卷名称",5);
            return;
        }
        //上传文件的附件url
        var examPagerUrl = createExamPager.convertUndefinedToNull(createExamPager.state.examPagerUrl,"array");
        if(createExamPager.isEmpty(examPagerUrl) || examPagerUrl.length<=0){
            message.warning("请上传试卷图片",5);
            return;
        }*/
        //答题卡标题
        var answerTitle = createExamPager.state.answerTitle;
        if(createExamPager.isEmpty(answerTitle)){
            message.warning("请输入答题卡标题",5);
            return;
        }
        //答题卡中的题目类型
        var answerSubjectType = createExamPager.state.subjectTypeValue;
        //答题卡中的题目数量
        var answerCount = parseInt(createExamPager.state.answerCount);
        if(isNaN(answerCount) || answerCount<=0){
            message.warning("请以数字的形式输入题目数量",5);
            return;
        }
        var answerScore = parseInt(createExamPager.state.answerScore);
        if(isNaN(answerScore) || answerScore<=0){
            message.warning("请以数字的形式输入题目分值",5);
            return;
        }
        var checkResult = createExamPager.checkCardTitleIsExist(answerTitle,answerSubjectType);
        if(checkResult==false){
            //答题卡中不存在当前要添加的答题卡title
            //答题卡中的题目编号数组
            var cardSubjectAnswerArray=[];
            for(var i=1;i<=answerCount;i++){
                var subjectDiv;
                if(answerSubjectType=="0"){
                    subjectDiv = createExamPager.buildChoiceSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="1"){
                    subjectDiv = createExamPager.buildCorrectSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="2"){
                    subjectDiv = createExamPager.buildFillBlankSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="3"){
                    subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }

                var subjectDivJson = {"index":i,"divContent":subjectDiv,"score":answerScore};
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
                if(answerSubjectType=="0"){
                    subjectDiv = createExamPager.buildChoiceSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="1"){
                    subjectDiv = createExamPager.buildCorrectSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="2"){
                    subjectDiv = createExamPager.buildFillBlankSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }else if(answerSubjectType=="3"){
                    subjectDiv = createExamPager.buildSimpleAnswerSubjectDivContent(i,answerTitle,answerSubjectType,answerScore);
                }
                var subjectDivJson = {"index":i,"divContent":subjectDiv,"score":answerScore};
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
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var source = target.value;
        var sourceArray = source.split("#");
        if(sourceArray.length>1){
            var currentImgAnswerInfo = source;
            createExamPager.setState({"currentImgAnswerInfo":currentImgAnswerInfo});
            source = sourceArray[2];
        }
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

    onprogress(ev){
        if(ev.lengthComputable){
            var precent=100 * ev.loaded/ev.total;
            console.log(precent);
        }
    },

    /**
     * 点击保存按钮，文件上传
     */
    uploadFile(){
        if(uploadFileList.length==0){
            message.warning("请选择上传的文件,谢谢！");
        }else{
            for(var i=0;i<uploadFileList.length;i++){
                var formData = new FormData();
                formData.append("file",uploadFileList[i]);
                formData.append("name",uploadFileList[i].name);
                createExamPager.setState({spinLoading:true});
                $.ajax({
                    type: "POST",
                    url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
                    enctype: 'multipart/form-data',
                    data: formData,
                    // 告诉jQuery不要去处理发送的数据
                    processData : false,
                    // 告诉jQuery不要去设置Content-Type请求头(没有该选项，服务器会返回http code  417，无法完成上传操作)
                    contentType : false,
                    xhr: function(){        //这是关键  获取原生的xhr对象  做以前做的所有事情
                        var xhr = jQuery.ajaxSettings.xhr();
                        xhr.upload.onload = function (){
                            // alert('finish downloading')
                        }
                        xhr.upload.onprogress = function (ev) {
                            if(ev.lengthComputable) {
                                var percent = 100 * ev.loaded/ev.total;
                                console.log(percent+"%",ev);
                            }
                        }
                        return xhr;
                    },
                    success: function (responseStr) {
                        if(responseStr!=""){
                            var fileUrl=responseStr;
                            //上传的操作来源
                            var optSource = createExamPager.state.uploadImgOptSource;
                            if(optSource=="analysisImg"){
                                //图片解析操作来源
                                createExamPager.setState({ examPagerModalVisible: false,spinLoading:false,analysisUrl:fileUrl });
                                // 上传成功后，直接设置到对应的题目上
                                var subjectJson = {"answerCardTitle":answerTitle,"answerSubjectType":answerSubjectType,"subjectNum":num,imageAnswer:fileUrl};
                                createExamPager.refreshCardChildArray(subjectJson,"setImageAnswer");
                                var analysisImgTag = <img src={fileUrl} style={{width:'400px',height:'200px'}}></img>;
                                createExamPager.setState({"analysisImgTag":analysisImgTag});
                            }else if(optSource=="examPagerTitleImg"){
                                //试卷标题图片来源
                                createExamPager.state.examPagerUrl.push(fileUrl);
                                var imgTag = <img src={fileUrl} style={{width:'100px',height:'100px'}}></img>;
                                createExamPager.state.examPagerImgTag.push(imgTag);
                                createExamPager.setState({ examPagerModalVisible: false,spinLoading:false});
                            }else if(optSource=="imageAnswer"){
                                //题目图片答案的图片来源
                                var currentImgAnswerInfo = createExamPager.state.currentImgAnswerInfo;
                                var currentImgAnswerInfoArray = currentImgAnswerInfo.split("#");
                                // answerTitle+"#"+num+"#knowledgePoint#"+answerSubjectType+"#imageAnswer"
                                var answerTitle=currentImgAnswerInfoArray[0];
                                var num = currentImgAnswerInfoArray[1];
                                var answerSubjectType = currentImgAnswerInfoArray[3];
                                createExamPager.setState({"imageAnswerUrl":fileUrl});
                                createExamPager.state.imageAnswerArray[currentImgAnswerInfo]=fileUrl;
                                console.log("image url:"+createExamPager.state.imageAnswerArray[currentImgAnswerInfo]);
                                // 上传成功后，直接设置到对应的题目上
                                var subjectJson = {"answerCardTitle":answerTitle,"answerSubjectType":answerSubjectType,"subjectNum":num,imageAnswer:fileUrl};
                                createExamPager.refreshCardChildArray(subjectJson,"setImageAnswer");
                                // 操作完成成，清空当前的题目信息
                                createExamPager.setState({ currentImgAnswerInfo: '',imageAnswer:fileUrl,examPagerModalVisible: false,spinLoading:false});
                            }
                        }
                    },
                    error : function(responseStr) {
                        console.log("error"+responseStr);
                        createExamPager.setState({ examPagerModalVisible: false,spinLoading:false });
                    }
                });
            }
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
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var subjectInfo = target.value;
        //题目信息
        var subjectInfoWithSelected = createExamPager.getCurrentSubjectInfo(subjectInfo);
        //选中的知识点信息
        var pointsArrayWithSelected=[];
        if(createExamPager.isEmpty(subjectInfoWithSelected.points)==false && subjectInfoWithSelected.points.length>0){
            for(var i=0;i<subjectInfoWithSelected.points.length;i++){
                var pointObj = subjectInfoWithSelected.points[i];
                pointsArrayWithSelected.push(pointObj.id);
            }
        }
        //获取所有的知识点数据，作为弹窗的下拉列表数据
        createExamPager.getLessonMenu();
        //获取当前老师已绑定知识点，作为穿梭框备选数据
        createExamPager.getMock(pointsArrayWithSelected);
        createExamPager.setState({bindKnowledgeBtnInfo:e.target.value,bindKnowledgeModalVisible: true,defaultSelected:[]});
    },
    /**
     * 获取当前图片已选定或输入的信息
     * @param subjectInfo
     * @returns {*}
     */
    getCurrentSubjectInfo(subjectInfo){
        var subjectInfoArray = subjectInfo.split("#");
        var answerTitle =subjectInfoArray[0];
        var num =subjectInfoArray[1];
        var answerSubjectType = subjectInfoArray[3];

        for(var i =0;i<cardChildArray.length;i++){
            var cardChildJson = cardChildArray[i];
            //找到对应的答题卡
            if(answerTitle == cardChildJson.answerTitle && answerSubjectType == cardChildJson.answerSubjectType){
                //找到对应的题目编号
                for(var j=0;j<cardChildJson.cardSubjectAnswerArray.length;j++){
                    var subjectDivJson = cardChildJson.cardSubjectAnswerArray[j];
                    if(num == subjectDivJson.index){
                        return subjectDivJson;
                    }
                }
            }
        }
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
    getMock(pointsArrayWithSelected) {
        const targetKeys = pointsArrayWithSelected;
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
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var subjectInfo = target.value;
        //题目信息
        var subjectInfoWithSelected = createExamPager.getCurrentSubjectInfo(subjectInfo);
        var analysisContent = createExamPager.convertUndefinedToNull(subjectInfoWithSelected.textAnalysis);
        var imageAnalysis = createExamPager.convertUndefinedToNull(subjectInfoWithSelected.imageAnalysis);
        var analysisImgTag="";
        createExamPager.state.analysisFileList.splice(0);
        if(createExamPager.isEmpty(imageAnalysis) == false){
            var fileJson = {uid:subjectInfoWithSelected.index,url:imageAnalysis,thumbUrl:imageAnalysis,status:'done'};
            createExamPager.state.analysisFileList.push(fileJson);
        }
        createExamPager.setState({analysisModalVisible:true,"analysisContent":analysisContent,addAnalysisBtnInfo:subjectInfo,"analysisUrl":imageAnalysis,"analysisImgTag":analysisImgTag});
    },

    /**
     * 添加解析文本域内容改变响应函数
     */
    analysisOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var analysisContent = target.value;
        createExamPager.setState({"analysisContent":analysisContent});
    },
    /**
     * 添加解析窗口关闭响应函数
     */
    analysisModalHandleCancel(){
        createExamPager.setState({analysisModalVisible:false,addAnalysisBtnInfo:'',"analysisContent":'',"analysisUrl":''});
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
        createExamPager.setState({analysisModalVisible:false,addAnalysisBtnInfo:'',"analysisContent":'',"analysisUrl":''});
    },
    /**
     * 获取试卷标题图片的文件路径列表
     */
    getExamPagerTitleImgList(file,isRemoved){
        var examPagerUrl = file.response;
        if(createExamPager.isEmpty(isRemoved)==false && isRemoved=="removed"){
            for(var i=0;i<createExamPager.state.examPagerUrl.length;i++){
                if(createExamPager.state.examPagerUrl[i] == examPagerUrl){
                    createExamPager.state.examPagerUrl.splice(i,1);
                }
            }
        }else{
            createExamPager.state.examPagerUrl.push(examPagerUrl);
        }
    },
    /**
     * 获取图片解析的url路径
     */
    getAnalysisiImgList(file,subjectInfo,isRemoved){
        var analysisUrl = file.response;
        if(createExamPager.isEmpty(isRemoved)==false && isRemoved=="removed"){
            analysisUrl = "";
        }
        createExamPager.setState({"analysisUrl":analysisUrl});
    },
    /**
     * 获取题目的图片答案
     */
    getImgAnswerList(file,subjectInfo,isRemoved){
        var fileUrl = file.response;
        console.log("getImgAnswerList===>"+subjectInfo);
        if(createExamPager.isEmpty(isRemoved)==false && isRemoved=="removed"){
            fileUrl = "";
        }
        //题目图片答案的图片来源
        var currentImgAnswerInfoArray = subjectInfo.split("#");
        var answerTitle=currentImgAnswerInfoArray[0];
        var num = currentImgAnswerInfoArray[1];
        var answerSubjectType = currentImgAnswerInfoArray[3];
        console.log("imageAnswerUrl URl："+fileUrl);
        createExamPager.setState({"imageAnswerUrl":fileUrl});
        createExamPager.state.imageAnswerArray[subjectInfo]=fileUrl;
        // 上传成功后，直接设置到对应的题目上
        var subjectJson = {"answerCardTitle":answerTitle,"answerSubjectType":answerSubjectType,"subjectNum":num,imageAnswer:fileUrl};
        createExamPager.refreshCardChildArray(subjectJson,"setImageAnswer");
        // 操作完成成，清空当前的题目信息
        createExamPager.setState({ currentImgAnswerInfo: '',imageAnswer:fileUrl,examPagerModalVisible: false,spinLoading:false});
    },
    render() {
        return (
            <div>
                <Modal
                    visible={createExamPager.state.analysisModalVisible}
                    title="添加解析"
                    onCancel={createExamPager.analysisModalHandleCancel}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue" onClick={createExamPager.addAnalysisForCurrentSubject}  >确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white" onClick={createExamPager.analysisModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <Col span={4} className="right_look">文本解析：</Col>
                        <Col span={18}>
                            <Input type="textarea" value={createExamPager.state.analysisContent} defaultValue={createExamPager.state.analysisContent} rows={5} onChange={createExamPager.analysisOnChange}/>
                        </Col>
                    </Row>
                    <Row className="ant-form-item">
                        <Col span={4} className="right_look">图片解析：</Col>
                        <Col span={18}>
                            {/*<AntUploadComponentsForUpdate className="add_study-b" id={answerTitle+"#"+num+"#imageAnswer#"+answerSubjectType}  fileList={imageAnswerFileArray} params={answerTitle+"#"+num+"#imageAnswer#"+answerSubjectType} callBackParent={createExamPager.getImgAnswerList}></AntUploadComponentsForUpdate>*/}
                            <AntUploadForAnalysisOfCreateComponents fileList={createExamPager.state.analysisUrl} callBackParent={createExamPager.getAnalysisiImgList}></AntUploadForAnalysisOfCreateComponents>
                        </Col>
                    </Row>

                </Modal>
                <Modal className="knowledge_span_wi"
                    visible={createExamPager.state.bindKnowledgeModalVisible}
                    title="知识点"
                    onCancel={createExamPager.bindKnowledgeModalHandleCancel}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue" onClick={createExamPager.bindKnowledgeForCurrentSubject}  >确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white" onClick={createExamPager.bindKnowledgeModalHandleCancel} >取消</button>
                    ]}
                >
                    <div className="ant-form-item">
                       <span>知识点：</span>
                        <span>
                            <Cascader
                                ref="knowledgeSelect" className="knowledge_inp"
                                options={options}
                                onChange={createExamPager.cascaderOnChange}
                                value={createExamPager.state.defaultSelected}
                                placeholder="请选择知识点"
                                showSearch
                            />
                        </span>
                    </div>
                    <div className="ant-form-item">
                        <div span={24}>
                            <Transfer
                                dataSource={createExamPager.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 325,
                                }}
                                titles={['待选知识点','已选知识点']}
                                operations={['', '']}
                                targetKeys={createExamPager.state.targetKeys}
                                onChange={createExamPager.transferHandleChange}
                                render={item => `${item.title} - ${item.description}`}
                            />
                        </div>
                    </div>

                </Modal>
                <div className="ant-collapse ant-modal-footer homework">
                    <Row className="ant-form-item">
                        <Col span={3}  className="right_upexam">
                            <span className="date_tr text_30">试卷名称：</span>
                        </Col>
                        <Col span={18} className="ant-form-item-control">
                <span className="date_tr">
                    <Input ref="examPagerTitle" placeholder="请输入试卷名称" onChange={createExamPager.examPagerTitleChange}/>
                </span>
                        </Col>
                    </Row>

                    <Row className="ant-form-item">
                        <Col span={3} className="right_upexam">
                            <span className="text_30">试卷图片：</span>
                        </Col>
                        <Col span={18}>
                        <span className="date_tr text_30 upexam_float">
                            <UploadExamPagerComponents key="examPagerTitleUpload" callBackParent={createExamPager.getExamPagerTitleImgList}></UploadExamPagerComponents>
                            <Modal
                                visible={createExamPager.state.examPagerModalVisible}
                                title="上传图片"
                                className="modol_width"
                                onCancel={createExamPager.examPagerModalHandleCancel}
                                transitionName=""  //禁用modal的动画效果
                                maskClosable={false} //设置不允许点击蒙层关闭
                                footer={[
                                    <div>
                                        <button type="primary" className="login-form-button examination_btn_blue" onClick={createExamPager.uploadFile}>
                                            保存
                                        </button>
                                        <button type="ghost" className="login-form-button examination_btn_white" onClick={createExamPager.examPagerModalHandleCancel}>
                                            取消
                                        </button>
                                    </div>
                                ]}
                            >
                                    <Row>
                                        <Col span={4}>上传文件：</Col>
                                        <Col span={20}>
                                            <div>
                                                <FileUploadComponents ref="fileUploadCom" fatherState={createExamPager.state.examPagerModalVisible} callBackParent={createExamPager.handleFileSubmit}/>
                                            </div>
                                            <Progress percent={createExamPager.state.uploadPercent} width={80} strokeWidth={4} />
                                        </Col>
                                    </Row>
                            </Modal>
                        </span>
                        </Col>
                    </Row>

                    <Row className="date_tr ant-form-item upexam_Set">
                        <Col span={15} className="ant-form-item-label upexam_le_datika">
                            <span className="text_30">设置答题卡：</span>
                        </Col>
                    </Row>
                                <Row className="ant-form-item">
                                    <Col span={3} className="right_upexam">
                                        <span className="text_30">标题：</span>
                                    </Col>
                                    <Col span={18}>
                                        <Input ref="answerTitle" defaultValue={createExamPager.state.answerTitle} placeholder="请输入答题卡标题" onChange={createExamPager.answerTitleOnChange}/>
                                    </Col>
                                </Row>

                                <Row className="ant-form-item">
                                    <Col span={3} className="right_upexam">
                                        <span className="text_30">题型：</span>
                                    </Col>
                                    <Col span={21} className="ant-form-item-control">
                                        <RadioGroup onChange={createExamPager.subjectTypeOnChange}
                                                    value={createExamPager.state.subjectTypeValue}>
                                            <Radio value="0">选择</Radio>
                                            <Radio value="1">判断</Radio>
                                            <Radio value="2">填空</Radio>
                                            <Radio value="3">简答</Radio>
                                        </RadioGroup>
                                    </Col>
                                </Row>

                                <Row className="ant-form-item">
                                    <Col span={3} className="right_upexam">
                                        <span className="text_30">题数：</span>
                                    </Col>
                                    <Col span={3}>
                                        <Input ref="answerCount" defaultValue={createExamPager.state.answerCount} onChange={createExamPager.answerCountOnChange}/>
                                    </Col>
                                    <Col span={1}>
                                        <span className="text_30"></span>
                                    </Col>
                                    <Col span={2}>
                                        <span className="text_30">分值：</span>
                                    </Col>
                                    <Col span={3}>
                                        <Input ref="answerScore" defaultValue={2} onChange={createExamPager.answerScoreOnChange}/>
                                    </Col>
                                </Row>
                    <Row className="date_tr ant-form-item">
                        <Col span={3}>
                            <span className="text_30"></span>
                        </Col>
                        <Col span={12}>
                            <button type="primary" className="login-form-button class_right examination_btn_blue"
                                    onClick={createExamPager.addAnswerCard}>
                                添加题目
                            </button>
                            <button type="ghost" className="login-form-button examination_btn_white" onClick={createExamPager.deleteAllCardChild}>
                                清除全部
                            </button>
                        </Col>
                    </Row>
                    <Row className="date_tr ant-form-item">
                        {createExamPager.state.cardChildTagArray}
                    </Row>
                </div>

                <Row className="homework_out ant-modal-footer">
                    <Col span={24}>
                 <span>
                   <button type="primary" className="login-form-button class_right examination_btn_blue"
                           onClick={createExamPager.saveExampager}>
                    保存
                   </button>
                   <button type="ghost" className="login-form-button examination_btn_white" onClick={createExamPager.handleCancel}>
                    取消
                   </button>
                 </span>
                    </Col>
                </Row>
            </div>
        );
    },
});
export  default CreateExamPagerComponents;

