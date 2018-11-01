import React, {PropTypes} from 'react';
import {message, Select, Row, Button, Checkbox} from 'antd';
import {AR_SCHOOL_ARRAY} from '../../utils/Const';
const CheckboxGroup = Checkbox.Group;

var submitFileOptions = [];

const CloudFileUploadComponents = React.createClass({
    getInitialState() {
        submitFileOptions = [];
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            visible: false,
            submitFileCheckedList: [],
            submitFileOptions: [],
        };
    },

    initFileUploadPage() {
        this.setState({submitFileCheckedList: [], submitFileOptions: []});
        var fileField = document.getElementById("fileField");
        fileField.value = "";
    },

    //拖拽过程中，通过该函数阻止浏览器默认动作
    dragOver(e) {
        e.preventDefault();
        submitFileOptions.splice(0);
        this.setState({submitFileCheckedList: [], submitFileOptions: submitFileOptions});
    },

    componentWillReceiveProps() {
        var fatherState = this.props.fatherState;
        if (fatherState == false) {
            this.setState({submitFileCheckedList: [], submitFileOptions: []});
            this.props.callBackParent([]);
        }
    },

    //鼠标拖放以后，获取当前的文件
    sbumitFile(e) {
        e.preventDefault();
        var files = e.dataTransfer.files;
        this.checkFileInfo(files);
    },

    checkFileInfo(files) {
        var fileSize = 157286400; //150M
        var tipMessage="请勿上传超过150M的文件，谢谢!";
        if(AR_SCHOOL_ARRAY.indexOf(this.state.loginUser.schoolId) != -1){
            fileSize = 524288000;   //500M
            tipMessage="请勿上传超过500M的文件，谢谢!";
        }
        if (files.length <= 0) {
            message.warning("请选择或拖拽待上传的文件,谢谢！");
        } else {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var fileName = file.name;
                var lastPointIndex = fileName.lastIndexOf(".");
                var fileMimeType = file.type;
                //通过截取文件后缀名的形式，完成对上传文件类型的判断
                var fileType = fileName.substring(lastPointIndex + 1);
                var fileSize = file.size;
                var isExit = this.checkCurrentFileIsSubmit(fileName);
                //var isMuliti = this.checkSubmitFileCount();
                var isMuliti = false;
                if (isMuliti == true) {
                    message.warning("请勿同时上传多个文件,谢谢！");
                } else if (isExit == true) {
                    message.warning("请勿重复上传,谢谢!");
                } else if (!this.checkIsRightFileTypeByEndWith(fileType)) {
                    /*message.warning("本系统只支持后缀名为ppt、pptx、pdf、mp3、mp4、flv文件的上传操作,请重新上传,谢谢!",10);*/
                    message.warning("本系统只支持后缀名为ppt、pptx、pdf、mp4、flv文件的上传操作,请重新上传,谢谢!", 10);
                } else if (fileSize >= parseInt(fileSize)) {
                    message.warning(tipMessage);
                } else {
                    var fileJson = {label: fileName, value: fileName, fileObj: file};
                    submitFileOptions.push(fileJson);
                }
            }
            this.setState({submitFileCheckedList: [], submitFileOptions: submitFileOptions});
            //回调，将已上传的文件列表传给父组件
            this.props.callBackParent(submitFileOptions);
        }
    },

    //判断已上传文件个数，目前只允许单文件上传
    checkSubmitFileCount() {
        var isOk = false;
        if(this.state.submitFileOptions.length>=1){
            isOk=true;
        }
        return isOk;
    },

    //检查当前文件是否已经上传
    checkCurrentFileIsSubmit(fileName) {
        for (var i = 0; i < this.state.submitFileOptions.length; i++) {
            var fileJson = this.state.submitFileOptions[i];
            if (fileJson.value == fileName) {
                return true;
            }
        }
        return false;
    },
    /**
     * 使用文件后缀名的方式判断文件类型
     * @param fileType，如ppt、pptx等
     * @returns {boolean}
     */
    checkIsRightFileTypeByEndWith(fileType) {
        var isOk = true;
        /*if(fileType == "pptx"){
            //pptx格式
            isOk = true;
        }else if(fileType == "ppt"){
            //ppt格式
            isOk = true;
        }else if(fileType == "pdf"){
            //pdf格式
            isOk = true;
        }else if(fileType == "flv"){
            //flv格式
            isOk=true;
        }else if(fileType == "mp4"){
            //mp4格式
            isOk=true;
        }*/
        return isOk;
    },
    /**
     * 检查上传的文件类型是否正确
     * 暂时废弃不用
     * @param fileType
     * @returns {boolean}
     */
    checkIsRightFileType(fileType) {
        var isOk = true;

        /*if(fileType == "application/vnd.openxmlformats-officedocument.presentationml.presentation"){
            //pptx格式
            isOk = true;
        }else if(fileType == "application/vnd.ms-powerpoint"){
            //ppt格式
            isOk = true;
        }else if(fileType == "application/pdf"){
            //pdf格式
            isOk = true;
        }else if(fileType == "video/x-flv"){
            //flv格式
            isOk=true;
        }else if(fileType == "video/mp4"){
            //mp4格式
            isOk=true;
        }else if(fileType == "audio/mp3"){
            //mp3格式
            isOk=true;
        }*/

        return isOk;
    },

    //移除列表中已上传的文件
    removeFile() {
        var checkedList = this.state.submitFileCheckedList;
        if (checkedList.length == 0) {
            message.warning("请选择文件后移除");
        } else {
            for (var rindex = 0; rindex < checkedList.length; rindex++) {
                var fileName = checkedList[rindex];
                var i = 0;
                while (i < submitFileOptions.length) {
                    var fileJson = submitFileOptions[i];
                    if (fileJson.value == fileName) {
                        submitFileOptions.splice(i, 1);
                        i = 0;
                        continue;
                    }
                    i++;
                }
                this.setState({submitFileCheckedList: [], submitFileOptions: submitFileOptions});
                var fileField = document.getElementById("fileField");
                fileField.value = "";
            }
            this.props.callBackParent([]);
        }
    },

    submitFileCheckBoxOnChange: function (checkedValues) {
        this.setState({submitFileCheckedList: checkedValues});
    },

    selectFile(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        submitFileOptions.splice(0);
        var files = target.files;
        this.checkFileInfo(files);
        this.setState({submitFileOptions});
    },

    F_Open_dialog() {
        document.getElementById("fileField").click();
    },

    render() {
        return (
            <div>
                <Row>
                    <div className="upload_area" onDragOver={this.dragOver} onDrop={this.sbumitFile}>
                        <input type="file" name="fileField" webkitdirectory multiple className="file" id="fileField"
                               size="28" onChange={this.selectFile} style={{display: 'none'}}/>
                        <Button type="primary" icon="plus" className="add_bnt" size={5}
                                onClick={this.F_Open_dialog}></Button>
                        <span style={{align: 'center'}}>请将文件拖拽到此区域实现上传</span>
                    </div>
                </Row>
                <Row>
                    <div className="date_tr">
                        已上传文件列表<Button type="primary" className="calmBorderRadius add_out add_study"
                                       onClick={this.removeFile}>移除</Button>
                    </div>
                    <div className="le_1">
                        <CheckboxGroup options={this.state.submitFileOptions} style={{margin: '9px'}}
                                       defaultValue={this.state.submitFileCheckedList}
                                       value={this.state.submitFileCheckedList}
                                       onChange={this.submitFileCheckBoxOnChange}/>
                    </div>
                </Row>
            </div>
        );
    },
});

export default CloudFileUploadComponents;
