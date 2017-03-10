import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal,Progress } from 'antd';
var antUpload;
const AntUploadForAnalysisOfCreateComponents = React.createClass({

    getInitialState() {
        antUpload = this;
        var defaultFileList = [];
        console.log("subjectInfo"+antUpload.props.params);
        var isDisabled = false;
        if(typeof(antUpload.props.fileList)!="undefined" && antUpload.props.fileList.length!=0){
            alert("len:"+antUpload.props.fileList.length);
            defaultFileList = antUpload.props.fileList ;
            isDisabled = true;
        }
        return {
            defaultFileList: defaultFileList,
            subjectInfo:antUpload.props.params,
            previewVisible: false,
            previewImage: '',
            disabled:isDisabled,
        };
    },

    componentDidMount(){
        alert("antUpload.props.params:"+antUpload.props.fileList.length);
    },

    componentWillReceiveProps(){
        var defaultFileList = [];
        alert("len in rec:"+antUpload.props.fileList.length);
        if(typeof(antUpload.props.fileList)!="undefined" && antUpload.props.fileList.length!=0){
            defaultFileList = [antUpload.props.fileList] ;
            antUpload.setState({disabled:true});
        }
        antUpload.setState({defaultFileList:defaultFileList});
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
            name:antUpload.state.subjectInfo,
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            defaultFileList:antUpload.state.defaultFileList,
            onPreview:antUpload.handlePreview,
            disabled:antUpload.state.disabled,
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
                    console.log("上传进度"+percent);
                    antUpload.setState({uploadPercent:percent,progressState:'block'});
                    /*var pro = <Progress type="circle" width={24} className="upexam_botom_ma" percent={percent} />;
                     antUpload.setState({uploadPercent:pro});*/
                    console.log(info.file, info.fileList);
                    if(info.file.status==="removed"){
                        antUpload.setState({disabled:false});
                        antUpload.props.callBackParent(info.file,antUpload.state.subjectInfo,"removed");
                    }
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
                        subjectInfo:antUpload.state.subjectInfo
                    };
                    antUpload.props.callBackParent(info.file,antUpload.state.subjectInfo);
                    antUpload.setState({disabled:true});
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
                    {/*<div style={{height:'auto','z-index:':'100'}}>
                     {antUpload.state.uploadPercent}
                     </div>*/}
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
