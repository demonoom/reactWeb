import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {DatePicker, Table} from 'antd';
import moment from 'moment';

const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';

const columns = [
    {title: '姓名', width: 100, dataIndex: 'name', key: 'name', fixed: 'left'},
    {title: '部门', width: 100, dataIndex: 'department', key: 'department', width: 150},
    {title: '迟到次数', dataIndex: 'tardiness', key: 'tardiness', width: 150},
    {title: '早退次数', dataIndex: 'numOfLeaving', key: 'numOfLeaving', width: 150},
    {title: '缺卡次数', dataIndex: 'missCardTimes', key: 'missCardTimes', width: 150},
    {title: '旷工次数', dataIndex: 'absenteeism', key: 'absenteeism', width: 150},
    {title: '出勤次数', dataIndex: 'attendance', key: 'attendance', width: 150},
    {title: '13号（星期一）', dataIndex: 'date', key: '1', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '2', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '3', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '4', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '5', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '6', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '7', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '8', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '9', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '10', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '11', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '12', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '13', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '14', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '15', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '16', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '17', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '18', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '20', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '21', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '22', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '23', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '24', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '25', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '26', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '27', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '28', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '29', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '30', width: 150},
    {title: '14号（星期二）', dataIndex: 'date', key: '31', width: 150},
];

//假数据
const data = [];
for (let i = 0; i < 100; i++) {
    data.push({
        key: i,
        name: `用户${i}`,
        department: 'IT部',
        tardiness: 1,
        numOfLeaving: 2,
        missCardTimes: 3,
        absenteeism: 1,
        attendance: 0,
        date: `London Park no. ${i}`,
    });
}

const MonthlySummary = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,

        };
    },

    componentDidMount() {
        this.getTimeNow();
    },

    /**
     * 获取当前日期,设置开始日期为本月1号，结束日期为今天
     */
    getTimeNow() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var startTime = year + seperator1 + month + seperator1 + '01';
        var endTime = year + seperator1 + month + seperator1 + strDate;
        this.setState({startTime, endTime});
    },

    /**
     * 日期改变的回调
     * @param date
     * @param dateString
     */
    timeOnChange(date, dateString) {
        console.log(date, dateString);
        var startTime = dateString[0];
        var endTime = dateString[1];
        this.setState({startTime, endTime});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <div className="group_cont">
                    <div className="public—til—blue">考勤详情</div>
                    <div>
                        时间：<RangePicker onChange={this.timeOnChange}
                                        value={[moment(this.state.startTime, dateFormat), moment(this.state.endTime, dateFormat)]}/>
                    </div>
                    <Table columns={columns} dataSource={data} scroll={{x: 5550, y: 300}} pagination={false}/>
                </div>
            </div>
        );
    }
});

export default MonthlySummary;
