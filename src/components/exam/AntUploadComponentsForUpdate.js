import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal } from 'antd';
import {isEmpty} from '../../utils/Const';
var antUpload;
var fileList=[];
const AntUploadComponentsForUpdate = React.createClass({

    getInitialState() {
        antUpload = this;
        return {
            defaultFileList:[],
            fileList:[],
            subjectInfo:antUpload.props.params,
            previewVisible: false,
            previewImage: '',
        };
    },
    /**
     * 图片答案组件加载
     */
    componentDidMount(){
        var fileListParams = antUpload.props.fileList;
        if(isEmpty(fileListParams)==false && fileListParams.length!=0 && antUpload.state.fileList.length==0){
            fileList.splice(0);
            fileListParams.forEach(function (e) {
                var fileJson = e;
                var lastLineIndex = fileJson.url.lastIndexOf("/");
                var fileName = fileJson.url.substring(lastLineIndex+1);
                var fileJson={
                    uid: Math.random(),
                    name: fileName,
                    status: 'done',
                    url: fileJson.url,
                    thumbUrl: fileJson.url,
                };
                fileList.push(fileJson);
            });
            antUpload.setState({fileList:fileList});
        }else{
            antUpload.setState({fileList:[]});
        }
    },
    /**
     * 更新试卷的图片解析时，显示的图片内容
     * @param nextProps
     */
    componentWillReceiveProps(nextProps){
        if(isEmpty(nextProps)==false && isEmpty(nextProps.fileList)==false && nextProps.fileList.length!=0 && antUpload.state.fileList.length==0){
            fileList.splice(0);
            var lastLineIndex = nextProps.fileList.lastIndexOf("/");
            var fileName = nextProps.fileList.substring(lastLineIndex+1);
            var fileJson={
                uid: Math.random(),
                name: fileName,
                status: 'done',
                url: nextProps.fileList,
                thumbUrl: nextProps.fileList,
            };
            fileList.push(fileJson);
            antUpload.setState({fileList:fileList});
        }else{
            antUpload.setState({fileList:[]});
        }
    },

    showInfo(e){
        antUpload.setState({subjectInfo:e.target.value});
    },

    handlePreview(file){
        antUpload.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleCancel(){
        antUpload.setState({ previewVisible: false })
    },

    render() {

        const props = {
            key:antUpload.props.params,
            // name:antUpload.state.subjectInfo,
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            defaultFileList:antUpload.state.defaultFileList,
            // fileList:antUpload.state.fileList,
            onPreview:antUpload.handlePreview,
            beforeUpload(file){
                var fileType = file.type;
                if(fileType.indexOf("image")==-1){
                    message.error('只能上传图片文件，请重新上传',5);
                    return false;
                }
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    antUpload.setState({uploadPercent:percent,progressState:'block'});
                    if(info.file.status==="removed"){
                        antUpload.props.callBackParent(info.file,antUpload.props.params,"removed");
                    }
                }
                if (info.file.status === 'done') {
                    antUpload.props.callBackParent(info.file,antUpload.props.params);
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }
            },
            onRemove(file){
            },
        };
        return (

            <div>
                <Upload {...props}>
                    <Button value={antUpload.props.params} onClick={antUpload.showInfo} className="add_study-b">
                        <Icon type="upload" /> 上传
                    </Button>
                </Upload>
                <Modal maskClosable="true" visible={antUpload.state.previewVisible} footer={null} onCancel={antUpload.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={antUpload.state.previewImage} />
                </Modal>
            </div>
        );
    },
});

export default AntUploadComponentsForUpdate;
