import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {
    Button, Table, Icon, Row, Col,
    Input, Select, Checkbox, message, Tag, Tooltip
} from 'antd';
import ChangeShiftModel from './ChangeShiftModel'
import ChooseMemberModal from './ChooseMemberModal'
import {doWebService} from '../../WebServiceHelper'
import Confirm from '../ConfirmModal'


var attNameArrF = [];
var attNameArrS = [];
var attNameArrT = [];
var attIdArrF = [];
var attIdArrS = [];
var attIdArrT = [];

const AttendanceManagement = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            optType: 'showAttendance',
            attName: "",//考勤组名称
            selectedRowKeys: [], //默认选中的天数
            changeShiftIsShow: false,
            joinAttMer: [],
            outAttMer: [],
            attPerson: [],
            inputVisible: false,
            inputValue: '',
            chooseMemberModalIsShow: false,
            // posDetil: '',    //考勤详细地址
            posDetilArr: [],   //考勤详细地址包括坐标，对象
            posArr: [],
            attendenceData: [],
            checked: false,
            radiusValue: 300,
            workTime: ['休息', '休息', '休息', '休息', '休息', '休息', '休息'],
            workTimeId: [false, false, false, false, false, false, false],
            defaultAtt: '',
            attendGroupId: '',
        };
    },

    componentDidMount() {
        window.__setPos__ = this.setPos;
        this.viewAttendGroupPage();
    },

    componentWillReceiveProps(nextProps) {

    },

    viewAttendGroupPage() {
        var _this = this;
        var arr = [];
        var param = {
            "method": 'viewAttendGroupPage',
            "colUid": _this.state.loginUser.colUid,
            "pageNo": '-1'
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    console.log(data);
                    //创造attData
                    for (var i = 0; i < data.length; i++) {
                        var str = '';
                        data[i].scheduleList.forEach(function (v) {
                            str += (v + ' ' + ' ' + '|' + ' ' + ' ');
                        });

                        var time = str.substr(0, str.length - 1);
                        var attData = {
                            key: data[i].id,
                            name: data[i].name,
                            num: data[i].memberCount + '人',
                            time: time,
                        };

                        arr.push(attData);
                    }
                    _this.setState({attendenceData: arr})
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    //接收坐标
    /*checkPos(e) {
        var arr = e.split('$');
        var posDetil = arr[1];   //详细地址
        var locationPoint = arr[0];   //坐标
        // console.log(posDetil);
        // console.log(locationPoint);
        //e中存着地理信息会不断传过来，把信息存在本地中，向table数组存完就清空本地。
        // this.setState({posDetil});   //考勤详细地址
    },*/

    /**
     * 删除考勤地点的回调
     * @param record
     */
    delPos(record) {
        //1.在页面删除
        var arr = this.state.posDetilArr;
        arr.forEach(function (v, i) {
            if (v.key == record.key) {
                arr.splice(i, 1);
                return
            }
        });
        this.setState({posDetilArr: arr});
        //2.在最后向后台传的数据中删除
    },

    setPos(e) {
        var arr = e.split('$');
        var posDetil = arr[1];   //详细地址
        var locationPoint = arr[0];   //坐标
        var posArr = this.state.posArr;


        var posDetil = {
            key: locationPoint,
            workpos: posDetil,
        };
        posArr.push(posDetil);
        this.setState({posDetilArr: posArr});
    },

    //增加考勤组
    addAtt() {
        this.setState({optType: 'addAttendance'});
    },

    /**
     * 编辑考勤组
     */
    updateAtt(e) {
        var _this = this;
        this.setState({attendGroupId: e.key});
        var param = {
            "method": 'viewAttendGroup',
            "attendGroupId": e.key,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    //1.调用初始化的方法
                    _this.initUpdateAtt(data);
                    //2.展示编辑窗口
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 删除考勤组的回调
     */
    delAtt(e) {
        this.setState({delAtt: e});   //要删除的班次的对象
        this.showConfirmModal();
    },

    /**
     * 删除考勤组
     */
    delAttData() {
        var num = this.state.delAtt.key;
        this.refs.confirm.changeConfirmModalVisible(false);
        var _this = this;
        //1.调用接口
        var param = {
            "method": "deleteAttendGroup",
            "attendGroupId": num
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" || ret.success == true) {
                    // 2.从本地数据删除那条考勤组信息
                    var arr = _this.state.attendenceData;
                    arr.forEach(function (v, i) {
                        if (v.key == num) {
                            arr.splice(i, 1);
                            return
                        }
                    });
                    _this.setState({attendenceData: arr});
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //返回到主table
    returnTable() {
        var _this = this;
        attNameArrF = [];
        attNameArrS = [];
        attNameArrT = [];
        attIdArrF = [];
        attIdArrS = [];
        attIdArrT = [];
        this.setState({optType: 'showAttendance'});
        this.setState({editAttName: ''});
        this.setState({editSelValue: ''});
        //初始化
        this.setState({posArr: []});
        this.setState({posDetilArr: []});
        this.setState({joinAttMer: []});
        this.setState({outAttMer: []});
        this.setState({attPerson: []});
        this.setState({attName: ''});
        this.setState({checked: false});
        this.setState({workTime: ['休息', '休息', '休息', '休息', '休息', '休息', '休息']});
        this.setState({workTimeId: [false, false, false, false, false, false, false]});
        this.setState({defaultAtt: ''});
        setTimeout(function () {
            _this.viewAttendGroupPage();
        }, 500)
    },

    //考勤组输入框输入的回调
    attNameOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var attName = target.value;
        if (attName.length > 20) {
            message.error("考勤组名称不能超过20个字符");
            return;
        }
        //设置考勤组名称
        this.setState({attName});
    },

    //考勤组输入框输入的回调
    editAttNameOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var editAttName = target.value;
        if (editAttName.length > 20) {
            message.error("考勤组名称不能超过20个字符");
            return;
        }
        //设置考勤组名称
        this.setState({editAttName});
    },

    /**
     * model关闭之后将addShiftModalIsShow重置
     */
    closeModel() {
        this.setState({changeShiftIsShow: false, chooseMemberModalIsShow: false});
    },

    addGroupMember(ids, name, num) {
        ids.forEach(function (v, i) {
            if (num == 1) {
                attIdArrF.push(v);
            } else if (num == 2) {
                attIdArrS.push(v);
            } else {
                attIdArrT.push(v);
            }
        });
        if (num == '1') {
            //参与考勤人员
            this.setState({joinAttPer: attIdArrF});
        } else if (num == '2') {
            //无需考勤人员
            this.setState({outAttPer: attIdArrS});
        } else {
            //考勤组负责人
            this.setState({AttPerAdmin: attIdArrT});
        }
        //这个局部变量arr导致每一次点击增加人员的时候会将以前的人员清空，后期做的时候把他做成全局变量，在最后保存信息的时候将数据清空
        // var arr = [];
        // var array = [];
        name.forEach(function (v, i) {
            if (num == 1) {
                attNameArrF.push(v);
            } else if (num == 2) {
                attNameArrS.push(v);
            } else {
                attNameArrT.push(v);
            }
        });
        //num是1，参与。2，无需。3，负责人
        if (num == 1) {
            this.setState({joinAttMer: attNameArrF})
            // this.setState({joinAttPer: array})
        } else if (num == 2) {
            this.setState({outAttMer: attNameArrS})
            // this.setState({outAttPer: array})
        } else if (num == 3) {
            if (attNameArrT.length > 1) {
                message.error('考勤组负责人只能选择1人');
                //只保留attNameArrT中的第一个名字
                attNameArrT.splice(1, attNameArrT.length);
                this.setState({attPerson: attNameArrT})
            } else {
                this.setState({attPerson: attNameArrT})
                // this.setState({attAdmin: array})
            }

        }
    },

    /**
     * 添加考勤地点的回调
     */
    addShiftPos() {
        this.props.mapShow();
    },

    /**
     * 选择考勤参与人的回调
     */
    chooseMember(e) {
        //e是1，参与。2，无需。3，负责人
        this.setState({chooseMemberModalIsShow: true});
        this.refs.chooseMemberModal.seeAddWhich(e);
    },

    /**
     * 人员tags点击x的回调
     * @param removedTag
     * @param kind
     */
    handleClose(removedTag, kind) {
        if (kind == 1) {
            //参与考勤人员
            const joinAttMer = this.state.joinAttMer;
            const joinAttPer = this.state.joinAttPer;   //id数组
            var delJoinMemberId;
            joinAttMer.forEach(function (v, i) {
                if (removedTag == v) {
                    delJoinMemberId = i;
                }
            });
            joinAttPer.splice(delJoinMemberId, 1);
            this.setState({joinAttPer});
            joinAttMer.filter(joinAttMer => joinAttMer !== removedTag);
            joinAttMer.splice(delJoinMemberId, 1);
            this.setState({joinAttMer});
        } else if (kind == 2) {
            //无需考勤人员
            const outAttMer = this.state.outAttMer;
            const outAttPer = this.state.outAttPer;
            var delOutMemberId;
            outAttMer.forEach(function (v, i) {
                if (removedTag == v) {
                    delOutMemberId = i;
                }
            });
            outAttPer.splice(delOutMemberId, 1);
            this.setState({outAttPer});
            outAttMer.filter(outAttMer => outAttMer !== removedTag);
            outAttMer.splice(delOutMemberId, 1);
            this.setState({outAttMer});
        } else if (kind == 3) {
            //考勤组负责人
            attNameArrT = [];
            attIdArrT = [];
            this.setState({AttPerAdmin: attIdArrT});
            const attPerson = this.state.attPerson;
            attPerson.filter(attPerson => attPerson !== removedTag);
            attPerson.splice(0);
            this.setState({attPerson});
        }
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
     * 保存新增考勤组的回调
     */
    saveNewAtt() {
        //向后台发送数据
        //清空本地数据
        // //保存后返回考勤组列表
        var _this = this;
        var name = this.state.attName;   //考勤组名称
        var isOutWork = this.state.checked;   //是否允许外请打卡
        var joinAttPer = this.state.joinAttPer;
        var outAttPer = this.state.outAttPer;
        var AttPerAdmin = this.state.AttPerAdmin;
        var radiusValue = this.state.radiusValue;   //考勤范围
        var posDetilArr = this.state.posDetilArr;  //考勤地址数组
        var workTimeId = this.state.workTimeId;   //考勤班次id
        if (name.length == '0') {
            message.error('考情组名称不能为空');
            return
        }
        ;
        if (isEmpty(joinAttPer) == true) {
            message.error('请选择参与考勤人员');
            return
        }
        ;
        if (isEmpty(AttPerAdmin) == true) {
            message.error('请选择参与考勤组负责人');
            return
        }
        ;
        if (isEmpty(posDetilArr) == true) {
            message.error('请选择考勤地点');
            return
        }
        ;
        var joinAttPerArr = [];
        joinAttPer.forEach(function (v, i) {
            var obj = {
                colUid: v
            };
            joinAttPerArr.push(obj);
        });
        var outAttPerArr = [];
        if (isEmpty(outAttPer) == false) {
            outAttPer.forEach(function (v, i) {
                var obj = {
                    colUid: v
                };
                outAttPerArr.push(obj);
            });
        }
        var posDetilArray = [];
        posDetilArr.forEach(function (v, i) {
            var arr = v.key.split('@');
            var obj = {
                "name": v.workpos,
                "x": arr[0],
                "y": arr[1]
            };
            posDetilArray.push(obj);
        });
        var workTimeIdArr = [];
        workTimeId.forEach(function (v, i) {
            if (!v || v == 'restDay') {
                var obj = {
                    "week": i + 1,
                    "isRestDay": true,
                };
            } else {
                var obj = {
                    "week": i + 1,
                    "scheduleId": v
                };
            }
            workTimeIdArr.push(obj);
        });
        var param = {
            "method": "addAttendGroup",
            "attendGroup": {
                "creator": {
                    "colUid": _this.state.loginUser.colUid
                },
                "admin": {
                    "colUid": AttPerAdmin[0]
                },
                "name": name,
                "allowOutside": isOutWork,
                "radius": radiusValue,
                "memberSet": joinAttPerArr,
                "privilegeSet": outAttPerArr,
                "scheduleList": workTimeIdArr,
                "locationList": posDetilArray
            }
        };
        console.log(param);
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                // var data = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("保存成功");
                    _this.returnTable();
                } else {
                    message.error(ret.msg);
                }
                //创造shiftData
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 初始化编辑窗口的回调
     * @param data
     */
    initUpdateAtt(data) {
        console.log(data);
        this.setState({editAttName: data.name});  //考勤组名称
        this.setState({editSelValue: data.radius + '米'});  //半径
        var posArr = this.state.posArr;
        data.locationList.forEach(function (v, i) {
            var posDetil = {
                key: v.x + '@' + v.y,
                workpos: v.name,
            };
            posArr.push(posDetil);
        });
        this.setState({posDetilArr: posArr});  //考勤详细地址
        var joinArr = [];
        var joinIdArr = [];
        var outArr = [];
        var outIdArr = [];
        data.memberSet.forEach(function (v, i) {
            joinArr.push(v.name);
            joinIdArr.push(v.colUid);
        });
        attNameArrF = joinArr;
        attIdArrF = joinIdArr;
        this.setState({joinAttMer: joinArr});  //参与人名
        this.setState({joinAttPer: joinIdArr});  //参与人名Id
        data.privilege.forEach(function (v, i) {
            outArr.push(v.name);
            outIdArr.push(v.colUid);
        });
        attNameArrS = outArr;
        attIdArrS = outIdArr;
        this.setState({outAttMer: outArr});   //无需人名
        this.setState({outAttPer: outIdArr});   //无需人名Id
        attNameArrT = [data.admin.name];
        attIdArrT = [data.admin.colUid];
        this.setState({attPerson: [data.admin.name]});   //负责人人名
        this.setState({AttPerAdmin: [data.admin.colUid]});   //负责人人名Id
        var workTime = [];
        var workTimeId = [];
        data.scheduleList.forEach(function (v, i) {
            workTime.push(v.scheduleItems);
            // workTimeId.push(v.scheduleId);
            if (isEmpty(v.scheduleId) == false) {
                workTimeId.push(v.scheduleId)
            } else {
                workTimeId.push(!v.isRestDay)
            }
        });
        this.setState({workTimeId});  //班次id
        this.setState({workTime});  //工作日
        this.setState({optType: 'editAttendance'});
    },

    updateNewAtt() {
        var _this = this;
        var name = this.state.editAttName;   //考勤组名称-
        var radiusValue = this.state.editSelValue;   //考勤范围-
        var isOutWork = this.state.checked;   //是否允许外请打卡
        var joinAttPer = this.state.joinAttPer;
        var outAttPer = this.state.outAttPer;
        var AttPerAdmin = this.state.AttPerAdmin;
        if (radiusValue.charAt(radiusValue.length - 1) == '米') {
            radiusValue = radiusValue.substr(0, radiusValue.length - 1);
        }
        ;
        var posDetilArr = this.state.posDetilArr;  //考勤地址数组
        var workTimeId = this.state.workTimeId;   //考勤班次id
        if (name.length == '0') {
            message.error('考情组名称不能为空');
            return
        }
        ;
        if (isEmpty(joinAttPer) == true) {
            message.error('请选择参与考勤人员');
            return
        }
        ;
        if (isEmpty(AttPerAdmin) == true) {
            message.error('请选择参与考勤组负责人');
            return
        }
        ;
        if (isEmpty(posDetilArr) == true) {
            message.error('请选择考勤地点');
            return
        }
        ;
        var joinAttPerArr = [];
        joinAttPer.forEach(function (v, i) {
            var obj = {
                colUid: v
            };
            joinAttPerArr.push(obj);
        });
        var outAttPerArr = [];
        if (isEmpty(outAttPer) == false) {
            outAttPer.forEach(function (v, i) {
                var obj = {
                    colUid: v
                };
                outAttPerArr.push(obj);
            });
        }
        var posDetilArray = [];
        posDetilArr.forEach(function (v, i) {
            var arr = v.key.split('@');
            var obj = {
                "name": v.workpos,
                "x": arr[0],
                "y": arr[1]
            };
            posDetilArray.push(obj);
        });
        var workTimeIdArr = [];
        workTimeId.forEach(function (v, i) {
            if (!v || v == 'restDay') {
                var obj = {
                    "week": i + 1,
                    "isRestDay": true,
                };
            } else {
                var obj = {
                    "week": i + 1,
                    "scheduleId": v
                };
            }
            workTimeIdArr.push(obj);
        });
        var attendGroupId = this.state.attendGroupId;
        var param = {
            "method": "updateAttendGroup",
            "attendGroup": {
                "id": attendGroupId,
                "creator": {
                    "colUid": _this.state.loginUser.colUid
                },
                "admin": {
                    "colUid": AttPerAdmin[0]
                },
                "name": name,
                "allowOutside": isOutWork,
                "radius": radiusValue,
                "memberSet": joinAttPerArr,
                "privilegeSet": outAttPerArr,
                "scheduleList": workTimeIdArr,
                "locationList": posDetilArray
            }
        };
        console.log(param);
        // debugger
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                // var data = ret.response;
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("保存成功");
                    _this.returnTable();
                } else {
                    message.error(ret.msg);
                }
                //创造shiftData
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    IsOutWorkOnChange(e) {
        this.setState({checked: e.target.checked});
    },

    /**
     * 范围变化的回调
     */
    radiusChange(value) {
        this.setState({radiusValue: value});
    },

    /**
     * 编辑范围变化的回调
     */
    editRadiusChange(value) {
        this.setState({editSelValue: value});
    },

    /**
     * 更改班次的回调
     */
    changeShift() {
        this.setState({changeShiftIsShow: true, allSelect: true});
    },

    /**
     * 改变某一项的回调
     */
    changeShiftOne(e) {
        this.setState({changeShiftIsShow: true, allSelect: false, selectDay: e.key});
    },

    callbackRecord(data) {
        var workTime = data.name + ',' + data.time;
        var workId = data.key;
        //点击确定之后拿到选择的班次，将班次设置给表格的中间的数据
        var allSelect = this.state.allSelect;
        var array = this.state.workTimeId;
        if (allSelect) {
            //是全选设置
            var arr = this.state.workTime;

            arr.forEach(function (v, i) {
                arr[i] = workTime;
                array[i] = workId;
            });
            this.setState({workTime: arr});
            this.setState({workTimeId: array});
            this.setState({defaultAtt: data.name + ': ' + data.time});
        } else {
            //是单个设置
            var selectDay = this.state.selectDay;
            var arr = this.state.workTime;
            arr.forEach(function (v, i) {
                if (i == selectDay) {
                    arr[i] = workTime;
                    array[i] = workId;
                }
            });
            this.setState({workTime: arr});
            this.setState({workTimeId: array});
        }

    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;

        const workdate = [{
            key: '0',
            workday: '周一',
            worktime: _this.state.workTime[0],
        }, {
            key: '1',
            workday: '周二',
            worktime: _this.state.workTime[1],
        }, {
            key: '2',
            workday: '周三',
            worktime: _this.state.workTime[2],
        }, {
            key: '3',
            workday: '周四',
            worktime: _this.state.workTime[3],
        }, {
            key: '4',
            workday: '周五',
            worktime: _this.state.workTime[4],
        }, {
            key: '5',
            workday: '周六',
            worktime: _this.state.workTime[5],
        }, {
            key: '6',
            workday: '周日',
            worktime: _this.state.workTime[6],
        }];

        //设置考勤组表头
        const workDayCol = [{
            title: '工作日',
            dataIndex: 'workday',
            key: 'workday',
        }, {
            title: '班次时间段',
            dataIndex: 'worktime',
            key: 'worktime',
        }, {
            title: '操作',
            key: 'action',
            className: 'checking_in_change',
            render: (text, record) => (
                <span>
            <a onClick={_this.changeShiftOne.bind(this, record)}>更改班次</a>
        </span>
            ),
        }];
        //考勤组表头
        const columns = [{
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            className: 'checking_in_date',
        }, {
            title: '人数',
            dataIndex: 'num',
            key: 'num',
            className: 'ant-table-selection-user2 class_right date_tr',
        }, {
            title: '考勤时间',
            dataIndex: 'time',
            key: 'time',
            className: 'checking_in_name  checking_in_name_time',
        }, {
            title: '操作',
            className: 'ant-table-selection-smallclass checking_in_operate class_right',
            key: 'action',
            render: (text, record) => (
                <span>
                   <Button type="button" className="score3_i" icon="edit"
                           onClick={_this.updateAtt.bind(this, record)}></Button>
                    <Button type="button" icon="delete" onClick={_this.delAtt.bind(this, record)}></Button>
                </span>
            ),
        }];

        //考勤地点表头
        const workPositionCol = [{
            title: '考勤地址',
            dataIndex: 'workpos',
            key: 'workpos',
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={_this.delPos.bind(this, record)}>删除</a>
                </span>
            ),
        }];

        const {joinAttMer, outAttMer, attPerson, inputVisible, inputValue} = this.state;
        //顶部banner
        var title;
        //页面主体部分
        var mainTable;
        //保存按钮
        var saveButton = <Button type="primary" onClick={this.saveNewAtt}>保存设置</Button>;
        //更新按钮
        var upDateButton = <Button type="primary" onClick={this.updateNewAtt}>保存设置</Button>;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);

            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };

        //表单元素
        var stepPanel = <div>
            <div className="checking_add_box checking_in_31">
                <Row>
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组名称：</Col>
                    <Col span={10}>
                        <Input placeholder="请输入考勤组名称" value={this.state.attName} onChange={this.attNameOnChange}/>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">参与考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {joinAttMer.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 1)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 1)}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">无需考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {outAttMer.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 2)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 2)}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组负责人：</Col>
                    <Col span={18}>
                            <span>
                                {attPerson.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 3)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 3)}>请选择</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <span className="password_ts checking_in_le">协助管理员分管本考勤组的排班及统计，只能选择1人</span>
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className="knowledge_ri knowledge_ri_8">工作日设置：</Col>
                    <Col span={10}>
                        <span>{this.state.defaultAtt}</span>
                        <a href="javascript:;" onClick={this.changeShift} className="add_out">更改班次</a>
                    </Col>
                </Row>

                {/*<Table columns={workDayCol} dataSource={workdate} pagination={false} rowSelection={rowSelection}*/}
                <Table columns={workDayCol} dataSource={workdate} pagination={false}
                       className="upexam_to_ma ant-col-20 checking_in_le "/>

                <Row className="upexam_to_ma upexam_float name_max4_24">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤地址：</Col>
                    <Col span={20}>
                        <span>根据办公地点考勤（可添加多个考勤地点）有效范围</span>
                        <span className="add_out">
                            <Select style={{width: 75}} defaultValue="300米" onChange={this.radiusChange}>
                            <Option value="100">100米</Option>
                            <Option value="200">200米</Option>
                            <Option value="300">300米</Option>
                            <Option value="400">400米</Option>
                            <Option value="500">500米</Option>
                            <Option value="600">600米</Option>
                            <Option value="700">700米</Option>
                            <Option value="800">800米</Option>
                            </Select>
                        </span>

                    </Col>
                </Row>

                {/*考勤地址table*/}
                <Table className="upexam_to_ma ant-col-20 checking_in_le min_53" columns={workPositionCol}
                       dataSource={this.state.posDetilArr} pagination={false}/>
                <div className="checking_in_le">
                    <a className="upexam_to_ma checking_in_l31" href="javascript:;"
                       onClick={this.addShiftPos}>添加考勤地点</a>
                    <br/>
                    <Checkbox disabled className="checking_in_l31" onChange={this.IsOutWorkOnChange}
                              checked={this.state.checked}>允许外勤打卡</Checkbox>
                    <div className="checking_in_l31 password_ts">关闭后，范围外不允许打卡</div>
                </div>

            </div>
        </div>;

        //编辑的表单元素，要初始化
        var editStepPanel = <div>
            <div className="checking_add_box checking_in_31">
                <Row>
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组名称：</Col>
                    <Col span={10}>
                        <Input placeholder="请输入考勤组名称" value={this.state.editAttName}
                               onChange={this.editAttNameOnChange}/>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">参与考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {joinAttMer.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 1)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 1)}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">无需考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {outAttMer.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 2)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 2)}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组负责人：</Col>
                    <Col span={18}>
                            <span>
                                {attPerson.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 3)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 3)}>请选择</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <span className="password_ts checking_in_le">协助管理员分管本考勤组的排班及统计，只能选择1人</span>
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className="knowledge_ri knowledge_ri_8">工作日设置：</Col>
                    <Col span={10}>
                        <span>{this.state.defaultAtt}</span>
                        <a href="javascript:;" onClick={this.changeShift} className="add_out">更改班次</a>
                    </Col>
                </Row>
                {/*<Table columns={workDayCol} dataSource={workdate} pagination={false} rowSelection={rowSelection}*/}
                <Table columns={workDayCol} dataSource={workdate} pagination={false}
                       className="upexam_to_ma ant-col-20 checking_in_le "/>
                <Row className="upexam_to_ma upexam_float name_max4_24">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤地址：</Col>
                    <Col span={20}>
                        <span>根据办公地点考勤（可添加多个考勤地点）有效范围</span>
                        <span className="add_out">
                            <Select style={{width: 75}} value={this.state.editSelValue}
                                    onChange={this.editRadiusChange}>
                            <Option value="100">100米</Option>
                            <Option value="200">200米</Option>
                            <Option value="300">300米</Option>
                            <Option value="400">400米</Option>
                            <Option value="500">500米</Option>
                            <Option value="600">600米</Option>
                            <Option value="700">700米</Option>
                            <Option value="800">800米</Option>
                            </Select>
                        </span>

                    </Col>
                </Row>
                <Table className="upexam_to_ma ant-col-20 checking_in_le min_53" columns={workPositionCol}
                       dataSource={this.state.posDetilArr} pagination={false}/>
                <div className="checking_in_le">
                    <a className="upexam_to_ma checking_in_l31" href="javascript:;"
                       onClick={this.addShiftPos}>添加考勤地点</a>
                    <br/>
                    <Checkbox disabled className="checking_in_l31" onChange={this.IsOutWorkOnChange}
                              checked={this.state.checked}>允许外勤打卡</Checkbox>
                    <div className="checking_in_l31 password_ts">关闭后，范围外不允许打卡</div>
                </div>
            </div>
        </div>;

        if (this.state.optType == 'showAttendance') {
            //考勤组展示
            title = <div className="public—til—blue">考勤详情</div>;
            mainTable =
                <div className="favorite_scroll" style={{overflow: "auto"}}>
                    <div className="checking_add_box group_cont">
                        <div>
                            <Button type="primary" icon="plus" onClick={this.addAtt}>新增考勤组</Button>
                        </div>
                        <Table className="checking_in_box cloud_box upexam_to_ma " columns={columns}
                               dataSource={this.state.attendenceData}
                               pagination={false}/>
                    </div>
                </div>;
        } else if (this.state.optType == 'addAttendance') {
            //新增考勤组
            title = <div className="public—til—blue">
                <div className="ant-tabs-right">
                    <Button onClick={this.returnTable}><Icon type="left"/></Button>
                </div>
                考勤详情
            </div>;

            mainTable =
                <div className="favorite_scroll" style={{overflow: "auto"}}>
                    {/*表单提交*/}
                    {stepPanel}
                    <div>
                        <Row>
                            <Col span={24} className="class_right yinyong_topic">
                                {saveButton}
                            </Col>
                        </Row>
                    </div>
                </div>;
        } else {
            //编辑考勤组
            title = <div className="public—til—blue">
                <div className="ant-tabs-right">
                    <Button onClick={this.returnTable}><Icon type="left"/></Button>
                    {/*returnTable的初始化可能不符合要求,返回的位置需要针对*/}
                </div>
                考勤详情
            </div>;

            mainTable =
                <div className="favorite_scroll" style={{overflow: "auto"}}>
                    {/*编辑表单提交*/}
                    {editStepPanel}
                    <div>
                        <Row>
                            <Col span={24} className="class_right yinyong_topic">
                                {upDateButton}
                                {/*saveButton请求的方法不是更新的方法要换*/}
                            </Col>
                        </Row>
                    </div>
                </div>;
        }

        return (
            <div className="group_cont">
                {title}
                {mainTable}
                <ChangeShiftModel
                    isShow={this.state.changeShiftIsShow}
                    closeModel={this.closeModel}
                    callbackRecord={this.callbackRecord}
                />
                <ChooseMemberModal
                    isShow={this.state.chooseMemberModalIsShow}
                    onCancel={this.closeModel}
                    addGroupMember={this.addGroupMember}
                    ref="chooseMemberModal"
                />
                <Confirm
                    ref="confirm"
                    title="确定删除?"
                    onConfirmModalCancel={this.closeConfirmModal}
                    onConfirmModalOK={this.delAttData}
                />
            </div>
        );
    }
});

export default AttendanceManagement;
