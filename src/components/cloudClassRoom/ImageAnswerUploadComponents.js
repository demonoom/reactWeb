import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal } from 'antd';
import {isEmpty} from '../../utils/Const';

var subjectFather;
var fileList=[];
const ImageAnswerUploadComponents = React.createClass({

    getInitialState() {
        return {
            defaultFileList: [],
            subjectInfo:this.props.params,
            previewVisible: false,
            previewImage: '',
        };
    },

    componentWillMount(){
        console.log("will:"+this.props.fileList);
        var defaultFileList = [];
        if(typeof(this.props.fileList)!="undefined" && this.props.fileList.length!=0){
            defaultFileList = this.props.fileList ;
        }
        this.setState({fileList:defaultFileList});
    },
    /**
     * 课程封面图片
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){
        var defaultFileList = [];
        if(typeof(nextProps.fileList)!="undefined" && nextProps.fileList.length!=0){
            defaultFileList = nextProps.fileList ;
        }
        this.setState({fileList:defaultFileList});
    },

    showInfo(e){
    },

    handlePreview(file){
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleCancel(){
        this.setState({ previewVisible: false })
    },

    render() {
        var _this = this;
        const props = {
            key:_this.props.params,
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            // defaultFileList:_this.state.fileList,
            fileList:_this.state.fileList,
            onPreview:_this.handlePreview,
            beforeUpload(file){
                _this.setState({fileList:[]});
                var fileType = file.type;
                if(fileType.indexOf("image")==-1){
                    message.error('只能上传图片文件，请重新上传',5);
                    return false;
                }
            },
            onChange(info) {
                _this.setState({fileList:info.fileList});
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    _this.setState({uploadPercent:percent,progressState:'block'});
                    //info.fileList.splice(0);
                    if(info.file.status==="removed"){
                        _this.props.callBackParent(info.file,"removed");
                    }
                }
                if (info.file.status === 'done') {
                    // _this.setState({ fileList:info.fileList });
                    _this.props.callBackParent(info.file);
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }

            },
            onRemove(file){
                console.log(file);
            },
        };
        return (

            <div>
                <Upload {...props}>
                    <Button value={this.state.subjectInfo} onClick={this.showInfo} className="add_study-b">
                        <Icon type="upload" /> 上传
                    </Button>
                </Upload>
                <Modal maskClosable="true" visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
                </Modal>
            </div>
        );
    },
});

export default ImageAnswerUploadComponents;
