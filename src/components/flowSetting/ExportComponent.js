import React, {PropTypes} from 'react';
import {
    Tabs, Table, message,Select,Row,Col,Input,DatePicker,Button,Modal,Pagination
} from 'antd';
import {isEmpty} from '../../utils/utils';
import {getPageSize} from '../../utils/Const';
import {doWebService} from '../../WebServiceHelper';
import {FLOW_OPTSOURCE_MANAGER} from '../../utils/Const';
const TabPane = Tabs.TabPane;
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;

const data = [];
for (let i = 0; i < 100; i++) {
    data.push({
        key: i,
        name: `Edrward ${i}`,
        age: 32,
        address: `London Park no. ${i}`,
    });
}
var processColumns = [{
    title: '标题',
    dataIndex: 'processName',
    key: 'processName',
    width: '30%',
}, {
    title: '发起时间',
    dataIndex: 'processStartTime',
    key: 'processStartTime',
    width: '20%',
}, {
    title: '完成时间',
    dataIndex: 'processEndTime',
    key: 'processEndTime',
    width: '20%',
}, {
    title: '历史审批人',
    dataIndex: 'approvalUsers',
    key: 'approvalUsers',
    width: '30%',
}
];

var exportLogColumns  = [{
    title: '导出文件名称',
    dataIndex: 'exportFileName',
    key: 'exportFileName',
    width: '30%',
}, {
    title: '导出人员',
    dataIndex: 'exportUser',
    key: 'exportUser',
    width: '15%',
}, {
    title: '导出时间',
    dataIndex: 'exportTime',
    key: 'exportTime',
    width: '20%',
}, {
    title: '审批名称',
    dataIndex: 'processName',
    key: 'processName',
    width: '25%',
}, {
    title: '操作',
    dataIndex: 'opt',
    key: 'opt',
    width: '10%',
    className:'date_export_btn'
    }
];



