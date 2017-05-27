import React, {PropTypes} from 'react';
import {Table, Button, Progress, message,Icon,Input,Modal,Row,Col,Radio,Cascader,Collapse,Checkbox} from 'antd';
import ConfirmModal from '../ConfirmModal';
import CloudFileUploadComponents from './CloudFileUploadComponents';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {createUUID} from '../../utils/utils';
import {isEmpty} from '../../utils/Const';
import {bubbleSort} from '../../utils/utils';

const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;
const CheckboxGroup = Checkbox.Group;

var columns = [{
    title: '名称',
    dataIndex: 'title',
    className: 'cloud_name',
},{
    title: '创建者',
    dataIndex: 'creator',
    className: 'ant-table-selection-user2 class_right date_tr',
}, {
    title: '更新时间',
    dataIndex: 'createTime',
    className: 'ant-135 class_right time',
}, {
    title: '操作',
    className: 'ant-table-selection-smallclass class_right',
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

var data = [];
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
            delBtnReadOnly:true,
            concatOptions:[],
            groupOptions:[],
        };
    },
    componentDidMount(){
        ms = cloudTable.props.messageUtilObj;
        cloudTable.isSchoolCloudFileSuperManager(cloudTable.state.ident);
        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, 1);
    },

    getFileByType(fileType){
        console.log("fileType"+fileType);
        var initPageNo=1;
        if(fileType=="myFile"){
            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
        }else{
            cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, initPageNo);
        }
        cloudTable.setState({"getFileType":fileType,parentDirectoryId:-1});
    },


    start() {
        cloudTable.setState({loading: true});
        setTimeout(() => {
            cloudTable.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    },
    /**
     * 表格数据批量选中的响应函数
     * //选中时，需要判断当前选中的数据中，是否有不可删除权限的
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        if(cloudTable.state.getFileType!="myFile"){
            //群文件中，群组可以删除任意文件，非群主只能删除自己的文件
            //判断是否是第一层文件夹
            if(cloudTable.state.currentDirectoryId==-1){
                // 判断是否是超级管理员
                if(cloudTable.state.currentUserIsSuperManager){
                    //超管在第一层具备所有文件夹操作权限，非超管无任何操作权限
                    cloudTable.setState({"delBtnReadOnly":false});
                }
            }else{
                for(var i=0;i<selectedRowKeys.length;i++){
                    var delKey = selectedRowKeys[i];
                    var fileObj = cloudTable.getCloudFilePermissionById(delKey);
                    //非第一层文件夹，根据分配的权限决定
                    if(fileObj.creator.colUid == sessionStorage.getItem("ident")){
                        //自己创建的文件夹或文件，拥有最大权限
                        cloudTable.setState({"delBtnReadOnly":false});
                    }else{
                        cloudTable.setState({"delBtnReadOnly":true});
                    }
                }
            }
        }
        if(selectedRowKeys.length==0){
            cloudTable.setState({"delBtnReadOnly":true});
        }
        cloudTable.setState({selectedRowKeys});
    },


    /**
     * 获取此文件夹的所有的拥有者权限
     */
    getCloudFilePermissionById(cloudFileId){
        var fileObj;
        var cloudFileArray = cloudTable.state.cloudFileArray;
        for(var i=0;i<cloudFileArray.length;i++){
            var cloudFile = cloudFileArray[i];
            var fileId = cloudFile.fileId;
            var cloudFileObj = cloudFile.cloudFileObj;
            if(cloudFileId==fileId){
                fileObj = cloudFileObj;
                break;
            }
        }
        return fileObj;
    },

    //点击导航时，进入的我的文件列表
    getUserRootCloudFiles: function (userId, pageNo,optSrc) {
        data = [];
        cloudTable.setState({currentDirectoryId: -1, totalCount: 0});
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
        cloudTable.setState({currentDirectoryId: -1, totalCount: 0});
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
            var directory = e.directory;
            var fileLogo = cloudTable.buildFileLogo(name,directory,e);

            var dirName = <span className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e,"moveDirModal")}>
                {fileLogo}
            </span>;
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

    buildFileLogo(name,directory,e){
        var fileLogo;
        if(directory){
            fileLogo=<span className="cloud_text">
                <i className="cloud_icon cloud_icon_file"></i>
                <span className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e,"mainTable")}>{name}</span>
            </span>;
        }else{
            var lastPointIndex = name.lastIndexOf(".");
            //通过截取文件后缀名的形式，完成对上传文件类型的判断
            var fileType = name.substring(lastPointIndex+1);
            var fileTypeLog;
            switch (fileType){
                case "png":
                    fileTypeLog = <i className="cloud_icon cloud_icon_png"></i>;
                    break;
                case "jpg":
                    fileTypeLog = <i className="cloud_icon cloud_icon_jpg"></i>;
                    break;
                case "mp3":
                    fileTypeLog = <i className="cloud_icon cloud_icon_mp3"></i>;
                    break;
                case "pdf":
                    fileTypeLog = <i className="cloud_icon cloud_icon_pdf"></i>;
                    break;
                case "ppt":
                case "pptx":
                    fileTypeLog = <i className="cloud_icon cloud_icon_ppt"></i>;
                    break;
                case "doc":
                case "docx":
                    fileTypeLog = <i className="cloud_icon cloud_icon_doc"></i>;
                    break;
                case "xls":
                case "xlsx":
                    fileTypeLog = <i className="cloud_icon cloud_icon_xls"></i>;
                    break;
                case "wps":
                    fileTypeLog = <i className="cloud_icon cloud_icon_wps"></i>;
                    break;
                default:
                    fileTypeLog = <i className="cloud_icon cloud_icon_other"></i>;
                    break;
            }
            fileLogo=<div>
                {fileTypeLog}
                {name}
            </div>;
        }
        return fileLogo;
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
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
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
        var cloudFileArray=[];
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
            var path = e.path;
            console.log("path---------->"+path);

            var fileLogo;
            var downloadButton;
            if(directory){
                fileLogo=<span className="cloud_text">
                    <i className="cloud_icon cloud_icon_file"></i>
                    <span className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e,"mainTable")}>{name}</span>
                </span>;
            }else{
                downloadButton=<a href={path} target="_blank" title="下载" download={path} className="te_download_a">
                    <Button icon="download"/></a>;
                var lastPointIndex = name.lastIndexOf(".");
                //通过截取文件后缀名的形式，完成对上传文件类型的判断
                var fileType = name.substring(lastPointIndex+1);
                var fileTypeLog;
                switch (fileType){
                    case "png":
                        fileTypeLog = <i className="cloud_icon cloud_icon_png"></i>;
                        break;
                    case "jpg":
                        fileTypeLog = <i className="cloud_icon cloud_icon_jpg"></i>;
                        break;
                    case "mp3":
                        fileTypeLog = <i className="cloud_icon cloud_icon_mp3"></i>;
                        break;
                    case "pdf":
                        fileTypeLog = <i className="cloud_icon cloud_icon_pdf"></i>;
                        break;
                    case "ppt":
                    case "pptx":
                        fileTypeLog = <i className="cloud_icon cloud_icon_ppt"></i>;
                        break;
                    case "doc":
                    case "docx":
                        fileTypeLog = <i className="cloud_icon cloud_icon_doc"></i>;
                        break;
                    case "xls":
                    case "xlsx":
                        fileTypeLog = <i className="cloud_icon cloud_icon_xls"></i>;
                        break;
                    case "wps":
                        fileTypeLog = <i className="cloud_icon cloud_icon_wps"></i>;
                        break;
                    default:
                        fileTypeLog = <i className="cloud_icon cloud_icon_other"></i>;
                        break;
                }
                fileLogo=<div>
                    {fileTypeLog}
                    {name}
                </div>;
            }
            var fileLogo = cloudTable.buildFileLogo(name,directory,e);
            var maxPermission = cloudTable.getMaxPermission(permissionsArray);
            var cloudFileJsonForEveryFile={"fileId":key,"cloudFileObj":e};
            cloudFileArray.push(cloudFileJsonForEveryFile);
            var editButton=<Button type="button" className="score3_i" value={key} text={key} onClick={cloudTable.editDirectoryName.bind(cloudTable,e)}
                               icon="edit"></Button>;
            var deleteButton=<Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                                 icon="delete"></Button>;
            var shareButton=<Button type="button" value={key} text={key} onClick={cloudTable.showShareModal.bind(cloudTable,e)}
                                icon="share-alt"></Button>;
            var moveButton=<Button type="button" value={key} text={key} onClick={cloudTable.showMoveFileModal.bind(cloudTable,e)}
                               icon="export"></Button>;
            var settinButton=<Button type="button" value={key} text={key} onClick={cloudTable.showPermissionModal.bind(cloudTable,e)}
                                 icon="setting"></Button>;
            //判断是否是第一层文件夹
            if(cloudTable.state.currentDirectoryId==-1){
                // 判断是否是超级管理员
                if(!cloudTable.state.currentUserIsSuperManager){
                    //超管在第一层具备所有文件夹操作权限，非超管无任何操作权限
                    editButton="";
                    deleteButton="";
                    shareButton="";
                    moveButton="";
                    settinButton="";
                }
            }else{
                //非第一层文件夹，根据分配的权限决定
                if(e.creator.colUid != sessionStorage.getItem("ident")){
                    //自己创建的文件夹或文件，拥有最大权限
                    switch (maxPermission){
                        case 1:
                        case 2:
                            break;
                        case 3:
                            settinButton="";
                            break;
                    }
                }
            }
            var subjectOpt = <div>
                {editButton}
                {deleteButton}
                {shareButton}
                {moveButton}
                {downloadButton}
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
        cloudTable.setState({"tableData":data,cloudFileArray,totalCount: parseInt(pager.rsCount)});
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
            cloudTable.setState({"parentDirectoryId":directoryObj.parentId,"currentDirectoryId":directoryObj.id,"currentDirectoryCreatorId":directoryObj.creator.colUid});
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
        cloudTable.setState({"delCloudFileIds":fileObject.id,"delType":"single"});
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
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
                    message.success("文件夹创建成功");
                }else{
                    message.error(ret.msg);
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
        var delIds;
        if(cloudTable.state.delType=="muliti"){
            //批量删除
            delIds = cloudTable.state.selectedRowKeys.join(",");
        }else{
            delIds=cloudTable.state.delCloudFileIds;
        }
        var param = {
            "method": 'deleteCloudFiles',
            "operateUserId": cloudTable.state.ident,
            "cloudFileIds":delIds,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.msg=="调用成功" && ret.response==true){
                    var initPageNo = 1;
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
                    message.success("删除成功");
                }else{
                    message.error(ret.msg);
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

        cloudTable.setState({
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
        cloudTable.renameCloudFile(cloudTable.state.ident,editFileObject.id,cloudTable.state.editDirectoryName);
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
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
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
            cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, initPageNo);
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
            cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, initPageNo);
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
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
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
        cloudTable.setState({"delType":"muliti"});
        cloudTable.refs.confirmModal.changeConfirmModalVisible(true);
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
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
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
                    var queryConditionJson="";
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");
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
        cloudTable.setState({"selectedRowKeysOfShare":selectedRowKeysStr});
    },

    /**
     * 获取联系人列表
     */
    getAntGroup(){
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var i=0;
                var concatOptions=[];
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var imgTag = <img src={e.avatar}  className="antnest_38_img" height="38" ></img>;
                    var userNameTag=<div>{imgTag}<span>{userName}</span></div>;
                    var userJson ={ label: userNameTag, value: userId};
                    if(userId != sessionStorage.getItem("ident")){
                        concatOptions.push(userJson);
                    }
                });
                cloudTable.setState({"concatOptions":concatOptions});
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
                    // var charGroupArray = [];
                    var groupOptions=[];
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
                        var groupNameTag = <div>{imgTag}<span>{groupName}</span></div>
                        var groupJson ={ label: groupNameTag, value: chatGroupId};
                        groupOptions.push(groupJson);
                    });
                    cloudTable.setState({"groupOptions":groupOptions});
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
        var checkedConcatOptions = cloudTable.state.checkedConcatOptions;
        var checkedGroupOptions = cloudTable.state.checkedGroupOptions;
        var shareToUserArray = checkedConcatOptions.concat(checkedGroupOptions);
        var nowThinking = cloudTable.state.nowThinking;
        var shareFile = cloudTable.state.shareCloudFile;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var uuid = createUUID();
        var createTime = (new Date()).valueOf();
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
        cloudTable.setState({shareModalVisible:false});

    },

    /**
     * 我的好友复选框被选中时的响应
     * @param checkedValues
     */
    concatOptionsOnChange(checkedValues) {
        console.log('checked = ', checkedValues);
        cloudTable.setState({"checkedConcatOptions":checkedValues});
    },
    /**
     * 我的好友复选框被选中时的响应
     * @param checkedValues
     */
    groupOptionsOnChange(checkedValues) {
        console.log('checked = ', checkedValues);
        cloudTable.setState({"checkedGroupOptions":checkedValues});
    },

    collapseChange(key){
        /*if(key==1){
            cloudTable.getUserChatGroupById(1);
        }*/
        cloudTable.getUserChatGroupById(1);
    },

    render() {
        const {loading, selectedRowKeys} = cloudTable.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: cloudTable.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        var delBtn;

        var tipTitle;
        if(cloudTable.state.getFileType=="myFile"){
            tipTitle="我的文件";
        }else{
            tipTitle="群文件";
        }
        var newButton;
        var uploadButton;
        //判断是否是超级管理员
        if(cloudTable.state.currentUserIsSuperManager){
            //第一级文件夹，只有超管有上传和新建的权限
            newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
            //uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
            delBtn = <div className="cloud_tool"><Button type="primary" onClick={cloudTable.showdelAllDirectoryConfirmModal}
                                  disabled={!hasSelected && cloudTable.state.delBtnReadOnly} loading={loading}
            >批量删除</Button><span className="password_ts"
                                style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;
        }else{
            //非超管
            if(cloudTable.state.currentDirectoryId!=-1){
                // 非第一级文件夹
                newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                //使用者只有上传的权限
                uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                /*if(cloudTable.state.currentDirMaxPermission!=3
                    || cloudTable.state.currentDirectoryCreatorId==sessionStorage.getItem("ident")){
                    newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                    uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                }else{
                    newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                    //使用者只有上传的权限
                    uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                }*/
                delBtn = <div className="cloud_tool"><Button type="primary" onClick={cloudTable.showdelAllDirectoryConfirmModal}
                                      disabled={!hasSelected} loading={loading}
                >批量删除</Button><span className="password_ts"
                                    style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;
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
                {newButton}
                {uploadButton}
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
            onChange: cloudTable.onShareDataSelectChange,
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
                                  onConfirmModalCancel={cloudTable.closeConfirmModal}
                                  onConfirmModalOK={cloudTable.deleteCloudFiles}
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
                                <Col span={24}>
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

                    <Modal title="分享文件" className="cloud_share_Modal"
                           visible={cloudTable.state.shareModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onCancel={cloudTable.shareModalHandleCancel}
                           onOk={cloudTable.shareFile}
                    >
                        <div>
                            <Row>
                                <Col span={12} className="share_til">选择好友分享文件：</Col>
                                <Col span={12} className="share_til">这一刻的想法：
									<span className="right_ri cloud_share_prompt"><Icon type="link" /><span>这是一个云盘分享的文件</span></span>
								</Col>
                            </Row>
                            <Row>
                                <Col span={11} className="upexam_float cloud_share_cont" >
                                    <Collapse bordered={false} defaultActiveKey={['2']} onChange={cloudTable.collapseChange}>
                                        <Panel header="我的群组" key="1">
                                            <CheckboxGroup options={cloudTable.state.groupOptions} onChange={cloudTable.groupOptionsOnChange} />
                                        </Panel>
                                        <Panel header="我的好友" key="2">
                                            <CheckboxGroup options={cloudTable.state.concatOptions} onChange={cloudTable.concatOptionsOnChange} />
                                        </Panel>
                                    </Collapse>
                                </Col>
                                <Col span={12} className="topics_dianzan">
                                    <div>
                                        <Input type="textarea"rows={14} placeholder="这是一个云盘分享的文件" value={cloudTable.state.nowThinking} onChange={cloudTable.nowThinkingInputChange}/>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Modal>

                    {toolbar}
                    <div className="favorite_scroll">
                        {/*<div className="pl_del">
                            {delBtn}
                        </div>*/}
                        {delBtn}
                        <Table className="cloud_box" rowSelection={rowSelection} columns={columns} dataSource={cloudTable.state.tableData} pagination={{
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
