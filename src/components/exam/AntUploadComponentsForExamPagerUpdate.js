import React, { PropTypes } from 'react';
import { Upload, Icon,message, Modal } from 'antd';
var antUploadComponentsForExamPagerUpdate;
const AntUploadComponentsForExamPagerUpdate = React.createClass({

    getInitialState() {
        antUploadComponentsForExamPagerUpdate = this;
        var defaultFileList = [];
        if(typeof(antUploadComponentsForExamPagerUpdate.props.fileList)!="undefined" && antUploadComponentsForExamPagerUpdate.props.fileList.length!=0){
            defaultFileList = antUploadComponentsForExamPagerUpdate.props.fileList ;
        }
        return {
            examPagerDefaultFileList: [],
            subjectInfo:'',
            previewVisible: false,
            previewImage: '',
            fileList: [],
        };
    },

    componentDidMount(){
    },

    componentWillReceiveProps(){
        var defaultFileList = [];
        if(typeof(antUploadComponentsForExamPagerUpdate.props.fileList)!="undefined" && antUploadComponentsForExamPagerUpdate.props.fileList.length!=0){
            defaultFileList = antUploadComponentsForExamPagerUpdate.props.fileList ;
        }
        antUploadComponentsForExamPagerUpdate.setState({fileList:defaultFileList});
    },

    showInfo(e){
        antUploadComponentsForExamPagerUpdate.setState({subjectInfo:e.target.value});
    },

    handlePreview(file){
        antUploadComponentsForExamPagerUpdate.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleChange({ fileList }){
        antUploadComponentsForExamPagerUpdate.setState({ fileList });
        for(var i=0;i<fileList.length;i++){
            var file = fileList[i];
            if (file.status !== 'uploading') {
                //上传进度
                var percent = file.percent;
                if(file.status==="removed"){
                    antUploadComponentsForExamPagerUpdate.props.callBackParent(fileList,antUploadComponentsForExamPagerUpdate.state.subjectInfo,"removed");
                }
            }
            if (file.status === 'done') {
                antUploadComponentsForExamPagerUpdate.props.callBackParent(fileList,antUploadComponentsForExamPagerUpdate.state.subjectInfo);
                message.success(`${file.name} 文件上传成功`,5);
            } else if (file.status === 'error') {
                message.error(`${file.name} 文件上传失败.`,5);
            }
        }
    },

    handleCancel(){
        antUploadComponentsForExamPagerUpdate.setState({ previewVisible: false })
    },

    render() {
        const props = {
            key:antUploadComponentsForExamPagerUpdate.props.params,
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture-card',
            fileList:antUploadComponentsForExamPagerUpdate.state.fileList,
            onPreview:antUploadComponentsForExamPagerUpdate.handlePreview,
            onChange:antUploadComponentsForExamPagerUpdate.handleChange,
            beforeUpload(file){
                var fileType = file.type;
                if(fileType.indexOf("image")==-1){
                    message.error('只能上传图片文件，请重新上传',5);
                    return false;
                }
            },
            onRemove(file){
            },
        };
        return (

            <div className="clearfix">
                <Upload {...props}>
                    <div>
                        <Icon type="plus" className="add_bnt topics_white"/>
                        <div className="ant-upload-text">上传图片</div>
                    </div>
                </Upload>
                <Modal maskClosable="true" visible={antUploadComponentsForExamPagerUpdate.state.previewVisible} footer={null} onCancel={antUploadComponentsForExamPagerUpdate.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={antUploadComponentsForExamPagerUpdate.state.previewImage} />
                </Modal>
            </div>
        );
    },
});

export default AntUploadComponentsForExamPagerUpdate;
