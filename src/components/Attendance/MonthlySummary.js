import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {DatePicker, Table, message} from 'antd';
import moment from 'moment';
import {doWebService} from '../../WebServiceHelper'

const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';

var columns = [
    {title: '姓名', width: 100, dataIndex: 'name', key: 'name', fixed: 'left'},
    {title: '部门', width: 100, dataIndex: 'department', key: 'department', width: 200},
    {title: '迟到次数', dataIndex: 'tardiness', key: 'tardiness', width: 200},
    {title: '早退次数', dataIndex: 'numOfLeaving', key: 'numOfLeaving', width: 200},
    {title: '缺卡次数', dataIndex: 'missCardTimes', key: 'missCardTimes', width: 200},
    {title: '旷工天数', dataIndex: 'absenteeism', key: 'absenteeism', width: 200},
    {title: '出勤天数', dataIndex: 'attendance', key: 'attendance', width: 200},
];

var monthData = [];

const MonthlySummary = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            x: 1200
        };
    },

    componentDidMount() {
        this.getTimeNow();
    },

    /**
     * 获取月度汇总
     */
    getMonthlySummary(startTime, endTime) {
        //初始化表头
        columns = [
            {title: '姓名', width: 100, dataIndex: 'name', key: 'name', fixed: 'left'},
            {title: '部门', width: 100, dataIndex: 'department', key: 'department',},
            {title: '迟到次数', dataIndex: 'tardiness', key: 'tardiness', width: 200},
            {title: '早退次数', dataIndex: 'numOfLeaving', key: 'numOfLeaving', width: 200},
            {title: '缺卡次数', dataIndex: 'missCardTimes', key: 'missCardTimes', width: 200},
            {title: '旷工天数', dataIndex: 'absenteeism', key: 'absenteeism', width: 200},
            {title: '出勤天数', dataIndex: 'attendance', key: 'attendance', width: 200},
        ];
        //初始化表格内容
        monthData = [];
        var _this = this;
        var param = {
            "method": 'viewPunchStatisticsPage',
            "schId": _this.state.loginUser.schoolId,
            "begin": startTime,
            "end": endTime,
            "dId": '-1',
            "pageNo": '-1',
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    _this.makeTable(data);
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 制作表格
     */
    makeTable(data) {
        if (isEmpty(data.punch_title) == false) {
            data.punch_title.forEach(function (v, i) {
                var obj = {title: v.day + '(' + v.week + ')', dataIndex: 'date' + i, key: i + '1', width: 200}
                columns.push(obj);
            })
        }
        if (isEmpty(data.punch_content) == false) {
            data.punch_content.forEach(function (v, i) {
                var obj1 = {
                    key: i,
                    name: v.name,
                    department: v.department,
                    tardiness: v.late,  //迟到
                    numOfLeaving: v.early,  //早退
                    missCardTimes: v.miss,  //缺卡
                    absenteeism: v.absent,   //旷工
                    attendance: v.attendance,   //出勤
                }
                var obj2 = {};
                for (var i = 0; i < v.detail.length; i++) {
                    obj2['date' + i] = v.detail[i]
                }
                var obj = Object.assign(obj1, obj2);
                monthData.push(obj);
            })
        }
        //计算表格宽度
        var x = (data.punch_title.length + 6) * 200;
        this.setState({x});
    },

    /**
     * 获取当前日期,设置开始日期为本月1号，结束日期为今天
     */
    getTimeNow() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate() - 1;
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var startTime = year + seperator1 + month + seperator1 + '01';
        var endTime = year + seperator1 + month + seperator1 + strDate;
        //如果是1号的话
        if (strDate == 0) {
            if (month == 1) {
                //1月1号
                startTime = (year - 1) + seperator1 + 12 + seperator1 + '01';
                endTime = (year - 1) + seperator1 + 12 + seperator1 + '30';
            } else {
                startTime = year + seperator1 + (month - 1) + seperator1 + '01';
                endTime = year + seperator1 + (month - 1) + seperator1 + '30';
            }
        }
        this.setState({startTime, endTime});
        this.getMonthlySummary(startTime, endTime);
        if (window.screen.width > 1366) {
            this.setState({y: 436})
        } else {
            this.setState({y: 400})
        }
    },

    /**
     * 日期改变的回调
     * @param date
     * @param dateString
     */
    timeOnChange(date, dateString) {
        // console.log(date, dateString);
        var startTime = dateString[0];
        var endTime = dateString[1];
        this.setState({startTime, endTime});
        this.getMonthlySummary(startTime, endTime);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div className="group_cont">
                <div className="public—til—blue">考勤汇总</div>
                <div className="favorite_scroll">
                    <div className="checking_add_box group_cont">
                        <div className="ding_user_t">
                            时间：<RangePicker onChange={this.timeOnChange}
                                            value={[moment(this.state.startTime, dateFormat), moment(this.state.endTime, dateFormat)]}/>
                        </div>
                        <Table className="checking_in_box cloud_box row-t-f month_box" columns={columns}
                               dataSource={monthData} scroll={{x: this.state.x, y: this.state.y}} pagination={false}/>
                    </div>
                </div>
                ;
            </div>
        );
    }
});

export default MonthlySummary;
