import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Button, Table, message} from 'antd';
import AddShiftModel from './AddShiftModel';
import {doWebService} from '../../WebServiceHelper'
import Confirm from '../ConfirmModal'

const ShiftManagement = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            addShiftModalIsShow: false,
            shiftData: [],  //班次数据
        };
    },

    componentDidMount() {
        //请求班次信息
        this.viewAttendSchedule();
    },

    /**
     * 获取班次
     */
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
     * 删除班次的回调
     */
    delShift(record) {
        this.setState({delRec: record});   //要删除的班次的对象
        this.showConfirmModal();
    },

    /**
     * Confirm打开
     */
    showConfirmModal() {
        this.refs.confirm.changeConfirmModalVisible(true);
    },

    /**
     * Confirm关闭
     */
    closeConfirmModal() {
        this.refs.confirm.changeConfirmModalVisible(false);
    },

    /**
     * 删除班次
     */
    delShiftData() {
        var num = this.state.delRec.key;
        this.refs.confirm.changeConfirmModalVisible(false);
        var _this = this;
        //1.调用接口
        var param = {
            "method": "deleteAttendSchedule",
            "attendScheduleId": num
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" || ret.success == true) {
                    //2.从本地数据删除那条班次信息
                    var arr = _this.state.shiftData;
                    arr.forEach(function (v, i) {
                        if (v.key == num) {
                            arr.splice(i, 1);
                            return
                        }
                    })
                    _this.setState({shiftData: arr});
                    message.success('删除成功');
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 编辑班次的回调
     */
    editShift(record) {
        var param = {
            "method": "viewAttendSchedule",
            "attendScheduleId": record.key
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.response);
                //1.起model
                //2.初始化model
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    addShiftOver() {
        this.viewAttendSchedule();
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        const columns = [{
            title: '班次名称',
            dataIndex: 'name',
            key: 'name',
            className: 'checking_in_name',
        }, {
            title: '考勤时间',
            dataIndex: 'time',
            key: 'time',
            className: 'checking_in_name',
        }, {
            title: '操作',
            key: 'action',
            className: 'ant-table-selection-smallclass checking_in_operate class_right',
            render: (text, record) => (
                <span>
                    {/*<Button type="button" className="score3_i" icon="edit"*/}
                            {/*onClick={_this.editShift.bind(this, record)}></Button>*/}
                    <Button type="button" icon="delete" onClick={_this.delShift.bind(this, record)}></Button>
                </span>
            ),
        }];

        return (
            <div className="group_cont">
                <div className="public—til—blue">考勤详情</div>
                <div className="favorite_scroll" style={{overflow: "auto"}}>
                    <div className="checking_add_box group_cont">
                        <Button type="primary" icon="plus" onClick={this.addShift}>新增班次</Button>
                        <Table className="checking_in_box cloud_box upexam_to_ma" columns={columns}
                               dataSource={this.state.shiftData}
                               pagination={false}/>
                        {/*新增班次model*/}
                        <AddShiftModel
                            isShow={this.state.addShiftModalIsShow}
                            closeModel={this.closeModel}
                            addShiftOver={this.addShiftOver}
                        />
                    </div>
                </div>
                <Confirm
                    ref="confirm"
                    title="确定删除?"
                    onConfirmModalCancel={this.closeConfirmModal}
                    onConfirmModalOK={this.delShiftData}
                />
            </div>
        );
    }
});

export default ShiftManagement;
