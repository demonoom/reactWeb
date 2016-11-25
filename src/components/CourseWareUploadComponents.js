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
const CourseWareUploadComponents = Form.create()(React.createClass({
    getInitialState() {
        return {
            visible: false,
            submitFileCheckedList:['大蚂蚁.txt'],
        };
    },
    showModal() {
        this.setState({
            visible: true,
        });
    },
    handleOk() {
        this.setState({ visible: false });
    },
    handleCancel() {
        this.setState({ visible: false });
    },

    handleEmail: function(val){
        this.props.callbackParent(val);
        //this.setState({lessonCount: val});
    },

    /*doWebService : function(data,listener) {
        var service = this;
        //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
        this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
        if (service.requesting) {
            return;
        }
        service.requesting = true;
        $.post(service.WEBSERVICE_URL, {
            params : data
        }, function(result, status) {
            service.requesting = false;
            if (status == "success") {
                listener.onResponse(result);
            } else {
                listener.onError(result);
            }
        }, "json");
    },*/

    doWebService : function(data,listener) {
        var service = this;
        this.WEBSERVICE_URL = "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload";
        if (service.requesting) {
            return;
        }
        service.requesting = true;
        $.post(service.WEBSERVICE_URL, {
            params : data
        }, function(result, status) {
            service.requesting = false;
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
            var param = {
                "file":uploadFileList[0],
            };
            this.doWebService(JSON.stringify(param), {
                onResponse : function(ret) {
                    console.log(ret.msg);
                    if(ret.msg=="调用成功" && ret.response==true){
                        alert("课件上传成功");
                    }else{
                        alert("课件上传失败");
                    }
                },
                onError : function(error) {
                    alert(error);
                }
            });
        }
    },

    handleFileSubmit(fileList){
        // alert("已上传文件："+fileList.length);
        for(var i=0;i<fileList.length;i++){
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj[0]);
        }
    },

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3},
            wrapperCol: { span: 17 },
        };
        return (
            <div className="toobar">

                <Button type="primary" onClick={this.showModal} icon="plus" title="上传课件" className="add_study">添加课件</Button>
                <Modal
                    visible={this.state.visible}
                    title="上传课件"
                    className="ant-modal-width"
                    onCancel={this.handleCancel}
                    footer={[]}
                >
                        <Form horizontal>
                            <FormItem
                                {...formItemLayout}
                                label={(<span>材料文件</span>)}
                                hasFeedback>
                                {getFieldDecorator('materialFile', {
                                    rules: [{ required: true, message: '请上传课件!' }],
                                })(
                                    <div>
                                        <FileUploadComponents callBackParent={this.handleFileSubmit}/>
                                    </div>
                                )}
                            </FormItem>
                            <FormItem>
                                <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.uploadFile}>
                                    保存
                                </Button>
                                <Button type="primary" htmlType="reset" className="login-form-button">
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
