import React, {PropTypes, Link} from 'react';
import {Table,Icon} from 'antd';

var mMenu;
const columns = [{
    title: 'option',
    dataIndex: 'option',
    key: 'option',
}];

const data = [{
    key: 'getAllTopic',
    option: <div className="yichao_menu_li"><Icon type="appstore-o" className="menu_left_i" /><span>全部</span></div>,
}, {
    key: 'onlyTeacherTopic',
    option: <div className="yichao_menu_li"><i className="iconfont menu_left_i">&#xe7e0;</i><span>只看老师</span></div>,
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
                       rowClassName={mMenu.getRowClassName} className="yichao_menu" pagination={false}/>

            </div>
        );
    },
});
export default AntNestMenu;