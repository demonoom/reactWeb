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
        submitFileOptions=[];
        return {
            visible: false,
            submitFileCheckedList:[],
            submitFileOptions:[],
        };
    },

    //拖拽过程中，通过该函数阻止浏览器默认动作
    dragOver(e){
        e.preventDefault();
        submitFileOptions.splice(0,submitFileOptions.length);
        this.setState({submitFileCheckedList:[],submitFileOptions:submitFileOptions});
    },

    componentWillReceiveProps(){
        var fatherState=this.props.fatherState;
        if(fatherState==false){
            this.setState({submitFileCheckedList:[],submitFileOptions:[]});
            this.props.callBackParent([]);
        }
    },

    //鼠标拖放以后，获取当前的文件
    sbumitFile(e){
        e.preventDefault();
        var files = e.dataTransfer.files;
        var fileType = files[0].type;
        var fileName = files[0].name;
        var isExit = this.checkCurrentFileIsSubmit(fileName);
        var isMuliti = this.checkSubmitFileCount();
        if(isMuliti==true){
            alert("请勿同时上传多个文件,谢谢！");
        }else if(isExit==true){
            alert("请勿重复上传,谢谢!");
        }else if(!this.checkIsRightFileType(fileType)){
            alert("文件类型不正确,请重新上传,谢谢!");
        }else{
            var fileJson = { label: fileName,value:fileName,fileObj:files };
            submitFileOptions.push(fileJson);
            this.setState({submitFileCheckedList:[],submitFileOptions:submitFileOptions});
            //回调，将已上传的文件列表传给父组件
            this.props.callBackParent(submitFileOptions);
        }
    },

    //判断已上传文件个数，目前只允许单文件上传
    checkSubmitFileCount(){
        var isOk=false;
        if(this.state.submitFileOptions.length>=1){
            isOk=true;
        }
        return isOk;
    },

    //检查当前文件是否已经上传
    checkCurrentFileIsSubmit(fileName){
         for(var i=0;i<this.state.submitFileOptions.length;i++){
             var fileJson = this.state.submitFileOptions[i];
             if(fileJson.value==fileName){
                 return true;
             }
         }
         return false;
    },
    //检查上传的文件类型是否正确
    checkIsRightFileType(fileType){
         var isOk = false;
         /*if(fileType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
             //docx格式
             isOk = true;
         }else if(fileType == "application/msword"){
             //doc格式
             isOk = true;
         }else*/
        if(fileType == "application/vnd.openxmlformats-officedocument.presentationml.presentation"){
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
        }


         /*else if(fileType == "application/vnd.ms-excel"){
             //xls格式
             isOk = true;
         }else if(fileType == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
             //xlsx格式
             isOk = true;
         }else if(fileType == "text/plain"){
             //txt格式
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
         }*/
         return isOk;
    },

    //移除列表中已上传的文件
    removeFile(){
        var checkedList = this.state.submitFileCheckedList;
        if(checkedList.length==0){
            alert("请选择文件后移除");
        }else{
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
                this.setState({submitFileCheckedList:[],submitFileOptions:submitFileOptions});

            }
            this.props.callBackParent([]);
        }
    },

    submitFileCheckBoxOnChange:function (checkedValues) {
        this.setState({submitFileCheckedList:checkedValues});
    },

    render() {
        return (
            <div>
                <Row>
                    <div className="upload_area" onDragOver={this.dragOver} onDrop={this.sbumitFile}>
                        {/*<Icon type="plus" />*/}
                        <span style={{align:'center'}}>请将文件拖拽到此区域实现上传</span>
                    </div>
                </Row>
                <Row>
                    <div>
                        已上传文件列表   <Button type="primary" onClick={this.removeFile}>移除</Button>
                    </div>
                    <div>
                        <CheckboxGroup options={this.state.submitFileOptions} defaultValue={this.state.submitFileCheckedList} value={this.state.submitFileCheckedList} onChange={this.submitFileCheckBoxOnChange}/>
                    </div>
                </Row>
            </div>
        );
    },
}));

export default FileUploadComponents;
