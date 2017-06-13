import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message,Steps,Icon,Progress,Modal,Collapse,Row,Col,Card} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {getLocalTime} from '../../utils/utils';
import {showLargeImg} from '../../utils/utils';
const Step = Steps.Step;
const Panel = Collapse.Panel;

var examsArray=[];
var TimeLineItemArray=[];
const TestQuestionStatisticsComponents = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
            tipModalVisible:false,
        };
    },

    componentDidMount(){
        var _this = this;
        _this.getExmQuestionStatistics();
    },

    /**
     * 获取本次考试分数排名列表
     */
    getExmQuestionStatistics(){
        var _this = this;
        var param = {
            "method": 'getExmQuestionStatistics',
            "exmId": _this.props.exmId,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    var paper = response.paper;
                    var questionTypes = paper.questionTypes;
                    var paperTitle = paper.title;
                    var createTime = getLocalTime(paper.createTime);
                    var mainCardArray=[];
                    questionTypes.forEach(function (questionType) {
                        var type = questionType.type;
                        var cardArray=[];
                        var cardTitle;
                        switch (type){
                            case 0:
                                cardTitle="选择";
                                break;
                            case 1:
                                cardTitle="判断";
                                break;
                            case 2:
                                cardTitle="填空";
                                break;
                            case 3:
                                cardTitle="简答";
                                break;
                        }
                        var statistics = response.statistics;

                        var index=1;
                        for(var i=0;i<statistics.length;i++){
                            var e = statistics[i];
                            var question = e.question;
                            var questionType = question.type;
                            if(questionType!=type){
                                continue;
                            }
                            switch (questionType){
                                case 0:
                                    //cardTitle="选择";
                                    _this.buildChoiceCard(question,e,index,questionType,cardArray);
                                    break;
                                case 1:
                                    // cardTitle="判断";
                                    _this.buildCorrectCard(question,e,index,questionType,cardArray);
                                    break;
                                case 2:
                                    // cardTitle="填空";
                                    _this.buildFillBlankCard(question,e,index,questionType,cardArray);
                                    break;
                                case 3:
                                    // cardTitle="简答";
                                    _this.buildSimpleAnswerCard(question,e,index,questionType,cardArray);
                                    break;
                            }
                            index = index+1;
                        }
                        /*statistics.forEach(function (e) {

                        });*/

                        var mainCard=<Card key={type} title={cardTitle} className="exam-particulars_cont">
                            {cardArray}
                        </Card>;
                        mainCardArray.push(mainCard);
                    });
                    _this.setState({
                        paperTitle,createTime,mainCardArray
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    buildChoiceCard(question,e,index,type,cardArray){
        var _this = this;
        //正确答案
        var textAnswer = question.textAnswer;
        //正确用户数组
        var rightUsers = e.rightUsers;
        //答错用户集合
        var wrongUsers = e.wrongUsers;
        //正确率
        var rightPercent = e.rightPercent;
        //选项分析
        var optionStatistics = e.optionStatistics;
        var optionASelectPercent = optionStatistics.optionRightSelectPercent;
        var optionASelectUsers = optionStatistics.optionASelectUsers;
        var optionBSelectPercent = optionStatistics.optionBSelectPercent;
        var optionBSelectUsers = optionStatistics.optionBSelectUsers;
        var optionCSelectPercent = optionStatistics.optionCSelectPercent;
        var optionCSelectUsers = optionStatistics.optionCSelectUsers;
        var optionDSelectPercent = optionStatistics.optionDSelectPercent;
        var optionDSelectUsers = optionStatistics.optionDSelectUsers;
        var optionESelectPercent = optionStatistics.optionESelectPercent;
        var optionESelectUsers = optionStatistics.optionESelectUsers;
        var optionFSelectPercent = optionStatistics.optionFSelectPercent;
        var optionFSelectUsers = optionStatistics.optionFSelectUsers;
        var everyRow=<Card key={type+index} className="upexam_topic" >
            <Row>
                <Col span={24}>{index}.正确答案:{textAnswer}</Col>
            </Row>
            <Row>
                <Col span={4}></Col>
                <Col span={3}>A</Col>
                <Col span={3}>B</Col>
                <Col span={3}>C</Col>
                <Col span={3}>D</Col>
                <Col span={3}>E</Col>
                <Col span={2}>F</Col>
            </Row>
            <Row>
                <Col span={4}>选此项</Col>
                {/*getchoicedUser*/}
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionASelectUsers)}>{optionASelectUsers.length}</a></Col>
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionBSelectUsers)}>{optionBSelectUsers.length}</a></Col>
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionCSelectUsers)}>{optionCSelectUsers.length}</a></Col>
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionDSelectUsers)}>{optionDSelectUsers.length}</a></Col>
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionESelectUsers)}>{optionESelectUsers.length}</a></Col>
                <Col span={2}><a onClick={_this.getchoicedUser.bind(_this,optionFSelectUsers)}>{optionFSelectUsers.length}</a></Col>
            </Row>
            <Row>
                <Col span={4}>选择率(%)</Col>
                <Col span={3}>{optionASelectPercent}</Col>
                <Col span={3}>{optionBSelectPercent}</Col>
                <Col span={3}>{optionCSelectPercent}</Col>
                <Col span={3}>{optionDSelectPercent}</Col>
                <Col span={3}>{optionESelectPercent}</Col>
                <Col span={2}>{optionFSelectPercent}</Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Button onClick={_this.getRightUser.bind(_this,rightUsers)}>正确:{rightUsers.length}</Button>
                    <Button onClick={_this.getWrongUser.bind(_this,wrongUsers)}>错误:{wrongUsers.length}</Button>
                    <Button>正确率:{rightPercent}%</Button>
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    buildCorrectCard(question,e,index,type,cardArray){
        var _this = this;
        //正确答案
        var textAnswerNo = question.textAnswer;
        var textAnswer;
        switch (textAnswerNo){
            case "0":
                textAnswer="错误";
                break;
            case "1":
                textAnswer="正确";
                break;
        }
        //正确用户数组
        var rightUsers = e.rightUsers;
        //答错用户集合
        var wrongUsers = e.wrongUsers;
        //正确率
        var rightPercent = e.rightPercent;
        //选项分析
        var optionStatistics = e.optionStatistics;
        var optionStatistics = e.optionStatistics;
        var optionRightSelectPercent = optionStatistics.optionRightSelectPercent;
        var optionRightSelectUsers = optionStatistics.optionRightSelectUsers;
        var optionWrongSelectPercent = optionStatistics.optionWrongSelectPercent;
        var optionWrongSelectUsers = optionStatistics.optionWrongSelectUsers;
        var everyRow=<Card key={type+index} className="upexam_topic" style={{width: 610}}>
            <Row>
                <Col span={24}>{index}.正确答案:{textAnswer}</Col>
            </Row>
            <Row>
                <Col span={4}></Col>
                <Col span={3}>正确</Col>
                <Col span={3}>错误</Col>
            </Row>
            <Row>
                <Col span={4}>选此项</Col>
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionRightSelectUsers)}>{optionRightSelectUsers.length}</a></Col>
                <Col span={3}><a onClick={_this.getchoicedUser.bind(_this,optionWrongSelectUsers)}>{optionWrongSelectUsers.length}</a></Col>
            </Row>
            <Row>
                <Col span={4}>选择率(%)</Col>
                <Col span={3}>{optionRightSelectPercent}</Col>
                <Col span={3}>{optionWrongSelectPercent}</Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Button onClick={_this.getRightUser.bind(_this,rightUsers)}>正确:{rightUsers.length}</Button>
                    <Button onClick={_this.getWrongUser.bind(_this,wrongUsers)}>错误:{wrongUsers.length}</Button>
                    <Button>正确率:{rightPercent}%</Button>
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    buildFillBlankCard(question,e,index,type,cardArray){
        var _this = this;
        //正确答案
        var textAnswer = question.textAnswer;
        var imageAnswer = question.imageAnswer;
        var imageAnalysis = question.imageAnalysis;
        //正确用户数组
        var rightUsers = e.rightUsers;
        //答错用户集合
        var wrongUsers = e.wrongUsers;
        //正确率
        var rightPercent = e.rightPercent;
        var imgObj;
        if(typeof(imageAnswer)!="undefined" && imageAnswer!=null && imageAnswer != ""){
            imgObj = <Row>
                    <Col span={24}><img style={{width:'460px',height:'300px'}} src={imageAnswer}  onClick={showLargeImg}/></Col>
                </Row>;
        }
        var everyRow=<Card key={type+index} className="upexam_topic" style={{width: 610}}>
            <Row>
                <Col span={24}>{index}.正确答案:{textAnswer}</Col>
            </Row>
            {imgObj}
            <Row>
                <Col span={24}>
                    <Button onClick={_this.getRightUser.bind(_this,rightUsers)}>正确:{rightUsers.length}</Button>
                    <Button onClick={_this.getWrongUser.bind(_this,wrongUsers)}>错误:{wrongUsers.length}</Button>
                    <Button>正确率:{rightPercent}%</Button>
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    buildSimpleAnswerCard(question,e,index,type,cardArray){
        var _this = this;
        //正确答案
        var textAnswer = question.textAnswer;
        var imageAnswer = question.imageAnswer;
        var imageAnalysis = question.imageAnalysis;
        //正确用户数组
        var rightUsers = e.rightUsers;
        //答错用户集合
        var wrongUsers = e.wrongUsers;
        //正确率
        var rightPercent = e.rightPercent;
        var imgObj;
        if(typeof(imageAnswer)!="undefined" && imageAnswer!=null && imageAnswer != "" ){
            imgObj = <Row>
                <Col span={24}><img style={{width:'460px',height:'300px'}} src={imageAnswer}  onClick={showLargeImg}/></Col>
            </Row>;
        }
        var everyRow=<Card key={type+index} className="upexam_topic" style={{width: 610}}>
            <Row>
                <Col span={24}>{index}.正确答案:{textAnswer}</Col>
            </Row>
            {imgObj}
            <Row>
                <Col span={24}>
                    <Button onClick={_this.getRightUser.bind(_this,rightUsers)}>正确:{rightUsers.length}</Button>
                    <Button onClick={_this.getWrongUser.bind(_this,wrongUsers)}>错误:{wrongUsers.length}</Button>
                    <Button>正确率:{rightPercent}%</Button>
                </Col>
            </Row>
        </Card>;
        cardArray.push(everyRow);
    },

    /**
     * 显示回答正确学生名单
     */
    getRightUser(rightUsersArray){
        var userLiArray = [];
        if(typeof(rightUsersArray)!="undefined" && rightUsersArray.length==0){
            message.warning("没有学生!");
        }else{
            rightUsersArray.forEach(function (user) {
                var userLi = <div>
                    <img src={user.avatar} style={{width:'50px',height:'50px'}}/>
                    <span>{user.userName}</span>
                </div>
                userLiArray.push(userLi);
            });
            this.setState({"tipLiArray":userLiArray,"tipModalVisible":true,"tipTitle":"回答正确学生名单"});
        }
    },

    /**
     * 显示回答错误学生名单
     */
    getWrongUser(wrongUsersArray){
        var userLiArray = [];
        if(typeof(wrongUsersArray)!="undefined" && wrongUsersArray.length==0){
            message.warning("没有学生!");
        }else{
            wrongUsersArray.forEach(function (user) {
                var userLi = <div>
                    <img src={user.avatar} style={{width:'50px',height:'50px'}}/>
                    <span>{user.userName}</span>
                </div>
                userLiArray.push(userLi);
            });
            this.setState({"tipLiArray":userLiArray,"tipModalVisible":true,"tipTitle":"回答错误学生名单"});
        }
    },

    /**
     * 显示选择指定选项的学生名单
     */
    getchoicedUser(choiceUsersArray){
        var userLiArray = [];
        if(typeof(choiceUsersArray)!="undefined" && choiceUsersArray.length==0){
            message.warning("没有学生!");
        }else{
            choiceUsersArray.forEach(function (user) {
                var userLi = <div>
                    <img src={user.avatar} style={{width:'50px',height:'50px'}}/>
                    <span>{user.userName}</span>
                </div>
                userLiArray.push(userLi);
            });
            this.setState({"tipLiArray":userLiArray,"tipModalVisible":true,"tipTitle":"选择该选项的学生名单"});
        }
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false});
    },

    render() {
        return (
            <div className="level_list_pa">
                <div className="exam-particulars_title">
                    <p>
                        {this.state.paperTitle}
                    </p>
                    <p className="exam-particulars_time">
                        布置时间：{this.state.createTime}
                    </p>
                </div>
                <div>
                    {this.state.mainCardArray}
                </div>
                <Modal
                    visible={this.state.tipModalVisible}
                    title={this.state.tipTitle}
                    onCancel={this.tipModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[]}>
                    <div>
                        {this.state.tipLiArray}
                    </div>
                </Modal>
            </div>
        );
    },
});

export default TestQuestionStatisticsComponents;
