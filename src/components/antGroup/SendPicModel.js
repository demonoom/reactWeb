import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Modal, Input, message} from 'antd';

const SendPicModel = React.createClass({

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
        var src = nextProps.pinSrc;
        var picFile = nextProps.picFile;
        var img = <img src={src} alt=""/>;
        this.setState({isShow: nextProps.isShow, img, src, picFile});
    },

    componentDidUpdate() {

    },

    /**
     * 确定的回调
     */
    handleOk() {
        var _this = this;
        var uploadFileList = this.state.picFile;
        var formData = new FormData();
        formData.append("file" + 0, uploadFileList);
        formData.append("name" + 0, uploadFileList.name);
        $.ajax({
            type: "POST",
            url: "http://60.205.86.217:8890/Excoord_Upload_Server/file/upload",
            enctype: 'multipart/form-data',
            data: formData,
            // 告诉jQuery不要去处理发送的数据
            processData: false,
            // 告诉jQuery不要去设置Content-Type请求头
            contentType: false,
            xhr: function () {        //这是关键  获取原生的xhr对象  做以前做的所有事情
                var xhr = jQuery.ajaxSettings.xhr();
                xhr.upload.onload = function () {

                };
                xhr.upload.onprogress = function (ev) {

                };
                return xhr;
            },
            success: function (responseStr) {
                if (responseStr != "") {
                    var fileUrl = responseStr;
                    //fileUrl文件的路径，根据路径创建文件发送对象，ms.send,关闭模态框
                    //调用发送图片的方法
                    _this.props.sendPicToOthers(fileUrl);
                    // setTimeout(function () {
                        _this.closeChangeShiftModal();
                    // },500)
                }
            },
            error: function (responseStr) {
                // antGroup.setState({cloudFileUploadModalVisible: false});
            }
        });
    },

    createUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
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
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <Modal title="发送图片"
                visible={this.state.isShow}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeChangeShiftModal}
                onOk={this.handleOk}
                className="search_map_wrap crop_img"
            >
                <div className="crop_img_i">
                    {this.state.img}
                </div>
            </Modal>
        );
    }
});

export default SendPicModel;
