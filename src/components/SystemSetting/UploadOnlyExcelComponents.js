import React, {PropTypes} from 'react';
import {Upload, Icon, message, Modal} from 'antd';
import {isEmpty} from '../../utils/Const';

var fileList = [];
var antUpload;
const UploadOnlyExcelComponents = React.createClass({

    getInitialState() {
        antUpload = this;
        return {
            defaultFileList: [],
            previewVisible: false,
            previewImage: '',
        };
    },

    componentDidMount() {
        antUpload.setState({"defaultFileList": []});
    },
    /**
     * 蚁巢发布图片组件
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (isEmpty(nextProps) == false && (typeof(nextProps.fileList) == "undefined" || nextProps.fileList.length == 0)) {
            antUpload.setState({fileList: []});
        }
    },


    handlePreview(file) {
        antUpload.setState({
            previewImage: file.url || file.thumbUrl,
            previewVisible: true,
        });
    },

    handleCancel() {
        antUpload.setState({previewVisible: false, "defaultFileList": []})
    },

    render() {
        // const multipleFlag = !!this.props.multiples ? true : false

        const props = {
            // multiple: true,
            // action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            action: 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload',
            listType: 'text',
            defaultFileList: antUpload.state.defaultFileList,
            fileList: antUpload.state.fileList,
            //onPreview:antUpload.handlePreview,
            beforeUpload(file) {
                var currentFileList = antUpload.state.fileList;
                if (isEmpty(currentFileList) == false && currentFileList.length >= 1) {
                    message.error('最多只能上传1个文件', 5);
                    return false;
                }
                console.log(file,"file")
                var fileType = file.type;
                // console.log((file.size)/1024,"kb")
                // console.log(((file.size)/1024/1024),"m")
                // console.log(file.size,"byte")
                // console.log(file,"file")
                // if((file.size)/1024/1024 > 200) {
                //     message.error('请上传200M以内的文件', 5);
                //     return false;
                // }
                var fileName = file.name;
                var fileNameArr = fileName.split(".");
                console.log(fileNameArr)
                // if (fileNameArr[1] === "MP4") {
                //     message.error('文件格式不符合，请重新上传', 5);
                //     return false;
                // }

                if (fileNameArr[1] !== "xls" && fileNameArr[1] !== "xlsx") {
                    message.error('文件格式不符合，请重新上传', 5);
                    return false;
                }

            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    //上传进度
                    var percent = info.file.percent;
                    antUpload.setState({uploadPercent: percent, progressState: 'block'});
                    if (info.file.status === "removed") {
                        antUpload.props.callBackParent(info.file, "removed");
                    }
                }
                if (info.file.status === 'done') {
                    
                    antUpload.props.callBackParent(info.file);
                    antUpload.setState({uploadPercent: 0, progressState: 'none', "defaultFileList": []});
                    message.success(`${info.file.name} 文件上传成功`, 5);
                } else if (info.file.status === 'error') {
                    message.error(`${info.file.name} 文件上传失败.`, 5);
                }
                antUpload.setState({"fileList": info.fileList});
            },
            onRemove(file) {
            },
        };

        return (
            <div className="new_add_ding-excel">
                <span className="new_add_ding-excel-cont">请参考模板<a href="http://60.205.86.217/upload9/2018-11-30/17/5738102b-204c-4ae5-a476-e99b3364ef98.xlsx" className="new_add_ding-excel-blue">(下载)</a>使用Excel格式批量上传课程表</span>
                <Upload {...props}>
                    <div className='noom_cursor noomUpLoadFileDiv'>
                        {/* <Icon className="noomUpLoadFile" type="plus-circle"/> */}
                        <span className="new_add_ding-excel-bluebtn">上传</span>
                    </div>
                </Upload>
                <Modal maskClosable={false} visible={antUpload.state.previewVisible} footer={null}
                       onCancel={antUpload.handleCancel}>
                    <img alt="example" style={{width: '100%'}} src={antUpload.state.previewImage}/>
                </Modal>
            </div>
        );
    },
});

export default UploadOnlyExcelComponents;
