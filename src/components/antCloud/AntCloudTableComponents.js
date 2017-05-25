import React, {PropTypes} from 'react';
import {Table, Button, Progress, message,Icon,Input,Modal,Row,Col,Radio,Cascader} from 'antd';
import ConfirmModal from '../ConfirmModal';
import CloudFileUploadComponents from './CloudFileUploadComponents';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {createUUID} from '../../utils/utils';
import {isEmpty} from '../../utils/Const';
import {bubbleSort} from '../../utils/utils';

const RadioGroup = Radio.Group;

var columns = [{
    title: '标题',
    dataIndex: 'title',
}, {
    title: '操作',
    className: 'ant-table-selection-user',
    dataIndex: 'subjectOpt',
},
];

var permissionTableColumns = [{
    title: '用户',
    dataIndex: 'userName',
}, {
    title: '操作',
    className: 'ant-table-selection-user',
    dataIndex: 'permissionOpt',
},
];

var targetDirColumns = [{
    title: '文件夹名称',
    dataIndex: 'dirName',
}, {
    title: '操作',
    className: 'ant-table-selection-user',
    dataIndex: 'moveDirOpt',
}
];

var groupColumns = [ {
    title:'头像',
    dataIndex:'userHeadIcon'
},{
    title: '联系人',
    dataIndex: 'userContacts',
}];

