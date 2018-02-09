/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Button, Row, Col, message,Table,Popover,Radio} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import {getPageSize} from '../../utils/Const';
const RadioGroup = Radio.Group;

var scheduleData = [];
var subjectData = [];
var subjectColumns = [{
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

/**
 * 从备课计划选题的modal
 */
class SelectMaterialsModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            dataSourceValue:'1',
            selectedSubjectKeys:[], //选中的题目
        };
        this.selectMaterialsModalHandleCancel = this.selectMaterialsModalHandleCancel.bind(this);
        this.initPage = this.initPage.bind(this);
        this.pageOnChange = this.pageOnChange.bind(this);
        this.getScheduleList = this.getScheduleList.bind(this);
        this.onScheduleSelectChange = this.onScheduleSelectChange.bind(this);
        this.getMaterialsBySheduleId = this.getMaterialsBySheduleId.bind(this);
        this.dataSourceOnChange = this.dataSourceOnChange.bind(this);
        this.selectMaterials = this.selectMaterials.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
        this.initPage();
        this.getScheduleList();
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.initPage();
        this.setState({isShow});
    }

    selectMaterialsModalHandleCancel() {
        this.initPage();
        this.setState({"isShow": false});
        this.props.onCancel();
    }

    /**
     * 初始化页面元素
     */
    initPage() {
        this.setState({selectedSubjectKeys:[]});
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
        subjectData = [];
        this.getMaterialsBySheduleId(scheduleId, 1);
        this.setState({currentScheduleId: scheduleId});
    }

    //根据备课计划获取资源列表
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
                    subjectData.push({
                        key: e.id,
                        fileName: e.name,
                        htmlPath: e.htmlPath,
                        materialsObj:e
                    });
                    var pager = ret.pager;
                    _this.setState({totalSubjectCount: parseInt(pager.rsCount)});
                });
            },
            onError: function (error) {
                message.error(error);
            }

        });
    }

    /**
     * 从题目列表中，选中一个题目
     */
    selectMaterials(record, index, event) {
        console.log(record);
        //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
        this.props.pushMaterialsToClass(record);
        this.selectMaterialsModalHandleCancel();
    }

    dataSourceOnChange(e){
        console.log('radio checked', e.target.value);
        this.setState({
            dataSourceValue: e.target.value,
        });
    }

    render() {
        return (
            <Modal title="选择题目" className="choose_class" visible={this.state.isShow}
                   onCancel={this.selectMaterialsModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   maskClosable={false} //设置不允许点击蒙层关闭
                   footer={null}
            >
                <Row>
                    <RadioGroup onChange={this.dataSourceOnChange} value={this.state.dataSourceValue}>
                        <Radio value={1}>备课计划</Radio>
                        <Radio value={2}>蚁盘</Radio>
                    </RadioGroup>
                </Row>
                <Row style={{height: 400}}>
                    <Col span={7} className="ant-form"><Table size="small" className="lesson"
                                                              onRowClick={this.onScheduleSelectChange}
                                                              columns={scheduleColumns} dataSource={scheduleData}
                                                              pagination={false}
                                                              scroll={{y: 300}}/></Col>
                    <Col span={17} className="col17_le 17_hei ant-form">
                        <div className="17_hei1">
                            <Table className="17_hei2" columns={subjectColumns}
                                   dataSource={subjectData}
                                   onRowClick={this.selectMaterials}
                                   pagination={{
                                total: this.state.totalSubjectCount,
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

export default SelectMaterialsModal;
