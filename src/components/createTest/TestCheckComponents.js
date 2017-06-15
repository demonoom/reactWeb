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
const TestCheckComponents = React.createClass({
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
                            var userLi=<li onClick={_this.seeAnswer.bind(_this,userObj,submited)}>
                                <span><img src={avatar} height="38"></img>{userObj.userName}</span>
                                <span>去批改</span>
                            </li>;
                            submitedUserArray.push(userLi)
                        }else {
                            var userLi=<li onClick={_this.seeAnswer.bind(_this,userObj,submited)}>
                                <span><img src={avatar} height="38"></img>{userObj.userName}</span>
                                <span>未提交</span>
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
            this.props.onCheckButtonClick(this.props.exmId,userObj);
        }
    },

    collapseOnChange(key){

    },

    render() {
        return (
            <div>
                <ul>
                    {this.state.submitedUserArray}
                    {this.state.noSubmitUserArray}
                </ul>
            </div>
        );
    },
});

export default TestCheckComponents;