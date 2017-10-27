import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, Table} from 'antd';
import AddShiftModel from './AddShiftModel';

const columns = [{
    title: '班次名称',
    dataIndex: 'name',
    key: 'name',
}, {
    title: '考勤时间',
    dataIndex: 'time',
    key: 'time',
}, {
    title: '操作',
    key: 'action',
    render: (text, record) => (
        <span>
      <a href="#">编辑</a>
      <span className="ant-divider"/>
      <a href="#">删除</a>
    </span>
    ),
}];

//假数据
const data = [{
    key: '1',
    name: 'A',
    time: '09:00-18:00 19:00-22:00',
}, {
    key: '2',
    name: 'B',
    time: '09:00-18:00',
}, {
    key: '3',
    name: 'C',
    time: '19:00-22:00',
}];

const ShiftManagement = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            addShiftModalIsShow: false,

        };
    },

    componentDidMount() {

    },

    /**
     * 新增班次的回调
     */
    addShift() {
        this.setState({addShiftModalIsShow: true});
    },

    /**
     * model关闭之后将addShiftModalIsShow重置
     */
    closeModel() {
        this.setState({addShiftModalIsShow: false});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <div className="public—til—blue">考勤详情</div>
                <Button type="primary" icon="plus" onClick={this.addShift}>新增班次</Button>

                <Table columns={columns} dataSource={data} pagination={false}/>

                <AddShiftModel
                    isShow={this.state.addShiftModalIsShow}
                    closeModel={this.closeModel}
                />
            </div>
        );
    }
});

export default ShiftManagement;
