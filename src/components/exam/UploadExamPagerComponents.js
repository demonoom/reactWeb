import React, { PropTypes } from 'react';
import { Upload, Icon,message, Modal,Progress } from 'antd';
import {isEmpty} from '../../utils/Const';
var antUpload;
var fileList=[];
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
            fileList:[],
            previewVisible: false,
            previewImage: '',
        };
    },

    componentDidMount(){
        console.log("==="+antUpload.props.fileList);
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
        }
        /*else{
            antUpload.setState({"defaultFileList":[]});
        }*/
    },

    /**
     * 试卷图片上传
     */
/*    componentWillReceiveProps(){
        var defaultFileList = [];
        if(typeof(antUpload.props.fileList)!="undefined" && antUpload.props.fileList.length!=0){
            defaultFileList = antUpload.props.fileList ;
        }
        antUpload.setState({defaultFileList:defaultFileList});
    },*/

    componentWillReceiveProps(nextProps){
        if(isEmpty(nextProps)==false && isEmpty(nextProps.fileList)==false && nextProps.fileList.length!=0 && antUpload.state.fileList.length==0){
            fileList.splice(0);
            var propsFileList = nextProps.fileList;
            propsFileList.forEach(function (e) {
                var lastLineIndex = e.url.lastIndexOf("/");
                var fileName = e.url.substring(lastLineIndex+1);
                var fileJson={
                    uid: Math.random(),
                    name: fileName,
                    status: 'done',
                    url: e.url,
                    thumbUrl: e.url,
                };
                fileList.push(fileJson);
            });

            antUpload.setState({fileList:fileList});
        }
        /*else{
            antUpload.setState({fileList:[]});
        }*/
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
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture-card',
            // defaultFileList: [],
            defaultFileList:antUpload.state.defaultFileList,
            fileList:antUpload.state.fileList,
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
                    console.log("上传进度"+percent);
                    antUpload.setState({uploadPercent:percent,progressState:'block'});
                    console.log(info.file, info.fileList);
                    if(info.file.status==="removed"){
                        antUpload.props.callBackParent(info.file,"removed");
                    }
                }
                if (info.file.status === 'done') {
                    antUpload.props.callBackParent(info.file);
                    antUpload.setState({uploadPercent:0,progressState:'none'});
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }
                antUpload.setState({"fileList":info.fileList});
            },
            onRemove(file){
                console.log(file);
            },
        };

        return (
            <div>
                <Upload {...props}>
                    <div>
                        <Icon type="plus" className="add_bnt topics_white"/>
                        <div className="ant-upload-text">上传图片</div>
                    </div>
                </Upload>
                <Modal maskClosable="true" visible={antUpload.state.previewVisible} footer={null} onCancel={antUpload.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={antUpload.state.previewImage} />
                </Modal>
            </div>
        );
    },
});

export default UploadExamPagerComponents;
