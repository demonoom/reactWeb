import React, {PropTypes} from 'react';
import {Upload, Icon, Button, message, Modal} from 'antd';
import {isEmpty} from '../../utils/Const';

var subjectFather;
var fileList = [];
var noom = [];

/**
 * 微课视频文件上传的组件
 */
const WeiClassUploadComponents = React.createClass({

    getInitialState() {
        return {
            defaultFileList: [],
            subjectInfo: this.props.params,
            previewVisible: false,
            previewImage: '',
            fileList:[],
        };
    },

    componentDidMount() {
        var upLoadNum = this.props.upLoadNumber;
        var videoName = this.props.videoName;
        // console.log(this.props.upLoadNum);
        console.log(videoName);
        console.log('~~~~~~');
        this.setState({upLoadNum});
        this.setState({videoName})
    },

    componentWillMount() {
        console.log("will:" + this.props.noom);
        noom = [];
        if (typeof(this.props.noom) != "undefined" && this.props.noom.length != 0) {
            noom = this.props.noom;
        }
        this.setState({fileList: noom});
    },
    /**
     * 课程封面图片(微课上传组件)
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        noom = [];
        noom = nextProps.noom;
        var defaultFileList = [];
        if (typeof(nextProps.fileList) != "undefined" && nextProps.fileList.length != 0) {
            defaultFileList = nextProps.fileList;
        }
        var videoName = this.props.videoName;
        this.setState({videoName})
        this.setState({fileList: defaultFileList});
    },

    showInfo(e) {
    },

    onRemove() {
        alert(1);
        // noom = [];
    },

    render() {
        var _this = this;
        const props = {
            key: _this.props.params,
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            listType: 'text',
            defaultFileList: noom,
            onRemove: _this.onRemove,
            onPreview: _this.handlePreview,
            beforeUpload(file) {
                if (isEmpty(noom[0]) == false) {
                    console.log(noom);
                    message.error('请先删除已上传文件，再重新上传', 5);
                    return false;
                }
                _this.setState({fileList: []});
                var fileType = file.type;
                if (fileType.indexOf("video/mp4") == -1) {
                    message.error('只能上传mp4格式的视频文件，请重新上传', 5);
                    return false;
                }
                var fileLength = (file.size / 1024 / 1024).toFixed(0);
                if (fileLength > 100) {
                    message.error('最大只能上传100M的视频文件，请重新上传', 5);
                    return false;
                }
                _this.props.beforeUploadBack(file);
            },
            onChange(info) {
                _this.setState({fileList: info.fileList});
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    _this.setState({uploadPercent: percent, progressState: 'block'});
                    //info.fileList.splice(0);
                    if (info.file.status === "removed") {
                        _this.props.callBackParent(info.file, "removed");
                    }
                }
                if (info.file.status === 'done') {
                    // _this.setState({ fileList:info.fileList });
                    _this.props.callBackParent(info.file, _this.state.upLoadNum);
                    message.success(`${info.file.name} 文件上传成功`, 5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`, 5);
                }

            },
            onRemove(file) {
                // alert(22);
                noom = [];
            },
        };
        return (

            <div>
                <Upload {...props}>
                    <Button value={this.state.subjectInfo} onClick={this.showInfo} className="create_upload_btn">
                        <Icon type="upload"/>
                    </Button>
                </Upload>
            </div>
        );
    },
});

export default WeiClassUploadComponents;
