import React, {PropTypes} from 'react';
import {Timeline, Button, Popover, message,Steps,Icon,Progress,Modal,Collapse} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
const Step = Steps.Step;
const Panel = Collapse.Panel;

var examsArray=[];
var TimeLineItemArray=[];
const TestScoreRankingsComponents = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
            tipModalVisible:false,
        };
    },

    componentDidMount(){
        var _this = this;
        _this.getExmScoreRankings();
    },

    /**
     * 获取本次考试分数排名列表
     */
    getExmScoreRankings(){
        var _this = this;
        var param = {
            "method": 'getExmScoreRankings',
            "exmId": _this.props.exmId,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    var submitedUserArray=[];
                    var noSubmitUserArray=[];
                    response.forEach(function (e) {
                        var score = e.score;
                        var submited = e.submited;
                        var userId = e.userId;
                        var userObj = e.user;
                        var avatar = userObj.avatar;
                        if(submited){
                            var userLi=<li onClick={_this.seeAnswer.bind(_this,userObj,submited)} className="group_fr exam_group_fr">
                                <span className="attention_img"><img src={avatar} height="38"></img></span><span>{userObj.userName}</span>
                                <span className="exam_group_fr_grade">{score}分</span>
                            </li>;
                            submitedUserArray.push(userLi)
                        }else {
                            var userLi=<li onClick={_this.seeAnswer.bind(_this,userObj,submited)} className="group_fr">
                                <span className="attention_img"><img src={avatar} height="38"></img></span><span>{userObj.userName}</span>
                            </li>;
                            noSubmitUserArray.push(userLi)
                        }
                    });
                    var submitedUserCount = submitedUserArray.length;
                    var noSubmitUserCount = noSubmitUserArray.length;
                    _this.setState({submitedUserArray,noSubmitUserArray,submitedUserCount,noSubmitUserCount});
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    seeAnswer(userObj,submited){
        if(submited==false){
            message.warning("此学生未提交");
        }else{
            // message.warning("提交"+userObj.userName);
            this.props.onCheckButtonClick(this.props.exmId,userObj);
        }
    },

    collapseOnChange(key){

    },

    render() {
        var submitedHeader=<span>已提交（{this.state.submitedUserCount}人）</span>;
        var noSubmitHeader=<span>未提交（{this.state.noSubmitUserCount}人）</span>;
        return (
            <div className="score_ranking">
                <Collapse defaultActiveKey={['1','2']} activeKey={['1','2']} onChange={this.state.collapseOnChange}>
                    <Panel header={submitedHeader} key="1">
                        <ul>
                            {this.state.submitedUserArray}
                        </ul>
                    </Panel>
                    <Panel header={noSubmitHeader} key="2">
                        <ul>
                            {this.state.noSubmitUserArray}
                        </ul>
                    </Panel>
                </Collapse>
            </div>
        );
    },
});

export default TestScoreRankingsComponents;
