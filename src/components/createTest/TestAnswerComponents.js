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
const TestAnswerComponents = React.createClass({
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
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },


    render() {
        var submitedHeader=<span>已提交({this.state.submitedUserCount}人)</span>;
        var noSubmitHeader=<span>未提交({this.state.noSubmitUserCount}人)</span>;
        return (
            <div>
                TestAnswerComponents
            </div>
        );
    },
});

export default TestAnswerComponents;
