import React, {PropTypes} from 'react';
import {message, Button, Modal} from 'antd';
import {isEmpty} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
import UploadImgComponents from './UploadImgComponents'

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
            isShow: false,
            topicImgUrl: [],     //说说/话题上传的图片路径,
        };
    },

    componentDidMount() {

    },

    componentDidUpdate() {
        if (isEmpty(document.getElementById("schoolMap")) == false) {
            document.getElementById("schoolMap").addEventListener('click', schoolMap.simulateClick);
        }
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
        if (isEmpty(schoolMap.state.sectionStyle)) {
            message.error('学校没有平面图，请上传平面图', 2)
            return
        }
        //1.清除画布
        context.clearRect(0, 0, canvas.width, canvas.height);
        //2.改变this.state.classRoomArr调用buildClassRoomList
        this.state.classRoomArr[this.state.imgPointIndex - 1].value = (e.offsetX / canvas.width).toFixed(6) + '-' + (e.offsetY / canvas.height).toFixed(6);
        this.buildClassRoomList()
        //3.根据this.state.classRoomArr重新描点
        // context.fillText(this.state.imgPointIndex, e.offsetX, e.offsetY)
        this.drawPointAgain(this.state.classRoomArr)
    },

    /**
     * 二次描点
     * @param data
     */
    drawPointAgain(data) {
        if (isEmpty(data) == false) {
            data.forEach(function (v, i) {
                if (isEmpty(v.value) == false) {
                    context.fillText(i + 1, v.value.split('-')[0] * canvas.width, v.value.split('-')[1] * canvas.height)
                }
            })
        }
    },

    /**
     * 教室地址聚焦的回调
     * @param data
     * @param index
     */
    clazzOnFocus(data, index, e) {
        for (var i = 0; i < document.getElementsByClassName('bindCoordinates_t_l').length; i++) {
            document.getElementsByClassName('bindCoordinates_t_l')[i].className = 'bindCoordinates_t_l'
        }
        e.target.className = 'bindCoordinates_t_l bindCoordinates_t_select'
        schoolMap.setState({imgPointIndex: index + 1});
        if (isEmpty(schoolMap.state.sectionStyle)) {
            message.error('学校没有平面图，请上传平面图', 2)
        }
    },

    /**
     * 查看学校绑定的所有地图
     */
    getSchoolMapBySchoolId(falg) {
        var _this = this;
        var param = {
            "method": 'getSchoolMapBySchoolId',
            "schId": _this.state.loginUser.schoolId,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功' && ret.success == true) {
                    if (isEmpty(ret.response) == false) {
                        var sectionStyle = {
                            backgroundSize: "100% 100%",
                            backgroundImage: `url(${ret.response.path})`,
                        };
                        _this.setState({sectionStyle});
                    } else {
                        message.error('学校没有平面图，请上传平面图', 2)
                    }
                    if (falg) {
                        _this.viewClassRoomPage()
                    }
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
                    _this.drawPoint(ret.response)
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 初始化描点
     * @param data
     */
    drawPoint(data) {
        if (isEmpty(data) == false) {
            data.forEach(function (v, i) {
                if (isEmpty(v.location) == false) {
                    context.fillText(i + 1, v.location.x * canvas.width, v.location.y * canvas.height)
                }
            })
        }
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
        if (isEmpty(this.state.classRoomArr) == false) {
            this.state.classRoomArr.forEach(function (v, i) {
                var clazzInp = <div key={i} className="bindCoordinates_list noom_cursor">
                    <span className="bindCoordinates_name focus_3"><span>{(i + 1)}</span><span
                        className="bindCoordinates_t_l"
                        onClick={_this.clazzOnFocus.bind(this, v, i)}>{v.name}</span></span>
                    <div className="bindCoordinates_xy">
                        <div>X:{_this.state.classRoomArr[i].value.split('-')[0]}</div>
                        <div>Y:{_this.state.classRoomArr[i].value.split('-')[1]}</div>
                    </div>
                </div>;
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
                if (isEmpty(v.value) == false) {
                    if (isEmpty(v.location) == false) {
                        arr.push(
                            {
                                id: v.location.id,
                                roomId: v.id,
                                x: v.value.split('-')[0],
                                y: v.value.split('-')[1],
                            }
                        )
                    } else {
                        arr.push(
                            {
                                roomId: v.id,
                                x: v.value.split('-')[0],
                                y: v.value.split('-')[1],
                            }
                        )
                    }
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
                console.log(ret);
                if (ret.msg == '调用成功' && ret.success == true) {
                    message.success('成功')
                    _this.setState({isShow: false})
                } else {
                    // message.fail(ret.msg)
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    closebindCoordinatesModel() {
        this.setState({isShow: false})
        this.setState({topicImgUrl: []})
    },

    /**
     * 设置窗口的显示和关闭
     * 将isShow=true向下传递,最终会设置
     * isShow必须一开始就设置为true将dom进行渲染,否则无法找到canvas
     * @param isShow
     * @param content
     */
    changeConfirmModalVisible(isShow) {
        this.setState({isShow})
        this.getSchoolMapBySchoolId(true)
        canvas = document.getElementById('schoolMap');
        context = canvas.getContext('2d');
        canvas.width = document.getElementsByClassName('bindCoordinates_cont')[0].offsetWidth - 260;
        canvas.height = document.getElementsByClassName('bindCoordinates_cont')[0].offsetHeight - 30;
        context.font = '900 20px 微软雅黑'
        context.fillStyle = '#ffff00'
    },

    /*获取上传图片信息*/
    getUploadedImgList(file, isRemoved) {
        var _this = this;
        this.removeImgViewStyle(); //移除图片上传组件的pointerEvents样式属性
        var imgUrl = file.response;
        if (isEmpty(isRemoved) == false && isRemoved == "removed") {
            for (var i = 0; i < this.state.topicImgUrl.length; i++) {
                if (this.state.topicImgUrl[i] == imgUrl) {
                    this.state.topicImgUrl.splice(i, 1);
                }
            }
        } else {
            this.state.topicImgUrl.push(imgUrl);
        }
        if (isEmpty(imgUrl) == false) {
            _this.uploadImg(imgUrl)
        }
    },

    uploadImg(imgUrl) {
        var _this = this;
        var param = {
            "method": 'bindSchoolMap',
            "adminId": this.state.loginUser.colUid,
            "mapURL": imgUrl,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == '调用成功' && ret.success == true) {
                    //刷新地图
                    _this.getSchoolMapBySchoolId(false)
                    //清空打点
                     _this.setState({topicImgUrl: []})
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 移除图片上传组件的pointerEvents样式属性
     * 原值为none时，会导致无法点击预览
     */
    removeImgViewStyle() {
        var imgViewObjArray = $("a[rel='noopener noreferrer']");
        for (var i = 0; i < imgViewObjArray.length; i++) {
            var imgViewObj = imgViewObjArray[i];
            imgViewObj.style.pointerEvents = "";
        }
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        return (
            <Modal
                visible={this.state.isShow}
                title="批量编辑教室坐标"
                width="860px"
                onCancel={this.closebindCoordinatesModel}
                transitionName=""  //禁用modal的动画效果
                className="bindCoordinatesBody"
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                footer={[
                    <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                            onClick={this.bindRoomLocation}>保存</button>
                ]}
            >
                <span className="bindTitlehint">（请先点击教室名称,然后在地图中点击对应位置）</span>
                <div className="bindCoordinates" style={{height: 449}}>
                    {/*<div className="public—til—blue">请先点击教室名称,然后在地图中点击对应位置</div>*/}
                    <div className="favorite_scroll bindCoordinates_cont">
                        <div className="bottom-B-11">
                            <span className="updateText ri-R-20 upexam_float">上传学校平面图</span>
                            <UploadImgComponents  callBackParent={this.getUploadedImgList}
                                                  fileList={this.state.topicImgUrl} />
                        </div>
                        <canvas
                            style={this.state.sectionStyle}
                            id='schoolMap'
                        />
                        <div className="bindCoordinates_t">
                            <div className="bindCoordinates_t_list">
                                <span className="bindCoordinates_t_name">教室名称</span>
                                <span className="bindCoordinates_t_xy">坐标值</span>
                            </div>
                            {this.state.clazzArr}
                        </div>

                    </div>
                </div>
            </Modal>

        )
    }
});

export default BindCoordinates;
