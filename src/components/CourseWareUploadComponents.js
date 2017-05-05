import React, { PropTypes } from 'react';
import { Form,Row,Col,Progress ,  Modal,Button, message} from 'antd';
import { doWebService } from '../WebServiceHelper';
import FileUploadComponents from './FileUploadComponents';

var uploadFileList=[];
var courseWareUpload;
const CourseWareUploadComponents = Form.create()(React.createClass({
    getInitialState() {
        courseWareUpload = this;
        return {
            visible: false,
            submitFileCheckedList:[],
            useSameSchedule:true,
            spinLoading:false,
            uploadPercent:0,
            progressState:'none',
        };
    },
    showModal() {
        uploadFileList.splice(0,uploadFileList.length);
        courseWareUpload.setState({
            spinLoading:false,visible: true,uploadPercent:0,progressState:'none'
        });
        //弹出文件上传窗口时，初始化窗口数据
        courseWareUpload.refs.fileUploadCom.initFileUploadPage();
    },

    handleCancel() {
        courseWareUpload.setState({ visible: false,spinLoading:false });
    },

    //点击保存按钮，文件上传
    uploadFile(){
        if(uploadFileList.length==0){
            message.warning("请选择上传的文件,谢谢！");
        }else{
            var formData = new FormData();
            formData.append("file",uploadFileList[0]);
            formData.append("name",uploadFileList[0].name);
            courseWareUpload.setState({spinLoading:true});
            $.ajax({
                type: "POST",
                url: "http://101.201.45.125:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData : false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType : false,
                xhr: function(){        //这是关键  获取原生的xhr对象  做以前做的所有事情
                    var xhr = jQuery.ajaxSettings.xhr();
                    xhr.upload.onload = function (){
                        courseWareUpload.setState({progressState:'none'});
                    }
                    xhr.upload.onprogress = function (ev) {
                        if(ev.lengthComputable) {
                            var percent = 100 * ev.loaded/ev.total;
                            courseWareUpload.setState({uploadPercent:Math.round(percent),progressState:'block'});
                        }
                    }
                    return xhr;
                },
                success: function (responseStr) {
                    if(responseStr!=""){
                        var fileUrl=responseStr;
                        courseWareUpload.addNormalMaterial(fileUrl,uploadFileList[0].name);
                        courseWareUpload.setState({ visible: false,spinLoading:false });
                        courseWareUpload.props.courseUploadCallBack();
                    }
                },
                error : function(responseStr) {
                    courseWareUpload.setState({ visible: false,spinLoading:false });
                }
            });

        }
    },
    //添加课件到知识点下
    addNormalMaterial(file,fileName){
        var subjectParamArray = courseWareUpload.props.params.split("#");
        var ident = subjectParamArray[0];
        var knowledgePointId = "";
        var knowledgeName = subjectParamArray[4];
        if(subjectParamArray[1] == null || subjectParamArray[1]==""){
            knowledgePointId = sessionStorage.getItem("lastClickMenuId");
            knowledgeName = sessionStorage.getItem("lastClickMenuName");
        }else{
            knowledgePointId = subjectParamArray[1];
            knowledgeName = subjectParamArray[4];
        }
        var lastPointIndex = fileName.lastIndexOf(".");
        var fileType = fileName.substring(lastPointIndex+1);
        //根据文件类型的不同，设置不同的文件封面
        var cover = "http://60.205.86.217/upload2/common/ziyuan_n_img5.png";
        if(fileType=="pptx"){
            cover = "http://60.205.86.217/upload2/common/ziyuan_n_img3.png";
        }else if(fileType=="ppt"){
            cover = "http://60.205.86.217/upload2/common/ziyuan_n_img2.png";
        }else if(fileType=="pdf"){
            cover = "http://60.205.86.217/upload2/common/ziyuan_n_img1.png";
        }else if(fileType=="flv"){
            cover = "http://60.205.86.217/upload2/common/ziyuan_n_img4.png";
        }else if(fileType=="mp4"){
            cover = "http://60.205.86.217/upload2/common/ziyuan_n_img6.png";
        }
        var isLinkToSchedule=this.state.useSameSchedule;
        var param = {
            "method":'addNormalMaterial',
            "ident":ident,
            "knowledgePointId":knowledgePointId,
            "cover":cover,
            "file":file,
            "fileName":fileName
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var courseWareReturnId = ret.response;
                    //引用到同名备课计划下，如果没有同名备课计划，则新建
                    if(isLinkToSchedule == true){
                        courseWareUpload.getOrCreateTeachSchedule(ident,knowledgeName,courseWareReturnId);
                    }else{
                        message.success("课件添加成功");
                    }
                }else{
                    message.error("课件添加失败");
                }
                courseWareUpload.setState({spinLoading:false});
            },
            onError : function(error) {
                message.error(error);
                courseWareUpload.setState({spinLoading:false});
            }
        });
    },

    /**
     * 根据tilte获取备课计划，如果没有会创建一个新的
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
                if(ret.msg=="调用成功" && ret.success==true){
                    var scheduleId = ret.response.colTsId;
                    courseWareUpload.copyMaterialToSchedule(userId,materiaIds,scheduleId)
                }
                courseWareUpload.setState({
                    visible: false,spinLoading:false
                });
            },
            onError : function(error) {
                message.error(error);
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
                if(ret.msg=="调用成功" && ret.response==true){
                    message.success("课件添加成功");
                }
            },
            onError : function(error) {
                message.error(error);
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

    render() {
        const { getFieldDecorator } = courseWareUpload.props.form;
        const formItemLayout = {
            labelCol: { span: 4},
            wrapperCol: { span: 20 },
        };
        //根据该状态值，来决定上传进度条是否显示
        var progressState = courseWareUpload.state.progressState;
        return (
            <div className="toobar">

                <Button type="primary" onClick={courseWareUpload.showModal} icon="plus-circle" title="上传课件" className="add_study add_study—a">添加课件</Button>
                <Modal
                    visible={courseWareUpload.state.visible}
                    title="上传课件"
                    className="modol_width"
                    maskClosable={false} //设置不允许点击蒙层关闭
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
                            <Col span={4}>上传文件：</Col>
                            <Col span={20}>
                                <div>
                                    <FileUploadComponents ref="fileUploadCom" fatherState={courseWareUpload.state.visible} callBackParent={courseWareUpload.handleFileSubmit}/>
                                </div>
								<div style={{display:progressState}}>
                                <Progress percent={courseWareUpload.state.uploadPercent} width={80} strokeWidth={4} />
                            </div>
                            </Col>
                            
                        </Row>
                </Modal>
            </div>
        );
    },
}));

export default CourseWareUploadComponents;
