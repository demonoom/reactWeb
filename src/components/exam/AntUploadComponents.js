import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal,Progress } from 'antd';

//@ sourceURL = FileUploadComponents.js
var submitFileOptions=[];
var antUpload;
const AntUploadComponents = React.createClass({

    getInitialState() {
        antUpload = this;
        submitFileOptions=[];
        return {
            previewVisible: false,
            previewImage: '',
            defaultFileList:[],
            uploadPercent:'',
        };
    },

    handleCancel(){
        this.setState({ previewVisible: false })
    },

    handlePreview(file){
        this.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleChange({ fileList }){
        this.setState({ fileList });
    },

    render() {

        const { previewVisible, previewImage, fileList } = this.state;
        const uploadButton = (
            <div>
                <Icon type="plus" />
                <div className="ant-upload-text">Upload</div>
            </div>
        );

        const props = {
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            defaultFileList: this.state.defaultFileList,
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    console.log("上传进度"+percent);
                    var pro = <Progress type="circle" width={24} className="upexam_botom_ma" percent={percent} />;
                    antUpload.setState({uploadPercent:pro});
                    console.log(info.file, info.fileList);
                }
                if (info.file.status === 'done') {
                    var uid = info.file.uid;
                    var fileName = info.file.name;
                    var url=info.file.response;
                    var thumbUrl=info.file.thumbUrl;
                    var fileJson={
                        uid: uid,
                        name: fileName,
                        status: 'done',
                        url: url,
                        thumbUrl: thumbUrl,
                    };
                    antUpload.state.defaultFileList.push(fileJson);
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }
            },
        };

        return (
            <div>
                <Upload {...props}>
                    <div style={{height:'auto','z-index:':'100'}}>
                        {antUpload.state.uploadPercent}
                    </div>
                    <Button className="upexam_update">
                        <Icon type="upload" /> 上传
                    </Button>
                </Upload>
            </div>
        );
    },
});

export default AntUploadComponents;
