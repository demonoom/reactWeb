import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import AttendanceManagement from './AttendanceManagement';
import ShiftManagement from './ShiftManagement';
import MonthlySummary from './MonthlySummary';
import DailyStatistics from './DailyStatistics';
import OriginalRecord from './OriginalRecord';

const Attendance = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            attendanceChoose: 'attendanceManagement',
        };
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        // console.log(nextProps.attendanceChoose);
        this.setState({attendanceChoose: nextProps.attendanceChoose})
    },


    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        switch (this.state.attendanceChoose) {
            case 'attendanceManagement':
                //考勤组管理
                this.tabComponent = <AttendanceManagement/>;
                break;
            case 'shiftManagement':
                //班次管理
                this.tabComponent = <ShiftManagement/>;
                break;
            case 'monthlySummary':
                //月度汇总
                this.tabComponent = <MonthlySummary/>;
                break;
            case 'dailyStatistics':
                //每日统计
                this.tabComponent = <DailyStatistics/>;
                break;
            case 'originalRecord':
                //原始记录
                this.tabComponent = <OriginalRecord/>;
                break;
        }
        return (
            <div>
                {this.tabComponent}
            </div>
        );
    }
});

export default Attendance;
