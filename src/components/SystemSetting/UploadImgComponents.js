import React, { PropTypes } from 'react';
import { Upload, Icon ,message, Modal } from 'antd';
import {isEmpty} from '../../utils/Const';

var fileList=[];
var antUpload;
const UploadImgComponents = React.createClass({

    getInitialState() {
        antUpload = this;
        return {
            defaultFileList:[],
            previewVisible: false,
            previewImage: '',
        };
    },

    componentDidMount(){
        antUpload.setState({"defaultFileList":[]});
    },
    /**
     * 蚁巢发布图片组件
      * @param nextProps
     */
    componentWillReceiveProps(nextProps){
        if(isEmpty(nextProps)==false && (typeof(nextProps.fileList)=="undefined" || nextProps.fileList.length==0)){
            antUpload.setState({fileList:[]});
        }
    },


    handlePreview(file){
        antUpload.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleCancel(){
        antUpload.setState({ previewVisible: false ,"defaultFileList":[]})
    },

    render() {

        const props = {
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            listType: 'picture-card',
            defaultFileList: antUpload.state.defaultFileList,
            fileList:antUpload.state.fileList,
            onPreview:antUpload.handlePreview,
            beforeUpload(file){
                var currentFileList = antUpload.state.fileList;
                if(isEmpty(currentFileList)==false && currentFileList.length>=9){
                    message.error('最多只能上传9张图片',5);
                    return false;
                }
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
                        antUpload.props.callBackParent(info.file,"removed");
                    }
                }
                if (info.file.status === 'done') {
                    antUpload.props.callBackParent(info.file);
                    antUpload.setState({uploadPercent:0,progressState:'none',"defaultFileList":[]});
                    message.success(`${info.file.name} 文件上传成功`,5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`,5);
                }
                antUpload.setState({"fileList":info.fileList});
            },
            onRemove(file){
            },
        };

        return (
            <div className="ding_modal_left">
                <Upload {...props}>
                    <div>
                        <Icon type="plus"  className="add_bnt topics_white" />
                        <div className="ant-upload-text">上传图片</div>
                    </div>
                </Upload>
                <Modal maskClosable={false}  visible={antUpload.state.previewVisible} footer={null} onCancel={antUpload.handleCancel}>
                    <img alt="example" style={{ width: '100%' }} src={antUpload.state.previewImage} />
                </Modal>
            </div>
        );
    },
});

export default UploadImgComponents;
