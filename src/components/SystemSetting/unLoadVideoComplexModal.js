/**
 * Created by noom on 17-9-7.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Input, Button, Row, Col, message, Checkbox, Transfer, Table, Select, Tag, Tooltip} from 'antd';
import {isEmpty} from '../../utils/utils';
import UploadImgAndVideoComponents from './UploadImgAndVideoComponents';


class MakeDingModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            topicImgUrl: [],     //说说/话题上传的图片路径,
            inputVisible: false,
        };
        this.MakeDingModalHandleCancel = this.MakeDingModalHandleCancel.bind(this);
        this.getUploadedImgList = this.getUploadedImgList.bind(this);
        this.removeImgViewStyle = this.removeImgViewStyle.bind(this);
        this.upLoad = this.upLoad.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.setState({isShow});
        var callbackId = nextProps.callbackId
        this.setState({callbackId});
    }

    /**
     * 模态框关闭回调
     * @constructor
     */
    MakeDingModalHandleCancel() {
        this.setState({"isShow": false});
        this.props.closeDingModel();
        this.state.topicImgUrl = [];
    }

    /*获取上传图片信息*/
    getUploadedImgList(file, isRemoved) {
        this.removeImgViewStyle(); //移除图片上传组件的pointerEvents样式属性
        var imgUrl = file.response + '?fileName=' + file.name;
        // var imgUrl = file.response;
        if (isEmpty(isRemoved) == false && isRemoved == "removed") {
            for (var i = 0; i < this.state.topicImgUrl.length; i++) {
                if (this.state.topicImgUrl[i] == imgUrl) {
                    this.state.topicImgUrl.splice(i, 1);
                }
            }
        } else {
            this.state.topicImgUrl.push(imgUrl);
        }
    }

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
    }

    upLoad() {
        //拿到图片的路径
        var arr = this.state.topicImgUrl;
        //传给littlePanel
        var callbackId = this.state.callbackId;
        window.__selectComplexVideoUpload__(arr, callbackId);
        //设置model关闭
        this.MakeDingModalHandleCancel();
    }

    render() {
        return (
            <Modal
                visible={this.state.isShow}
                width={400}
                title={"上传文件"}
                onCancel={this.MakeDingModalHandleCancel}
                transitionName=""  //禁用modal的动画效果
                maskClosable={false} //设置不允许点击蒙层关闭
                footer={[]}
                className="new_add_ding"
            >
                <div className="noomUpLoadFile_wrap">
                    <UploadImgAndVideoComponents callBackParent={this.getUploadedImgList}
                                            fileList={this.state.topicImgUrl}
                                            multiples={true}
                    />
                    <div className="class_right"><Button className="noomUpLoadFile_btn" type="primary"
                                                         onClick={this.upLoad}>确定</Button></div>
                </div>
            </Modal>
        );
    }

}

export default MakeDingModal;
