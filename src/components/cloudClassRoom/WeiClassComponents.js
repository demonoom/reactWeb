import React, { PropTypes } from 'react';
import { Upload, Icon,Button,message, Modal } from 'antd';
import {isEmpty} from '../../utils/Const';

var subjectFather;
var fileList=[];
const WeiClassComponents = React.createClass({

    getInitialState() {
        // antUpload = this;
        var defaultFileList = [];
        subjectFather=this.props.params;
        if(typeof(this.props.fileList)!="undefined" && this.props.fileList.length!=0){
            // defaultFileList = this.props.fileList ;
        }
        defaultFileList = [{
            uid: 'jknkjj0i-ojlij',
            name: 'xxx.png',
            status: 'done',
        }, {
            uid: 'jioliij0-ijli',
            name: 'yyy.png',
            status: 'done',
        }];
        return {
            defaultFileList: defaultFileList,
            subjectInfo:this.props.params,
            previewVisible: false,
            previewImage: '',
            fileListParam:this.props.fileList
        };
    },
    /**
     * 图片答案上传/修改用
     */
    componentDidMount(){
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
            defaultFileList:_this.state.defaultFileList,
            onPreview:_this.handlePreview,
            beforeUpload(file){
                _this.props.beforeUploadBack(file,_this.state.subjectInfo);
                var fileType = file.type;
                if(fileType.indexOf("video/mp4")==-1){
                    message.error('只能上传图片文件，请重新上传',5);
                    return false;
                }
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    _this.setState({uploadPercent:percent,progressState:'block'});
                    info.fileList.splice(0);
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
            },
            onRemove(file){
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

export default WeiClassComponents;
