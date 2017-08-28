import React, {PropTypes, Link} from 'react';
import {Table,Icon} from 'antd';

var mMenu;
const columns = [{
    title: 'option',
    dataIndex: 'option',
    key: 'option',
}];

const data = [{
    key: 'myFile',
    option: <div className="yichao_menu_li"><Icon type="appstore-o" className="menu_left_i" /><span>我的文件</span></div>,
}, {
    key: 'groupFile',
    option: <div className="yichao_menu_li"><i className="iconfont menu_left_i">&#xe7e0;</i><span>群文件</span></div>,
}];

const AntCloudMenu = React.createClass({
    getInitialState() {
        mMenu = this;
        return {
            selectRowKey:'myFile',
        };
    },

    componentDidMount(){
        mMenu.props.callbackParent(this.state.selectRowKey);
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
                <div className="menu_til">蚁盘</div>
                <Table onRowClick={mMenu.getAntNest} showHeader={false} columns={columns} dataSource={data}
                       rowClassName={mMenu.getRowClassName} className="yichao_menu" pagination={false}/>

            </div>
        );
    },
});
export default AntCloudMenu;