import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message,Steps,Icon,Progress,Modal} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
const Step = Steps.Step;

var examsArray=[];
var TimeLineItemArray=[];
const TestAnalysisComponents = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
            tipModalVisible:false,
            paperId:'',
        };
    },

    componentDidMount(){
        var _this = this;
        _this.getExmOverallStatistics();
    },

    /**
     * 获取这次考试的整体统计
     */
    getExmOverallStatistics(){
        var _this = this;
        var param = {
            "method": 'getExmOverallStatistics',
            "exmId": _this.props.exmId,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    //平均分到最高分之间的人名集合
                    var average2highestNames = response.average2highestNames;
                    var average2highestNamesCount;
                    if(typeof(average2highestNames)!="undefined" ){
                        average2highestNamesCount = average2highestNames.length;
                    }else{
                        average2highestNamesCount=0;
                    }
                    //平均分到最低分之间的人名集合
                    var average2lowestNames = response.average2lowestNames;
                    var average2lowestNamesCount;
                    if(typeof(average2lowestNames)!="undefined" ){
                        average2lowestNamesCount = average2lowestNames.length;
                    }else{
                        average2lowestNamesCount=0;
                    }
                    //平均分
                    var averageScore = response.averageScore;
                    //班级名称
                    var className =response.className;
                    //最高分
                    var highestScore = response.highestScore;
                    //最高分人名集合
                    var highestScoreNames = response.highestScoreNames;
                    var highestScoreNamesCount;
                    if(typeof(highestScoreNames)!="undefined" ){
                        highestScoreNamesCount = highestScoreNames.length;
                    }else{
                        highestScoreNamesCount=0;
                    }
                    //最低分
                    var lowestScore = response.lowestScore;
                    //最低分人名集合
                    var lowestScoreNames = response.lowestScoreNames;
                    var lowestScoreNamesCount;
                    if(typeof(lowestScoreNames)!="undefined" ){
                        lowestScoreNamesCount = lowestScoreNames.length;
                    }else{
                        lowestScoreNamesCount=0;
                    }
                    //推荐讲解题目
                    var recommendExplainQuestions = response.recommendExplainQuestions;
                    var liArray=[];
                    recommendExplainQuestions.forEach(function (e) {
                        var title = e.question.title;
                        var liTag=<li>
                            <div>{title}</div>
                            <div><Progress percent={e.rightPercent} /></div>
                        </li>;
                        liArray.push(liTag);
                    });
                    _this.setState({average2highestNames,average2lowestNames,averageScore,
                        className,highestScore,highestScoreNames,lowestScore,
                        lowestScoreNames,recommendExplainQuestions,lowestScoreNamesCount,highestScoreNamesCount,
                        average2highestNamesCount,average2lowestNamesCount,liArray
                    })
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },
    /**
     * 显示分值最高的人姓名
     */
    getMaxUser(){
        // highestScoreNames
        var maxLiArray = [];
        if(this.state.highestScoreNames.length==0){
            message.warning("没有学生");
        }else{
            this.state.highestScoreNames.forEach(function (e) {
                var maxLi = <div className="group_fr">
                    <span className="attention_img"><img src={require('../images/maaee_face.png')}/></span>
                    <span>{e}</span>
                </div>
                maxLiArray.push(maxLi);
            });
            this.setState({"tipLiArray":maxLiArray,"tipModalVisible":true,"tipTitle":"最高分名单"});
        }
    },

    /**
     * 显示分值最低的人姓名
     */
    getMinUser(){
        var minLiArray = [];
        if(this.state.lowestScoreNames.length==0){
            message.warning("没有学生");
        }else{
            this.state.lowestScoreNames.forEach(function (e) {
                var maxLi = <div className="group_fr">
                    <span className="attention_img"><img src={require('../images/maaee_face.png')}/></span>
                    <span>{e}</span>
                </div>
                minLiArray.push(maxLi);
            });
            this.setState({"tipLiArray":minLiArray,"tipModalVisible":true,"tipTitle":"最低分名单"});
        }
    },

    getAverage2highestNames(){
        var bigAvageLiArray = [];
        if(this.state.average2highestNames.length==0){
            message.warning("没有学生");
        }else{
            this.state.average2highestNames.forEach(function (e) {
                var biggerLi = <div className="group_fr">
                    <span className="attention_img"><img src={require('../images/maaee_face.png')}/></span>
                    <span>{e}</span>
                </div>
                bigAvageLiArray.push(biggerLi);
            });
            this.setState({"tipLiArray":bigAvageLiArray,"tipModalVisible":true,"tipTitle":"高于平均分学生名单"});
        }
    },

    getAverage2lowestNames(){
        var lowAvageLiArray = [];
        if(this.state.average2lowestNames.length==0){
            message.warning("没有学生");
        }else{
            this.state.average2lowestNames.forEach(function (e) {
                var lowerLi = <div className="group_fr">
                    <span className="attention_img"><img src={require('../images/maaee_face.png')}/></span>
                    <span>{e}</span>
                </div>
                lowAvageLiArray.push(lowerLi);
            });
            this.setState({"tipLiArray":lowAvageLiArray,"tipModalVisible":true,"tipTitle":"低于平均分学生名单"});
        }
    },
    /**
     * 获取本次考试分数排名列表
     */
    getExmScoreRankings(){
        this.props.onSortedButtonClick(this.props.exmId);
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false});
    },

    /**
     * 老师获取此次考试的题目结果分析    试卷详情
     */
    getExmQuestionStatistics(){
        this.props.onExmQuestionStatisticsClick(this.props.exmId);
    },
    /**
     * 平行班比较
     */
    getExmPushByPaperId(){
        this.props.onExmPushClick(this.props.paperId);
    },

    render() {
        var maxScoreDiv=<div className="exam_ranking">
			<div className="icon_champion"></div>
            <div className="exam_gray">最高分{this.state.highestScore}分</div>
			<div ><a href="#/MainLayout" className="exam_blue" onClick={this.getMaxUser}>({this.state.highestScoreNamesCount}人)</a></div>
        </div>;
        var avgScoreDiv=<div className="exam_ranking">
			<div className="icon_mean"></div>
            <div className="exam_gray">平均{this.state.averageScore}分</div>
        </div>;
        var minScoreDiv=<div className="exam_ranking">
			<div className="icon_lowest"></div>
			<div className="exam_gray">最低分{this.state.lowestScore}分</div>
            <div ><a className="exam_orange" href="#/MainLayout" onClick={this.getMinUser}>({this.state.lowestScoreNamesCount}人)</a>
			</div>
        </div>;
        var average2highestNamesCountDiv=<div className="i_roundness">
            <a href="#/MainLayout" onClick={this.getAverage2highestNames}>
                <span>{this.state.average2highestNamesCount}人</span>
            </a>
        </div>;
        var average2lowestNamesCountDiv=<div className="i_roundness">
            <a href="#/MainLayout" onClick={this.getAverage2lowestNames}>
                <span>{this.state.average2lowestNamesCount}人</span>
            </a>
        </div>;
        return (
            <div  className="level_list_pa exam_statistics">
                    <Steps>
                        <Step status="finish" title={maxScoreDiv} icon={<Icon type="arrow-up00" />} />
                        <Step status="finish" title={average2highestNamesCountDiv} icon={<Icon type="user00" />} />
                        <Step status="finish" title={avgScoreDiv} icon={<Icon type="safety" />} />
                        <Step status="finish" title={average2lowestNamesCountDiv} icon={<Icon type="user00" />} />
                        <Step status="finish" title={minScoreDiv} icon={<Icon type="arrow-down00" />} />
                    </Steps>
                <div className="examte_tab">
                    <a onClick={this.getExmScoreRankings}>
						<div className="icon_grade"></div>
						<div>成绩排名</div>
					</a>
                    <a onClick={this.getExmQuestionStatistics}>
						<div className="icon_particulars"></div>
						<div>试卷详情</div>
					</a>
                    <a  onClick={this.getExmPushByPaperId}>
						<div className="icon_compare"></div>
						<div>平行班比较</div>
					</a>
                </div>
                <div className="exam-correct_til">
                    <span>推荐讲解题目(正确率小于60%)</span>
                </div>
                <div className="exam-correct_ul">
                    <ul>
                        {this.state.liArray}
                    </ul>
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

export default TestAnalysisComponents;
