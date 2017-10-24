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
                this.tabComponent = <AttendanceManagement/>;
                break;
            case 'shiftManagement':
                this.tabComponent = <ShiftManagement/>;
                break;
            case 'monthlySummary':
                this.tabComponent = <MonthlySummary/>;
                break;
            case 'dailyStatistics':
                this.tabComponent = <DailyStatistics/>;
                break;
            case 'originalRecord':
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
