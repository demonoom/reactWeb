import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message,Steps,Icon,Progress} from 'antd';
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

    getMaxUser(){
        console.log("getMaxUser");
    },

    getMinUser(){

    },

    render() {
        var maxScoreDiv=<div>
            <a href="#/MainLayout" onClick={this.getMaxUser}>
                <span>最高分{this.state.highestScore}分</span>
                <span>({this.state.highestScoreNamesCount})人</span>
            </a>
        </div>;
        var avgScoreDiv=<div>
            <span>平均{this.state.averageScore}分</span>
        </div>;
        var minScoreDiv=<div>
            <a href="#/MainLayout" onClick={this.getMinUser}>
                <span>最低分{this.state.lowestScore}分</span>
                <span>({this.state.lowestScoreNamesCount})人</span>
            </a>
        </div>;
        var average2highestNamesCountDiv=<div>
            <span>({this.state.average2highestNamesCount})人</span>
        </div>;
        var average2lowestNamesCountDiv=<div>
            <span>({this.state.average2lowestNamesCount})人</span>
        </div>;
        return (
            <div>
                <div>
                    <Steps>
                        <Step status="finish" title={maxScoreDiv} icon={<Icon type="arrow-up" />} />
                        <Step status="finish" title={average2highestNamesCountDiv} icon={<Icon type="user" />} />
                        <Step status="finish" title={avgScoreDiv} icon={<Icon type="safety" />} />
                        <Step status="finish" title={average2lowestNamesCountDiv} icon={<Icon type="user" />} />
                        <Step status="finish" title={minScoreDiv} icon={<Icon type="arrow-down" />} />
                    </Steps>
                </div>
                <div>
                    <Button icon="bar-chart">成绩排名</Button>
                    <Button icon="pie-chart">试卷详情</Button>
                    <Button icon="line-chart">平行班比较</Button>
                </div>
                <div>
                    <span>推荐讲解题目(正确率小于60%)</span>
                </div>
                <div>
                    <ul>
                        {this.state.liArray}
                    </ul>
                </div>
            </div>
        );
    },
});

export default TestAnalysisComponents;
