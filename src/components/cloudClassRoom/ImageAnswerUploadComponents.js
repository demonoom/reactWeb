import React, {PropTypes} from 'react';
import {Upload, Icon, Button, message, Modal} from 'antd';
import {isEmpty} from '../../utils/Const';
//国际化
import {IntlProvider, addLocaleData} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';

var subjectFather;
var fileList = [];
const ImageAnswerUploadComponents = React.createClass({

    getInitialState() {
        return {
            defaultFileList: [],
            subjectInfo: this.props.params,
            previewVisible: false,
            previewImage: '',
        };
    },

    componentWillMount() {
        console.log("will:" + this.props.fileList);
        var defaultFileList = [];
        if (typeof(this.props.fileList) != "undefined" && this.props.fileList.length != 0) {
            defaultFileList = this.props.fileList;
        }
        this.setState({fileList: defaultFileList});


    },
    /**
     * 课程封面图片
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        var _this = this;
        if(isEmpty(nextProps.updateClassObj)==false){
            var updateisSeries = nextProps.updateClassObj.isSeries;
            var updateClassObj = nextProps.updateClassObj.videos;
            //判断是否为微课或者是否播放还是正在播放，禁止使用上传按钮
            if(updateisSeries!==3){
                updateClassObj.forEach(function (updateClassObj, i) {
                    var videoStatus = updateClassObj.videoStatus;
                    if (videoStatus == 2 || videoStatus == 3) {
                        _this.setState({imgIsUpdateDisable: true});
                        // maskClosable="false"
                        // maskClosable="true"

                    }
                });
            }else {
                _this.setState({imgIsUpdateDisable: false});
            }
        }
        var defaultFileList = [];
        if (typeof(nextProps.fileList) != "undefined" && nextProps.fileList.length != 0) {
            defaultFileList = nextProps.fileList;
        }
        _this.setState({fileList: defaultFileList});
    },

    showInfo(e) {

    },

    handlePreview(file) {
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleCancel() {
        this.setState({previewVisible: false})
    },

    render() {
        var _this = this;
        const props = {
            key: _this.props.params,
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            // defaultFileList:_this.state.fileList,
            fileList: _this.state.fileList,
            onPreview: _this.handlePreview,
            beforeUpload(file) {
                _this.setState({fileList: []});
                var fileType = file.type;
                if (fileType.indexOf("image") == -1) {
                    message.error('只能上传图片文件，请重新上传', 5);
                    return false;
                }
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
                    _this.props.callBackParent(info.file);
                    message.success(`${info.file.name} 文件上传成功`, 5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`, 5);
                }

            },
            onRemove(file) {
                console.log(file);
            },
        };
        return (

            <div>
                <Upload {...props}>
                    <Button value={this.state.subjectInfo} disabled={this.state.imgIsUpdateDisable}
                            onClick={this.showInfo} className="add_study-b">
                        <Icon type="upload"/>
                        <FormattedMessage
                            id='upload'
                            description='上传'
                            defaultMessage='上传'
                        />
                    </Button>
                </Upload>
                <Modal maskClosable={false} visible={this.state.previewVisible} footer={null}
                       onCancel={this.handleCancel}>
                    <img alt="example" style={{width: '100%'}} src={this.state.previewImage}/>
                </Modal>
            </div>
        );
    },
});

export default ImageAnswerUploadComponents;
