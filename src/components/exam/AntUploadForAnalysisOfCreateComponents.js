import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal,Progress } from 'antd';
import {isEmpty} from '../../utils/Const';
var antUpload;
var fileList=[];
const AntUploadForAnalysisOfCreateComponents = React.createClass({

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

    componentDidMount(){
        if(isEmpty(antUpload.props.fileList)==false){
            fileList.splice(0);
            var lastLineIndex = antUpload.props.fileList.lastIndexOf("/");
            var fileName = antUpload.props.fileList.substring(lastLineIndex+1);
            var fileJson={
                uid: Math.random(),
                name: fileName,
                status: 'done',
                url: antUpload.props.fileList,
                thumbUrl: antUpload.props.fileList,
            };
            fileList.push(fileJson);
            antUpload.setState({fileList:fileList});
            antUpload.setState({"defaultFileList":fileList});
        }else{
            antUpload.setState({"defaultFileList":[]});
        }
    },
    /**
     * 设置文件上传组件的显示内容
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
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            defaultFileList:antUpload.state.defaultFileList,
            fileList:antUpload.state.fileList,
            onPreview:antUpload.handlePreview,
            beforeUpload(file){
                var fileType = file.type;
                props.name = file.name;
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
                        antUpload.props.callBackParent(info.file,antUpload.state.subjectInfo,"removed");
                    }
                }
                if (info.file.status === 'done') {
                    antUpload.props.callBackParent(info.file,antUpload.state.subjectInfo);
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    //解析图片上传错误处理
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }
                antUpload.setState({"fileList":info.fileList});
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

export default AntUploadForAnalysisOfCreateComponents;
