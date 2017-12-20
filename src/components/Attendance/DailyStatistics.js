import React, {PropTypes} from 'react';
import OpenNewPage from '../OpenNewPage'
import {isEmpty} from '../../utils/utils';

const DailyStatistics = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,

        };
    },

    componentDidMount() {

    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                每日统计
            </div>
        );
    }
});

export default DailyStatistics;
