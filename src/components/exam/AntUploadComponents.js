import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal,Progress } from 'antd';
import {isEmpty} from '../../utils/Const';

var subjectFather;
var fileList=[];
const AntUploadComponents = React.createClass({

    getInitialState() {
        // antUpload = this;
        var defaultFileList = [];
        console.log("subjectInfo--->"+this.props.params);
        console.log("fileLists--->"+this.props.fileList);
        subjectFather=this.props.params;
        if(typeof(this.props.fileList)!="undefined" && this.props.fileList.length!=0){
            defaultFileList = this.props.fileList ;
        }
        return {
            defaultFileList: defaultFileList,
            subjectInfo:this.props.params,
            previewVisible: false,
            previewImage: '',
            fileListParam:this.props.fileList
        };
        //antUpload=this;
    },
    /**
     * 图片答案上传/修改用
     */
    componentDidMount(){
        console.log("this.props.params:"+this.state.fileListParam);
        var fileListParams = this.state.fileListParam;
        if(isEmpty(fileListParams)==false && fileListParams.length!=0 && (isEmpty(this.state.fileList) || this.state.fileList.length==0)){
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
            this.setState({fileList:fileList});
        }else{
            this.setState({fileList:[]});
        }
    },

    componentWillReceiveProps(){
        var defaultFileList = [];
        if(typeof(this.props.fileList)!="undefined" && this.props.fileList.length!=0){
            defaultFileList = this.props.fileList ;
        }
        this.setState({defaultFileList:defaultFileList});
    },

    showInfo(e){
        console.log("e.target.value"+e.target.value);
        //this.setState({subjectInfo:e.target.value});
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
            name:_this.state.subjectInfo,
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture',
            defaultFileList:_this.state.defaultFileList,
            // fileList:this.state.fileList,
            onPreview:_this.handlePreview,
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
                    _this.setState({uploadPercent:percent,progressState:'block'});
                    info.fileList.splice(0);
                    console.log(info.file, info.fileList);
                    if(info.file.status==="removed"){
                        _this.props.callBackParent(info.file,_this.state.subjectInfo,"removed");
                    }
                }
                if (info.file.status === 'done') {
                    _this.props.callBackParent(info.file,_this.state.subjectInfo);
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }
                // this.setState({"fileList":info.fileList});
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

export default AntUploadComponents;
