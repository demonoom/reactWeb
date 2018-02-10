/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Button, Row, Col, message,Table,Popover,Radio,Icon} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import {getPageSize} from '../../utils/Const';
const RadioGroup = Radio.Group;

var scheduleData = [];
var materialsData = [];
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
}, {
    title: '操作',
    className: 'ant-table-selection-user schoolgroup_operate',
    dataIndex: 'moveDirOpt',
}
];

/**
 * 从备课计划选题的modal
 */
class SelectAntCloudMaterialsModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false
        };
        this.SelectAntCloudMaterialsModalHandleCancel = this.SelectAntCloudMaterialsModalHandleCancel.bind(this);
        this.buildTargetDirData = this.buildTargetDirData.bind(this);
        this.getUserRootCloudFiles = this.getUserRootCloudFiles.bind(this);
        this.antCloudFileTablePageOnChange = this.antCloudFileTablePageOnChange.bind(this);
        this.getAntCountFileList = this.getAntCountFileList.bind(this);
        this.buildFileLogo = this.buildFileLogo.bind(this);
        this.intoDirectoryInner = this.intoDirectoryInner.bind(this);
        this.listFiles = this.listFiles.bind(this);
        this.returnParentAtMoveModal = this.returnParentAtMoveModal.bind(this);
        this.pushFileFromAntCloud = this.pushFileFromAntCloud.bind(this);
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
    }

    SelectAntCloudMaterialsModalHandleCancel() {
        this.setState({"isShow": false});
        this.props.onCancel();
    }

    getAntCountFileList(){
        var initPageNo = 1;
        this.getUserRootCloudFiles(this.state.loginUser.colUid, initPageNo);
        this.setState({parentDirectoryId: -1, antCloudFileCurrentPage: 1});
    }

    /**
     * 课件表格分页
     * 需要注意该表格承载了不同的数据，需要根据情况进行分页
     * @param pageNo
     */
    antCloudFileTablePageOnChange(pageNo) {
        this.getUserRootCloudFiles(this.state.loginUser.colUid, pageNo);
        this.setState({
            antCloudFileCurrentPage: pageNo,
        });
    }

    //点击导航时，进入的我的文件列表
    getUserRootCloudFiles (userId, pageNo) {
        var _this = this;
        _this.setState({currentDirectoryId: -1, totalCount: 0});
        var param = {
            "method": 'getUserRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    _this.buildTargetDirData(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 点击蚁盘文件夹时，进入下一级目录
     * @param ret
     */
    buildTargetDirData(ret) {
        var _this = this;
        var targetDirDataArray = [];
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

                var dirName = <span className="font_gray_666">
                                {fileLogo}
                              </span>;
                var moveDirOpt;
                var lastPointIndex = name.lastIndexOf(".");
                //通过截取文件后缀名的形式，完成对上传文件类型的判断
                var fileType = name.substring(lastPointIndex + 1);
                if (directory == false) {
                    dirName = name;
                    if(fileType=="ppt" || fileType == "pptx"){
                        moveDirOpt = <div>
                            <Button onClick={_this.pushFileFromAntCloud.bind(_this,e)}>确定</Button>
                        </div>;
                    }
                }
                var dataJson = {
                    key: key,
                    dirName: dirName,
                    fileObj:e
                    //moveDirOpt: moveDirOpt
                };
                targetDirDataArray.push(dataJson);
            })
            _this.setState({"targetDirDataArray": targetDirDataArray});
        }
    }

    /**
     * 根据文件类型，构建不同的图标显示
     */
    buildFileLogo(name, directory, e) {
        var _this = this;
        var fileLogo;
        if (directory) {
            fileLogo = <span className="cloud_text">
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc"
                      onClick={_this.intoDirectoryInner.bind(_this, e, "mainTable")}>{name}</span>
            </span>;
        } else {
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
            </span>;
        }
        return fileLogo;
    }

    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj, optSrc) {
        var _this = this;
        var initPageNo = 1;
        var queryConditionJson = "";
        if (isEmpty(optSrc) == false && optSrc == "mainTable") {
            _this.setState({
                "parentDirectoryId": directoryObj.parentId,
                "currentDirectoryId": directoryObj.id,
                "currentDirectoryCreatorId": directoryObj.creator.colUid
            });
        } else {
            _this.setState({
                "parentDirectoryIdAtMoveModal": directoryObj.parentId,
                "currentDirectoryIdAtMoveModal": directoryObj.id
            });
        }
        _this.listFiles(_this.state.loginUser.colUid, directoryObj.id, queryConditionJson, initPageNo, optSrc);
    }

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles(operateUserId, cloudFileId, queryConditionJson, pageNo, optSrc) {
        var _this = this;
        _this.setState({totalCount: 0});
        if (isEmpty(optSrc) == false && optSrc == "mainTable") {
            _this.setState({"currentDirectoryId": cloudFileId});
        } else {
            _this.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
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
                    _this.buildTargetDirData(ret);
                } else {
                    var parentDirectoryId = e.parent.parentId;
                    _this.setState({"parentDirectoryId": parentDirectoryId});
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
        if (_this.state.parentDirectoryIdAtMoveModal == 0) {
            _this.setState({"parentDirectoryIdAtMoveModal": -1, "currentDirectoryIdAtMoveModal": -1});
            _this.getUserRootCloudFiles(_this.state.loginUser.colUid, initPageNo, "moveDirModal");
        } else {
            var queryConditionJson = "";
            _this.listFiles(_this.state.loginUser.colUid,
                _this.state.parentDirectoryIdAtMoveModal, queryConditionJson, initPageNo, "moveDirModal");
        }
    }

    /**
     * 将选中的蚁盘文件，通过回调的形式，推送到课堂
     * @param file
     */
    pushFileFromAntCloud(fileOrDirectory){
        var _this = this;
        console.log(fileOrDirectory);
        var fileObj = fileOrDirectory.fileObj;
        var fileName = fileObj.name;
        var isDirectory = fileObj.directory;
        if(isDirectory==true){
            this.intoDirectoryInner(fileObj, "moveDirModal");
        }else{
            var lastPointIndex = fileName.lastIndexOf(".");
            //通过截取文件后缀名的形式，完成对上传文件类型的判断
            var fileType = fileName.substring(lastPointIndex + 1);
            if(fileType=="ppt" || fileType == "pptx"){
                //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
                this.props.pushMaterialsToClass(fileObj);
                this.SelectAntCloudMaterialsModalHandleCancel();
            }else{
                message.error("暂不支持打开该文件");
                return;
            }
        }
    }


    render() {

        //title="选择课件"
        return (
            <Modal className="choose_class" visible={this.state.isShow}
                   onCancel={this.SelectAntCloudMaterialsModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   maskClosable={false} //设置不允许点击蒙层关闭
                   footer={null}
                   closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
            >
                <Row style={{height: 400}} className="yinyong3">
                    <Col span={24} className="17_hei ant-form">
                        <Row>
                            <Col span={24} style={{height:'354'}}>
                                <div className="public—til—blue">
                                    <div className="ant-tabs-right"><Button onClick={this.returnParentAtMoveModal}><Icon
                                        type="left"/></Button></div>
                                </div>
                                <Table columns={targetDirColumns} showHeader={false}
                                       dataSource={this.state.targetDirDataArray}
                                       onRowClick={this.pushFileFromAntCloud}
                                       pagination={{
                                           total: this.state.totalCount,
                                           pageSize: getPageSize(),
                                           onChange: this.antCloudFileTablePageOnChange
                                       }} scroll={{y: 300}}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectAntCloudMaterialsModal;
