import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { Upload,  message } from 'antd';
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;


var submitFileOptions=[];

const FileUploadComponents = Form.create()(React.createClass({
    getInitialState() {
        return {
            visible: false,
            submitFileCheckedList:['大蚂蚁.txt'],
        };
    },

    //拖拽过程中，通过该函数阻止浏览器默认动作
    dragOver(e){
        e.preventDefault();
    },
    //鼠标拖放以后，获取当前的文件
    sbumitFile(e){
        e.preventDefault();
        var files = e.dataTransfer.files;
        var fileType = files[0].type;
        var fileName = files[0].name;
        var isExit = this.checkCurrentFileIsSubmit(fileName);
        if(isExit==true){
            alert("请勿重复上传,谢谢!");
        }else if(!this.checkIsRightFileType(fileType)){
            alert("文件类型不正确,请重新上传,谢谢!");
        }else{
            var fileJson = { label: fileName,value:fileName,fileObj:files };
            submitFileOptions.push(fileJson);
            this.setState({submitFileCheckedList:['']});
            this.props.callBackParent(submitFileOptions);
        }
    },
    //检查当前文件是否已经上传
    checkCurrentFileIsSubmit(fileName){
         for(var i=0;i<submitFileOptions.length;i++){
             var fileJson = submitFileOptions[i];
             if(fileJson.value==fileName){
                 return true;
             }
         }
         return false;
    },
    //检查上传的文件类型是否正确
    checkIsRightFileType(fileType){
         var isOk = false;
         if(fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
             //docx格式
             isOk = true;
         }else if(fileType == "application/msword"){
             //doc格式
             isOk = true;
         }else if(fileType == "application/vnd.openxmlformats-officedocument.presentationml.presentation"){
             //pptx格式
             isOk = true;
         }else if(fileType == "application/vnd.ms-powerpoint"){
             //ppt格式
             isOk = true;
         }else if(fileType == "application/vnd.ms-excel"){
             //xls格式
             isOk = true;
         }else if(fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
             //xlsx格式
             isOk = true;
         }else if(fileType == "text/plain"){
             //txt格式
             isOk = true;
         }else if(fileType == "application/pdf"){
             //pdf格式
             isOk = true;
         }else if(fileType == "image/png"){
             //png格式
             isOk = true;
         }else if(fileType == "image/jpeg"){
             //jpeg/jpg格式
             isOk = true;
         }else if(fileType == "image/bmp"){
             //bmp格式
             isOk = true;
         }
         return isOk;
    },

    //移除列表中已上传的文件
    removeFile(){
        var checkedList = this.state.submitFileCheckedList;
        for(var rindex=0;rindex<checkedList.length;rindex++){
            var fileName = checkedList[rindex];
            var i=0;
            while(i<submitFileOptions.length){
                var fileJson = submitFileOptions[i];
                if(fileJson.value==fileName){
                    submitFileOptions.splice(i,1);
                    i=0;
                    continue;
                }
                i++;
            }
            this.setState({submitFileCheckedList:[]});
        }
        this.props.callBackParent(submitFileOptions);
    },

    submitFileCheckBoxOnChange:function (checkedValues) {
        this.setState({submitFileCheckedList:checkedValues});
    },

    render() {
        return (
            <div>
                <Row>
                    <div style={{ width: 346, height: 180,backgroundColor:'green' }} onDragOver={this.dragOver} onDrop={this.sbumitFile}>
                        <Icon type="plus" />
                    </div>
                </Row>
                <Row>
                    <div>
                        已上传文件列表   <Button type="primary" onClick={this.removeFile}>移除</Button>
                    </div>
                    <div>
                        <CheckboxGroup options={submitFileOptions} defaultValue={this.state.submitFileCheckedList} value={this.state.submitFileCheckedList} onChange={this.submitFileCheckBoxOnChange}/>
                    </div>
                </Row>
            </div>
        );
    },
}));

export default FileUploadComponents;
