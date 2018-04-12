/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Button, Row, Col, message, Table, Popover, Radio, Icon} from 'antd';
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
 * 从备课计划选择课件的modal
 */
//是否给出无更多数据的提示
var isTipNoDataMessage = true;

class SelectScheduleMaterialsModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            dataSourceValue: 1,  //默认为从备课计划中选择
        };
        this.SelectScheduleMaterialsModalHandleCancel = this.SelectScheduleMaterialsModalHandleCancel.bind(this);
        this.loadMoreScheduleFlile = this.loadMoreScheduleFlile.bind(this);
        this.getScheduleList = this.getScheduleList.bind(this);
        this.onScheduleSelectChange = this.onScheduleSelectChange.bind(this);
        this.getMaterialsBySheduleId = this.getMaterialsBySheduleId.bind(this);
        this.buildMaterialsFileLogo = this.buildMaterialsFileLogo.bind(this);
        this.selectMaterials = this.selectMaterials.bind(this);

    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
        this.getScheduleList();
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.setState({isShow});
    }

    /**
     * 关闭从备课计划选择课件的窗口
     * @constructor
     */
    SelectScheduleMaterialsModalHandleCancel() {
        this.setState({"isShow": false});
        this.props.onCancel();
    }

    /**
     * 备课计划下的课件加载更多
     */
    loadMoreScheduleFlile() {
        var newPageNo = parseInt(this.state.currentPage) + 1;
        this.getMaterialsBySheduleId(this.state.currentScheduleId, newPageNo);
    }

    //获取老师名下的备课计划
    getScheduleList() {
        var _this = this;
        scheduleData.splice(0);
        var param = {
            "method": 'getTeachScheduleByIdent',
            "ident": _this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                ret.response.forEach(function (e) {
                    var scheduleArray = e.split("#");
                    var scheduleId = scheduleArray[0];
                    var courseName = scheduleArray[1];
                    scheduleData.push({
                        key: scheduleId,
                        scheduleName: courseName,
                        scheduleOpt: '',
                    });
                });
                _this.setState({scheduleCount: scheduleData.length});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 本地课堂中，左侧备课计划选项改变的响应函数
     * @param selectedRowKeys
     */
    onScheduleSelectChange(selectedRowKeys) {
        var scheduleId = selectedRowKeys.key;
        materialsData = [];
        //切换备课计划时，不提示无更多数据
        isTipNoDataMessage = false;
        this.getMaterialsBySheduleId(scheduleId, 1);
        this.setState({currentScheduleId: scheduleId});
    }

    //本地课堂中，点击左侧备课计划时，根据备课计划获取对应的资源文件
    getMaterialsBySheduleId(ScheduleId, pageNo) {
        var _this = this;
        var param = {
            "method": 'getMaterialsBySheduleId',
            "scheduleId": ScheduleId,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                let courseWareList = [];
                _this.activeKey = [];
                courseWareList.splice(0);
                var response = ret.response;
                if (isEmpty(response) == false && response.length > 0) {
                    isTipNoDataMessage = true;
                    response.forEach(function (e) {
                        var name = e.name;
                        var fileLog = _this.buildMaterialsFileLogo(name);
                        var lastPointIndex = e.path.lastIndexOf(".");
                        //通过截取文件后缀名的形式，完成对上传文件类型的判断
                        var noomPath = e.path.substring(lastPointIndex + 1);
                        var htmlPath;
                        if (noomPath == 'ppt' || noomPath == 'pptx') {
                            htmlPath = e.htmlPath
                        } else if (noomPath == "pdf") {
                            htmlPath = e.pdfPath
                        }
                        materialsData.push({
                            key: e.id,
                            fileName: fileLog,
                            htmlPath: htmlPath,
                            materialsObj: e
                        });

                    });
                    _this.setState({currentPage: pageNo});
                } else {
                    if (isTipNoDataMessage == true) {
                        message.error("无更多数据");
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    }

    /**
     * 从备课计划列表中，选中一个文件
     */
    selectMaterials(record, index, event) {
        var _this = this;
        console.log(record);
        var fileObj = record.materialsObj;
        var fileName = fileObj.name;
        var materialId = fileObj.id;
        var lastPointIndex = fileName.lastIndexOf(".");
        //通过截取文件后缀名的形式，完成对上传文件类型的判断
        var fileType = fileName.substring(lastPointIndex + 1);
        if (isEmpty(record.htmlPath)) {
            message.error("暂不支持打开该文件");
            return;
        }
        if (fileType == "ppt" || fileType == "pptx") {
            this.props.useMaterialInClass(materialId);
            //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
            this.props.pushMaterialsToClass(record.htmlPath);
        }
        else if (fileType == "pdf") {
            //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
            this.props.useMaterialInClass(materialId);
            this.props.pushMaterialsToClass(fileObj.pdfPath);
        }
        this.SelectScheduleMaterialsModalHandleCancel();

    }


    /**
     * 生成备课计划资源文件列表时，根据文件类型，构建不同的图标显示
     */
    buildMaterialsFileLogo(name) {
        var fileLogo;
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
            {fileTypeLog}<span className="classroom_file_50">{name}</span>
        </div>;
        return fileLogo;
    }

    render() {

        return (
            <Modal className="modal_classroom modal_classroom_push" visible={this.state.isShow}
                   onCancel={this.SelectScheduleMaterialsModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   title="推送课件"
                   width={750}
                   maskClosable={false} //设置不允许点击蒙层关闭
                   closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                   footer={null}
            >
                <Row className="modal_flex">
                    <Col className="ant-form modal_classroom_push_left">
                        <Table className="lesson classroom_prepare_lessons"
                               onRowClick={this.onScheduleSelectChange}
                               columns={scheduleColumns} dataSource={scheduleData}
                               pagination={false}
                               scroll={{y: 300, x: 'hidden'}}/>
                    </Col>
                    <Col className="col17_le 17_hei ant-form modal_flex_1">
                        <div className="17_hei1">
                            <Table className="modal_classroom_push_right" columns={materialsColumns}
                                   dataSource={materialsData}
                                   showHeader={false}
                                   onRowClick={this.selectMaterials}
                                   pagination={false} scroll={{y: 300}}/>
                            <div className="schoolgroup_operate schoolgroup_more more_classroom">
                                <a onClick={this.loadMoreScheduleFlile} className="schoolgroup_more_a">加载更多</a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectScheduleMaterialsModal;
