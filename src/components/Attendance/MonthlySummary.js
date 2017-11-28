import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {DatePicker, Table} from 'antd';

const {MonthPicker, RangePicker} = DatePicker;

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

const data = [];
for (let i = 0; i < 50; i++) {
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

    },

    timeOnChange(date, dateString) {
        console.log(date, dateString);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
                <div className="group_cont">
                    <div className="public—til—blue">月度汇总</div>
                    <div className="favorite_scroll">
                        <div className="checking_add_box group_cont">
                                <div className="ding_user_t">
                                    时间：<RangePicker onChange={this.timeOnChange}/>
                                </div>
                            <Table className="checking_in_box cloud_box row-t-f" columns={columns} dataSource={data} scroll={{x: 5550, y: 434}} pagination={false}/>
                        </div>
                    </div>;
                </div>
        );
    }
});

export default MonthlySummary;
