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
 * 从备课计划选择课件的modal
 */
class SelectScheduleMaterialsModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            dataSourceValue:1,  //默认为从备课计划中选择
        };
        this.SelectScheduleMaterialsModalHandleCancel = this.SelectScheduleMaterialsModalHandleCancel.bind(this);
        this.pageOnChange = this.pageOnChange.bind(this);
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

    SelectScheduleMaterialsModalHandleCancel() {
        this.setState({"isShow": false});
        this.props.onCancel();
    }

    /**
     * 题目分页页码改变的响应函数
     * @param pageNo
     */
    pageOnChange(pageNo){
        this.getMaterialsBySheduleId(this.state.currentScheduleId, pageNo);
        this.setState({
            currentPage: pageNo,
        });
    }

    //获取老师名下的备课计划
    getScheduleList(){
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

    onScheduleSelectChange(selectedRowKeys) {
        var scheduleId = selectedRowKeys.key;
        materialsData = [];
        this.getMaterialsBySheduleId(scheduleId, 1);
        this.setState({currentScheduleId: scheduleId});
    }

    //点击左侧备课计划时，根据备课计划获取对应的资源文件
    getMaterialsBySheduleId (ScheduleId, pageNo) {
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
                response.forEach(function (e) {
                    var name = e.name;
                    var fileLog = _this.buildMaterialsFileLogo(name);
                    materialsData.push({
                        key: e.id,
                        fileName: fileLog,
                        htmlPath: e.htmlPath,
                        materialsObj:e
                    });
                    var pager = ret.pager;
                    _this.setState({totalMaterialsCount: parseInt(pager.rsCount)});
                });
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
        console.log(record);
        if(isEmpty(record.htmlPath)){
            message.error("暂不支持打开该文件");
            return;
        }else{
            //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
            this.props.pushMaterialsToClass(record);
            this.SelectScheduleMaterialsModalHandleCancel();
        }
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
        fileLogo = <span className="cloud_text">
                {fileTypeLog}{name}
            </span>;
        return fileLogo;
    }

    render() {
        // title="选择课件"
        return (
            <Modal className="choose_class" visible={this.state.isShow}
                   onCancel={this.SelectScheduleMaterialsModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   maskClosable={false} //设置不允许点击蒙层关闭
                   closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                   footer={null}
            >
                <Row style={{height: 400}} className="yinyong3">
                    <Col span={7} className="ant-form"><Table size="small" className="lesson"
                                                              onRowClick={this.onScheduleSelectChange}
                                                              columns={scheduleColumns} dataSource={scheduleData}
                                                              pagination={false}
                                                              scroll={{y: 300}}/></Col>
                    <Col span={17} className="col17_le 17_hei ant-form">
                        <div className="17_hei1">
                            <Table className="17_hei2" columns={materialsColumns}
                                   dataSource={materialsData}
                                   showHeader={false}
                                   onRowClick={this.selectMaterials}
                                   pagination={{
                                       total: this.state.totalMaterialsCount,
                                       pageSize: getPageSize(),
                                       onChange: this.pageOnChange
                                   }} scroll={{y: 300}}/>
                        </div>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectScheduleMaterialsModal;
