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
            currentDirectoryIdAtMoveModal:-1
        };
        this.SelectAntCloudMaterialsModalHandleCancel = this.SelectAntCloudMaterialsModalHandleCancel.bind(this);
        this.buildTargetDirData = this.buildTargetDirData.bind(this);
        this.getUserRootCloudFiles = this.getUserRootCloudFiles.bind(this);
        this.loadMoreAntCloudFlile = this.loadMoreAntCloudFlile.bind(this);
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
     * 蚁盘文件加载更多的回调
     */
    loadMoreAntCloudFlile() {
        var queryConditionJson = "";
        var antCloudFileCurrentPage = parseInt(this.state.antCloudFileCurrentPage) + 1;
        if(this.state.currentDirectoryIdAtMoveModal==-1){
            this.getUserRootCloudFiles(this.state.loginUser.colUid, antCloudFileCurrentPage);
        }else{
            this.listFiles(this.state.loginUser.colUid, this.state.currentDirectoryIdAtMoveModal, queryConditionJson, antCloudFileCurrentPage, "moveDirModal");
        }
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
                if (isEmpty(response)==false && response.length >0) {
                    _this.buildTargetDirData(ret);
                    _this.setState({
                        antCloudFileCurrentPage: pageNo,
                    });
                }else{
                    message.error("无更多数据");
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
                    fileObj:e
                };
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
            fileLogo = <span className="cloud_text">
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc">{name}</span>
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
            fileLogo = <div className="classroom_push_td">
                {fileTypeLog}{name}
            </div>;
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
        //进入文件夹前，先清空文件夹内的数据
        targetDirDataArray.splice(0);
        _this.setState({
            "parentDirectoryIdAtMoveModal": directoryObj.parentId,
            "currentDirectoryIdAtMoveModal": directoryObj.id
        });
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
        _this.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
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
                if (isEmpty(response)==false && response.length>0) {
                    _this.buildTargetDirData(ret);
                    _this.setState({
                        antCloudFileCurrentPage: pageNo,
                    });
                } else {
                    message.error("无更多数据");
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
        if (_this.state.parentDirectoryIdAtMoveModal != -1) {
            //进入文件夹前，先清空文件夹内的数据
            targetDirDataArray.splice(0);
        }
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

        return (
            <Modal className="modal_classroom modal_classroom_push modal_classroom_box" visible={this.state.isShow}
                   onCancel={this.SelectAntCloudMaterialsModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   title="选择课件"
                   maskClosable={false} //设置不允许点击蒙层关闭
                   footer={null}
                   closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
            >
                <Row style={{height: 400}}>
                    <Col span={24} className="17_hei ant-form">
                        <Row>
                            <Col span={24} >
                                    <Icon type="left" className="classroom_left_i" onClick={this.returnParentAtMoveModal} />
                                <Table columns={targetDirColumns} showHeader={false}
                                       dataSource={this.state.targetDirDataArray}
                                       onRowClick={this.pushFileFromAntCloud}
                                       pagination={false} scroll={{y: 300}}/>
                                <div className="schoolgroup_operate schoolgroup_more">
                                    <a onClick={this.loadMoreAntCloudFlile} className="schoolgroup_more_a">加载更多</a>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectAntCloudMaterialsModal;
