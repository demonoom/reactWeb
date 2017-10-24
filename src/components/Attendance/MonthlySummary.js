import React, {PropTypes} from 'react';
import OpenNewPage from '../OpenNewPage'
import {isEmpty} from '../../utils/utils';

const MonthlySummary = React.createClass({

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
                月度汇总
            </div>
        );
    }
});

export default MonthlySummary;
