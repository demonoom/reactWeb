import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Checkbox,Row,Col } from 'antd';
import { Upload,  message } from 'antd';
import { doWebService } from '../WebServiceHelper';
import FileUploadComponents from './FileUploadComponents';
const FormItem = Form.Item;

const props = {
    name: 'file',
    showUploadList: true,
    action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
    // action: 'http://www.maaee.com/Excoord_Upload_Server/file/upload',
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
            submitFileCheckedList:[],
            useSameSchedule:false,
        };
    },
    showModal() {
        uploadFileList.splice(0,uploadFileList.length);
        courseWareUpload.setState({
            visible: true,
        });
        //弹出文件上传窗口时，初始化窗口数据
        courseWareUpload.refs.fileUploadCom.initFileUploadPage();
    },

    handleOk() {
        courseWareUpload.setState({ visible: false });
    },
    handleCancel() {
        courseWareUpload.setState({ visible: false });
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
                        courseWareUpload.props.courseUploadCallBack();
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
        var knowledgeName = subjectParamArray[4];
        var isLinkToSchedule=this.state.useSameSchedule;
        //alert("knowledgeName:"+knowledgeName+"\t"+isLinkToSchedule);
        var param = {
            "method":'addNormalMaterial',
            "ident":ident,
            "knowledgePointId":knowledgePointId,
            "cover":"http://pic.qiantucdn.com/58pic/19/30/17/5695e8b35c176_1024.jpg",
            "file":file,
            "fileName":fileName
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.success==true){
                    var courseWareReturnId = ret.response;
                    //引用到同名教学进度下，如果没有同名教学进度，则新建
                    if(isLinkToSchedule == true){
                        courseWareUpload.getOrCreateTeachSchedule(ident,knowledgeName,courseWareReturnId);
                    }else{
                        alert("课件添加成功");
                    }
                }else{
                    alert("课件添加失败");
                }
            },
            onError : function(error) {
                alert(error);
            }
        });
    },

    /**
     * 根据tilte获取教学进度，如果没有会创建一个新的
     * @param userId   用户id
     * @param materiaIds 课件id
     * @param scheduleId 我的备课id
     */
    getOrCreateTeachSchedule(userId,title,materiaIds){
        var param = {
            "method":'getOrCreateTeachSchedule',
            "userId":userId,
            "title":title,
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.success==true){
                    var scheduleId = ret.response.colTsId;
                    courseWareUpload.copyMaterialToSchedule(userId,materiaIds,scheduleId)
                }
                knowledge.setState({
                    visible: false,
                });
            },
            onError : function(error) {
                alert(error);
            }
        });
},

    /**
     * 拷贝课件到我的备课下
     * @param userId   用户id
     * @param materiaIds 课件id
     * @param scheduleId 我的备课id
     */
    copyMaterialToSchedule(userId,materiaIds,scheduleId){
        var param = {
            "method":'copyMaterialToSchedule',
            "userId":userId,
            "materiaIds":materiaIds,
            "scheduleId":scheduleId
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.response==true){
                    alert("课件添加成功");
                }
            },
            onError : function(error) {
                alert(error);
            }
        });
    },

    handleFileSubmit(fileList){
        if(fileList==null || fileList.length==0){
            uploadFileList.splice(0,uploadFileList.length);
        }
        for(var i=0;i<fileList.length;i++){
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj[0]);
        }
    },

    checkBoxOnChange(e) {
        // currentKnowledgeState:false,
        // newScheduleState:false,
        console.log(`checked = ${e.target.checked}`);
        this.setState({useSameSchedule:e.target.checked});
        // currentKnowledgeState:false,
        // newScheduleState:false,
        /*var checkBoxValue = e.target.value;
        var inputObj = knowledge.refs.scheduleName;
        var currentKnowledgeState;
        var newScheduleState;
        if(checkBoxValue=="currentKnowledge"){
            if(e.target.checked==true){
                currentKnowledgeState=true;
            }else{
                currentKnowledgeState=false;
            }
            inputObj.refs.input.value="";
            knowledge.setState({inputState:true});
        }else{
            if(e.target.checked==true){
                newScheduleState=true;
            }else{
                newScheduleState=true;
            }
            knowledge.setState({inputState:false});
        }
        knowledge.setState({currentKnowledgeState:currentKnowledgeState,newScheduleState:newScheduleState});
        if(currentKnowledgeState==true || newScheduleState==true){
            knowledge.setState({isNewSchedule:true});
        }else{
            knowledge.setState({isNewSchedule:false});
        }*/
    },

    render() {
        const { getFieldDecorator } = courseWareUpload.props.form;
        const formItemLayout = {
            labelCol: { span: 4},
            wrapperCol: { span: 20 },
        };
        return (
            <div className="toobar">

                <Button type="primary" onClick={courseWareUpload.showModal} icon="plus" title="上传课件" className="add_study">添加课件</Button>
                <Modal
                    visible={courseWareUpload.state.visible}
                    title="上传课件"
                    className="modol_width"
                    onCancel={courseWareUpload.handleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                            <Button type="primary" htmlType="submit" className="login-form-button" onClick={courseWareUpload.uploadFile}>
                                保存
                            </Button>
                            <Button type="ghost" htmlType="reset" className="login-form-button" onClick={courseWareUpload.handleCancel}>
                                取消
                            </Button>
                        </div>
                    ]}
                >
                        <Row>
                            <Col span={4}>文件</Col>
                            <Col span={20}>
                                <div>
                                    <FileUploadComponents ref="fileUploadCom" fatherState={courseWareUpload.state.visible} callBackParent={courseWareUpload.handleFileSubmit}/>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={4}></Col>
                            <Col span={20}>
                                <div>
                                    <Checkbox onChange={courseWareUpload.checkBoxOnChange} value="currentKnowledge">同时引用到同名教学进度下</Checkbox>
                                </div>
                            </Col>
                        </Row>
                </Modal>
            </div>
        );
    },
}));

export default CourseWareUploadComponents;
