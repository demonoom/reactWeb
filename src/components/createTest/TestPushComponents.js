import React, {PropTypes} from 'react';
import {Timeline, Button, Row,Col, message,Steps,Icon,Progress,Modal,Collapse,Table} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
import {getLocalTime} from '../../utils/utils';
const Step = Steps.Step;
const Panel = Collapse.Panel;

var examsArray=[];
var TimeLineItemArray=[];

const columns = [ {
    title: 'exmInfo',
    dataIndex: 'exmInfo',
}];

const TestPushComponents = React.createClass({
    getInitialState() {
        return {
            ident: sessionStorage.getItem('ident'),
            tipModalVisible:false,
            pageNo:1,
            selectedRowKeys: [],
        };
    },

    componentDidMount(){
        var _this = this;
        _this.getExmPushByPaperId(this.state.pageNo);
    },

    /**
     * 获取本次考试分数排名列表
     */
    getExmPushByPaperId(pageNo){
        var _this = this;
        var param = {
            "method": 'getExmPushByPaperId',
            "paperId": _this.props.paperId,
            "pageNo": pageNo,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    var tableTrJsonArray=[];
                    response.forEach(function (e) {
                        var clazz = e.clazz;
                        var grade = clazz.grade;
                        var gradeName=grade.name;
                        var clazzName = clazz.name;
                        var exmId = e.id;
                        var paper = e.paper;
                        var paperTitle = paper.title;
                        var startTimeStamp = e.startTime;
                        var endTimeStamp = e.endTime;
                        var startTime = formatYMD(startTimeStamp)+" "+formatHM(startTimeStamp);
                        var endTime = formatYMD(endTimeStamp)+" "+formatHM(endTimeStamp);
                        var exmUL=<ul>
                            <li className="gray_42 compare_li">{paperTitle}</li>
                            <li className="blueness compare_li">{gradeName+clazzName}</li>
                            <li className="exam-particulars_time compare_li">{startTime+"~"+endTime}</li>
                        </ul>;

                        var trJson={
                            key: exmId,
                            exmInfo: exmUL,
                        };
                        tableTrJsonArray.push(trJson)
                    });
                    var pager = ret.pager;
                     _this.setState({tableTrJsonArray,totalCount: parseInt(pager.rsCount)});
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    onSelectChange(selectedRowKeys){
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    },

    getExmOverallStatisticsByExmIds(){
        var _this = this;
        var exmIds = _this.state.selectedRowKeys.join(",");
        var param = {
            "method": 'getExmOverallStatisticsByExmIds',
            "exmIds": exmIds,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg == "调用成功" && ret.success == true){
                    var response = ret.response;
                    var rowArray=[];
                    var headerRow=<Row>
                        <Col span={6}>&nbsp;</Col>
                        <Col span={188}><span className="icon_mean"></span>平均分对比</Col>
                        <Col span={188}><span className="icon_champion"></span>最高分对比</Col>
                        <Col span={188}><span className="icon_up_arrow"></span>高于平均分人数</Col>
                        <Col span={188}><span className="icon_lowest"></span>低于平均分人数</Col>
                    </Row>;
                    rowArray.push(headerRow);
                    response.forEach(function (e) {
                        var average2highestNames = e.average2highestNames;
                        var average2lowestNames = e.average2lowestNames;
                        var averageScore = e.averageScore;
                        var className = e.className;
                        var highestScore = e.highestScore;
                        var highestScoreNames = e.highestScoreNames;
                        var lowestScore = e.lowestScore;
                        var lowestScoreNames = e.lowestScoreNames;
                        var classRow=<Row>
                            <Col span={6}>{className}</Col>
                            <Col span={188}>{averageScore}</Col>
                            <Col span={188}>{highestScore}</Col>
                            <Col span={188}>{average2highestNames.length}</Col>
                            <Col span={188}>{average2lowestNames.length}</Col>
                        </Row>;
                        rowArray.push(classRow);
                    });
                    _this.setState({"rowArray":rowArray,"tipModalVisible":true,"tipTitle":"班级比较"});
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false});
    },

    pageOnChange(pageNo){
        this.setState({pageNo});
        this.getExmPushByPaperId(pageNo);
    },

    collapseOnChange(key){

    },

    render() {
        const { loading, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <div className="favorite_my exam_compare">
                <div className="exam_compare_remark">
					<Button type="primary" className="exam_right_a" onClick={this.getExmOverallStatisticsByExmIds} disabled={!hasSelected} loading={loading}>比较</Button>
					<span className="password_ts">
                        {hasSelected ? `选中 ${selectedRowKeys.length} 条记录` : ''}
                    </span>
                </div>
                <Table rowSelection={rowSelection} columns={columns}  showHeader={false}
                       dataSource={this.state.tableTrJsonArray}
                       pagination={{
                           total: this.state.totalCount,
                           pageSize: getPageSize(),
                           defaultCurrent: this.state.pageNo,
                           current: this.state.pageNo,
                           onChange: this.pageOnChange
                       }}
                />
                <Modal className="compare_class_modal"
                    visible={this.state.tipModalVisible}
                    title={this.state.tipTitle}
                    onCancel={this.tipModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[]}>
                    <div className="compare_class">
                        {this.state.rowArray}
                    </div>
                </Modal>
            </div>
        );
    },
});

export default TestPushComponents;
