import React, { PropTypes } from 'react';
import { Modal, Button,message } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox,Table,Popover } from 'antd';
import { DatePicker } from 'antd';
import { Card } from 'antd';
import { Radio } from 'antd';
import { doWebService } from '../../WebServiceHelper';
const { MonthPicker, RangePicker } = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

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
var cardTagArray = [];
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
            subjectTypeValue: 'selectAnswer',
            answerTitle:'选择题',
            answerCount:2,
            answerScore:2,
            subjectCount:0,
            cardList:[],//答题卡中选择题的选项数组
            cardChildTagArray:[]
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

    handleSubmit(e) {
        e.preventDefault();
        var ident = sessionStorage.getItem("ident");
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
    checkCardTitleIsExist(answerTitle){
        var isExist = false;
        var answerTitleInCardChildJson;
        cardChildArray.map(function(item,i){
            answerTitleInCardChildJson = item;
            if(answerTitleInCardChildJson.answerTitle == answerTitle){
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
    answerInCardOnChange(checkedValues) {
        console.log('checked = ', checkedValues);
    },

    /**
     * 删除选中的题目
     * 注意编号要重新生成
     */
    deleteSubjectContentDiv(e){
        alert("deleteSubjectContentDiv");
        // var selectedKey = e.target.key;
        // alert("selectedKey:"+selectedKey);
    },

    /**
     * 删除答题卡时的响应函数
     */
    deleteAnswerCard(e){
        var deleteCardTitle = e.target.value;
        alert("删除选定答题卡"+deleteCardTitle);
        for(var i=0;i<cardChildArray.length;i++){
            var cardChildJson = cardChildArray[i];
            var cartTitleInJson = cardChildJson.answerTitle;
            if(deleteCardTitle == cartTitleInJson){
                cardChildArray.splice(i,1);
                break;
            }
        }
        this.buildCardChildArray();
    },

    /**
     * 答题卡中的题目分值改变时的响应函数
     */
    subjectScoreOnChange(){
        alert("subjectScoreOnChange");
    },

    /**
     * 创建答题卡中的题目div
     */
    buildSubjectDivContent(index,answerTitle){
        var subjectDiv =<div>
            <Row>
                <Col span={1}>{index}.</Col>
            </Row>
            <Row>
                <Col span={3}>答案：</Col>
                <Col span={12}>
                    <CheckboxGroup options={selectAnswerOptions} defaultValue={['A']} onChange={createExamPager.answerInCardOnChange}/>
                </Col>
            </Row>
            <Row>
                <Col span={3}>分值：</Col>
                <Col span={5}>
                    <Input onChange={createExamPager.subjectScoreOnChange}/>
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
                    <Button  onClick={createExamPager.deleteSubjectContentDiv}>
                        删除
                    </Button>
                </Col>
            </Row>
        </div>;
        return subjectDiv;
    },
    /**
     * 创建Card组件的标记，最终在页面上显示cardChildTagArray中的内容
     */
    buildCardChildArray(){
        cardChildTagArray = cardChildArray.map((e, i)=> {
            var subjectArray=e.cardSubjectAnswerArray;
            return <Card key={e.answerTitle} title={e.answerTitle} extra={<Button title={e.answerTitle} value={e.answerTitle} icon="delete" onClick={createExamPager.deleteAnswerCard}>删除</Button>} style={{width: 650}}>
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
        var checkResult = createExamPager.checkCardTitleIsExist(answerTitle);
        if(checkResult==false){
            //答题卡中不存在当前要添加的答题卡title
            //答题卡中的题目编号数组
            var cardSubjectAnswerArray=[];
            for(var i=1;i<=answerCount;i++){
                var subjectDiv = createExamPager.buildSubjectDivContent(i,answerTitle);
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
                var subjectDiv = createExamPager.buildSubjectDivContent(i,answerTitle);
                var subjectDivJson = {"index":i,"divContent":subjectDiv};
                cardSubjectAnswerArray.push(subjectDivJson);
            }
            cardChildJsonWithExist.cardSubjectAnswerArray = cardSubjectAnswerArray;
        }
        createExamPager.buildCardChildArray();
        // var newCount = createExamPager.state.subjectCount+1;
        // createExamPager.setState({subjectCount:newCount});
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
                    <Input ref="examPagerTitle" placeholder="请输入试卷名称"/>
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
                            className="add_study add_study—a">上传试卷图片</Button>
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
                            <Button type="ghost" htmlType="reset" className="login-form-button">
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