const ExportComponent = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            processName:'',
            flowType:'',
            procDefId: '',
            startTimeOfProcessStart: '',
            endTimeOfProcessStart: '',
            startTimeOfProcessEnd: '',
            endTimeOfProcessEnd: '',
            flowStatus: '-1',
            selectedRowKeys: [],
            processList:[]
        };
    },

    componentDidMount() {
        this.getAllFlowGroupBySchoolId();
    },

    componentWillReceiveProps(nextProps) {
    },

    /**
     * 获取流程分组及其分组下的流程列表
     */
    getAllFlowGroupBySchoolId() {
        let _this = this;
        var param = {
            "method": 'getAllFlowGroupBySchoolId',
            "pageNo": "1",
            "schoolId": this.state.loginUser.schoolId + "",
            "optSource": FLOW_OPTSOURCE_MANAGER
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    _this.buildFlowOptionGroup(ret.response);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 创建流程分组的面板
     */
    buildFlowOptionGroup(flowGroupResponse) {
        var optionGroupArray = [];
        //默认选择项
        var flowType = "";
        var groupIndex = 0;
        flowGroupResponse.forEach(function (flowGroup) {
            var flowObjArray = [];
            var processDefinitionList = flowGroup.flowProcessDefinitionList;
            for(var i=0;i<processDefinitionList.length;i++){
                var processDefinition = processDefinitionList[i];
                var procDefId = processDefinition.procDefId;
                var procName = processDefinition.procDefName;
                var processOption =  <Option value={procDefId}>{procName}</Option>;
                flowObjArray.push(processOption);
                if(i==0 && groupIndex == 0){
                    flowType = procDefId;
                }
            }
            var flowGroupName = flowGroup.groupName;
            var optionGroupObj = <OptGroup label={flowGroupName}>
                {flowObjArray}
            </OptGroup>;
            optionGroupArray.push(optionGroupObj);
            groupIndex++;
        });
        this.setState({optionGroupArray,flowType});
    },

    /**
     * 数据导出tabs切换响应
     */
    exportTabsChange(key){
        console.log(key);
        if(key == "exportLog"){
            //查询导出记录
            var initPageNo = "1";
            this.searchExportLog(initPageNo);
        }
    },



    /**
     * 审批类型改变的响应函数
     */
    flowTypeChange(value) {
        this.setState({flowType: value});
    },

    /**
     * 审批运行状态改变响应函数
     * @param value
     */
    flowStatusChange(value) {
        this.setState({flowStatus: value});
    },

    processNameChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var processName = target.value;
        this.setState({processName});
    },

    /**
     * 流程发起日期改变的回调
     * @param date
     * @param dateString
     */
    processStartTimeOnChange(date, dateString) {
        var startTimeOfProcessStart = dateString[0];
        var endTimeOfProcessStart = dateString[1];
        this.setState({startTimeOfProcessStart, endTimeOfProcessStart});
    },

    /**
     * 流程发起日期改变的回调
     * @param date
     * @param dateString
     */
    processEndTimeOnChange(date, dateString) {
        var startTimeOfProcessEnd = dateString[0];
        var endTimeOfProcessEnd = dateString[1];
        this.setState({startTimeOfProcessEnd, endTimeOfProcessEnd});
    },

    searchProcessByPage(){
        var initPageNo = 1;
        this.searchProcess(initPageNo);
    },

    /**
     * 查询按钮点击响应函数
     */
    searchProcess(pageNo){
        //查询
        let _this = this;
        var processList = [];
        var param = {
            "method": 'getHistoricProcessInstanceByCondition',
            "pageNo": pageNo,
            "procDefId": this.state.flowType,
            "startTimeOfProcessStart": this.state.startTimeOfProcessStart,
            "endTimeOfProcessStart": this.state.endTimeOfProcessStart,
            "startTimeOfProcessEnd": this.state.startTimeOfProcessEnd,
            "endTimeOfProcessEnd": this.state.endTimeOfProcessEnd,
            "flowStatus": this.state.flowStatus,
            "userId": this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        response.forEach(function (historicProcess) {
                            processList.push({
                                key: historicProcess.procInsId,
                                processName:historicProcess.procInsName,
                                processStartTime: historicProcess.startTime,
                                processEndTime: historicProcess.endTime,
                                approvalUsers:historicProcess.allApprovalUserName
                            });
                        });
                    }
                    var pager = ret.pager;
                    _this.setState({processList, totalProcessCount: pager.rsCount, selectedRowKeys:[]});//selectedRowKeys设置成[]可以清除默认勾选
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 切换tab页时，获取导出记录的表格数据
     */
    searchExportLog(pageNo){
        //查询
        let _this = this;
        var exportLogList = [];
        var param = {
            "method": 'getAllFlowExportLogByUserId',
            "pageNo": pageNo,
            "userId": this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        response.forEach(function (exportLog) {
                            var downloadButton =
                                <a href={exportLog.exportFileUrl} target="_blank" title="下载" download={exportLog.exportFileUrl} className="te_download_a_noom">
                                    <Button icon="download"/></a>;
                            exportLogList.push({
                                key: exportLog.exportId,
                                exportFileName:exportLog.exportFileName,
                                exportUser: exportLog.user.userName,
                                exportTime: exportLog.exportTime,
                                processName: exportLog.processName,
                                opt:downloadButton
                            });
                        });
                    }
                    var pager = ret.pager;
                    _this.setState({exportLogList, totalExportLogCount: pager.rsCount});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({
            selectedRowKeys,
        });
    },

    /**
     * 执行导出操作，并给出对应的操作提示
     */
    exportTips(){
        this.exportProcessData();
        Modal.success({
            transitionName:"",  //禁用modal的动画效果
            content: '数据准备中，完成导出后我们会将数据保存在“数据导出记录”中，您稍后下载即可。'
        });
    },

    /**
     * 完成选定审批数据的导出操作
     */
    exportProcessData(){
        var _this = this;
        var selectedRowKeys = _this.state.selectedRowKeys;
        var procInsIds = selectedRowKeys.toString();
        var param = {
            "method": 'exportHistoricProcessInstanceToExcel',
            "procInsIds":procInsIds,
            "userId": this.state.loginUser.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg + "===" + ret.response);
                if (ret.msg == "调用成功" && ret.success == true) {

                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 审批列表分页
     */
    processPageOnChange(pageNo){
        this.searchProcess(pageNo);
        this.setState({
            currentPage: pageNo,
        });
    },
    /**
     * 审批导出记录分页
     * @param pageNo
     */
    exportLogPageOnChange(pageNo){
        this.searchExportLog(pageNo);
        this.setState({
            exportLogCurrentPage: pageNo,
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        var _this = this;
        const rowSelection = {
            selectedRowKeys: _this.state.selectedRowKeys,
            onChange: _this.onSelectChange,
        };
        const hasSelected = _this.state.selectedRowKeys.length > 0;
        var processTable = null;
        if(isEmpty(_this.state.processList)==false){
            processTable = <Table rowSelection={rowSelection} columns={processColumns}
                                  pagination={{total: this.state.totalProcessCount, pageSize: getPageSize(), onChange: this.processPageOnChange}}
                                  dataSource={this.state.processList} scroll={{ y: 200 }}
            />;
        }

        return (
                <Tabs defaultActiveKey="dataExport" onChange={this.exportTabsChange} className="data_export">
                    <TabPane tab="数据导出" key="dataExport">
                        <div>
                            <div className="group_cont data_export">
                                <div className="date_export_input">
                                    <Row>
                                        <Col span={3} className="framework_m_l">审批类型：</Col>
                                        <Col span={21}>
                                            <Row className="margin_0_4" style={{width:315}}>
                                                <Col span={12}>
                                                    <Select style={{width: 150}} defaultValue={this.state.flowType} value={this.state.flowType} onChange={this.flowTypeChange}>
                                                        {this.state.optionGroupArray}
                                                    </Select>
                                                </Col>
                                                <Col span={12}>
                                                    <Select defaultValue={_this.state.flowStatus} value={_this.state.flowStatus} style={{width: 150}} onChange={this.flowStatusChange}>
                                                        <Option value="-1">请选择运行状态</Option>
                                                        <Option value="1">全部</Option>
                                                        <Option value="2">已完成</Option>
                                                        <Option value="3">进行中</Option>
                                                    </Select>
                                                </Col>
                                            </Row>
                                        </Col>

                                    </Row>
                                    <Row>
                                        <Col span={3} className="framework_m_l">发起时间：</Col>
                                        <Col span={8} className="margin_0_4">
                                            <RangePicker onChange={this.processStartTimeOnChange} />
                                        </Col>

                                        <Col span={3} className="framework_m_l">完成时间：</Col>
                                        <Col span={8} className="margin_0_4">
                                            <RangePicker onChange={this.processEndTimeOnChange} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={22} justify="end" className="right_look">
                                            <Button onClick={this.searchProcessByPage} className="ant-btn-primary ant-btn antnest_talk">查询</Button>
                                            <Button
                                                type="primary"
                                                onClick={this.exportTips}
                                                disabled={!hasSelected}  className="ant-btn-primary ant-btn">
                                                导出
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="date_export_table">
                                    {/*<Table rowSelection={rowSelection} columns={processColumns}*/}
                                           {/*pagination={{total: this.state.totalProcessCount, pageSize: getPageSize(), onChange: this.processPageOnChange}}*/}
                                           {/*dataSource={this.state.processList} scroll={{ y: 200 }}*/}
                                           {/*/>*/}
                                    {processTable}
                                    {/*<Pagination defaultCurrent={1} pageSize={getPageSize()} total={this.state.totalProcessCount} onChange={this.processPageOnChange} />*/}
                                    {/*<Pagination defaultCurrent={1} pageSize={getPageSize()} total={this.state.totalProcessCount} onChange={this.processPageOnChange} />*/}
                                </div>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="数据导出记录" key="exportLog">
                        <div>
                                <Table columns={exportLogColumns}
                                       pagination={{total: this.state.totalExportLogCount, pageSize: getPageSize(), onChange: this.exportLogPageOnChange}}
                                       dataSource={this.state.exportLogList} scroll={{ y: 300 }}
                                />
                                {/*<Pagination defaultCurrent={1} pageSize="30" total={this.state.totalExportLogCount} onChange={this.exportLogPageOnChange} />*/}
                                {/*pagination={{total: this.state.totalExportLogCount, pageSize: getPageSize(), onChange: this.exportLogPageOnChange}}*/}
                        </div>
                    </TabPane>
                </Tabs>
        );
    },
});

export default ExportComponent;
