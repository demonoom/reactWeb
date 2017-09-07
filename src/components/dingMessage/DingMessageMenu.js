import React, {PropTypes, Link} from 'react';
import {Table,Icon} from 'antd';

var mMenu;

//构造表格样式
const columns = [{
    title: 'option',
    dataIndex: 'option',
    key: 'option',
}];

//构造表格数据
const data = [ {
    key: 'myReceive',
    option: <div className="yichao_menu_li"><i className="iconfont menu_left_i">&#xeaf8;</i><span>我收到的</span></div>,
}, {
    key: 'mySend',
    option: <div className="yichao_menu_li"><i className="iconfont menu_left_i">&#xe704;</i><span>我发出的</span></div>,
}];

const DingmessageMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {
            selectRowKey:'myReceive',
        };
    },
    /**
     * 获取当前的操作项
     * @param record
     * @param index
     */
    getDingMessage(record){
        mMenu.setState({selectRowKey:record.key});
        mMenu.props.callbackParent(record.key);
    },
    /**
     * 设置当前选中行的背景颜色
     * @param record
     * @param index
     * @returns {string}
     */
    getRowClassName(record){
        if(record.key==mMenu.state.selectRowKey){
            return "tableRow";
        }
    },

    render() {
        return (
            <div>
                <div className="menu_til">叮消息</div>
                <Table onRowClick={mMenu.getDingMessage} showHeader={false} columns={columns} dataSource={data}
                       rowClassName={mMenu.getRowClassName} className="yichao_menu" pagination={false}/>

            </div>
        );
    },
});
export default DingmessageMenu;

