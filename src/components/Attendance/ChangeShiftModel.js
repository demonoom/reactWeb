import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Modal} from 'antd';

const columns = [{
    title: '班次名称',
    dataIndex: 'name',
    key: 'name',

}, {
    title: '考勤时间',
    dataIndex: 'time',
    key: 'time',
}];

const data = [{
    key: '1',
    name: 'A',
    time: '09:00-18:00 19:00-22:00',
}, {
    key: '2',
    name: 'B',
    time: '09:00-18:00 19:00-22:00',
}, {
    key: '3',
    name: 'C',
    time: '09:00-18:00 19:00-22:00',
}];

const ChangeShiftModel = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            changeShiftIsShow: false,
            isShow: false,
        };
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        this.setState({isShow: nextProps.isShow});
    },

    /**
     * 确定的回调
     */
    handleOk() {
        alert('确定');
    },

    /**
     * 关闭model的回调
     */
    closeChangeShiftModal() {
        this.setState({
            isShow: false,
        });
        this.props.closeModel();
    },

    /**
     * 行点击的回调
     */
    onRowClick(record, index) {
        console.log(record);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <Modal
                title="选择班次"
                visible={this.state.isShow}
                width={480}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeChangeShiftModal}
                onOk={this.handleOk}
                className="schoolgroup_modal"
            >
                <div>
                    <Table columns={columns} dataSource={data} pagination={false} onRowClick={this.onRowClick} className="change_model" />
                </div>
            </Modal>
        );
    }
});

export default ChangeShiftModel;