var data = [];
var subjectList;
var uploadFileList=[];
var cloudTable;
var ms;
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
            permissionModalVisible:false,     //设置权限窗口的状态控制
            permissionTypeValue:-1,      //默认的权限类型
            userAccount:'',     //搜索用户文本框的初始值
            userContactsData:[],
        };
    },
    componentDidMount(){
        ms = cloudTable.props.messageUtilObj;
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
                className: 'ant-table-selection-user2 time',
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
    getUserRootCloudFiles: function (userId, pageNo,optSrc) {
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
                    if(isEmpty(optSrc)==false && optSrc=="mainTable"){
                        cloudTable.buildTableDataByResponse(ret);
                    }else if(optSrc=="moveDirModal"){
                        cloudTable.buildTargetDirData(ret);
                    }else {
                        cloudTable.buildTableDataByResponse(ret);
                        cloudTable.buildTargetDirData(ret);
                    }
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
                    cloudTable.buildTargetDirData(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 构建移动文件时的目标文件夹数据
     * @param ret
     */
    buildTargetDirData(ret){
        var targetDirDataArray= [];
        var i=0;
        ret.response.forEach(function (e) {
            if(i==0){
                if(e.parent){
                    var parentDirectoryId = e.parent.parentId;
                    cloudTable.setState({"parentDirectoryIdAtMoveModal":parentDirectoryId});
                }
            }
            i++
            var key = e.id;
            var name = e.name;
            var dirName = <a className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e,"moveDirModal")}>{name}</a>;
            var moveDirOpt;
            if(e.directory==true){
                moveDirOpt=<div>
                    <Button onClick={cloudTable.moveFileToTargetDir.bind(cloudTable,key)}>确定</Button>
                </div>;
            }else{
                dirName = name;
            }
            var dataJson= {
                key: key,
                dirName: dirName,
                moveDirOpt:moveDirOpt
            };
            targetDirDataArray.push(dataJson);
        })
        cloudTable.setState({"targetDirDataArray":targetDirDataArray});
    },

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles: function (operateUserId, cloudFileId,queryConditionJson,pageNo,optSrc) {
        data = [];
        cloudTable.setState({totalCount: 0});
        cloudTable.buildPageView();
        if(isEmpty(optSrc)==false && optSrc=="mainTable"){
            cloudTable.setState({"currentDirectoryId":cloudFileId});
        }else{
            cloudTable.setState({"currentDirectoryIdAtMoveModal":cloudFileId});
        }
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
                    if(isEmpty(optSrc)==false && optSrc=="mainTable"){
                        cloudTable.buildTableDataByResponse(ret);
                    }else{
                        cloudTable.buildTargetDirData(ret);
                    }
                }else{
                    var parentDirectoryId = e.parent.parentId;
                    cloudTable.setState({"parentDirectoryId":parentDirectoryId});
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
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo,"mainTable");
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
                    <a className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e,"mainTable")}>{name}</a>
                </div>;
            }else{
                fileLogo=<div>
                    <Icon type="file" />
                    {name}
                </div>;
            }
            var maxPermission = cloudTable.getMaxPermission(permissionsArray);
            var editButton;
            var deleteButton;
            var shareButton;
            var moveButton;
            var settinButton;
            if(e.creator.colUid == sessionStorage.getItem("ident")){
                //自己创建的文件夹或文件，拥有最大权限
                editButton=<Button type="button" className="score3_i" value={key} text={key} onClick={cloudTable.editDirectoryName.bind(cloudTable,e)}
                                   icon="edit"></Button>;
                deleteButton=<Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                                     icon="delete"></Button>;
                shareButton=<Button type="button" value={key} text={key} onClick={cloudTable.showShareModal.bind(cloudTable,e)}
                                    icon="share-alt"></Button>;
                moveButton=<Button type="button" value={key} text={key} onClick={cloudTable.showMoveFileModal.bind(cloudTable,e)}
                                   icon="export"></Button>;
                settinButton=<Button type="button" value={key} text={key} onClick={cloudTable.showPermissionModal.bind(cloudTable,e)}
                                     icon="setting"></Button>;
            }else{
                switch (maxPermission){
                    case 1:
                    case 2:
                        editButton=<Button type="button" className="score3_i" value={key} text={key} onClick={cloudTable.editDirectoryName.bind(cloudTable,e)}
                                           icon="edit"></Button>;
                        deleteButton=<Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                                             icon="delete"></Button>;
                        shareButton=<Button type="button" value={key} text={key} onClick={cloudTable.showShareModal.bind(cloudTable,e)}
                                            icon="share-alt"></Button>;
                        moveButton=<Button type="button" value={key} text={key} onClick={cloudTable.showMoveFileModal.bind(cloudTable,e)}
                                           icon="export"></Button>;
                        settinButton=<Button type="button" value={key} text={key} onClick={cloudTable.showPermissionModal.bind(cloudTable,e)}
                                             icon="setting"></Button>;
                        break;
                    case 3:
                        editButton=<Button type="button" className="score3_i" value={key} text={key} onClick={cloudTable.editDirectoryName.bind(cloudTable,e)}
                                           icon="edit"></Button>;
                        deleteButton=<Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                                             icon="delete"></Button>;
                        shareButton=<Button type="button" value={key} text={key} onClick={cloudTable.showShareModal.bind(cloudTable,e)}
                                            icon="share-alt"></Button>;
                        moveButton=<Button type="button" value={key} text={key} onClick={cloudTable.showMoveFileModal.bind(cloudTable,e)}
                                           icon="export"></Button>;
                        settinButton="";
                        break;
                }
            }

            var subjectOpt = <div>
                {editButton}
                {deleteButton}
                {shareButton}
                {moveButton}
                {settinButton}
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
     * 获取最大的权限
     * 权限的排序为1最大，3最小
     * @param permissionsArray
     * @returns {*}
     */
    getMaxPermission(permissionsArray){
        var maxPermission;
        var permissionIdArray=[];
        permissionsArray.forEach(function (e) {
            var permission = e.permission;
            permissionIdArray.push(permission);
        });
        permissionIdArray = bubbleSort(permissionIdArray);
        maxPermission = permissionIdArray[0];
        return maxPermission;
    },

    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj,optSrc){
        console.log("optSrc:"+optSrc);
        var permissionsArray = directoryObj.permissions;
        var maxPermission = cloudTable.getMaxPermission(permissionsArray);
        cloudTable.setState({"currentDirMaxPermission":maxPermission});
        var initPageNo =1 ;
        var queryConditionJson="";
        if(isEmpty(optSrc)==false && optSrc=="mainTable"){
            cloudTable.setState({"parentDirectoryId":directoryObj.parentId,"currentDirectoryId":directoryObj.id});
        }else{
            cloudTable.setState({"parentDirectoryIdAtMoveModal":directoryObj.parentId,
                "currentDirectoryIdAtMoveModal":directoryObj.id});
        }
        cloudTable.listFiles(cloudTable.state.ident,directoryObj.id,queryConditionJson,initPageNo,optSrc);
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
                cloudTable.setState({"parentDirectoryId":-1,"currentDirectoryId":-1});
                cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo,"mainTable");
            }else{
                var queryConditionJson="";
                cloudTable.listFiles(cloudTable.state.ident,
                    cloudTable.state.parentDirectoryId,queryConditionJson,initPageNo,"mainTable");
            }
        }else{
            cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
        }
    },

    returnParentAtMoveModal(){
        var initPageNo=1;
        if(cloudTable.state.getFileType=="myFile"){
            if(cloudTable.state.parentDirectoryIdAtMoveModal==0){
                cloudTable.setState({"parentDirectoryIdAtMoveModal":-1,"currentDirectoryIdAtMoveModal":-1});
                cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo,"moveDirModal");
            }else{
                var queryConditionJson="";
                cloudTable.listFiles(cloudTable.state.ident,
                    cloudTable.state.parentDirectoryIdAtMoveModal,queryConditionJson,initPageNo,"moveDirModal");
            }
        }else{
            cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
        }
    },

    /**
     * 显示设置权限的窗口
     */
    showPermissionModal(fileObject){
        console.log("setting key:"+fileObject.id);
        var permissionsArray = fileObject.permissions;
        var maxPermission = cloudTable.getMaxPermission(permissionsArray);
        //当前要执行设置权限操作的文件夹id
        cloudTable.setState({"settingCloudFileIds":fileObject.id,"settingCloudFileMaxPermission":maxPermission});
        cloudTable.setState({"permissionModalVisible":true,permissionTypeValue:1,permissionTableData:[],userAccount:''});
    },

    /**
     * 设置权限窗口的确定操作
     */
    permissionModalHandleOk(){
        var param = {
            "method": 'assignPermission',
            "operateUseId": cloudTable.state.ident,
            "cloudFileId":cloudTable.state.settingCloudFileIds,
            "userId":cloudTable.state.userAccount,
            "permission":cloudTable.state.permissionTypeValue,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && ret.response==true){
                    var initPageNo = 1;
                    //TODO 这里还需要判断是根目录还是子文件夹，根据不同情况，进入不同的目录
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("权限设置成功");
                }else{
                    message.error("权限设置失败");
                }
                cloudTable.setState({ permissionModalVisible: false });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 设置权限窗口的取消操作
     */
    permissionModalHandleCancel(){
        cloudTable.setState({"permissionModalVisible":false});
    },

    /**
     * 执行批量删除操作
     */
    showdelAllDirectoryConfirmModal(){

    },

    /**
     * 权限类型切换响应函数
     * @param e
     */
    onPermissionTypeChange(e){
        cloudTable.setState({
            permissionTypeValue: e.target.value,
        });
        var param = {
            "method": 'getCloudFilePermissionByIdAndPermission',
            "operateUserId": cloudTable.state.ident,
            "cloudFileId":cloudTable.state.settingCloudFileIds,
            "permission":e.target.value,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功"){
                    console.log(ret.response);
                    var permissionTableData=[];
                    var permissionResponse = ret.response;
                    if(isEmpty(permissionResponse)==false && permissionResponse.length>0){

                        permissionResponse.forEach(function (e) {
                            var id = e.id;
                            var permission = e.permission;
                            var user = e.user;
                            var permissionOpt=<div>
                                <Button onClick={cloudTable.removePermission.bind(cloudTable,id)} icon="delete"></Button>
                            </div>;
                            var userJson = {
                                key: id,
                                userName:user.userName,
                                permission: permission,
                                user:user,
                                permissionOpt:permissionOpt
                            };
                            permissionTableData.push(userJson);
                        });
                    }
                    cloudTable.setState({"permissionTableData":permissionTableData});
                }else{
                    message.error("权限信息获取失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    userAccountInputChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var userAccount = target.value;
        cloudTable.setState({"userAccount":userAccount});
    },
    /**
     * 移除权限
     */
    removePermission(delPermissionId){
        console.log("delPermissionId:"+delPermissionId);
        var param = {
            "method": 'removeCloudFilePermissions',
            "operateUseId": cloudTable.state.ident,
            "cloudFilePermissionIds":delPermissionId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && ret.response==true){
                    var initPageNo = 1;
                    //TODO 这里还需要判断是根目录还是子文件夹，根据不同情况，进入不同的目录
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("权限设置成功");
                }else{
                    message.error("权限设置失败");
                }
                cloudTable.setState({ permissionModalVisible: false });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 显示移动文件的窗口
     */
    showMoveFileModal(fileObject){
        console.log("moveFileId key:"+fileObject.id);

        cloudTable.setState({ moveFileModalVisible: true,"moveFileId":fileObject.id });
    },

    /**
     * 关闭移动文件的窗口
     */
    moveFileModalHandleCancel(){
        cloudTable.setState({ moveFileModalVisible: false });
    },

    moveFileToTargetDir(toCloudFileId){
        cloudTable.moveCloudFiles(cloudTable.state.moveFileId,toCloudFileId);
    },

    /**
     * 完成文件向目标文件夹的移动
     */
    moveCloudFiles(fromCloudFileIds,toCloudFileId){
        var param = {
            "method": 'moveCloudFiles',
            "operateUserId": cloudTable.state.ident,
            "fromCloudFileIds":fromCloudFileIds,
            "toCloudFileId":toCloudFileId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && ret.response==true){
                    var initPageNo = 1;
                    //TODO 这里还需要判断是根目录还是子文件夹，根据不同情况，进入不同的目录
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                    message.success("移动成功");
                }else{
                    message.error("移动失败");
                }
                cloudTable.setState({ moveFileModalVisible: false });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    onShareDataSelectChange(selectedRowKeys) {
        var selectedRowKeysStr = selectedRowKeys.join(",");
        this.setState({"selectedRowKeysOfShare":selectedRowKeysStr});
    },

    /**
     * 获取联系人列表
     */
    getAntGroup(){
        var userContactsData=[];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var i=0;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var imgTag = <img src={e.avatar}  className="antnest_38_img" height="38" ></img>;
                    var userJson = {key:userId,userContacts:userName,userObj:e,"userHeadIcon":imgTag};
                    if(userId != sessionStorage.getItem("ident")){
                        userContactsData.push(userJson);
                    }
                    /*if(i==0){
                        mMenu.setState({selectRowKey:userId});
                    }*/
                    i++;
                });
                cloudTable.setState({"userContactsData":userContactsData});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getUserChatGroupById(pageNo){
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var response = ret.response;
                    var charGroupArray = [];
                    response.forEach(function (e) {
                        var chatGroupId = e.chatGroupId;
                        var chatGroupName = e.name;
                        var membersCount = e.members.length;
                        var groupMemebersPhoto=[];
                        for(var i=0;i<membersCount;i++){
                            var member = e.members[i];
                            var memberAvatarTag = <img src={member.avatar} ></img>;
                            groupMemebersPhoto.push(memberAvatarTag);
                            if(i>=3){
                                break;
                            }
                        }
                        var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                        switch (groupMemebersPhoto.length){
                            case 1:
                                imgTag = <div className="maaee_group_face1">{groupMemebersPhoto}</div>;
                                break;
                            case 2:
                                imgTag = <div className="maaee_group_face2">{groupMemebersPhoto}</div>;
                                break;
                            case 3:
                                imgTag = <div className="maaee_group_face3">{groupMemebersPhoto}</div>;
                                break;
                            case 4:
                                imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                                break;
                        }
                        var groupName = chatGroupName;
                        var groupNameTag = <a className="font_gray_666">{groupName}</a>
                        var chatGroupJson = {key:chatGroupId,userContacts:groupName,userObj:e,"userHeadIcon":imgTag};
                        charGroupArray.push(chatGroupJson);
                    });
                    cloudTable.setState({"userContactsData":charGroupArray});
                }
                //var pager = ret.pager;
                //cloudTable.setState({"optType":"getUserChatGroup","totalChatGroupCount":parseInt(pager.rsCount)});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 修改文件夹名称的文本框内容改变响应函数
     */
    nowThinkingInputChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var nowThinking = target.value;
        if(isEmpty(nowThinking)){
            nowThinking="这是一个云盘分享的文件";
        }
        cloudTable.setState({"nowThinking":nowThinking});
    },

    /**
     * 显示分享文件的窗口
     */
    showShareModal(fileObject){
        console.log("share key:"+fileObject.id);
        cloudTable.setState({"shareCloudFileIds":fileObject.id,"shareCloudFile":fileObject});
        cloudTable.getAntGroup();
        cloudTable.setState({shareModalVisible:true});
    },

    /**
     * 关闭分享文件的窗口
     */
    shareModalHandleCancel(){
        cloudTable.setState({shareModalVisible:false});
    },

    /**
     * 分享文件
     */
    shareFile(){
        var shareFileId = cloudTable.state.shareCloudFileIds;
        var shareToUser = cloudTable.state.selectedRowKeysOfShare;
        var nowThinking = cloudTable.state.nowThinking;
        var shareFile = cloudTable.state.shareCloudFile;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = createUUID();
        var createTime = (new Date()).valueOf();
        console.log("shareFileId:"+shareFileId);
        console.log("shareToUser:"+shareToUser);
        console.log("nowThinking:"+nowThinking);
        var shareToUserArray=[];
        if(isEmpty(shareToUser)==false){
            shareToUserArray = shareToUser.split(",");
        }
        var attachement={"address":shareFile.path,"user":loginUser,"createTime":shareFile.createTime};
        shareToUserArray.forEach(function (e) {
            var messageJson = {
                'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                "toId": e, "command": "message", "hostId": loginUser.colUid,
                "uuid": uuid, "toType": 1,"attachment":attachement
            };
            var commandJson = {"command": "message", "data": {"message": messageJson}};
            ms.send(commandJson);
        });

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
        }else{
            //非超管
            if(cloudTable.state.currentDirectoryId!=-1){
                if(cloudTable.state.currentDirMaxPermission!=3){
                    newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                    uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                }else{
                    newButton="";
                    //使用者只有上传的权限
                    uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                }
            }
        }

        var returnParentToolBar;
        console.log("------>"+cloudTable.state.parentDirectoryId);
        if(cloudTable.state.parentDirectoryId!=-1 && cloudTable.state.currentDirectoryId!=-1){
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
        var returnToolbarInMoveModal=<div className="public—til—blue">
            <div className="ant-tabs-right"><Button onClick={cloudTable.returnParentAtMoveModal}><Icon type="left" /></Button></div>
        </div>;
        var returnToolbarInShareModal=<div className="public—til—blue">
            <div className="ant-tabs-right"><Button onClick={cloudTable.getAntGroup}><Icon type="left" /></Button></div>
        </div>;
        //根据该状态值，来决定上传进度条是否显示
        var progressState = cloudTable.state.progressState;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };

        var radioGroup;
        switch (cloudTable.state.settingCloudFileMaxPermission){
            case 1:
                if(cloudTable.state.currentUserIsSuperManager){
                    //超级管理员
                    radioGroup = <RadioGroup onChange={cloudTable.onPermissionTypeChange} value={cloudTable.state.permissionTypeValue}>
                        <Radio  style={radioStyle} value={1}>校级管理员</Radio>
                        <Radio  style={radioStyle} value={2}>管理者</Radio>
                        <Radio  style={radioStyle} value={3}>使用者</Radio>
                    </RadioGroup>;
                }else{
                    radioGroup = <RadioGroup onChange={cloudTable.onPermissionTypeChange} value={cloudTable.state.permissionTypeValue}>
                        <Radio  style={radioStyle} value={2}>管理者</Radio>
                        <Radio  style={radioStyle} value={3}>使用者</Radio>
                    </RadioGroup>;
                }
                break;
            case 2:
                radioGroup = <RadioGroup onChange={cloudTable.onPermissionTypeChange} value={cloudTable.state.permissionTypeValue}>
                    <Radio  style={radioStyle} value={3}>使用者</Radio>
                </RadioGroup>
                break;
        }

        const {selectedRowKeysOfShare} = cloudTable.state;
        const rowSelectionOfShare = {
            selectedRowKeysOfShare,
            onChange: this.onShareDataSelectChange,
        };

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

                    <Modal title="权限管理"
                           visible={cloudTable.state.permissionModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onOk={cloudTable.permissionModalHandleOk}
                           onCancel={cloudTable.permissionModalHandleCancel}
                    >
                        <div>
                            <Row>
                                <Col span={3} className="right_look">权限类型：</Col>
                                <Col span={20}>
                                    {radioGroup}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} className="right_look">用户账号：</Col>
                                <Col span={20}>
                                    <Input value={cloudTable.state.userAccount} onChange={cloudTable.userAccountInputChange}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={3} className="right_look"></Col>
                                <Col span={20}>
                                    <Table showHeader={false} columns={permissionTableColumns} dataSource={cloudTable.state.permissionTableData}
                                           pagination={false}
                                    />
                                </Col>
                            </Row>

                        </div>
                    </Modal>

                    <Modal title="移动文件"
                           visible={cloudTable.state.moveFileModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onCancel={cloudTable.moveFileModalHandleCancel}
                           footer={null}
                    >
                        <div>
                            <Row>
                                <Col span={3} className="right_look">目标文件夹：</Col>
                                <Col span={20}>
                                    {returnToolbarInMoveModal}
                                    <Table  columns={targetDirColumns}  showHeader={false} dataSource={cloudTable.state.targetDirDataArray}
                                        pagination={{
                                        total: cloudTable.state.totalCount,
                                        pageSize: getPageSize(),
                                        onChange: cloudTable.pageOnChange
                                    }} scroll={{y: 300}}/>
                                </Col>
                            </Row>
                        </div>
                    </Modal>

                    <Modal title="分享文件"
                           visible={cloudTable.state.shareModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onCancel={cloudTable.shareModalHandleCancel}
                           onOk={cloudTable.shareFile}
                    >
                        <div>
                            <Row>
                                <Col span={12}>分享给：</Col>
                                <Col span={12}>这一刻的想法：</Col>
                            </Row>
                            <Row>
                                <Col span={3}></Col>
                                <Col span={9}>
                                    {returnToolbarInShareModal}
                                    <div>
                                        <div className="maaee_group affix_bottom_tc" onClick={cloudTable.getUserChatGroupById.bind(cloudTable,1)}>
                                            <img src={require('../images/groupTitle.png')} className="antnest_38_img" />
                                            <span className=""　icon="usergroup-add">我的群组</span>
                                        </div>
                                        <Table rowSelection={rowSelectionOfShare} className="maaeegroup yiqun"
                                               showHeader={false}
                                               columns={groupColumns} dataSource={cloudTable.state.userContactsData}
                                               pagination={false} scroll={{y: 200}}/>
                                    </div>
                                </Col>
                                <Col span={3}></Col>
                                <Col span={9}>
                                    <div>
                                        <Input type="textarea"rows={14} value={cloudTable.state.nowThinking} onChange={cloudTable.nowThinkingInputChange}/>
                                        <div>
                                            <Icon type="link" /><span>这是一个云盘分享的文件</span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
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
