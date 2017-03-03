import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal,Progress } from 'antd';
var antUpload;
const UploadExamPagerComponents = React.createClass({

    getInitialState() {
        antUpload = this;
        var defaultFileList = [];
        console.log("subjectInfo"+antUpload.props.params);
        if(typeof(antUpload.props.fileList)!="undefined" && antUpload.props.fileList.length!=0){
            defaultFileList = antUpload.props.fileList ;
        }
        return {
            defaultFileList:defaultFileList,
        };
    },

    componentWillReceiveProps(){
        var defaultFileList = [];
        if(typeof(antUpload.props.fileList)!="undefined" && antUpload.props.fileList.length!=0){
            defaultFileList = antUpload.props.fileList ;
        }
        antUpload.setState({defaultFileList:defaultFileList});
    },

    render() {

        const props = {
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            defaultFileList: [],
            //fileList:antUpload.state.defaultFileList,
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    console.log("上传进度"+percent);
                    antUpload.setState({uploadPercent:percent,progressState:'block'});
                    console.log(info.file, info.fileList);
                    if(info.file.status==="removed"){
                        antUpload.props.callBackParent(info.file,"removed");
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
                        subjectInfo:antUpload.props.params
                    };
                    //antUpload.state.defaultFileList.push(fileJson);
                    antUpload.props.callBackParent(info.file);
                    antUpload.setState({uploadPercent:0,progressState:'none'});
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
                    <Button className="add_study-d">
                        <Icon type="upload" /> 上传
                    </Button>
                </Upload>
            </div>
        );
    },
});

export default UploadExamPagerComponents;
