import React, {PropTypes} from 'react';
import {
    Table,
    Button,
    Progress,
    message,
    Icon,
    Input,
    Modal,
    Row,
    Col,
    Radio,
    Cascader,
    Collapse,
    Checkbox,
    Tabs,
    Pagination
} from 'antd';
import ConfirmModal from '../ConfirmModal';
import CloudFileUploadComponents from './CloudFileUploadComponents';
import SubjectUploadComponent from '../subjectManager/SubjectUploadComponent';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {createUUID} from '../../utils/utils';
import {isEmpty, TO_TYPE, SMALL_IMG} from '../../utils/Const';
import {bubbleSort} from '../../utils/utils';
import {showLargeImg} from '../../utils/utils';

const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;
const CheckboxGroup = Checkbox.Group;

var columns = [{
    title: '名称',
    dataIndex: 'title',
    className: 'cloud_name',
}, {
    title: '创建者',
    dataIndex: 'creator',
    className: 'ant-table-selection-user2 class_right date_tr',
}, {
    title: '更新时间',
    dataIndex: 'createTime',
    className: 'ant-table-selection-smallclass_t class_right time',
}, {
    title: '操作',
    className: 'ant-table-selection-smallclass class_right operatIcon',
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
    className: 'ant-table-selection-user schoolgroup_operate',
    dataIndex: 'moveDirOpt',
}
];

var data = [];
var uploadFileList = [];
var cloudTable;
var ms;

var messageData = [];
var userMessageData = [];
var subjectParents = [];
const AntCloudTableComponents = React.createClass({
    getInitialState() {
        cloudTable = this;
        return {
            ident: sessionStorage.getItem('ident'),
            selectedRowKeys: [],
            loading: false,
            count: 0,
            totalCount: 0,
            totalCountModal: 0,   //Modal 数据总条数
            currentPage: 1,
            currentPageModal: 1,   //Modal当前页数
            currentView: 'myFile',
            clazzId: '',
            dateTime: '',
            tableData: [],
            getFileType: 'myFile',
            parentDirectoryId: -1,
            currentDirectoryId: -1,
            mkdirModalVisible: false,
            uploadPercent: 0,
            progressState: 'none',
            permissionTypeValue: -1,      //默认的权限类型
            userAccount: '',     //搜索用户文本框的初始值
            userContactsData: [],
            delBtnReadOnly: true,
            concatOptions: [],
            groupOptions: [],
            structureOptions: [],   //组织架构
            isGroupCreator: false,   //记录当前用户是否是操作当前群文件的群主
            disabledFlag: false,
            defaultActiveKey: "1",
            activeKey: "1",
            subjectModalVisible: false,  //上传题目modal
            pageNoMap: [],   //存放文件夹的id和pageNo的对应关系
            pageNo: 1, //设置移动文件夹是pageNo
            cloudFileIdMove: "", //设置移动文件夹是cloudFileId
        };
    },

    componentDidMount() {
        ms = this.props.messageUtilObj;
        var antCloudKey = this.props.antCloudKey;
        // this.getFileByType(antCloudKey);
        this.getFileByType('myFile');
    },

    componentWillReceiveProps(nextProps) {
        // var antCloudKey = nextProps.antCloudKey;
        // this.getFileByType(antCloudKey);
    },

    changeFileType(optType) {
        this.getFileByType(optType);
    },

    componentDidUpdate() {
        var imgArrNum = this.state.imgArrNum;
        var a = document.querySelectorAll(".topics_zanImg")[imgArrNum];
        var b = this.state.imgArrflag;
        if (isEmpty(a) == false) {
            if (b) {
                setTimeout(function () {
                    a.click();
                }, 200);
                this.state.imgArrflag = false;
            }
        }
    },

    getFileByType(fileType) {
        var initPageNo = 1;
        if (fileType == "myFile") {
            //我的文件 里面 我的资源
            if (cloudTable.state.activeKey == '1') {
                cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
            }
            //我的文件 里面 我的题目
            if (cloudTable.state.activeKey == '2') {
                cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, initPageNo);
            }
        } else {
            cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, initPageNo);
        }
        cloudTable.setState({"getFileType": fileType, parentDirectoryId: -1, currentPage: 1});
    },

    /**
     * 表格数据批量选中的响应函数
     * //选中时，需要判断当前选中的数据中，是否有不可删除权限的
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        if (cloudTable.state.getFileType != "myFile") {
            //群文件中，群组可以删除任意文件，非群主只能删除自己的文件
            //判断是否是第一层文件夹
            if (cloudTable.state.currentDirectoryId == -1) {
                // 判断是否是超级管理员
                if (cloudTable.state.currentUserIsSuperManager) {
                    //超管在第一层具备所有文件夹操作权限，非超管无任何操作权限
                    cloudTable.setState({"delBtnReadOnly": false});
                }
            } else {
                for (var i = 0; i < selectedRowKeys.length; i++) {
                    var delKey = selectedRowKeys[i];
                    var fileObj = cloudTable.getCloudFilePermissionById(delKey);
                    //非第一层文件夹，根据分配的权限决定
                    if (fileObj.creator.colUid == sessionStorage.getItem("ident")) {
                        //自己创建的文件夹或文件，拥有最大权限
                        cloudTable.setState({"delBtnReadOnly": false});
                    } else {
                        cloudTable.setState({"delBtnReadOnly": true});
                    }
                }
            }
        }
        if (selectedRowKeys.length == 0) {
            cloudTable.setState({"delBtnReadOnly": true});
        }
        cloudTable.setState({selectedRowKeys});
    },


    /**
     * 获取此文件夹的所有的拥有者权限
     */
    getCloudFilePermissionById(cloudFileId) {
        var fileObj;
        var cloudFileArray = cloudTable.state.cloudFileArray;
        for (var i = 0; i < cloudFileArray.length; i++) {
            var cloudFile = cloudFileArray[i];
            var fileId = cloudFile.fileId;
            var cloudFileObj = cloudFile.cloudFileObj;
            if (cloudFileId == fileId) {
                fileObj = cloudFileObj;
                break;
            }
        }
        return fileObj;
    },

    //点击导航时，进入的我的文件列表
    getUserRootCloudFiles: function (userId, pageNo, optSrc, flag) {
        debugger
        var _this = this;
        data = [];
        _this.setState({currentDirectoryId: -1, totalCount: 0});
        var param = {
            "method": 'getUserRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                debugger
                if (response) {
                    if (isEmpty(optSrc) == false && optSrc == "mainTable") {
                        cloudTable.buildTableDataByResponse(ret);
                    } else if (optSrc == "moveDirModal") {
                        cloudTable.buildTargetDirData(ret);
                        //_this.buildTargetDirDataSaveLocal(ret);
                    } else if (optSrc == "copyDirModal") {
                        // 保存
                        cloudTable.buildTargetDirDataSaveLocal(ret);
                    } else {
                        if (!flag) {
                            cloudTable.buildTableDataByResponse(ret);
                        }
                        cloudTable.buildTargetDirData(ret);
                        //cloudTable.buildTargetDirDataSaveLocal(ret);
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //点击导航时，获取用户的根群文件夹
    getUserChatGroupRootCloudFiles: function (userId, pageNo, optSrc) {
        debugger
        data = [];
        cloudTable.setState({currentDirectoryId: -1, totalCount: 0});
        var param = {
            "method": 'getUserChatGroupRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger
                var response = ret.response;
                if (response) {
                    if (optSrc == 'mainTable') {
                        cloudTable.buildTableDataByResponse(ret);//构建表格的数据
                    } else if (optSrc == 'moveDirModal') {
                        cloudTable.buildTargetDirData(ret);//构建移动文件时的目标文件夹数据
                    } else if (optSrc == 'copyDirModal') {
                        cloudTable.buildTargetDirDataSaveLocal(ret);
                    } else {
                        cloudTable.buildTableDataByResponse(ret);//构建表格的数据
                        cloudTable.buildTargetDirData(ret);//构建移动文件时的目标文件夹数据
                        cloudTable.buildTargetDirDataSaveLocal(ret);
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     *打开保存文件到蚁盘的model
     */
    /*    saveFile(fileIds) {
            var _this = this;
            //1.请求用户的私人网盘用数据构建model的table
            var id = JSON.parse(sessionStorage.getItem("loginUser")).colUid;
            var param = {
                "method": 'getUserRootCloudFiles',
                "userId":  id,
                "pageNo": 1,
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    var response = ret.response;
                    if (response) {
                        //构建我的文件目标文件夹数据
                        _this.buildTargetDirDataSaveLocal(ret);
                    }
                    // this.setState({isSaved: true});
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        },*/


    /*
   数组去重
    */
    unique(array) {
        var n = []; //一个新的临时数组
        for (var i = 0; i < array.length; i++) {
            if (n.indexOf(array[i]) == -1) {
                n.push(array[i]);
            }
        }
        return n;
    },

    /**
     * 保存到本地的确定按钮
     * @param ret
     */
    buildTargetDirDataSaveLocal(ret) {
        var targetDirDataArray = [];
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            ret.response.forEach(function (e) {
                if (i == 0) {
                    if (e.parent) {
                        var parentDirectoryId = e.parent.parentId;
                        cloudTable.setState({"parentDirectoryIdAtMoveModalSave": parentDirectoryId});
                    }
                }
                i++;
                var key = e.id;
                var name = e.name;
                var directory = e.directory;
                var fileLogo = cloudTable.buildFileLogo(name, directory, e, "copyDirModal");
                var dirName = <span className="font_gray_666"
                    //这是点击文件名进入文件夹的功能
                                    onClick={cloudTable.intoDirectoryInner.bind(cloudTable, e, "copyDirModal")}>
                {fileLogo}
            </span>;
                var moveDirOpt;
                if (e.directory == true) {
                    moveDirOpt = <div>
                        {/*这是确定保存的功能*/}
                        <Button className="btn_font"
                                onClick={cloudTable.saveFileToLocalDir.bind(cloudTable, key, "copyDirModal")}>确定</Button>
                    </div>;
                } else {
                    dirName = name;
                }
                var dataJson = {
                    key: key,
                    dirName: dirName,
                    moveDirOpt: moveDirOpt
                };
                targetDirDataArray.push(dataJson);
            })
            var totalCount = ret.pager.rsCount;
            //更新保存modal的数据和页码
            cloudTable.setState({
                "targetDirDataArray1": targetDirDataArray,
                "totalCountForCopyModal": totalCount,
                totalCount: totalCount
            });
        }
    },


    /**
     * 构建移动文件时的目标文件夹数据
     * @param ret
     */
    buildTargetDirData(ret) {
        var targetDirDataArray = [];
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            ret.response.forEach(function (e) {
                if (i == 0) {
                    if (e.parent) {
                        var parentDirectoryId = e.parent.parentId;
                        cloudTable.setState({"parentDirectoryIdAtMoveModal": parentDirectoryId});
                    }
                }
                i++;
                var key = e.id;
                var name = e.name;
                var directory = e.directory;
                var fileLogo = cloudTable.buildFileLogo(name, directory, e, "moveDirModal");

                var dirName = <span className="font_gray_666"
                                    onClick={cloudTable.intoDirectoryInner.bind(cloudTable, e, "moveDirModal")}>
                {fileLogo}
            </span>;
                var moveDirOpt;
                if (e.directory == true) {
                    moveDirOpt = <div>
                        <Button className="btn_font"
                                onClick={cloudTable.moveFileToTargetDir.bind(cloudTable, key, "moveDirModal")}>确定</Button>
                    </div>;
                } else {
                    dirName = name;
                }
                var dataJson = {
                    key: key,
                    dirName: dirName,
                    moveDirOpt: moveDirOpt
                };
                targetDirDataArray.push(dataJson);
            });
            cloudTable.setState({
                "targetDirDataArray1": targetDirDataArray,
                totalCount: parseInt(ret.pager.rsCount),
                totalCountModal: parseInt(ret.pager.rsCount)
            });
        }
    },

    buildFileLogo(name, directory, e, optSrc) {
        var fileLogo;
        if (directory) {
            fileLogo = <span className="cloud_text">
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc"
                      onClick={cloudTable.intoDirectoryInner.bind(cloudTable, e, optSrc)}>{name}</span>
            </span>;
        } else {
            if (this.state.activeKey == "1") {
                var lastPointIndex = name.lastIndexOf(".");
                //通过截取文件后缀名的形式，完成对上传文件类型的判断
                var fileType = name.substring(lastPointIndex + 1);
                var fileTypeLog;
                switch (fileType) {
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
                fileLogo = <span className="cloud_text">
                {fileTypeLog}
                    <span className="yipan_name" onClick={cloudTable.readDoc.bind(cloudTable, e)}>{name}</span>
            </span>;
            } else {
                var subjectI = null;
                if (e.subject.typeName == '单选题') {
                    subjectI = <i className="icon_question icon_single_choice upexam_float"></i>
                } else if (e.subject.typeName == '判断题') {
                    subjectI = <i className="icon_question icon_trueOrfalse upexam_float"></i>
                } else if (e.subject.typeName == '多选题') {
                    subjectI = <i className="icon_question icon_multiple_choice upexam_float"></i>
                } else {
                    subjectI = <i className="icon_question icon_short_answer upexam_float"></i>
                }
                var subjectContent = <span className="cloud_text">
                    {subjectI}
                    <span className="antnest_name affix_bottom_tc table_name_high">
                        <article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: name}}
                                 onClick={cloudTable.readDoc.bind(cloudTable, e)}></article>
                    </span>
                 </span>;
                fileLogo = subjectContent;
            }
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
    listFilesLocal: function (operateUserId, cloudFileId, queryConditionJson, pageNo, optSrc) {
        data = [];
        cloudTable.setState({totalCount: 0});
        if (isEmpty(optSrc) == false && optSrc == "mainTable") {
            cloudTable.setState({"currentDirectoryId": cloudFileId});
        } else {
            cloudTable.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
        }
        var param = {
            "method": 'listFiles',
            "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            "queryConditionJson": queryConditionJson,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    if (isEmpty(optSrc) == false && optSrc == "mainTable") {
                        cloudTable.buildTableDataByResponse(ret);
                    } else {
                        cloudTable.buildTargetDirDataSaveLocal(ret, true, optSrc);
                    }
                    //cloudTable.buildTargetDirDataSaveLocal(ret, true, optSrc);
                } else {
                    var parentDirectoryId = e.parent.parentId;
                    cloudTable.setState({"parentDirectoryId": parentDirectoryId});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 蚁盘中，点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles: function (operateUserId, cloudFileId, queryConditionJson, pageNo, optSrc) {
        debugger
        data = [];
        cloudTable.setState({totalCount: 0});
        var param = {
            "method": 'listFiles',
            "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            "queryConditionJson": queryConditionJson,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger
                var response = ret.response;
                console.log("ss" + optSrc)
                if (response) {
                    if (isEmpty(optSrc) == false && optSrc == "mainTable") {
                        cloudTable.setState({"currentDirectoryId": cloudFileId});
                        cloudTable.buildTableDataByResponse(ret);
                    } else if (isEmpty(optSrc) == false && optSrc == "moveDirModal") {
                        if (isEmpty(response) == true) {
                            cloudTable.setState({
                                "currentDirectoryId": cloudTable.state.cloudFileIdMove,
                                "currentPageModal": cloudTable.state.pageNo
                            });
                            //cloudTable.buildTargetDirData(ret);
                        } else {
                            //移动文件夹页面进入文件
                            cloudTable.setState({
                                "currentDirectoryId": cloudFileId,
                                "currentPageModal": pageNo,
                                "cloudFileIdMove": cloudFileId
                            });
                            cloudTable.buildTargetDirData(ret);
                        }

                    } else if (isEmpty(optSrc) == false && optSrc == "copyDirModal") {
                        // 保存
                        cloudTable.setState({"currentDirectoryId": cloudFileId, "currentPageForCopyModal": pageNo});
                        cloudTable.buildTargetDirDataSaveLocal(ret);
                    } else {
                        cloudTable.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
                        cloudTable.buildTargetDirData(ret);
                        cloudTable.buildTargetDirDataSaveLocal(ret);
                    }
                } else {
                    var parentDirectoryId = e.parent.parentId;
                    cloudTable.setState({"parentDirectoryId": parentDirectoryId});
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
    isSchoolCloudFileSuperManager(userId) {
        var param = {
            "method": 'isSchoolCloudFileSuperManager',
            "userId": userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.success == true && ret.msg == "调用成功") {
                    cloudTable.setState({"currentUserIsSuperManager": response});
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
    renameCloudFile(operateUserId, cloudFileId, name) {
        var param = {
            "method": 'renameCloudFile',
            "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            "name": name
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (ret.success == true && ret.msg == "调用成功" && ret.response == true) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    if (cloudTable.state.activeKey == '2') {
                        if (cloudTable.state.parentSubjectDirectoryId == '0') {
                            cloudTable.setState({parentSubjectDirectoryId: '-1', currentSubjectDirectoryId: "-1"});
                            cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, initPageNo);
                        } else {
                            cloudTable.listCloudSubject(cloudTable.state.parentSubjectDirectoryId, initPageNo)
                        }
                    } else {
                        if (cloudTable.state.currentDirectoryId != -1) {
                            cloudTable.listFiles(cloudTable.state.ident, cloudTable.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, cloudTable.state.currentPage);
                        }
                    }
                    message.success("重命名成功");
                } else {
                    message.error("重命名失败");
                }
                cloudTable.setState({"reNameModalVisible": false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /*
蚁盘，点"我的题目"时调用的接口
userId   --- 登录用户的id
pageNo   --- 页码，-1取全部
*/
    getUserRootCloudSubjects(userId, pageNo) {
        cloudTable.setState({
            "currentSubjectDirectoryId": -1,
        });
        var param = {
            "method": 'getUserRootCloudSubjects',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    cloudTable.buildTableDataByResponse(ret);
                }
            }
        )
    },
    /**
     * 蚁盘我的资源tabs切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        if (activeKey == "1") {
            cloudTable.setState({
                activeKey: '1',
                currentSubjectDirectoryId: '-999',
                currentPage: 1,
                selectedRowKeys: []
            });//不知道currentSubjectDirectoryId是什么值,在点击我的蚁盘时不要赋值成-1就可以解决没有后退按钮的问题
            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, 1);
        }
        if (activeKey == "2") {
            cloudTable.setState({activeKey: '2', currentPage: 1, selectedRowKeys: []});
            cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, 1)
        }
    },
    /**
     * 构建表格的数据
     * @param ret
     */
    buildTableDataByResponse(ret) {
        debugger
        var _this = this;
        var i = 0;
        var cloudFileArray = [];
        var data = [];
        _this.state.tableData = [];
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            for (var i = 0; i < ret.response.length; i++) {
                var e = ret.response[i];
                if (i == 0) {
                    if (_this.state.activeKey == '1') {
                        if (e.parent) {
                            var parentDirectoryId = e.parent.parentId;
                            _this.setState({"parentDirectoryId": parentDirectoryId});
                        }
                    } else {
                        var parentDirectoryId = e.parentId;
                        _this.setState({"parentSubjectDirectoryId": parentDirectoryId});
                    }

                }
                var key = e.id;
                var createTime = e.createTime;
                var createUid = e.createUid;
                var creator = e.creator;
                var userName = e.creator.userName;
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
                var downloadButton;

                if (directory) {
                    downloadButton = null;
                } else {
                    if (isEmpty(path) == false) {
                        var pathLocal = path.substring(path.indexOf('/upload') - 1, path.length);
                        downloadButton =
                            <a href={path} target="_blank" title="下载" download={e.name} className="te_download_a_noom">
                                <Button icon="download"/></a>;
                    }
                }
                if (cloudTable.state.activeKey == '2' && directory === false && isEmpty(e.subject) === true) {
                    //题目  非文件夹  题目对象为空  则continue
                    console.log("continue:" + e);
                    continue;
                }
                var fileLogo = _this.buildFileLogo(name, directory, e, "mainTable");
                var cloudFileJsonForEveryFile = {"fileId": key, "cloudFileObj": e};
                cloudFileArray.push(cloudFileJsonForEveryFile);
                var editButton = <Button title="重命名" type="button" className="score3_i" value={key} text={key}
                                         onClick={cloudTable.editDirectoryName.bind(cloudTable, e)}
                                         icon="edit"></Button>;
                var deleteButton = <Button title="删除" type="button" value={key} text={key}
                                           onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable, e)}
                                           icon="delete"></Button>;
                var shareButton = <Button title="分享" type="button" value={key} text={key}
                                          onClick={cloudTable.showShareModal.bind(cloudTable, e)}
                                          icon="share-alt"></Button>;
                var moveButton = <Button title="移动" type="button" value={key} text={key}
                                         onClick={cloudTable.showMoveFileModal.bind(cloudTable, e)}
                                         icon="swap"></Button>;
                var saveButton = <Button title="保存至我的蚁盘" type="button" value={key} text={key}
                                         onClick={cloudTable.getCloudFileSave.bind(cloudTable, e)}
                                         icon="save"></Button>;

                var getFileType = cloudTable.state.getFileType;
                //我的蚁盘是私有的，用户具备所有的操作权限
                if (getFileType != "myFile") {
                    //群文件的第一层无操作项
                    //判断是否是第一层文件夹
                    //群文件的第一层目录无任何操作
                    if (_this.state.currentDirectoryId == -1 || (e.creator.colUid != sessionStorage.getItem("ident") && _this.state.isGroupCreator == false)) {
                        editButton = "";
                        deleteButton = "";
                        moveButton = "";
                        if (_this.state.currentDirectoryId == -1) {
                            saveButton = "";
                            shareButton = "";
                        }
                    }
                } else {
                    //我的文件夹中，如果是文件夹，则不应该有保存按钮
                    saveButton = "";
                }
                var subjectOpt;
                if (cloudTable.state.activeKey == '2' && cloudTable.state.getFileType == "myFile") {
                    if (directory) {
                        subjectOpt = <div>
                            {deleteButton}
                            {editButton}
                        </div>
                    } else {
                        subjectOpt = <div>
                            {deleteButton}
                        </div>
                    }
                } else {
                    subjectOpt = <div>
                        {editButton}
                        {deleteButton}
                        {shareButton}
                        {moveButton}
                        {saveButton}
                        {downloadButton}
                    </div>;
                }
                data.push({
                    key: key,
                    title: fileLogo,
                    creator: <span className="dold_text name_max">{userName}</span>,
                    createTime: getLocalTime(createTime),
                    subjectOpt: subjectOpt,
                });
            }
            // , totalCount: parseInt(ret.pager.rsCount)
            _this.setState({"tableData": data, cloudFileArray, totalCount: parseInt(ret.pager.rsCount)});
        } else {
            _this.setState({"tableData": [], cloudFileArray: [], totalCount: 0});
            // subjectParents.pop();
        }
    },

    /**
     * 蚁盘中，如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj, optSrc) {
        debugger
        var initPageNo = 1;
        var queryConditionJson = "";
        this.buildPageNoMap(this.state.currentDirectoryId, this.state.currentPage);
        //点击第一层文件夹时，记录当前文件夹的群主是否是当前用户
        if (cloudTable.state.currentDirectoryId == -1 && cloudTable.state.getFileType != "myFile") {
            if (directoryObj.createUid == this.state.ident) {
                this.setState({"isGroupCreator": true});
            } else {
                this.setState({"isGroupCreator": false});
            }
        }
        if (isEmpty(optSrc) == false && optSrc == "mainTable") {
            cloudTable.setState({
                "parentDirectoryId": directoryObj.parentId,
                "currentDirectoryId": directoryObj.id,
                "currentDirectoryCreatorId": directoryObj.creator.colUid
            });
        }
        if (isEmpty(optSrc) == false && optSrc == "moveDirModal") {
            cloudTable.setState({
                "parentDirectoryId": directoryObj.parentId,
                "currentDirectoryId": directoryObj.id,
                "currentDirectoryCreatorId": directoryObj.creator.colUid
            });
        }
        else {
            cloudTable.setState({
                "parentDirectoryIdAtMoveModal": directoryObj.parentId,
                "currentDirectoryIdAtMoveModal": directoryObj.id
            });
        }
        if (cloudTable.state.activeKey == '1') {
            //我的资源点击进入事件
            cloudTable.listFiles(cloudTable.state.ident, directoryObj.id, queryConditionJson, initPageNo, optSrc);
        } else {
            //题目
            cloudTable.setState({
                "parentSubjectDirectoryId": directoryObj.parentId,
                "currentSubjectDirectoryId": directoryObj.id,
            });
            subjectParents.push(this.state.parentSubjectDirectoryId);
            this.unique(subjectParents);
            cloudTable.listCloudSubject(directoryObj.id, initPageNo)
        }
        this.setState({currentPage: initPageNo});
    },
    /**
     * 点击文件夹名称，进入文件夹内部的文件列表   cloudFileId   --- 目录的id  pageNo        --- 页码，-1取全部
     listCloudDir(String cloudFileId, String pageNo)
     */
    listCloudSubject(cloudFileId, pageNO) {
        var _this = this;
        var data = [];
        var param = {
            "method": 'listCloudSubject',
            "cloudFileId": cloudFileId,
            "pageNo": pageNO
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildTableDataByResponse(ret);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 如果不是文件，預覽
     */
    readDoc(e) {
        if (this.state.activeKey == 2) {
            var url = 'http://jiaoxue.maaee.com:8091/#/questionDetil?courseId=' + e.subject.id;
            let obj = {mode: '', title: '我的题目', url: url, width: '380px'};
            LP.Start(obj);
            return
        }
        //根据不同的文件类型判断使用哪种方式预览
        var type = e.suffix;
        var path = e.path;
        var id = e.id;
        var createUid = e.createUid;
        var name = e.name;
        if (type == 'mp4') {
            var url = 'http://www.maaee.com/Excoord_PhoneService/cloudFile/cloudFileShow/' + e.uuid + '/' + e.id;
            this.view(event, url, name);
        } else if (type == 'jpg' || type == 'bmp' || type == 'png') {
            var url = path;
            //当前的路径
            var arr = [];
            var sum = document.getElementsByClassName('te_download_a_noom');
            for (var i = 0; i < sum.length; i++) {
                var suffix = sum[i].href.substr(sum[i].href.length - 3);
                if (suffix == 'jpg' || suffix == 'png' || suffix == 'PNG' || suffix == 'JPG' || suffix == 'BMP' || suffix == 'bmp') {
                    arr.push(sum[i].href)
                }
            }
            //总共的图片个数
            var num = arr.length;
            //所有图片的路径
            //创建img对象，渲染并调用插件
            var imgArr = [];
            arr.forEach(function (v, i) {
                var imgId = "img" + i;
                var img = <span className="topics_zan"><img id={imgId} className="topics_zanImg"
                                                            onClick={showLargeImg} src={v}/>
                      </span>;
                imgArr.push(img);
                if (url == v) {
                    num = i;
                }
            });
            //渲染
            this.setState({imgArr, imgArrflag: true, imgArrNum: num});
            // document.querySelectorAll(".topics_zanImg")[num].click();
            //不能立马渲染到dom，怀疑是创建react的方法，采取另一种react创建方法
            // this.view(event, url, name);
        } else {
            var url = "http://www.maaee.com/Excoord_PhoneService/cloudFile/cloudFileShow/" + id + "/" + createUid;
            this.view(event, url, name);
        }
    },
    /**
     * 打开view视窗
     * @param e
     * @param url
     * @param tit
     */
    view(e, url, tit) {
        e = e || window.event;
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;

        let mode = (tit) => {
            let refArr = tit.split('.');
            let type = refArr[refArr.length - 1];
            return type;
        }

        let obj = {mode: mode(tit), title: tit, url: url, width: '380px'};


        LP.Start(obj);
    },

    /**
     *
     */
    downloadFile(fileName, content) {
        var aLink = document.createElement('a');
        var blob = new Blob([content]);
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        aLink.dispatchEvent(evt);
    },

    /**
     * 修改文件夹的名称（重命名）
     * 显示修改操作的modal窗口
     * @param fileObject
     */
    editDirectoryName(fileObject) {
        var pointPosition = fileObject.name.lastIndexOf(".");
        if (pointPosition == -1) {
            cloudTable.setState({
                "reNameModalVisible": true,
                "editDirectoryName": fileObject.name,
                "editFileObject": fileObject
            });
        } else {
            var name = fileObject.name.slice(0, pointPosition);
            cloudTable.setState({"reNameModalVisible": true, "editDirectoryName": name, "editFileObject": fileObject});
        }
    },

    /**
     * 删除文件或文件夹
     * @param fileObject
     */
    deleteFileOrDirectory(fileObject) {
        cloudTable.setState({"delCloudFileIds": fileObject.id, "delType": "single",confirmModal:true});
        // cloudTable.refs.confirmModal.changeConfirmModalVisible(true);
    },
    /**
     * 创建文件夹
     * TODO 此处应该将返回的response直接追加到当前的table中
     */
    makeDirectory() {
        var _this = this;
        var param;
        if (_this.state.activeKey == '2') {
            param = {
                "method": 'mkdir',
                "operateUserId": cloudTable.state.ident,
                "parentCloudFileId": cloudTable.state.currentSubjectDirectoryId,
                "name": cloudTable.state.editDirectoryName
            };
        } else {
            param = {
                "method": 'mkdir',
                "operateUserId": cloudTable.state.ident,
                "parentCloudFileId": cloudTable.state.currentDirectoryId,
                "name": cloudTable.state.editDirectoryName
            };
        }
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    if (cloudTable.state.activeKey == '2') {
                        if (cloudTable.state.currentSubjectDirectoryId != -1) {
                            cloudTable.listCloudSubject(cloudTable.state.currentSubjectDirectoryId, initPageNo)
                        } else {
                            cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, initPageNo);
                        }
                    } else {
                        if (cloudTable.state.currentDirectoryId != -1) {
                            cloudTable.listFiles(cloudTable.state.ident,
                                cloudTable.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                            cloudTable.setState({currentPage: 1});
                        } else {
                            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, 1);
                            cloudTable.setState({currentPage: 1});
                        }
                    }
                    message.success("文件夹创建成功");
                } else {
                    message.error(ret.msg);
                }
                cloudTable.setState({"mkdirModalVisible": false});
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
    deleteCloudFiles() {
        var delIds;
        if (cloudTable.state.delType == "muliti") {
            //批量删除
            delIds = cloudTable.state.selectedRowKeys.join(",");
        } else {
            delIds = cloudTable.state.delCloudFileIds;
        }
        var param = {
            "method": 'deleteCloudFiles',
            "operateUserId": cloudTable.state.ident,
            "cloudFileIds": delIds,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功" && ret.response == true) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    if (cloudTable.state.activeKey == '2') {
                        if (cloudTable.state.currentSubjectDirectoryId != -1) {
                            cloudTable.listCloudSubject(cloudTable.state.currentSubjectDirectoryId, initPageNo)
                        } else {
                            cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, initPageNo);
                        }
                    } else {
                        if (cloudTable.state.currentDirectoryId != -1) {
                            cloudTable.listFiles(cloudTable.state.ident,
                                cloudTable.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, cloudTable.state.currentPage);
                        }
                    }
                    message.success("删除成功");
                } else {
                    message.error(ret.msg);
                }
                cloudTable.setState({"selectedRowKeys": [],confirmModal:false});
                // cloudTable.refs.confirmModal.changeConfirmModalVisible(false);
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
        debugger
        var getFileType = cloudTable.state.getFileType;
        if (getFileType == "myFile") {
            if (this.state.activeKey == "1") {
                //判断是否是第一层文件夹
                if (this.state.currentDirectoryId != -1) {
                    var queryConditionJson = "";
                    this.buildPageNoMap(this.state.currentDirectoryId, pageNo);
                    this.listFiles(this.state.ident,
                        this.state.currentDirectoryId, queryConditionJson, pageNo, "mainTable");
                } else {
                    this.buildPageNoMap(-1, pageNo);
                    cloudTable.setState({activeKey: '1', currentSubjectDirectoryId: '-999'});//不知道currentSubjectDirectoryId是什么值,在点击我的蚁盘时不要赋值成-1就可以解决没有后退按钮的问题
                    cloudTable.getUserRootCloudFiles(cloudTable.state.ident, pageNo);
                }

            } else {
                if (this.state.currentSubjectDirectoryId != -1) {
                    this.listCloudSubject(this.state.currentSubjectDirectoryId, pageNo);
                } else {
                    cloudTable.setState({activeKey: '2'});
                    cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, pageNo)
                }
            }
            // cloudTable.getUserRootCloudFiles(cloudTable.state.ident, pageNo);
        } else {
            if (this.state.currentDirectoryId != -1) {
                var queryConditionJson = "";
                this.listFiles(this.state.ident,
                    this.state.currentDirectoryId, queryConditionJson, pageNo, "mainTable");
            } else {
                this.getUserChatGroupRootCloudFiles(this.state.ident, pageNo);
            }

        }
        $(".ant-table-body").animate({scrollTop: 0}, 0);
        this.setState({
            currentPage: pageNo,
            //totalCount: parseInt(ret.pager.rsCount)

        });
    },


    /**
     * 表格分页响应函数
     * 需要注意该表格承载了不同的数据，需要根据情况进行分页
     * @param pageNo
     */
    pageOnChangeModal(pageNo) {
        debugger
        var getFileType = cloudTable.state.getFileType;
        if (getFileType == "myFile") {
            if (this.state.activeKey == "1") {
                //判断是否是第一层文件夹
                if (this.state.currentDirectoryId != -1) {
                    var queryConditionJson = "";
                    this.buildPageNoMap(this.state.currentDirectoryId, pageNo);
                    this.listFiles(this.state.ident,
                        this.state.currentDirectoryId, queryConditionJson, pageNo, "moveDirModal");
                    cloudTable.setState({pageNo: pageNo})
                } else {
                    this.buildPageNoMap(-1, pageNo);
                    cloudTable.setState({activeKey: '1', currentSubjectDirectoryId: '-999', pageNo: pageNo});//不知道currentSubjectDirectoryId是什么值,在点击我的蚁盘时不要赋值成-1就可以解决没有后退按钮的问题
                    cloudTable.getUserRootCloudFiles(cloudTable.state.ident, pageNo, "moveDirModal");
                }

            } else {
                if (this.state.currentSubjectDirectoryId != -1) {
                    this.listCloudSubject(this.state.currentSubjectDirectoryId, pageNo);
                } else {
                    cloudTable.setState({activeKey: '2'});
                    cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, pageNo)
                }
            }
            // cloudTable.getUserRootCloudFiles(cloudTable.state.ident, pageNo);
        } else {
            if (this.state.currentDirectoryId != -1) {
                var queryConditionJson = "";
                this.listFiles(this.state.ident,
                    this.state.currentDirectoryId, queryConditionJson, pageNo, "moveDirModal");
            } else {
                this.getUserChatGroupRootCloudFiles(this.state.ident, pageNo, "moveDirModal");
            }
        }
        $(".ant-table-body").animate({scrollTop: 0}, 0);
        this.setState({
            pageNo: pageNo,
            currentPageModal: pageNo,
            //totalCount: parseInt(ret.pager.rsCount)

        });
    },

    /**
     * 表格分页响应函数
     * 需要注意该表格承载了不同的数据，需要根据情况进行分页
     * @param pageNo
     */
    pageOnChangeForCopyModal(pageNo) {
        debugger
        var getFileType = cloudTable.state.getFileType;
        //判断是否是第一层文件夹
        if (this.state.currentDirectoryId != -1) {
            var queryConditionJson = "";
            this.buildPageNoMap(this.state.currentDirectoryId, pageNo);
            this.listFiles(this.state.ident,
                this.state.currentDirectoryId, queryConditionJson, pageNo, "copyDirModal");
        } else {
            this.buildPageNoMap(-1, pageNo);
            cloudTable.setState({activeKey: '1', currentSubjectDirectoryId: '-999'});//不知道currentSubjectDirectoryId是什么值,在点击我的蚁盘时不要赋值成-1就可以解决没有后退按钮的问题
            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, pageNo, "copyDirModal");
        }
        $(".ant-table-body").animate({scrollTop: 0}, 0);
        this.setState({
            currentPageForCopyModal: pageNo,
            //totalCount: parseInt(ret.pager.rsCount)

        });
    },

    /**
     * 关闭重命名窗口
     */
    reNameModalHandleCancel() {
        cloudTable.setState({"reNameModalVisible": false});
    },
    /**
     * 确定执行重命名操作
     */
    reNameModalHandleOk() {
        var editFileObject = cloudTable.state.editFileObject;
        if (!editFileObject.suffix) {
            cloudTable.renameCloudFile(cloudTable.state.ident, editFileObject.id, cloudTable.state.editDirectoryName);
        } else {
            var editDirectoryName = cloudTable.state.editDirectoryName + "." + editFileObject.suffix;
            cloudTable.renameCloudFile(cloudTable.state.ident, editFileObject.id, editDirectoryName);
        }
    },
    /**
     * 修改文件夹名称的文本框内容改变响应函数
     */
    directoryNameInputChange(e) {

        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var editFileObject = cloudTable.state.editFileObject;
        var editDirectoryName = target.value;
        cloudTable.setState({"editDirectoryName": editDirectoryName});
    },

    /**
     * 显示新建文件夹的窗口
     */
    showMkdirModal() {
        cloudTable.setState({"mkdirModalVisible": true, "editDirectoryName": ''});
    },

    /**
     * 关闭新建文件夹的窗口
     */
    mkdirModalHandleCancel() {
        cloudTable.setState({"mkdirModalVisible": false});
    },
    /**
     * 关闭删除确认的弹窗
     */
    closeConfirmModal() {
        this.setState({
            confirmModal:false
        })
    },

    /**
     * 关闭上传文件弹窗
     */
    cloudFileUploadModalHandleCancel() {
        cloudTable.setState({"cloudFileUploadModalVisible": false, disabledFlag: false});
    },

    //点击保存按钮，向蚁盘指定文件夹上传文件
    uploadFile() {
        debugger
        var formDataArr = [];
        cloudTable.state.disabledFlag = "false";
        if (uploadFileList.length == 0) {
            message.warning("请选择上传的文件,谢谢！");
        } else {
            cloudTable.state.disabledFlag = "true";
            var formData = new FormData();
            for (var i = 0; i < uploadFileList.length; i++) {
                formData.append("file" + i, uploadFileList[i]);
                formData.append("name" + i, uploadFileList[i].name);
                formDataArr.push(formData);
            }
            console.log(formData);
            console.log(formDataArr);
            $.ajax({
                type: "POST",
                url: "http://60.205.86.217:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData: false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType: false,
                xhr: function () {        //这是关键  获取原生的xhr对象  做以前做的所有事情
                    var xhr = jQuery.ajaxSettings.xhr();
                    xhr.upload.onload = function () {
                        cloudTable.setState({progressState: 'none'});
                    }
                    xhr.upload.onprogress = function (ev) {
                        if (ev.lengthComputable) {
                            var percent = 100 * ev.loaded / ev.total;
                            cloudTable.setState({uploadPercent: Math.round(percent), progressState: 'block'});
                        }
                    }
                    return xhr;
                },
                success: function (responseStr) {
                    if (responseStr != "") {
                        var fileUrl = responseStr;
                        //TODO 调用本地上传文件的方法
                        var arr = fileUrl.split(',');
                        arr.forEach(function (v, i) {
                            cloudTable.createCloudFile(v, uploadFileList[i]);
                        });
                    }
                },
                error: function (responseStr) {
                    cloudTable.setState({cloudFileUploadModalVisible: false});
                }
            });

        }
    },
    /**
     * 处理上传组件已上传的文件列表
     * @param fileList
     */
    handleFileSubmit(fileList) {
        /*if (fileList == null || fileList.length == 0) {
            uploadFileList.splice(0, uploadFileList.length);
        }*/
        uploadFileList.splice(0);
        for (var i = 0; i < fileList.length; i++) {
            var fileJson = fileList[i];
            var fileObj = fileJson.fileObj;
            uploadFileList.push(fileObj);
        }
    },
    /**
     * 显示文件上传的窗口
     */
    showUploadFileModal() {
        uploadFileList.splice(0, uploadFileList.length);
        if (cloudTable.state.activeKey == '1') {
            cloudTable.setState({
                cloudFileUploadModalVisible: true, uploadPercent: 0, progressState: 'none', disabledFlag: false
            });
            //弹出文件上传窗口时，初始化窗口数据
            cloudTable.refs.fileUploadCom.initFileUploadPage();
        } else {
            cloudTable.refs.antCloudSubjectComponents.showModal();
        }
    },

    /**
     * 向指定文件夹上传文件
     */
    createCloudFile(fileUrl, fileObj) {
        debugger
        var param = {
            "method": 'createCloudFile',
            "operateUserId": cloudTable.state.ident,
            "parentCloudFileId": cloudTable.state.currentDirectoryId,
            "name": fileObj.name,
            "path": fileUrl,
            "length": fileObj.size
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger
                if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    /*cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");*/
                    if (cloudTable.state.activeKey == '1') {
                        if (cloudTable.state.currentDirectoryId != -1) {
                            cloudTable.listFiles(cloudTable.state.ident,
                                cloudTable.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, cloudTable.state.currentPage);
                        }
                    } else {
                        if (cloudTable.state.currentSubjectDirectoryId != -1) {
                            cloudTable.listCloudSubject(cloudTable.state.currentSubjectDirectoryId, initPageNo)
                        } else {
                            cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, initPageNo);
                        }
                    }

                    message.success("文件上传成功");
                } else {
                    message.error("文件上传失败");
                }
                cloudTable.setState({cloudFileUploadModalVisible: false, currentPage: 1});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 返回上级目录
     */
    returnParent() {
        debugger
        var pageNoMap = this.state.pageNoMap;
        // var initPageNo = 1;
        var currentPageNo = 1;
        if (cloudTable.state.getFileType == "myFile") {
            if (cloudTable.state.activeKey == '1') {
                if (cloudTable.state.parentDirectoryId == 0) {
                    cloudTable.setState({"parentDirectoryId": -1, "currentDirectoryId": -1});
                    var pageNoIndex = this.getPageNoIndex(-1, pageNoMap);
                    if (pageNoIndex != -1) {
                        var pageNoJson = pageNoMap[pageNoIndex];
                        currentPageNo = pageNoJson.pageNo;
                        // cloudTable.getUserRootCloudFiles(cloudTable.state.ident, currentPageNo, "mainTable");
                    }
                    cloudTable.getUserRootCloudFiles(cloudTable.state.ident, currentPageNo, "mainTable");
                } else {
                    var queryConditionJson = "";
                    var pageNoIndex = this.getPageNoIndex(this.state.parentDirectoryId, pageNoMap);
                    if (pageNoIndex != -1) {
                        var pageNoJson = pageNoMap[pageNoIndex];
                        currentPageNo = pageNoJson.pageNo;
                    }
                    cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.parentDirectoryId, queryConditionJson, currentPageNo, "mainTable");
                }
            } else {
                var lastSubjectParent = subjectParents.pop();
                var lastSubjectParentId = subjectParents[subjectParents.length - 1];
                if (lastSubjectParent == '0') {
                    lastSubjectParent = [];
                    cloudTable.setState({parentSubjectDirectoryId: '-1', currentSubjectDirectoryId: "-1"});
                    cloudTable.getUserRootCloudSubjects(cloudTable.state.ident, currentPageNo);
                } else {
                    cloudTable.listCloudSubject(lastSubjectParent, currentPageNo)
                }
            }
        } else {
            if (cloudTable.state.parentDirectoryId == 0) {
                cloudTable.setState({"parentDirectoryId": -1, "currentDirectoryId": -1});
                cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, currentPageNo, 'mainTable');
            } else {
                var queryConditionJson = "";
                var pageNoIndex = this.getPageNoIndex(this.state.parentDirectoryId, pageNoMap);
                if (pageNoIndex != -1) {
                    var pageNoJson = pageNoMap[pageNoIndex];
                    currentPageNo = pageNoJson.pageNo;
                }
                cloudTable.listFiles(cloudTable.state.ident,
                    cloudTable.state.parentDirectoryId, queryConditionJson, currentPageNo, "mainTable");
            }
        }
        this.setState({currentPage: currentPageNo});
    },
    /**
     * 移动文件的modal中的回退按钮
     */
    returnParentAtMoveModal() {
        var initPageNo = 1;
        if (cloudTable.state.getFileType == "myFile") {
            if (cloudTable.state.parentDirectoryIdAtMoveModal == 0) {
                cloudTable.setState({"parentDirectoryIdAtMoveModal": -1, "currentDirectoryIdAtMoveModal": -1});
                cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo, "moveDirModal");
            } else if (cloudTable.state.parentDirectoryIdAtMoveModal == -1 || isEmpty(cloudTable.state.parentDirectoryIdAtMoveModal) == true) {
                //根目录下后退操作,不执行
                return
            } else {
                var queryConditionJson = "";
                cloudTable.listFiles(cloudTable.state.ident,
                    cloudTable.state.parentDirectoryIdAtMoveModal, queryConditionJson, initPageNo, "moveDirModal");
            }
        } else {
            if (cloudTable.state.parentDirectoryIdAtMoveModal == 0) {
                cloudTable.setState({"parentDirectoryIdAtMoveModal": -1, "currentDirectoryIdAtMoveModal": -1});
                cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, initPageNo, 'moveDirModal');
            } else {
                var queryConditionJson = "";
                cloudTable.listFiles(cloudTable.state.ident,
                    cloudTable.state.parentDirectoryIdAtMoveModal, queryConditionJson, initPageNo, "moveDirModal");
            }
        }
        this.setState({currentPageModal: initPageNo});
    },

    /**
     * 执行批量删除操作
     */
    showdelAllDirectoryConfirmModal() {
        cloudTable.setState({"delType": "muliti",confirmModal:true});
        // cloudTable.refs.confirmModal.changeConfirmModalVisible(true);
    },

    userAccountInputChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var userAccount = target.value;
        cloudTable.setState({"userAccount": userAccount});
    },


    /**
     *拿到保存的文件的信息的回调
     * @param filePath
     * @param fileName
     * @param fileLength
     */
    getCloudFileSave(fileObject) {
        var initPageNo = 1;
        this.getUserRootCloudFiles(this.state.ident, initPageNo, "copyDirModal");
        this.setState({saveFileModalVisible: true, "saveFileId": fileObject.id, "currentPageForCopyModal": 1});
    },

    /**
     * 点击取消按钮 取消保存文件
     */
    saveFileModalHandleCancel() {
        cloudTable.setState({saveFileModalVisible: false});
    },


    /**
     * 点击确定按钮，保存文件到指定目录   点击 父亲
     */
    saveFileToLocalDir(parentCloudFileId) {
        debugger
        var _this = this;
        //1.请求用户的私人网盘用数据构建model的table
        var id = JSON.parse(sessionStorage.getItem("loginUser")).colUid;
        var param = {
            "method": 'copyCloudFiles',
            "operateUserId": id,
            "toCloudFileId": parentCloudFileId,
            "fromCloudFileIds": this.state.saveFileId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger
                if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    if (cloudTable.state.fileType != 'myFile') {
                        if (cloudTable.state.currentDirectoryId != -1) {
                            cloudTable.listFiles(cloudTable.state.ident,
                                cloudTable.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, cloudTable.state.currentPage);
                        }
                        cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, cloudTable.state.currentPage);
                    }
                    message.success("文件保存成功");
                } else {
                    message.error("文件保存失败");
                }
                cloudTable.setState({saveFileModalVisible: false});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },


    /**
     * 点击确定按钮，保存文件到指定目录
     */
    saveFileToTargetDir(parentCloudFileId, fileIds) {
        if (this.state.isShare) {
            var param = {
                "method": 'copyCloudFiles',
                "operateUserId": antGroup.state.loginUser.colUid,
                "toCloudFileId": parentCloudFileId,
                "fromCloudFileIds": fileIds
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                        var initPageNo = 1;
                        var queryConditionJson = "";
                        if (antGroup.state.currentDirectoryId != -1) {
                            antGroup.listFiles(antGroup.state.ident,
                                antGroup.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            antGroup.getUserRootCloudFiles(antGroup.state.ident, antGroup.state.currentPage);
                        }
                        message.success("文件保存成功");
                    } else {
                        message.error("文件保存失败");
                    }
                    antGroup.setState({saveFileModalVisible: false});
                    antGroup.setState({checkFileModalVisible: false});
                    antGroup.setState({isShare: false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });

        } else {
            //1.将此文件的信息拿过来
            var name = this.state.fileName;
            var path = this.state.filePath;
            var length = this.state.fileLength;
            var fileCreateUid = this.state.fileCreateUid;

            var param = {
                "method": 'createCloudFile',
                "operateUserId": antGroup.state.loginUser.colUid,
                "parentCloudFileId": parentCloudFileId,
                "name": name,
                "path": path,
                "length": length
            };

            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                        var initPageNo = 1;
                        var queryConditionJson = "";
                        if (antGroup.state.currentDirectoryId != -1) {
                            antGroup.listFiles(antGroup.state.ident,
                                antGroup.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                        } else {
                            antGroup.getUserRootCloudFiles(antGroup.state.ident, antGroup.state.currentPage);
                        }
                        message.success("文件保存成功");
                    } else {
                        message.error("文件保存失败");
                    }
                    antGroup.setState({saveFileModalVisible: false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },
    /**
     * 显示移动文件的窗口
     */
    showMoveFileModal(fileObject) {
        var initPageNo = 1;
        var getFileType = cloudTable.state.getFileType;
        if (getFileType == "myFile") {
            if (this.state.activeKey == "1") {
                cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo, "moveDirModal");
                cloudTable.setState({
                    moveFileModalVisible: true,
                    "moveFileId": fileObject.id,
                    fileType: "myFile",
                    currentPageModal: 1
                });
            }
        } else {
            cloudTable.getUserChatGroupRootCloudFiles(cloudTable.state.ident, initPageNo, "moveDirModal");
            cloudTable.setState({
                moveFileModalVisible: true,
                "moveFileId": fileObject.id,
                fileType: "groupFile",
                currentPageModal: 1
            });
        }

    },

    /**
     * 关闭移动文件的窗口
     */
    moveFileModalHandleCancel() {
        cloudTable.setState({moveFileModalVisible: false});
    },

    moveFileToTargetDir(toCloudFileId) {
        cloudTable.moveCloudFiles(cloudTable.state.moveFileId, toCloudFileId);
    },

    /**
     * 完成文件向目标文件夹的移动
     */
    moveCloudFiles(fromCloudFileIds, toCloudFileId) {
        debugger
        var param = {
            "method": 'moveCloudFiles',
            "operateUserId": cloudTable.state.ident,
            "fromCloudFileIds": fromCloudFileIds,
            "toCloudFileId": toCloudFileId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger
                if (ret.success == true && ret.msg == "调用成功" && ret.response == true) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    /*cloudTable.listFiles(cloudTable.state.ident,
                        cloudTable.state.currentDirectoryId,queryConditionJson,initPageNo,"mainTable");*/
                    if (cloudTable.state.currentDirectoryId != -1) {
                        cloudTable.listFiles(cloudTable.state.ident,
                            cloudTable.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                    } else {
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, cloudTable.state.currentPage);
                    }
                    message.success("移动成功");
                } else {
                    message.error("移动失败");
                }
                cloudTable.setState({moveFileModalVisible: false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    onShareDataSelectChange(selectedRowKeys) {
        var selectedRowKeysStr = selectedRowKeys.join(",");
        cloudTable.setState({"selectedRowKeysOfShare": selectedRowKeysStr});
    },

    /**
     * 获取联系人列表
     */
    getAntGroup() {
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var resLength = ret.response.length;
                var response = ret.response.splice(4, resLength);
                var i = 0;
                var concatOptions = [];
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var imgTag = <img src={e.avatar} className="antnest_38_img" height="38"></img>;
                    var userNameTag = <div>{imgTag}<span>{userName}</span></div>;
                    var userJson = {label: userNameTag, value: userId};
                    if (userId != sessionStorage.getItem("ident")) {
                        concatOptions.push(userJson);
                    }
                });
                cloudTable.setState({"concatOptions": concatOptions});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 保存 save  back
     * @param pageNo
     */

    saveBarBack() {
        var initPageNo = 1;
        //我的文件 列表里面 我的资源
        if (cloudTable.state.parentDirectoryIdAtMoveModalSave == '0') {
            cloudTable.setState({"parentDirectoryIdAtMoveModalSave": -1, "currentDirectoryIdAtMoveModalSave": -1});
            // cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo, '', true);
            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo, "copyDirModal");
        } else {
            var queryConditionJson = "";
            cloudTable.listFilesLocal(cloudTable.state.ident, cloudTable.state.parentDirectoryIdAtMoveModalSave, queryConditionJson, initPageNo);
            //this.listFiles(this.state.ident,this.state.currentDirectoryId, queryConditionJson, initPageNo, "copyDirModal");
        }
        //判断是否是第一层文件夹
        /*if (this.state.currentDirectoryId != -1) {
            var queryConditionJson = "";
            this.buildPageNoMap(this.state.currentDirectoryId, initPageNo);
            this.listFiles(this.state.ident,
                this.state.currentDirectoryId, queryConditionJson, initPageNo, "copyDirModal");
        } else {
            this.buildPageNoMap(-1, pageNo);
            cloudTable.setState({activeKey: '1', currentSubjectDirectoryId: '-999'});//不知道currentSubjectDirectoryId是什么值,在点击我的蚁盘时不要赋值成-1就可以解决没有后退按钮的问题
            cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo, "copyDirModal");
        }*/
        this.setState({currentPageForCopyModal: initPageNo});
    },


    getUserChatGroupById(pageNo) {
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    // var charGroupArray = [];
                    var groupOptions = [];
                    response.forEach(function (e) {
                        var chatGroupId = e.chatGroupId;
                        var chatGroupName = e.name;
                        var membersCount = e.members.length;
                        var groupMemebersPhoto = [];
                        for (var i = 0; i < membersCount; i++) {
                            var member = e.members[i];
                            var memberAvatarTag = <img src={member.avatar}></img>;
                            groupMemebersPhoto.push(memberAvatarTag);
                            if (i >= 3) {
                                break;
                            }
                        }
                        var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                        switch (groupMemebersPhoto.length) {
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
                        var groupJson = {label: groupNameTag, value: chatGroupId};
                        groupOptions.push(groupJson);
                    });
                    cloudTable.setState({"groupOptions": groupOptions});
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
     * 组织架构列表
     */
    getStructureUsers: function () {
        var _this = this;
        var param = {
            "method": 'getStructureUsers',
            "operateUserId": sessionStorage.getItem("ident"),
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                var userStruct = [];
                data.forEach(function (e) {

                    var userStructId = e.colUid;
                    var userStructName = e.userName;
                    var userStructImgTag = <img src={e.avatar} className="antnest_38_img" height="38"></img>;
                    var userStructNameTag = <div>{userStructImgTag}<span>{userStructName}</span></div>;
                    var userStructJson = {label: userStructNameTag, value: userStructId};

                    if (userStructId != sessionStorage.getItem("userStructId")) {
                        userStruct.push(userStructJson);
                    }
                });
                cloudTable.setState({"structureOptions": userStruct});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取最近联系人
     */
    getRecentContents() {
        userMessageData.splice(0);
        messageData.splice(0);
        var _this = this;
        var param = {
            "method": 'getUserRecentMessages',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false || isEmpty(messageData) == false) {
                    response.forEach(function (e) {
                        //如果这条消息的来源是我自己 助手 ,就直接讲readState制成1
                        _this.setMessageArrayForOnePerson(e);
                    });
                    _this.showMessageData();
                }


            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 将返回的每一个message消息对象进行处理，将同一个人的消息整合到一起
     * 格式为：{fromUser,messageResponse}
     * 如：{{colUid:23836,userName:'王丹'},[{content:'123'}{content:'test'}]}
     */
    setMessageArrayForOnePerson(messageObj) {
        if (messageObj.command == "message") {
            var fromUser = messageObj.fromUser;
            var content = messageObj.content;

            var messageIndex = -1;
            var messageToType = messageObj.toType;
            var contentJson = {"content": content,};
            if (messageToType == 1) {
                //个人消息
                var showUser;
                if (fromUser.colUid != sessionStorage.getItem("ident")) {
                    showUser = fromUser;
                } else {
                    showUser = messageObj.toUser;
                }
                if (isEmpty(showUser)) {
                    // console.log("toUser为空");
                    return;
                }
                var colUid = showUser.colUid;
                messageIndex = this.checkMessageIsExist(colUid);
                //个人消息
                if (messageIndex == -1) {
                    var contentArray = [contentJson];
                    var userJson = {
                        key: colUid,
                        "fromUser": showUser,
                        contentArray: contentArray,
                        "messageToType": messageToType,
                    };
                    messageData.push(userJson);
                } else {
                    messageData[messageIndex].contentArray.push(contentJson);
                }
            } else {
                //群组消息
                var toChatGroup = messageObj.toChatGroup;
                if (isEmpty(toChatGroup) == false) {
                    var chatGroupId = toChatGroup.chatGroupId;
                    var groupName = toChatGroup.name;
                    messageIndex = this.checkMessageIsExist(messageObj.toChatGroup.chatGroupId);
                    if (messageIndex == -1) {
                        var contentArray = [contentJson];
                        var userJson = {
                            key: chatGroupId,
                            "fromUser": fromUser,
                            contentArray: contentArray,
                            "messageToType": messageToType,
                            "toChatGroup": toChatGroup,
                        };
                        messageData.push(userJson);
                    } else {
                        messageData[messageIndex].contentArray.push(contentJson);
                    }
                }
            }
        }
    },

    checkMessageIsExist(userId) {
        var messageIndex = -1;
        for (var i = 0; i < messageData.length; i++) {
            var userJson = messageData[i];
            if (userJson.key == userId) {
                messageIndex = i;
                break;
            }
        }
        return messageIndex;
    },

    /**
     * 渲染用户最新消息列表
     */
    showMessageData() {
        userMessageData.splice(0);
        messageData.forEach(function (data) {
            var messageType = data.messageToType;
            if (messageType == 1) {
                //个人消息
                var userStructId = data.key;
                var userStructName = data.fromUser.userName;
                var userStructImgTag = <img src={data.fromUser.avatar} className="antnest_38_img" height="38"></img>;
                var userStructNameTag = <div>{userStructImgTag}<span>{userStructName}</span></div>;
                var userStructJson = {label: userStructNameTag, value: userStructId};

                if (userStructId != sessionStorage.getItem("userStructId") && userStructId != 138437 && userStructId != 41451 && userStructId != 142033 && userStructId != 139581) {
                    userMessageData.push(userStructJson);
                }
            } else {
                //群组

                var chatGroupId = data.key;
                var chatGroupName = data.toChatGroup.name;
                var membersCount = data.toChatGroup.avatar.split('#').length;
                var groupMemebersPhoto = [];
                for (var i = 0; i < membersCount; i++) {
                    var memberAvatarTag = <img src={data.toChatGroup.avatar.split('#')[i] + '?' + SMALL_IMG}></img>;
                    groupMemebersPhoto.push(memberAvatarTag);
                    if (i >= 3) {
                        break;
                    }
                }
                var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                switch (groupMemebersPhoto.length) {
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
                var groupJson = {label: groupNameTag, value: chatGroupId + '%'};
                userMessageData.push(groupJson);
            }

        });
        this.setState({"userMessageData": []});   //先setStatet空可以让render强刷
        this.setState({"userMessageData": userMessageData});
    },


    /**
     * 修改文件夹名称的文本框内容改变响应函数
     */
    nowThinkingInputChange(e) {

        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var nowThinking = target.value;
        // if (isEmpty(nowThinking)) {
        //     nowThinking = "这是一个云盘分享的文件";
        // }
        cloudTable.setState({"nowThinking": nowThinking});
    },

    /**
     * 显示分享文件的窗口
     */
    showShareModal(fileObject) {
        this.props.showShareFromCloud(fileObject)
        // return
        // cloudTable.setState({"shareCloudFileIds": fileObject.id, "shareCloudFile": fileObject});
        // cloudTable.getAntGroup();
        // this.getStructureUsers();
        // this.getRecentContents();
        // cloudTable.setState({shareModalVisible: true});
    },

    /**
     * 关闭分享文件的窗口
     */
    shareModalHandleCancel() {
        cloudTable.setState({
            shareModalVisible: false,
            "checkedGroupOptions": [],
            "checkedConcatOptions": [],
            "checkedRecentConnectOptions": [],
        });
    },

    /**
     * 调用分享接口
     */
    getsharekey() {
        var shareFileId = cloudTable.state.shareCloudFile.id;
        var operateUserId = cloudTable.state.shareCloudFile.createUid;
        var param = {
            "method": 'share',
            "operateUserId": operateUserId,
            "cloudFileIds": shareFileId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功") {
                    var response = ret.response;
                    cloudTable.shareFile(response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 分享文件
     */
    shareFile(response) {
        var response = response;
        var _this = this;
        var checkedConcatOptions = cloudTable.state.checkedConcatOptions;
        var checkedGroupOptions = cloudTable.state.checkedGroupOptions;
        var checkedsSructureOptions = cloudTable.state.checkedsSructureOptions;
        var checkedRecentConnectOptions = this.state.checkedRecentConnectOptions;  //最近联系人id 既包括群组(%结尾)又有个人数组
        var nowThinking = cloudTable.state.nowThinking;
        var shareFile = cloudTable.state.shareCloudFile;

        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var createTime = (new Date()).valueOf();
        var cover = "http://png.findicons.com/files/icons/2083/go_green_web/64/link.png";
        var suffix = shareFile.suffix;//后缀名
        var name = shareFile.name;  //对应title
        var creator = shareFile.creator;
        var messageToPer = 1;//根据接收者是群组还是个人来决定
        var messageToGrp = 4;

        if (typeof(nowThinking) == 'undefined') {
            nowThinking = '这是一个蚁盘分享的文件'
        }

        if (isEmpty(checkedConcatOptions) == true && isEmpty(checkedGroupOptions) == true && isEmpty(checkedsSructureOptions) == true && isEmpty(checkedRecentConnectOptions) == true) {
            message.error('请选择转发好友或群组');
            return false
        }

        /*远程调试*/
        //var filePath = "http://" + 'www.maaee.com' + ":" + 80 + "/Excoord_PhoneService" + "/cloudFile/shareShow/" + response;

        var filePath = "http://jiaoxue.maaee.com:8091/#/fileShareLink?shareId=" + response + "&userId=" + sessionStorage.getItem("ident");

        var attachement = {
            "address": filePath,
            "user": creator,
            "createTime": shareFile.createTime,
            "cover": cover,
            "content": name,
            "type": TO_TYPE
        };

        if (isEmpty(checkedRecentConnectOptions) == false) {
            checkedRecentConnectOptions.forEach(function (e) {
                var mes = e + '';
                if (mes.indexOf('%') == -1) {
                    //个人
                    var uuid = createUUID();
                    var messageJson = {
                        'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                        "toId": e, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToPer, "attachment": attachement, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                } else {
                    //群组
                    var toId = e.slice(0, e.length - 1)
                    var uuid = createUUID();
                    var messageJson = {
                        'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                        "toId": toId, "command": "message", "hostId": loginUser.colUid,
                        "uuid": uuid, "toType": messageToGrp, "attachment": attachement, "state": 0
                    };
                    var commandJson = {"command": "message", "data": {"message": messageJson}};
                    ms.send(commandJson);
                }
            });
        }

        if (isEmpty(checkedGroupOptions) == false) {
            checkedGroupOptions.forEach(function (e) {
                var uuid = createUUID();
                var messageJson = {
                    'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                    "toId": e, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToGrp, "attachment": attachement, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            });
        }

        if (isEmpty(checkedConcatOptions) == false) {
            checkedConcatOptions.forEach(function (e) {
                var uuid = createUUID();
                var messageJson = {
                    'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                    "toId": e, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToPer, "attachment": attachement, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            });
        }

        if (isEmpty(checkedsSructureOptions) == false) {
            checkedsSructureOptions.forEach(function (e) {
                var uuid = createUUID();
                var messageJson = {
                    'content': nowThinking, "createTime": createTime, 'fromUser': loginUser,
                    "toId": e, "command": "message", "hostId": loginUser.colUid,
                    "uuid": uuid, "toType": messageToPer, "attachment": attachement, "state": 0
                };
                var commandJson = {"command": "message", "data": {"message": messageJson}};
                ms.send(commandJson);
            });
        }
        cloudTable.setState({shareModalVisible: false, "checkedGroupOptions": [], "checkedConcatOptions": []});
        // cloudTable.setState({"checkedGroupOptions": []});
    },

    buildShareUrl(filePath) {
        if (filePath.indexOf("agent=ExcoordMessenger") == -1) {
            if (filePath.indexOf("?") != -1) {
                filePath = filePath + "&agent=ExcoordMessenger";
            } else {
                filePath = filePath + "?agent=ExcoordMessenger";
            }
        }
        return filePath;
    },

    /**
     * 我的好友复选框被选中时的响应
     * @param checkedValues
     */
    concatOptionsOnChange(checkedValues) {
        cloudTable.setState({"checkedConcatOptions": checkedValues});
    },

    /**
     * 组织架构复选框被选中时的响应
     * @param checkedValues
     */
    roleOptionsOnChange(checkedValues) {
        cloudTable.setState({"checkedsSructureOptions": checkedValues});
    },
    /**
     * 我的好友复选框被选中时的响应x
     * @param checkedValues
     */
    groupOptionsOnChange(checkedValues) {
        cloudTable.setState({"checkedGroupOptions": checkedValues});
    },

    /**
     * 最近联系复选框被选中时的响应x
     * @param checkedValues
     */
    recentConnectOptionsOnChange(checkedValues) {
        this.setState({"checkedRecentConnectOptions": checkedValues});
    },

    collapseChange(key) {
        /*if(key==1){
            cloudTable.getUserChatGroupById(1);
        }*/
        this.getRecentContents();
        cloudTable.getUserChatGroupById(1);
    },

    //添加题目处 关闭modal
    subjectHandleCancel() {
        cloudTable.setState({"subjectModalVisible": false});
    },
    /**
     * 题目上传成功后的回调函数
     */
    courseUploadAntCloud() {
        // var subjectParams = sessionStorage.getItem("ident") + "#" + this.state.currentTeachScheduleId + "#" + 1 + "#" + this.state.currentOptType + "#" + this.state.currentKnowledgeName + "#" + this.state.subjectDataFilter + "#fromUpload";
        // this.refs.subjectUploadComponent.initGetSubjectInfo(subjectParams);
        var _this = this;
        var initPageNo = 1;
        var id = this.state.currentSubjectDirectoryId;
        _this.listCloudSubject(id, initPageNo)
    },

    /**
     * 构建存放了文件夹id和pageNo关系的集合
     * @param directoryId
     * @param pageNo
     */
    buildPageNoMap(directoryId, pageNo) {
        var pageNoMap = this.state.pageNoMap;
        var pageNoIndex = this.getPageNoIndex(directoryId, pageNoMap);
        if (pageNoIndex == -1) {
            var pageNoJson = {};
            pageNoJson.directoryId = directoryId;
            pageNoJson.pageNo = pageNo;
            pageNoMap.push(pageNoJson);
        } else {
            var pageNoJson = pageNoMap[pageNoIndex];
            pageNoJson.pageNo = pageNo;
        }
        this.setState({pageNoMap});
    },

    /**
     * 检查给定的文件夹id在pageNoMap中是否存在,如果存在,则返回所在的index位置,否则返回-1
     * @param directoryId
     * @param pageNoMap
     * @returns {number}
     */
    getPageNoIndex(directoryId, pageNoMap) {
        var pageNoIndex = -1;
        for (var i = 0; i < pageNoMap.length; i++) {
            var pageNoJson = pageNoMap[i];
            if (pageNoJson.directoryId == directoryId) {
                pageNoIndex = i;
                break;
            }
        }
        return pageNoIndex;
    },

    render() {
        const {loading, selectedRowKeys} = cloudTable.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: cloudTable.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        var delBtn;
        var newButton;
        var uploadButton;
        var returnParentToolBar;

        var tipTitle;
        if (cloudTable.state.getFileType == "myFile") {
            tipTitle = "我的文件";
            newButton = <Button value="newDirectory" className="calmBorderRadius antnest_talk"
                                onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
            if (cloudTable.state.activeKey == '2') {
                //上传题目
                if (cloudTable.state.currentSubjectDirectoryId != -1) {
                    uploadButton = <SubjectUploadComponent ref="subjectUploadComponent" activeKey={this.state.activeKey}
                                                           floderId={this.state.currentSubjectDirectoryId}
                                                           courseUploadAntCloud={this.courseUploadAntCloud}></SubjectUploadComponent>
                }
            } else {
                if (cloudTable.state.currentDirectoryId != -1) {
                    uploadButton = <Button 
                                        className="calmBorderRadius"
                                        value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                }
            }
            delBtn =
                <div className="cloud_tool">
                    <Button type="primary" 
                            className="calmBorderRadius"
                            onClick={cloudTable.showdelAllDirectoryConfirmModal}
                                                    disabled={!hasSelected && cloudTable.state.delBtnReadOnly}
                                                    loading={loading}
                >批量删除</Button><span className="password_ts"
                                    style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span>
                </div>;

            var content = <Tabs
                hideAdd
                onChange={cloudTable.onChange}
                animated={false}
                activeKey={cloudTable.state.activeKey}
                defaultActiveKey={cloudTable.state.defaultActiveKey}
                tabBarExtraContent={delBtn}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="我的资源" key="1">
                    <Table className="cloud_box" rowSelection={rowSelection} columns={columns}
                           dataSource={cloudTable.state.tableData} pagination={{
                        total: cloudTable.state.totalCount,
                        pageSize: getPageSize(),
                        current: this.state.currentPage,
                        onChange: cloudTable.pageOnChange
                    }} scroll={{y: 400}}/>
                </TabPane>
                <TabPane tab="我的题目" key="2">
                    <Table className="cloud_box" rowSelection={rowSelection} columns={columns}
                           dataSource={cloudTable.state.tableData} pagination={{
                        total: cloudTable.state.totalCount,
                        pageSize: getPageSize(),
                        current: this.state.currentPage,
                        onChange: cloudTable.pageOnChange
                    }} scroll={{y: 400}}/>
                </TabPane>
            </Tabs>
        } else {
            tipTitle = "群文件";
            if (cloudTable.state.currentDirectoryId != -1) {
                // 非第一级文件夹
                newButton = <Button value="newDirectory" className="calmBorderRadius antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                //使用者只有上传的权限
                uploadButton = <Button 
                                    value="uploadFile" 
                                    className="calmBorderRadius"
                                    onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                /*if(cloudTable.state.currentDirMaxPermission!=3
                 || cloudTable.state.currentDirectoryCreatorId==sessionStorage.getItem("ident")){
                 newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                 uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                 }else{
                 newButton=<Button value="newDirectory"  className="antnest_talk" onClick={cloudTable.showMkdirModal}>新建文件夹</Button>;
                 //使用者只有上传的权限
                 uploadButton=<Button value="uploadFile" onClick={cloudTable.showUploadFileModal}>上传文件</Button>;
                 }*/
                // delBtn = <div className="cloud_tool"><Button type="primary"
                //                                              onClick={cloudTable.showdelAllDirectoryConfirmModal}
                //                                              disabled={!hasSelected} loading={loading}
                // >批量删除</Button><span className="password_ts"
                //                     style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span>
                // </div>;
            }
            var content = <div style={{"height": '100%'}}>
                <Table className="cloud_box" rowSelection={rowSelection} columns={columns}
                       dataSource={this.state.tableData} pagination={false} scroll={{y: 400}}/>
                <Pagination total={this.state.totalCount} pageSize={getPageSize()} current={this.state.currentPage}
                            onChange={this.pageOnChange}/>
            </div>
        }
        if ((cloudTable.state.parentDirectoryId != -1 && cloudTable.state.currentDirectoryId != -1) && (cloudTable.state.parentSubjectDirectoryId != -1 && cloudTable.state.currentSubjectDirectoryId != -1)) {
            returnParentToolBar =
                <div className="ant-tabs-right"><Button onClick={cloudTable.returnParent}><Icon type="left"/></Button>
                </div>;
        }
        var toolbar = <div className="public—til—blue">
            {returnParentToolBar}
            <div className="talk_ant_btn1">
                {newButton}
                {uploadButton}
            </div>
            {tipTitle}
        </div>;
        var returnToolbarInMoveModal = <div className="public—til—blue">
            <div className="ant-tabs-right"><Button onClick={cloudTable.returnParentAtMoveModal}><Icon
                type="left"/></Button></div>
        </div>;
        var returnToolbarInShareModal = <div className="public—til—blue">
            <div className="ant-tabs-right"><Button onClick={cloudTable.getAntGroup}><Icon type="left"/></Button></div>
        </div>;
        var saveToobarBack = <div className="public—til—blue">
            <div className="ant-tabs-right"><Button onClick={cloudTable.saveBarBack}><Icon
                type="left"/></Button></div>
        </div>;
        //根据该状态值，来决定上传进度条是否显示
        var progressState = cloudTable.state.progressState;
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };

        const {selectedRowKeysOfShare} = cloudTable.state;
        const rowSelectionOfShare = {
            selectedRowKeysOfShare,
            onChange: cloudTable.onShareDataSelectChange,
        };

        return (
            <div>
                <Modal title="重命名"
                       width={440}
                       visible={cloudTable.state.reNameModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={cloudTable.reNameModalHandleOk}
                       onCancel={cloudTable.reNameModalHandleCancel}
                       className="schoolgroup_modal"
                >
                    <div className="">
                        <Row className="ant_row">
                            <Col span={6} className="right_look">名称：</Col>
                            <Col span={16} className="framework_m_r">
                                <Input value={cloudTable.state.editDirectoryName}
                                       onChange={cloudTable.directoryNameInputChange}/>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                <Modal title="新建文件夹"
                       width={440}
                       visible={cloudTable.state.mkdirModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={cloudTable.makeDirectory}
                       onCancel={cloudTable.mkdirModalHandleCancel}
                       className="schoolgroup_modal"
                >
                    <div className="">
                        <Row className="ant_row">
                            <Col span={6} className="right_look">名称：</Col>
                            <Col span={16} className="framework_m_r">
                                <Input value={cloudTable.state.editDirectoryName}
                                       onChange={cloudTable.directoryNameInputChange}/>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                {/* <ConfirmModal ref="confirmModal"
                              title="确定要删除选中的文件/文件夹"
                              onConfirmModalCancel={cloudTable.closeConfirmModal}
                              onConfirmModalOK={cloudTable.deleteCloudFiles}
                ></ConfirmModal> */}
                 <Modal 
                    visible={cloudTable.state.confirmModal}
                    title="提示"
                    className="calmModal"
                    maskClosable={false} //设置不允许点击蒙层关闭
                    onCancel={cloudTable.closeConfirmModal}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                             <button type="primary" 
                                    className="calmSure login-form-button examination_btn_blue" 
                                    onClick={cloudTable.deleteCloudFiles} 
                                    >
                            确定</button>
                            <button type="ghost" 
                                    className="calmPre  login-form-button examination_btn_white" 
                                    onClick={cloudTable.closeConfirmModal} >取消</button>
                           
                        </div>
                    ]}
                >
                    <div className="isDel">
                        <img className="sadFeel" src={require("../../../dist/jquery-photo-gallery/icon/sad.png")} />
                        确定要删除选中的文件/文件夹?
                    </div>
                </Modal>

                <Modal
                    visible={cloudTable.state.cloudFileUploadModalVisible}
                    title="上传文件"
                    className="modol_width"
                    maskClosable={false} //设置不允许点击蒙层关闭
                    onCancel={cloudTable.cloudFileUploadModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <div>
                            
                            <Button type="ghost" htmlType="reset" className="login-form-button"
                                    onClick={cloudTable.cloudFileUploadModalHandleCancel}>
                                取消
                            </Button>
                            <Button type="primary" htmlType="submit" className="calmSave login-form-button"
                                    onClick={cloudTable.uploadFile}
                                    disabled={cloudTable.state.disabledFlag}>
                                保存
                            </Button>
                        </div>
                    ]}
                >
                    <Row>
                        <Col span={4}>上传文件：</Col>
                        <Col span={20}>
                            <div>
                                <CloudFileUploadComponents ref="fileUploadCom"
                                                           fatherState={cloudTable.state.cloudFileUploadModalVisible}
                                                           callBackParent={cloudTable.handleFileSubmit}/>
                            </div>
                            <div style={{display: progressState}}>
                                <Progress percent={cloudTable.state.uploadPercent} width={80} strokeWidth={4}/>
                            </div>
                        </Col>

                    </Row>
                </Modal>


                <Modal title="移动文件"
                       visible={cloudTable.state.moveFileModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={cloudTable.moveFileModalHandleCancel}
                       footer={null}
                >
                    <div className="move_file">
                        <Row>
                            <Col span={24}>
                                {returnToolbarInMoveModal}
                                <Table columns={targetDirColumns} showHeader={false}
                                       dataSource={cloudTable.state.targetDirDataArray1}
                                       pagination={{
                                           total: cloudTable.state.totalCountModal,
                                           pageSize: getPageSize(),
                                           current: this.state.currentPageModal,
                                           onChange: cloudTable.pageOnChangeModal
                                       }} scroll={{y: 300}}/>


                                {/* <Table className="cloud_box" rowSelection={rowSelection} columns={columns}
                                       dataSource={cloudTable.state.tableData}
                                       pagination={{
                                            total: cloudTable.state.totalCount,
                                            pageSize: getPageSize(),
                                            current: this.state.currentPage,
                                            onChange: cloudTable.pageOnChange
                                       }} scroll={{y: 400}}/>*/}


                            </Col>
                        </Row>
                    </div>
                </Modal>

                <Modal title="分享文件" className="cloud_share_Modal"
                       visible={cloudTable.state.shareModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={cloudTable.shareModalHandleCancel}
                       onOk={cloudTable.getsharekey}
                >
                    <div>
                        <Row>
                            <Col span={12} className="share_til">选择好友分享文件：</Col>
                            <Col span={12} className="share_til">这一刻的想法：
                                <span className="right_ri cloud_share_prompt">
                                    <Icon type="link" className="info_school_s"/><span>这是一个蚁盘分享的文件</span>
                                </span>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11} className="upexam_float cloud_share_cont">
                                <Collapse bordered={false} defaultActiveKey={['2']}
                                          onChange={cloudTable.collapseChange}>
                                    <Panel header="最近联系人" key="2">
                                        <CheckboxGroup options={this.state.userMessageData}
                                                       value={this.state.checkedRecentConnectOptions}
                                                       onChange={this.recentConnectOptionsOnChange}
                                        />
                                    </Panel>
                                    <Panel header="我的群组" key="1">
                                        <CheckboxGroup options={cloudTable.state.groupOptions}
                                                       value={cloudTable.state.checkedGroupOptions}
                                                       onChange={cloudTable.groupOptionsOnChange}/>
                                    </Panel>
                                    <Panel header="我的好友" key="0">
                                        <CheckboxGroup options={cloudTable.state.concatOptions}
                                                       value={cloudTable.state.checkedConcatOptions}
                                                       onChange={cloudTable.concatOptionsOnChange}/>
                                    </Panel>
                                    <Panel header="组织架构" key="3">
                                        <CheckboxGroup options={cloudTable.state.structureOptions}
                                                       value={cloudTable.state.checkedsSructureOptions}
                                                       onChange={cloudTable.roleOptionsOnChange}/>
                                    </Panel>
                                </Collapse>
                            </Col>
                            <Col span={12} className="topics_dianzan">
                                <div className="cloud_share_cont_ri">
                                    <Input type="textarea" rows={14} placeholder="这是一个蚁盘分享的文件"
                                           value={cloudTable.state.nowThinking}
                                           onChange={cloudTable.nowThinkingInputChange}/>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                {/*保存到我的蚁盘model*/}
                <Modal title="我的文件"
                       visible={cloudTable.state.saveFileModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={cloudTable.saveFileModalHandleCancel}
                       footer={null}
                >
                    <div className="move_file">
                        <Row>
                            <Col span={24}>
                                {saveToobarBack}
                                <Table columns={targetDirColumns} showHeader={false}
                                       dataSource={cloudTable.state.targetDirDataArray1}
                                       pagination={{
                                           total: cloudTable.state.totalCountForCopyModal,
                                           pageSize: getPageSize(),
                                           current: this.state.currentPageForCopyModal,
                                           onChange: cloudTable.pageOnChangeForCopyModal
                                       }}

                                       scroll={{y: 300}}/>
                            </Col>
                        </Row>
                    </div>
                </Modal>
                {toolbar}
                <div className="favorite_scroll">
                    {content}
                </div>
                }
                <ul>
                    <li className="imgLi">
                        {this.state.imgArr}
                    </li>
                </ul>
            </div>

        );
    },
});

export default AntCloudTableComponents;