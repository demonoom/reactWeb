import React, {PropTypes} from 'react';
import {Table, Button, Progress, message,Icon,Input,Modal,Row,Col} from 'antd';
import ConfirmModal from '../ConfirmModal';
import CloudFileUploadComponents from './CloudFileUploadComponents';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {isEmpty} from '../../utils/Const';

var columns = [{
    title: '标题',
    dataIndex: 'title',
}, {
    title: '操作',
    className: 'ant-table-selection-user',
    dataIndex: 'subjectOpt',
},
];

var data = [];
var subjectList;
var uploadFileList=[];
var cloudTable;
const AntCloudTableComponents = React.createClass({
    getInitialState() {
        cloudTable = this;

        return {
            ident: sessionStorage.getItem('ident'),
            selectedRowKeys: [],
            loading: false,
            count: 0,
            totalCount: 0,
            currentPage: 1,
            currentView: 'homeWorkList',
            clazzId: '',
            dateTime: '',
            tableData:[],
            getFileType:'myFile',
            parentDirectoryId:-1,
            currentDirectoryId:-1,
            mkdirModalVisible:false,
            uploadPercent:0,
            progressState:'none',
        };
    },
    componentDidMount(){
        cloudTable.isSchoolCloudFileSuperManager(this.state.ident);
        cloudTable.getUserRootCloudFiles(this.state.ident, 1);
    },

    getFileByType(fileType){
        console.log("fileType"+fileType);
        var initPageNo=1;
        if(fileType=="myFile"){
            cloudTable.getUserRootCloudFiles(this.state.ident, initPageNo);
        }else{
            cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
        }
        cloudTable.setState({"getFileType":fileType,parentDirectoryId:-1});
    },


    start() {
        this.setState({loading: true});
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    },

    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    buildPageView(optSource){
        if (optSource == "查看") {
            columns = [{
                title: '内容',
                dataIndex: 'subjectContent',
                className: 'ant-table-selection-cont3 left-12'
            }, {
                title: '类型',
                className: 'ant-table-selection-user2',
                dataIndex: 'subjectType',
            }
            ];
        } else {
            columns = [{
                title: '名称',
                dataIndex: 'title',
				className: 'left-12',
            }, {
                title: '更新时间',
                dataIndex: 'createTime',
                className: 'ant-table-selection-user2',
            }, {
                title: '创建者',
                dataIndex: 'creator',
                className: 'ant-table-selection-user2',
            }, {
                title: '操作',
                className: 'ant-table-selection-topic',
                dataIndex: 'subjectOpt',
            },
            ];
        }
    },

    //点击导航时，进入的我的文件列表
    getUserRootCloudFiles: function (userId, pageNo) {
        data = [];
        cloudTable.setState({currentView: 'subjectList', totalCount: 0});
        cloudTable.buildPageView();
        var param = {
            "method": 'getUserRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    cloudTable.buildTableDataByResponse(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //点击导航时，获取用户的根群文件夹
    getUserChatGroupRootCloudFiles: function (userId, pageNo) {
        data = [];
        cloudTable.setState({currentView: 'subjectList', totalCount: 0});
        cloudTable.buildPageView();
        var param = {
            "method": 'getUserChatGroupRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    cloudTable.buildTableDataByResponse(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles: function (operateUserId, cloudFileId,queryConditionJson,pageNo) {
        data = [];
        cloudTable.setState({currentView: 'subjectList', totalCount: 0});
        cloudTable.buildPageView();
        var param = {
            "method": 'listFiles',
            "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            "queryConditionJson":queryConditionJson,
            "pageNo":pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    cloudTable.buildTableDataByResponse(ret);
                    cloudTable.setState({"currentDirectoryId":cloudFileId});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 是否是学校云盘的超级管理者
     * @param userId
     */
    isSchoolCloudFileSuperManager(userId){
        var param = {
            "method": 'isSchoolCloudFileSuperManager',
            "userId": userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.success==true && ret.msg=="调用成功"){
                    cloudTable.setState({"currentUserIsSuperManager":response});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 文件夹重命名
     * @param operateUserId
     * @param cloudFileId
     * @param name
     */
    renameCloudFile(operateUserId,cloudFileId,name){
        var param = {
            "method": 'renameCloudFile',
            "operateUserId": operateUserId,
            "cloudFileId":cloudFileId,
            "name":name
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.success==true && ret.msg=="调用成功" && ret.response == true){
                    var initPageNo = 1;
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("重命名成功");
                }else{
                    message.error("重命名失败");
                }
                cloudTable.setState({"reNameModalVisible":false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 构建表格的数据
     * @param ret
     */
    buildTableDataByResponse(ret){
        var i=0;
        ret.response.forEach(function (e) {
            if(i==0){
                if(e.parent){
                    var parentDirectoryId = e.parent.parentId;
                    cloudTable.setState({"parentDirectoryId":parentDirectoryId});
                }
            }
            i++
            var key=e.id;
            var createTime =e.createTime;
            var createUid = e.createUid;
            var creator = e.creator;
            var directory = e.directory;
            var file = e.file;
            var fileType = e.fileType;
            var fromId = e.fromId;
            var fromType = e.fromType;
            var length = e.length;
            var name = e.name;
            var parentId = e.parentId;
            var permissionsArray = e.permissions;
            var schoolId = e.schoolId;
            var valid = e.valid;

            var fileLogo;
            if(directory){
                fileLogo=<div>
                    <Icon type="folder" />
                    <a className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e)}>{name}</a>
                </div>;
            }else{
                fileLogo=<div>
                    <Icon type="file" />
                    {name}
                </div>;
            }
            var subjectOpt = <div>
                <Button type="button" className="score3_i" value={key} text={key} onClick={cloudTable.editDirectoryName.bind(cloudTable,e)}
                        icon="edit"></Button>
                <Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                        icon="delete"></Button>
                <Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                        icon="share-alt"></Button>
                <Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                        icon="export"></Button>
            </div>;
            data.push({
                key: key,
                title: fileLogo,
                creator:creator.userName,
                createTime: getLocalTime(createTime),
                subjectOpt: subjectOpt,
            });
        });
        var pager = ret.pager;
        cloudTable.setState({totalCount: parseInt(pager.rsCount)});
        cloudTable.setState({"tableData":data});
    },
    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj){
        console.log(directoryObj.name);
        var initPageNo =1 ;
        var queryConditionJson="";
        cloudTable.setState({"parentDirectoryId":directoryObj.parentId,"currentDirectoryId":directoryObj.id});
        cloudTable.listFiles(cloudTable.state.ident,directoryObj.id,queryConditionJson,initPageNo);
    },
    /**
     * 修改文件夹的名称（重命名）
     * 显示修改操作的modal窗口
     * @param fileObject
     */
    editDirectoryName(fileObject){
        console.log(fileObject);
        var name = fileObject.name;
        cloudTable.setState({"reNameModalVisible":true,"editDirectoryName":name,"editFileObject":fileObject});
    },

    /**
     * 删除文件或文件夹
     * @param fileObject
     */
    deleteFileOrDirectory(fileObject){
        console.log("del key:"+fileObject.id);
        cloudTable.setState({"delCloudFileIds":fileObject.id});
        cloudTable.refs.confirmModal.changeConfirmModalVisible(true);
    },
    /**
     * 创建文件夹
     * TODO 此处应该将返回的response直接追加到当前的table中
     */
    makeDirectory(){
        var param = {
            "method": 'mkdir',
            "operateUserId": cloudTable.state.ident,
            "parentCloudFileId":cloudTable.state.currentDirectoryId,
            "name":cloudTable.state.editDirectoryName
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && isEmpty(ret.response)==false){
                    var initPageNo = 1;
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("文件夹创建成功");
                }else{
                    message.error("文件夹创建失败");
                }
                cloudTable.setState({"mkdirModalVisible":false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 删除文件夹或文件
     * 支持批量操作，多个id用逗号分割
     */
    deleteCloudFiles(){
        var param = {
            "method": 'deleteCloudFiles',
            "operateUserId": cloudTable.state.ident,
            "cloudFileIds":cloudTable.state.delCloudFileIds,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && ret.response==true){
                    var initPageNo = 1;
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("删除成功");
                }else{
                    message.error("删除失败");
                }
                cloudTable.refs.confirmModal.changeConfirmModalVisible(false);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 表格分页响应函数
     * 需要注意该表格承载了不同的数据，需要根据情况进行分页
     * @param pageNo
     */
    pageOnChange(pageNo) {
        var currentView = cloudTable.state.currentView;
        if (currentView == "homeWorkList") {
            cloudTable.getUserRootCloudFiles(sessionStorage.getItem("ident"), pageNo);
        } else {

        }

        this.setState({
            currentPage: pageNo,
        });
    },

    /**
     * 关闭重命名窗口
     */
    reNameModalHandleCancel(){
        cloudTable.setState({"reNameModalVisible":false});
    },
    /**
     * 确定执行重命名操作
     */
    reNameModalHandleOk(){
        var editFileObject = cloudTable.state.editFileObject;
        cloudTable.renameCloudFile(this.state.ident,editFileObject.id,cloudTable.state.editDirectoryName);
    },
    /**
     * 修改文件夹名称的文本框内容改变响应函数
     */
    directoryNameInputChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var editDirectoryName = target.value;
        cloudTable.setState({"editDirectoryName":editDirectoryName});
    },

    /**
     * 显示新建文件夹的窗口
     */
    showMkdirModal(){
        cloudTable.setState({"mkdirModalVisible":true,"editDirectoryName":''});
    },

    /**
     * 关闭新建文件夹的窗口
     */
    mkdirModalHandleCancel(){
        cloudTable.setState({"mkdirModalVisible":false});
    },
    /**
     * 关闭删除确认的弹窗
     */
    closeConfirmModal() {
        cloudTable.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 关闭上传文件弹窗
     */
    cloudFileUploadModalHandleCancel(){
        cloudTable.setState({"cloudFileUploadModalVisible":false});
    },

    //点击保存按钮，向蚁盘指定文件夹上传文件
    uploadFile(){
        if(uploadFileList.length==0){
            message.warning("请选择上传的文件,谢谢！");
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
                xhr: function(){        //这是关键  获取原生的xhr对象  做以前做的所有事情
                    var xhr = jQuery.ajaxSettings.xhr();
                    xhr.upload.onload = function (){
                        cloudTable.setState({progressState:'none'});
                    }
                    xhr.upload.onprogress = function (ev) {
                        if(ev.lengthComputable) {
                            var percent = 100 * ev.loaded/ev.total;
                            cloudTable.setState({uploadPercent:Math.round(percent),progressState:'block'});
                        }
                    }
                    return xhr;
                },
                success: function (responseStr) {
                    if(responseStr!=""){
                        var fileUrl=responseStr;
                        //TODO 调用本地上传文件的方法
                        cloudTable.createCloudFile(fileUrl,uploadFileList[0]);
                        //cloudTable.setState({ cloudFileUploadModalVisible: false });
                        //TODO 上传成功后，重新获取数据
                        //cloudTable.props.courseUploadCallBack();
                    }
                },
                error : function(responseStr) {
                    cloudTable.setState({ cloudFileUploadModalVisible: false });
                }
            });

        }
    },
    /**
     * 处理上传组件已上传的文件列表
     * @param fileList
     */
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
    /**
     * 显示文件上传的窗口
     */
    showUploadFileModal() {
        uploadFileList.splice(0,uploadFileList.length);
        cloudTable.setState({
            cloudFileUploadModalVisible: true,uploadPercent:0,progressState:'none'
        });
        //弹出文件上传窗口时，初始化窗口数据
        cloudTable.refs.fileUploadCom.initFileUploadPage();
    },

    /**
     * 向指定文件夹上传文件
     */
    createCloudFile(fileUrl,fileObj){
        var param = {
            "method": 'createCloudFile',
            "operateUserId": cloudTable.state.ident,
            "parentCloudFileId":cloudTable.state.currentDirectoryId,
            "name":fileObj.name,
            "path":fileUrl,
            "length":fileObj.size
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && isEmpty(ret.response)==false){
                    var initPageNo = 1;
                    //TODO 这里还需要判断是根目录还是子文件夹，根据不同情况，进入不同的目录
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("文件上传成功");
                }else{
                    message.error("文件上传失败");
                }
                cloudTable.setState({ cloudFileUploadModalVisible: false });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 返回上级目录
     */
    returnParent(){
        var initPageNo=1;
        if(cloudTable.state.getFileType=="myFile"){
            if(cloudTable.state.parentDirectoryId==0){
                cloudTable.setState({"parentDirectoryId":-1,"currentDirectoryId":0});
                cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
            }else{
                var queryConditionJson="";

                cloudTable.listFiles(cloudTable.state.ident,cloudTable.state.parentDirectoryId,queryConditionJson,initPageNo);
            }
        }else{
            cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
        }
    },

    showdelAllDirectoryConfirmModal(){

    },

    render() {
        const {loading, selectedRowKeys} = cloudTable.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        var delBtn = <div><Button type="primary" onClick={cloudTable.showdelAllDirectoryConfirmModal}
                                  disabled={!hasSelected} loading={loading}
        >批量删除</Button><span className="password_ts"
                            style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;

        var tipTitle;
        if(cloudTable.state.getFileType=="myFile"){
            tipTitle="我的文件";
        }else{
            tipTitle="群文件";
        }
        var newButton;
        var uploadButton;
        var setManagerButton;
        var setUserButton;
        //判断是否是超级管理员
        if(cloudTable.state.currentUserIsSuperManager){
            newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
            uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
            setManagerButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>分配管理者</Button>;
            setUserButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>分配使用者</Button>;
        }

        var returnParentToolBar;
        if(cloudTable.state.parentDirectoryId!=-1){
            returnParentToolBar = <div className="ant-tabs-right"><Button onClick={cloudTable.returnParent}><Icon type="left" /></Button></div>;
        }

        var toolbar = <div className="public—til—blue">
            {returnParentToolBar}
            <div className="talk_ant_btn1">
			<div className="pl_del">
                            {delBtn}
                        </div>
                {newButton}
                {uploadButton}
                {setManagerButton}
                {setUserButton}
            </div>
            {tipTitle}
        </div>;
        //根据该状态值，来决定上传进度条是否显示
        var progressState = cloudTable.state.progressState;
        return (
                <div>
                    <Modal title="重命名"
                           visible={cloudTable.state.reNameModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onOk={cloudTable.reNameModalHandleOk}
                           onCancel={cloudTable.reNameModalHandleCancel}
                    >
                    	<div>
                            <Row>
                                <Col span={3} className="right_look">名称：</Col>
                                <Col span={20}>
                                    <Input value={cloudTable.state.editDirectoryName} onChange={cloudTable.directoryNameInputChange}/>
                                </Col>
                            </Row>
                        </div>
                    </Modal>
                    <Modal title="新建文件夹"
                           visible={cloudTable.state.mkdirModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onOk={cloudTable.makeDirectory}
                           onCancel={cloudTable.mkdirModalHandleCancel}
                    >
                        <div>
                            <Row>
                                <Col span={3} className="right_look">名称：</Col>
                                <Col span={20}>
                                    <Input value={cloudTable.state.editDirectoryName} onChange={cloudTable.directoryNameInputChange}/>
                                </Col>
                            </Row>
                        </div>
                    </Modal>
                    <ConfirmModal ref="confirmModal"
                                  title="确定要删除选中的文件/文件夹"
                                  onConfirmModalCancel={this.closeConfirmModal}
                                  onConfirmModalOK={this.deleteCloudFiles}
                    ></ConfirmModal>

                    <Modal
                        visible={cloudTable.state.cloudFileUploadModalVisible}
                        title="上传文件"
                        className="modol_width"
                        maskClosable={false} //设置不允许点击蒙层关闭
                        onCancel={cloudTable.cloudFileUploadModalHandleCancel}
                        transitionName=""  //禁用modal的动画效果
                        footer={[
                            <div>
                                <Button type="primary" htmlType="submit" className="login-form-button" onClick={cloudTable.uploadFile}>
                                    保存
                                </Button>
                                <Button type="ghost" htmlType="reset" className="login-form-button" onClick={cloudTable.cloudFileUploadModalHandleCancel}>
                                    取消
                                </Button>
                            </div>
                        ]}
                    >
                        <Row>
                            <Col span={4}>上传文件：</Col>
                            <Col span={20}>
                                <div>
                                    <CloudFileUploadComponents ref="fileUploadCom" fatherState={cloudTable.state.cloudFileUploadModalVisible} callBackParent={cloudTable.handleFileSubmit}/>
                                </div>
                                <div style={{display:progressState}}>
                                    <Progress percent={cloudTable.state.uploadPercent} width={80} strokeWidth={4} />
                                </div>
                            </Col>

                        </Row>
                    </Modal>

                    {toolbar}
                    <div className="favorite_scroll">
                        
					<Table  rowSelection={rowSelection} columns={columns} dataSource={cloudTable.state.tableData} pagination={{
                        total: cloudTable.state.totalCount,
                        pageSize: getPageSize(),
                        onChange: cloudTable.pageOnChange
                    }} scroll={{y: 400}}/>
					</div>
                </div>

        );
    },
});

export default AntCloudTableComponents;
