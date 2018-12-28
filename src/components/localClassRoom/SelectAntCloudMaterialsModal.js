/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Button, Row, Col, message, Table, Popover, Radio, Icon, Tabs} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty, showLargeImg} from '../../utils/utils';
import {
    getPageSize,
    MIDDLE_IMG,
    SMALL_IMG,
    ANT_CLOUD_FILTER_OPTION,
    ANT_CLOUD_FILTER_OPTION_IMG
} from '../../utils/Const';

const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

var scheduleData = [];
var materialsData = [];
var selectArr = [];
var filterImgData = [];
var selectedImgAtChosenModal = [];
var materialsColumns = [{
    title: '文件',
    className: 'ant-table-selection-cont2',
    dataIndex: 'fileName'
}, {
    title: '操作',
    className: 'ant-table-selection-user schoolgroup_operate',
    dataIndex: 'fileOpt',
}
];

var scheduleColumns = [{
    title: '备课计划',
    dataIndex: 'scheduleName',

},
];

var targetDirColumns = [{
    title: '文件夹名称',
    dataIndex: 'dirName',
},
];

var targetDirDataArray = [];

/**
 * 从蚁盘选择课件的modal
 */


class SelectAntCloudMaterialsModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            chosenImgModalVisible: false,
            currentDirectoryIdAtMoveModal: -1,
            filterImgData: [],
            pageNo: 1,
            defaultArr: [],
            cloudImgDirectoryParentId: -1,  //蚁盘图片的文件夹的父id
            parentDirectoryIdAtMoveModal: -1,  //蚁盘文件的文件夹的父id
            cloudTasKey: "cloudFile",
            selectNum: [],  //选中后显示的下标
            selectArr: [],  //选中的数组
            selectCount: 0,//选中的数目
            chosenImgArr: [], //已选图片在modal里的集合
            fileInto: false,
            antCloudImgCurrentPage: 1,   //蚁盘图片的当前页码
            currentDirectoryIdAtImgModal: -1, //蚁盘图片的当前文件夹id
            showIconBtn: false, //回退按钮
        };
        this.SelectAntCloudMaterialsModalHandleCancel = this.SelectAntCloudMaterialsModalHandleCancel.bind(this);
        this.buildTargetDirData = this.buildTargetDirData.bind(this);
        this.buildTargetDirImgData = this.buildTargetDirImgData.bind(this);
        this.getUserRootCloudFiles = this.getUserRootCloudFiles.bind(this);
        this.loadMoreAntCloudFlile = this.loadMoreAntCloudFlile.bind(this);
        this.loadMoreAntCloudFlileImg = this.loadMoreAntCloudFlileImg.bind(this); //加载更多过滤图片
        this.getAntCountFileList = this.getAntCountFileList.bind(this);
        this.buildFileLogo = this.buildFileLogo.bind(this);
        this.buildFilterFileLogo = this.buildFilterFileLogo.bind(this);
        this.intoDirectoryInner = this.intoDirectoryInner.bind(this);
        this.listFiles = this.listFiles.bind(this);
        this.returnParentAtMoveModal = this.returnParentAtMoveModal.bind(this);
        this.pushFileFromAntCloud = this.pushFileFromAntCloud.bind(this);
        this.filterCloudFile = this.filterCloudFile.bind(this);
        this.sendFilterCloudFile = this.sendFilterCloudFile.bind(this);
        this.chooseSetectBox = this.chooseSetectBox.bind(this);
        this.checkboxClicked = this.checkboxClicked.bind(this);
        this.filterIntoDirectoryInnerFile = this.filterIntoDirectoryInnerFile.bind(this);
        this.cloudTabsChange = this.cloudTabsChange.bind(this);
        this.chosenImgModal = this.chosenImgModal.bind(this);
        this.closeChosenHandleCancel = this.closeChosenHandleCancel.bind(this);
        this.getDirectoryCount = this.getDirectoryCount.bind(this);
        this.getSelectImgIndex = this.getSelectImgIndex.bind(this);
        this.deleteChosenImg = this.deleteChosenImg.bind(this);
        this.okFilterCloudFile = this.okFilterCloudFile.bind(this);
        this.deleteCheckboxClicked = this.deleteCheckboxClicked.bind(this);
        this.rebuildChosenImgArr = this.rebuildChosenImgArr.bind(this);
        this.checkCurrentIsExitAtFilterImgData = this.checkCurrentIsExitAtFilterImgData.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
        this.getAntCountFileList();
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.setState({isShow});
        targetDirDataArray.splice(0);
        selectArr.splice(0);
        selectedImgAtChosenModal.splice(0);
        this.getAntCountFileList();
        var initCloudImgDirectoryParentId = -1;
        var initPageNo = 1;
        this.filterCloudFile(initCloudImgDirectoryParentId, initPageNo);
    }

    /**
     * 本地课堂中，关闭从蚁盘选择课件的窗口
     * @constructor
     */
    SelectAntCloudMaterialsModalHandleCancel() {
        filterImgData.splice(0);
        this.setState({
            "isShow": false,
            selectNum: [],
            selectArr: [],
            selectCount: 0,
            defaultArr: [],
            cloudTasKey: 'cloudFile',
            currentDirectoryIdAtMoveModal: -1
        });
        this.props.onCancel();

    }

    /**
     * 获取用户的蚁盘根文件夹
     */
    getAntCountFileList() {
        var initPageNo = 1;
        this.getUserRootCloudFiles(-1, initPageNo);
        this.setState({parentDirectoryId: -1, antCloudFileCurrentPage: 1});
    }

    /**
     * 蚁盘文件加载更多的回调
     */
    loadMoreAntCloudFlile() {
        var queryConditionJson = "";
        var antCloudFileCurrentPage = parseInt(this.state.antCloudFileCurrentPage) + 1;
        if (this.state.currentDirectoryIdAtMoveModal == -1) {
            this.getUserRootCloudFiles(-1, antCloudFileCurrentPage);
        } else {
            this.listFiles(this.state.loginUser.colUid, this.state.currentDirectoryIdAtMoveModal, queryConditionJson, antCloudFileCurrentPage);
        }
    }

    /**
     * 蚁盘文件过滤图片加载更多的回调
     */
    loadMoreAntCloudFlileImg() {
        var _this = this;
        var queryConditionJson = "";
        var antCloudImgCurrentPage = parseInt(this.state.antCloudImgCurrentPage) + 1;
        if (this.state.currentDirectoryIdAtImgModal == -1) {
            this.filterCloudFile(-1, antCloudImgCurrentPage, 'loadMore');
        } else {
            this.filterCloudFile(this.state.currentDirectoryIdAtImgModal, antCloudImgCurrentPage, 'loadMore');
            // message.error("无更多数据");
        }
    }

    //点击导航时，进入的我的文件列表
    getUserRootCloudFiles(parentId, pageNo) {
        var _this = this;
        _this.setState({currentDirectoryId: -1, totalCount: 0});
        var param = {
            "method": 'filterCloudFile',
            "userId": this.state.loginUser.colUid, //23836
            "parentId": parentId, //1454
            "filterOption": ANT_CLOUD_FILTER_OPTION_IMG,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false && response.length > 0) {
                    _this.buildTargetDirData(ret);
                    _this.setState({
                        antCloudFileCurrentPage: pageNo,
                        showIconBtn: false
                    });
                } else {
                    message.success("无更多数据");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 过滤蚁盘资源文件
     * @param file
     */

    filterCloudFile(parentId, pageNo, keyWord) {
        var _this = this;
        //_this.setState({currentDirectoryId: -1, totalCount: 0});
        this.setState({"currentDirectoryIdAtImgModal": parentId});
        var param = {
            "method": 'filterCloudFile',
            "userId": this.state.loginUser.colUid, //23836
            "parentId": parentId, //1454
            "filterOption": ANT_CLOUD_FILTER_OPTION,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false && response.length > 0) {
                    if (keyWord == 'loadMore') {
                        var loadMoreObj = _this.state.defaultArr;
                        loadMoreObj.response = loadMoreObj.response.concat(ret.response);
                        _this.setState({defaultArr: loadMoreObj, antCloudImgCurrentPage: pageNo});
                        _this.buildTargetDirImgData(loadMoreObj, false);
                    } else {
                        _this.buildTargetDirImgData(ret, false);
                        _this.setState({defaultArr: ret, antCloudImgCurrentPage: pageNo});
                    }
                    // _this.state.defaultArr.push(ret);
                } else {
                    var parentDirectoryId = _this.state.currentDirectory.parentId;
                    _this.setState({"cloudImgDirectoryParentId": parentDirectoryId});
                    message.success("无更多数据");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 过滤图片和文件夹
     * @param ret
     */

    buildTargetDirImgData(ret, noomFlag) {
        var _this = this;
        var directoryCount = _this.getDirectoryCount(ret.response);
        if (isEmpty(ret.response) == false) {

            ret.response.forEach(function (v, i) {
                if (i == 0) {
                    if (v.parent) {
                        var parentDirectoryId = v.parent.parentId;
                        _this.setState({"cloudImgDirectoryParentId": parentDirectoryId});
                    }

                }
                if (v.fileType == 1) {
                    //文件夹
                    var name = v.name;
                    var directory = v.directory;
                    var fileLogo = _this.buildFilterFileLogo(name, directory, v);
                    var fileLogoArr = <li key={v.id}>{fileLogo}</li>
                    _this.checkCurrentIsExitAtFilterImgData(v.id);
                    filterImgData.push(fileLogoArr);
                } else {
                    if (!noomFlag) {
                        //勾选的过程中不再进行push
                        _this.state.selectNum.push(
                            {
                                id: v.id,
                                content: ''
                            }
                        );
                    }
                    var item = _this.state.selectNum.filter(item => {
                        if (item.id == v.id) {
                            return item
                        }
                    });
                    var filterImg = <li key={v.id}>
                        <span className="selectTab_li">
                            <img className="topics_zanImg" onClick={showLargeImg} src={v.path + '?' + MIDDLE_IMG}
                                 alt={v.path}/>
                        </span>
                        <span className={item[0].content == '' ? 'selectBox' : 'selectBox on'} id={v.id}
                              onClick={_this.chooseSetectBox.bind(this, v)}>
                            {/*{_this.state.selectNum[i - directoryCount].content}*/}
                            {item[0].content}
                        </span>
                        <input type='checkbox' checked={item[0].content == '' ? false : true} id={v.id + 'checkbox'}
                               onClick={_this.checkboxClicked.bind(this, v)}/>
                        <div className="check_text focus_3">{v.name}</div>
                    </li>;
                    _this.checkCurrentIsExitAtFilterImgData(v.id);
                    filterImgData.push(filterImg);
                }
            })
        }
        this.setState({filterImgData: filterImgData});
    }

    checkCurrentIsExitAtFilterImgData(vid) {
        var result = false;
        for (var i = 0; i < filterImgData.length; i++) {
            var imgData = filterImgData[i];
            if (imgData.key == vid) {
                filterImgData.splice(i, 1);
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * 获取当前文件夹内的子文件夹的个数
     */
    getDirectoryCount(response) {
        var directoryCount = 0;
        if (isEmpty(response) == false) {
            response.forEach(function (subFileOrDirectory) {
                if (subFileOrDirectory.directory === true) {
                    directoryCount++;
                }
            })
        }
        return directoryCount;
    }

    /**
     * 选中图片的函数
     */
    chooseSetectBox(selectData, e) {
        var id = selectData.id;
        e.target.nextSibling.click();
        console.log(id);
        console.log(this.state.selectNum);

    }

    checkboxClicked(selectData, e) {
        var _this = this;
        var id = selectData.id;
        if (e.target.checked) {
            //选中
            selectArr.push(selectData);
            this.state.selectNum.forEach(function (v, i) {
                /*if (selectData.id == v.id) {
                    v.content = selectArr[i].indexOf(selectData.id) + 1;
                }*/
                var index = _this.getSelectImgIndex(v.id);
                if (index != -1) {
                    v.content = index;
                }
                $("#" + id).addClass('on');
            })
        } else {
            //取消选中
            selectArr.forEach(function (v, i) {
                if (v.id == selectData.id) {
                    selectArr.splice(i, 1);
                }
                $("#" + id).removeClass('on');
            })
            if (selectArr.length == 0) {
                _this.state.selectNum.forEach(function (item, index) {
                    item.content = '';
                })
            } else {
                selectArr.forEach(function (m, j) {
                    _this.state.selectNum.forEach(function (item, index) {
                        if (m.id == item.id) {
                            item.content = j + 1;
                        }
                        if (item.id == selectData.id) {
                            item.content = '';
                        }
                    })
                })
            }
        }
        this.setState({selectCount: selectArr.length})
        this.setState({selectArr: selectArr})
        console.log(this.state.defaultArr);
        this.buildTargetDirImgData(this.state.defaultArr, true);
    }

    /**
     * 获取选中图片的索引位置,存在则+1selectCount
     * @param currentSelectedImgId
     * @returns {number}
     */
    getSelectImgIndex(currentSelectedImgId) {
        var index = -1;
        for (var i = 0; i < selectArr.length; i++) {
            var selectedImg = selectArr[i];
            if (currentSelectedImgId == selectedImg.id) {
                index = i + 1;
                break;
            }
        }
        return index;
    }


    /**
     * 生成蚁盘文件列表时，根据文件类型，构建不同的图标显示
     */
    buildFilterFileLogo(name, directory, v) {
        var _this = this;
        var fileLogo;
        if (directory) {
            fileLogo = <span className="selectTab_li">
                <img className="pc_file" src={require('../images/pc_file.png')} alt=""
                     onClick={_this.filterIntoDirectoryInnerFile.bind(this, v.id, v)}/>
                <div className="check_text focus_3">{name}</div>
            </span>;
        }
        return fileLogo;
    }

    /**
     * 过滤图片进入文件夹内部
     * @param
     */
    filterIntoDirectoryInnerFile(directoryId, directoryObj) {
        var initPageNo = 1;
        console.log(directoryId);
        // this.state.selectNum = [];
        this.state.fileInto = true;
        filterImgData.splice(0);
        this.setState({showIconBtn: true, "currentDirectory": directoryObj});
        this.filterCloudFile(directoryId, initPageNo);

    }


    /**
     * 发送
     * @param
     */

    sendFilterCloudFile() {
        filterImgData.splice(0);
        this.setState({"isShow": false, selectNum: [], selectArr: [], selectCount: 0, defaultArr: []});
        this.props.sendFilterCloudFile(selectArr);
        selectArr.splice(0);
    }

    /**
     * 点击蚁盘文件夹时，进入下一级目录
     * @param ret
     */
    buildTargetDirData(ret) {
        var _this = this;
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            ret.response.forEach(function (e) {
                if (i == 0) {
                    if (e.parent) {
                        var parentDirectoryId = e.parent.parentId;
                        _this.setState({"parentDirectoryIdAtMoveModal": parentDirectoryId});
                    }
                }
                i++;
                var key = e.id;
                var name = e.name;
                var directory = e.directory;
                var fileLogo = _this.buildFileLogo(name, directory, e);
                var dataJson = {
                    key: key,
                    dirName: fileLogo,
                    fileObj: e
                };
                //console.log(dataJson)
                targetDirDataArray.push(dataJson);
            })
            _this.setState({"targetDirDataArray": targetDirDataArray});
        }
    }

    /**
     * 生成蚁盘文件列表时，根据文件类型，构建不同的图标显示
     */
    buildFileLogo(name, directory, e) {
        var _this = this;
        var fileLogo;
        if (directory) {
            fileLogo = <span className="cloud_text" style={{overflow:'hidden'}}>
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc">{name}</span>
            </span>;
        } else {
            var lastPointIndex = name.lastIndexOf(".");
            //通过截取文件后缀名的形式，完成对上传文件类型的判断
            var fileType = name.substring(lastPointIndex + 1);
            var fileType = fileType.toLowerCase();
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
            fileLogo = <div className="classroom_push_td">
                {fileTypeLog}
                <span className="classroom_file_50">{name}</span>
            </div>;
        }
        return fileLogo;
    }

    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj) {
        var _this = this;
        var initPageNo = 1;
        var queryConditionJson = "";
        //进入文件夹前，先清空文件夹内的数据
        targetDirDataArray.splice(0);
        _this.setState({
            "parentDirectoryIdAtMoveModal": directoryObj.parentId,
            "currentDirectoryIdAtMoveModal": directoryObj.id,
            showIconBtn: true
        });
        _this.listFiles(_this.state.loginUser.colUid, directoryObj.id, queryConditionJson, initPageNo);
    }

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles(operateUserId, cloudFileId, queryConditionJson, pageNo) {
        var _this = this;
        _this.setState({totalCount: 0});
        _this.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
        /*var param = {
            "method": 'filterCloudFile',
            "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            "queryConditionJson": queryConditionJson,
            "pageNo": pageNo,
            "filterOption": ANT_CLOUD_FILTER_OPTION_IMG,
        };*/
        var param = {
            "method": 'filterCloudFile',
            "userId": this.state.loginUser.colUid, //23836
            "parentId": cloudFileId, //1454
            "filterOption": ANT_CLOUD_FILTER_OPTION_IMG,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response) == false && response.length > 0) {
                    _this.buildTargetDirData(ret);
                    _this.setState({
                        antCloudFileCurrentPage: pageNo,
                    });
                } else {
                    message.success("无更多数据");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 蚁盘文件夹进入后，通过该函数完成返回
     */
    returnParentAtMoveModal() {
        var _this = this;
        var initPageNo = 1;
        if (_this.state.cloudTasKey == "cloudFile") {
            //蚁盘文件的回退逻辑
            if (_this.state.parentDirectoryIdAtMoveModal != -1) {
                //进入文件夹前，先清空文件夹内的数据
                targetDirDataArray.splice(0);
            }
            if (_this.state.parentDirectoryIdAtMoveModal == 0) {
                _this.setState({"parentDirectoryIdAtMoveModal": -1, "currentDirectoryIdAtMoveModal": -1});
                _this.getUserRootCloudFiles(-1, initPageNo, "moveDirModal");
            } else {
                var queryConditionJson = "";
                _this.listFiles(_this.state.loginUser.colUid,
                    _this.state.parentDirectoryIdAtMoveModal, queryConditionJson, initPageNo);
            }
        } else {
            filterImgData.splice(0);
            //蚁盘图片的回退逻辑
            if (_this.state.cloudImgDirectoryParentId == 0) {
                //回到根目录
                _this.filterCloudFile(-1, initPageNo);
                _this.setState({showIconBtn: false})

            } else {
                //回到上级目录
                _this.filterIntoDirectoryInnerFile(_this.state.cloudImgDirectoryParentId);
            }
        }
    }

    /**
     * 将选中的蚁盘文件，通过回调的形式，推送到课堂
     * @param file
     */
    pushFileFromAntCloud(fileOrDirectory) {
        var fileObj = fileOrDirectory.fileObj;
        var fileName = fileObj.name;
        var isDirectory = fileObj.directory;
        var cid = fileObj.id;
        if (isDirectory == true) {
            this.intoDirectoryInner(fileObj);
        } else {
            var lastPointIndex = fileName.lastIndexOf(".");
            //通过截取文件后缀名的形式，完成对上传文件类型的判断
            var fileType = fileName.substring(lastPointIndex + 1);
            if (fileType == "ppt" || fileType == "pptx") {
                this.props.useCloudFileInClass(cid);
                //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
                this.props.pushMaterialsToClass(fileObj.htmlPath,'',true);
                this.SelectAntCloudMaterialsModalHandleCancel();
            } else if (fileType == "pdf" || fileType == "doc" || fileType == "docx") {
                //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
                this.props.useCloudFileInClass(cid);
                this.props.pushMaterialsToClass(fileObj.pdfPath,'',true);
                this.SelectAntCloudMaterialsModalHandleCancel();
            } else {
                message.error("暂不支持打开该文件");
                return;
            }
        }
    }

    /**
     * 云盘tabs切换的响应函数
     */
    cloudTabsChange(cloudTasKey) {
        var _this = this;
        this.setState({cloudTasKey});
    }


    /**
     * 已选择图片的modal
     */
    chosenImgModal() {
        var _this = this;
        var chosenImgArr = [];
        if (this.state.selectCount === 0) {
            message.error("请选择图片");
        } else {
            selectedImgAtChosenModal.splice(0);
            selectedImgAtChosenModal = selectArr.slice(0);
            if (isEmpty(selectedImgAtChosenModal) == false) {
                selectedImgAtChosenModal.forEach(function (v, i) {
                    var selectImgData = <li>
                    <span className="selectTab_li">
                        <img className="topics_zanImg" src={v.path + '?' + MIDDLE_IMG} alt={v.path}
                             onClick={showLargeImg}/>
                    </span>
                        <div className="check_text focus_3">{v.name}</div>
                        <span className="deleteBox" id={v.id} onClick={_this.deleteChosenImg.bind(_this, v)}></span>
                        <input type='checkbox' onClick={_this.deleteCheckboxClicked.bind(_this, v)}/>
                    </li>;
                    chosenImgArr.push(selectImgData);
                })
            }
            this.setState({chosenImgArr: chosenImgArr});
            this.setState({chosenImgModalVisible: true});
        }

    }

    /**
     * 关闭已选择图片的modal
     */
    closeChosenHandleCancel() {
        this.setState({chosenImgModalVisible: false});
    }

    /**
     * 删除已选择图片
     */
    deleteChosenImg(chosenImg, e) {
        var _this = this;
        // e.target.nextSibling.click();
        for (var i = 0; i < selectedImgAtChosenModal.length; i++) {
            var imgObj = selectedImgAtChosenModal[i];
            if (imgObj.id === chosenImg.id) {
                selectedImgAtChosenModal.splice(i, 1);
            }
        }
        _this.rebuildChosenImgArr();
    }

    deleteCheckboxClicked(chosenImgArr, e) {
        var _this = this;
        if (e.target.checked) {
            _this.state.chosenImgArr.forEach(function (v, i) {
                if (v.id == chosenImgArr.id) {
                    selectArr.splice(i, 1);
                }
            })
        }

    }

    /**
     * 确定已选择图片
     */
    okFilterCloudFile() {
        console.log(selectedImgAtChosenModal);
        console.log(selectArr);
        var _this = this;
        selectArr.forEach(function (selectedImg) {
            var isRemoved = _this.checkSelectedImgIsRemove(selectedImg);
            if (isRemoved === true) {
                _this.rebuildSelectedArray(selectedImg);
            }
        })
        this.setState({chosenImgModalVisible: false});
    }

    checkSelectedImgIsRemove(selectedImg) {
        var isRemove = true;
        for (var i = 0; i < selectedImgAtChosenModal.length; i++) {
            var chosenImg = selectedImgAtChosenModal[i];
            if (chosenImg.id === selectedImg.id) {
                isRemove = false;
                break;
            }
        }
        return isRemove;
    }

    rebuildSelectedArray(selectData) {
        var _this = this;
        var id = selectData.id;
        //取消选中
        selectArr.forEach(function (v, i) {
            if (v.id == selectData.id) {
                selectArr.splice(i, 1);
            }
            $("#" + id).removeClass('on');
        })
        if (selectArr.length == 0) {
            _this.state.selectNum.forEach(function (item, index) {
                item.content = '';
            })
        } else {
            selectArr.forEach(function (m, j) {
                _this.state.selectNum.forEach(function (item, index) {
                    if (m.id == item.id) {
                        item.content = j + 1;
                    }
                    if (item.id == selectData.id) {
                        item.content = '';
                    }
                })
            })
        }
        _this.setState({selectCount: selectArr.length, selectArr: selectArr});
        _this.buildTargetDirImgData(this.state.defaultArr, true);
    }


    /**
     * 重新构建已选页面上的图片内容
     */
    rebuildChosenImgArr() {
        var _this = this;
        var chosenImgArr = [];
        if (isEmpty(selectedImgAtChosenModal) == false) {
            selectedImgAtChosenModal.forEach(function (v, i) {
                var selectImgData = <li>
                    <span className="selectTab_li">
                        <img className="topics_zanImg" src={v.path + '?' + MIDDLE_IMG} alt={v.path}
                             onClick={showLargeImg}/>
                    </span>
                    <div className="check_text focus_3">{v.name}</div>
                    <span className="deleteBox" id={v.id} onClick={_this.deleteChosenImg.bind(_this, v)}></span>
                    <input type='checkbox' onClick={_this.deleteCheckboxClicked.bind(_this, v)}/>
                </li>;
                chosenImgArr.push(selectImgData);
            })
        }
        _this.setState({chosenImgArr: chosenImgArr});
    }
    render() {
        var showIcon =<div className="ant-modal-header_i">
            <Icon type="left" className="ant-modal-header_i"
            onClick={this.returnParentAtMoveModal}/>
        </div>
        return (
            <div>
                <Modal className="select_img_modal"
                       visible={this.state.isShow}
                       onCancel={this.SelectAntCloudMaterialsModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       zIndex='998'
                       height="540px"
                       footer={null}
                       closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）

                >
                    <Row>
                        <Col span={24} className="17_hei ant-form">
                            <Row>
                                <Col span={24}>
                                    {this.state.showIconBtn == true ? showIcon : ''}
                                    {/*<span className="ant-modal-header_font">蚁盘</span>*/}
                                    <Tabs
                                        transitionName="" //禁用Tabs的动画效果
                                        className="selectTab"
                                        onChange={this.cloudTabsChange}
                                        type="card"
                                        animated={false}
                                    >
                                        <TabPane tab="蚁盘文件" key="cloudFile">


                                            <Table columns={targetDirColumns} showHeader={false}
                                                   dataSource={this.state.targetDirDataArray}
                                                   onRowClick={this.pushFileFromAntCloud}
                                                   pagination={false}/>
                                            <div
                                                className="schoolgroup_operate schoolgroup_more more_classroom more_fileimg">
                                                <a onClick={this.loadMoreAntCloudFlile} className="schoolgroup_more_a">加载更多</a>
                                            </div>
                                        </TabPane>

                                        <TabPane tab="蚁盘图片" key="cloudImg">
                                            <ul className="imgLi">
                                                {this.state.filterImgData}
                                            </ul>
                                            <div className="check_img_more ">
                                                <a onClick={this.loadMoreAntCloudFlileImg}
                                                   className="schoolgroup_more_a">加载更多</a>
                                            </div>
                                            <div className="footerButton check_img_footer">
                                                <span className="check_img_btn" onClick={this.chosenImgModal}>已选择：<span
                                                    className="check_img_number">{this.state.selectCount}</span></span>
                                                <Button type="primary" className="check_img_btn2 right_ri"
                                                        onClick={this.sendFilterCloudFile}>使用</Button>
                                            </div>
                                        </TabPane>
                                    </Tabs>

                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Modal>


                <Modal className="select_img_modal"
                       visible={this.state.chosenImgModalVisible}
                       onCancel={this.closeChosenHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       title="已选图片"
                       maskClosable={false} //设置不允许点击蒙层关闭
                       zIndex='998'
                       height="540px"
                       footer={null}
                       closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                >
                    <Icon type="left" className="ant-modal-header_i" onClick={this.closeChosenHandleCancel}/>
                    <span className="ant-modal-header_font">蚁盘</span>
                    <div className="modal_register_main">
                        <ul className="chosenBox imgLi">
                            {this.state.chosenImgArr}
                        </ul>

                        <div className="footerButton check_img_footer2">
                            <Button type="primary" className="check_img_btn2 right_ri" onClick={this.okFilterCloudFile}>确定</Button>
                        </div>
                    </div>
                </Modal>

            </div>
        );
    }

}

export default SelectAntCloudMaterialsModal;
