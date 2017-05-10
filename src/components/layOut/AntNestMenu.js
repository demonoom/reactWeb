import React, {PropTypes, Link} from 'react';
import {Table} from 'antd';

var mMenu;
const columns = [{
    title: 'option',
    dataIndex: 'option',
    key: 'option',
}];

const data = [{
    key: 'getAllTopic',
    option: '全部',
}, {
    key: 'onlyTeacherTopic',
    option: '只看老师',
}];

const AntNestMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {
            selectRowKey:'getAllTopic',
        };
    },
    /**
     * 获取当前的操作项
     * @param record
     * @param index
     */
    getAntNest(record, index){
        mMenu.setState({selectRowKey:record.key});
        mMenu.props.callbackParent(record.key);
    },
    /**
     * 设置当前选中行的背景颜色
     * @param record
     * @param index
     * @returns {string}
     */
    getRowClassName(record, index){
        if(record.key==mMenu.state.selectRowKey){
            return "tableRow";
        }
    },

    render() {
        return (
            <div>
                <div className="menu_til">蚁巢</div>
                <Table onRowClick={mMenu.getAntNest} showHeader={false} columns={columns} dataSource={data}
                       rowClassName={mMenu.getRowClassName} className="yichao_menu"/>
            </div>
        );
    },
});
export default AntNestMenu;