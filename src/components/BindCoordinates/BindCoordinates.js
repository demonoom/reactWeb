import React, {PropTypes} from 'react';
import {Input, message, Button} from 'antd';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';

var schoolMap;
var canvas;
var context;

const BindCoordinates = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        schoolMap = this;
        return {
            loginUser: loginUser,
            classRoomArr: [],
        };
    },

    componentDidMount() {
        this.getSchoolMapBySchoolId()
        canvas = document.getElementById('schoolMap');
        context = canvas.getContext('2d');
        canvas.width = 620;
        canvas.height = 580;
    },

    componentDidUpdate() {
        document.getElementById("schoolMap").addEventListener('click', schoolMap.simulateClick);
    },

    /**
     * 地图被点击的回调
     * @param e
     */
    simulateClick(e) {
        if (isEmpty(this.state.imgPointIndex)) {
            message.error('请先选一个教室', 2)
            return
        }
        context.fillText(this.state.imgPointIndex, e.offsetX, e.offsetY)
        this.state.classRoomArr[this.state.imgPointIndex - 1].value = e.offsetX + '.' + e.offsetY;
        this.buildClassRoomList()
    },

    /**
     * 教室地址聚焦的回调
     * @param data
     * @param index
     */
    clazzOnFocus(data, index) {
        schoolMap.setState({imgPointIndex: index + 1});
    },

    /**
     * 查看学校绑定的所有地图
     */
    getSchoolMapBySchoolId() {
        var _this = this;
        var param = {
            "method": 'getSchoolMapBySchoolId',
            "schId": _this.state.loginUser.schoolId,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功' && ret.success == true) {
                    var sectionStyle = {
                        backgroundSize: "100% 100%",
                        backgroundImage: `url(${ret.response.path})`,
                    };
                    _this.setState({sectionStyle});
                    _this.viewClassRoomPage()
                    //查看当前时间的教室人数热点图
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取初始数据
     */
    viewClassRoomPage() {
        var _this = this;
        var param = {
            "method": 'viewClassRoomPage',
            "uid": this.state.loginUser.colUid,
            "pn": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功' && ret.success == true) {
                    _this.makeClassRoomList(ret.response)
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 初始化数据列表
     * @param data
     */
    makeClassRoomList(data) {
        var arr = []
        if (isEmpty(data) == false) {
            data.forEach(function (v, i) {
                var obj = {
                    name: v.name,
                    value: '',
                    id: v.id
                }
                if (isEmpty(v.location) == false) {
                    obj.location = v.location
                    obj.value = v.location.x + '-' + v.location.y
                }
                arr.push(obj);
            })
        }
        this.setState({classRoomArr: arr});
        this.buildClassRoomList()
    },

    /**
     * 构建渲染列表
     */
    buildClassRoomList() {
        var arr = [];
        var _this = this;
        console.log(this.state.classRoomArr);
        if (isEmpty(this.state.classRoomArr) == false) {
            this.state.classRoomArr.forEach(function (v, i) {
                var clazzInp = <div key={i}>
                    <span>{(i + 1) + '.' + v.name}</span>
                    <Input placeholder="Basic usage" value={_this.state.classRoomArr[i].value}
                           onFocus={_this.clazzOnFocus.bind(this, v, i)}/>
                </div>
                arr.push(clazzInp);
            })
        }
        this.setState({clazzArr: arr})
    },

    /**
     * 给教室绑定位置
     */
    bindRoomLocation() {
        var _this = this;
        var arr = [];
        if (isEmpty(_this.state.classRoomArr) == false) {
            _this.state.classRoomArr.forEach(function (v) {
                if (isEmpty(v.location) == false) {
                    arr.push(
                        {
                            id: v.location.id,
                            roomId: v.id,
                            x: (v.value.split('.')[0] / canvas.width).toFixed(6),
                            y: (v.value.split('.')[1] / canvas.height).toFixed(6),
                        }
                    )
                } else {
                    arr.push(
                        {
                            roomId: v.id,
                            x: (v.value.split('.')[0] / canvas.width).toFixed(6),
                            y: (v.value.split('.')[1] / canvas.height).toFixed(6),
                        }
                    )
                }
            })
        }
        var obj = {
            locations: arr
        }
        var param = {
            "method": 'bindRoomLocation',
            "location": obj,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功' && ret.success == true) {
                    message.success('成功')
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <div style={{overflow: 'auto'}}>
                <canvas
                    style={this.state.sectionStyle}
                    id='schoolMap'
                />
                <div>
                    {this.state.clazzArr}
                </div>
                <Button type="primary" onClick={this.bindRoomLocation}>确定</Button>
            </div>
        );
    }
});

export default BindCoordinates;
