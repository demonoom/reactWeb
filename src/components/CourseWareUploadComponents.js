import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { Upload,  message } from 'antd';
import FileUploadComponents from './FileUploadComponents';
const Dragger = Upload.Dragger;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

const props = {
    name: 'file',
    showUploadList: true,
    // action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
    action: 'http://www.maaee.com/Excoord_Upload_Server/file/upload',
    beforeUpload(file) {
        //alert(file);
        data:{file}
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};

var uploadFileList=[];
var courseWareUpload;
const CourseWareUploadComponents = Form.create()(React.createClass({
    getInitialState() {
        courseWareUpload = this;
        return {
            visible: false,
            submitFileCheckedList:['大蚂蚁.txt'],
        };
    },
    showModal() {
        uploadFileList.splice(0,uploadFileList.length);
        // if(this.refs.fileUploadCom!=null && typeof(this.refs.fileUploadCom)!='undefined' ){
        //     this.refs.fileUploadCom.initFileUploadPage('test');
        // }
        courseWareUpload.setState({
            visible: true,
        });
    },
    handleOk() {
        courseWareUpload.setState({ visible: false });
    },
    handleCancel() {
        courseWareUpload.setState({ visible: false });
    },

    doWebService : function(data,listener) {
        var service = this;
        this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
        // if (service.requesting) {
        //     return;
        // }
        // service.requesting = true;
        $.post(service.WEBSERVICE_URL, {
            params : data
        }, function(result, status) {
            // service.requesting = false;
            if (status == "success") {
                listener.onResponse(result);
            } else {
                listener.onError(result);
            }
        }, "json");
    },

    //点击保存按钮，文件上传
    uploadFile(){
        if(uploadFileList.length==0){
            alert("请选择上传的文件,谢谢！");
        }else{
            var formData = new FormData();
            formData.append("file",uploadFileList[0]);
            formData.append("name",uploadFileList[0].name);
            $.ajax({
                type: "POST",
                url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData : false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType : false,
                success: function (responseStr) {
                    if(responseStr!=""){
                        var fileUrl=responseStr;
                        courseWareUpload.addNormalMaterial(fileUrl,uploadFileList[0].name);
                        courseWareUpload.setState({ visible: false });
                    }
                },
                error : function(responseStr) {
                    console.log("error"+responseStr);
                }
            });
        }
    },
    //添加课件到知识点下
    addNormalMaterial(file,fileName){
        var subjectParamArray = courseWareUpload.props.params.split("#");
        var ident = subjectParamArray[0];
        var knowledgePointId = subjectParamArray[1];
        var param = {
            "method":'addNormalMaterial',
            "ident":ident,
            "knowledgePointId":knowledgePointId,
            "cover":"http://pic.qiantucdn.com/58pic/19/30/17/5695e8b35c176_1024.jpg",
            "file":file,
            "fileName":fileName
        };
        courseWareUpload.doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.response==true){
                    alert("课件添加成功");
                }else{
                    alert("课件添加失败");
                }
            },
            onError : function(error) {
                alert(error);
            }
        });

    },

    handleFileSubmit(fileList){
        for(var i=0;i<fileList.length;i++){
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj[0]);
        }
    },

    render() {
        const { getFieldDecorator } = courseWareUpload.props.form;
        const formItemLayout = {
            labelCol: { span: 4},
            wrapperCol: { span: 17 },
        };
        return (
            <div className="toobar">

                <Button type="primary" onClick={courseWareUpload.showModal} icon="plus" title="上传课件" className="add_study">添加课件</Button>
                <Modal
                    visible={courseWareUpload.state.visible}
                    title="上传课件"
                    className="ant-modal-width"
                    onCancel={courseWareUpload.handleCancel}
                    footer={[]}
                >
                        <Form horizontal>
                            <FormItem  className="timu_pad"
                                {...formItemLayout}
                                label={(<span>材料文件</span>)}
                                hasFeedback>
                                {getFieldDecorator('materialFile')(
                                    <div>
                                        <FileUploadComponents ref="fileUploadCom" callBackParent={courseWareUpload.handleFileSubmit}/>
                                    </div>
                                )}
                            </FormItem>

                            <FormItem >
                                <Button type="primary" htmlType="submit" className="login-form-button botton_left3" onClick={courseWareUpload.uploadFile}>
                                    保存
                                </Button>
                                <Button type="primary" htmlType="reset" className="login-form-button" onClick={courseWareUpload.handleCancel}>
                                    取消
                                </Button>
                            </FormItem>
                        </Form>
                </Modal>
            </div>
        );
    },
}));

export default CourseWareUploadComponents;
