import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, Radio, Icon} from 'antd';

const AttendanceManagement = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,

        };
    },

    componentDidMount() {

    },

    addAtt() {
        alert('新增考勤组');
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <Button type="primary" icon="plus" onClick={this.addAtt}>新增考勤组</Button>
            </div>
        );
    }
});

export default AttendanceManagement;
