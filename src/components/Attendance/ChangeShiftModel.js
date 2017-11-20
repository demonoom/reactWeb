import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Modal, message} from 'antd';
import {doWebService} from '../../WebServiceHelper'

const columns = [{
    title: '班次名称',
    dataIndex: 'name',
    key: 'name',

}, {
    title: '考勤时间',
    dataIndex: 'time',
    key: 'time',
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
        this.viewAttendSchedule();
    },

    componentWillReceiveProps(nextProps) {
        this.setState({isShow: nextProps.isShow});
    },

    viewAttendSchedule() {
        var _this = this;
        var arr = [];
        var param = {
            "method": 'viewAttendSchedulePage',
            "colUid": _this.state.loginUser.colUid,
            "pageNo": '-1'
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                //创造shiftData
                for (var i = 0; i < data.length; i++) {
                    var str = '';
                    data[i].items.forEach(function (v, i) {
                        str += (v.checkIn + '--' + v.checkOut + ',');
                    });
                    var time = str.substr(0, str.length - 1);
                    var shift = {
                        key: data[i].id,
                        name: data[i].name,
                        time: time
                    };
                    arr.push(shift);
                }
                _this.setState({shiftData: arr})
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 确定的回调
     */
    handleOk() {
        //将数据返回父组件
        var record = this.state.record;
        if (isEmpty(record) == true) {
            message.error('请先选择班次');
            return
        }
        this.props.callbackRecord(record);
        this.closeChangeShiftModal();
    },

    /**
     * 关闭model的回调
     */
    closeChangeShiftModal() {
        this.setState({
            isShow: false,
            record: null,
        });
        this.props.closeModel();
    },

    /**
     * 行点击的回调
     */
    onRowClick(record, index) {
        // console.log(record);
        this.setState({record});
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
                    <Table columns={columns} dataSource={this.state.shiftData} pagination={false}
                           onRowClick={this.onRowClick} className="change_model"/>
                </div>
            </Modal>
        );
    }
});

export default ChangeShiftModel;
