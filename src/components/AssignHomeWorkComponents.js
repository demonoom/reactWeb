import React, {PropTypes} from 'react';
import {Modal, Button, message} from 'antd';
import {Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox, Table, Popover} from 'antd';
import {DatePicker} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
const {MonthPicker, RangePicker} = DatePicker;
const FormItem = Form.Item;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;

var assignHomeWork;
var classList = [];
var scheduleData = [];
var knowledgeDate = [];
var subjectData = [];
// var selectedSubjectData = [];
var scheduleColumns = [{
    title: '备课计划',
    dataIndex: 'scheduleName',

},
];

var subjectColumns = [{
    title: '内容',
    className: 'ant-table-selection-cont2',
    dataIndex: 'content'
}, {
    title: '题型',
    className: 'ant-table-selection-topic',
    dataIndex: 'subjectType',
    filters: [{
        text: '单选题',
        value: '单选题',
    }, {
        text: '多选题',
        value: '多选题',
    }, {
        text: '判断题',
        value: '判断题',
    }, {
        text: '简答题',
        value: '简答题',
    }, {
        text: '材料题',
        value: '材料题',
    },],
    onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
},
];

var selectedSubjectColumns = [{
    title: '内容',
    className: 'ant-table-selection-cont2',
    dataIndex: 'content'
}
];

var plainOptions = [];
var defaultCheckedList = [];
var clazzIds = "";
var dateTime = "";
const AssignHomeWorkComponents = React.createClass({

    getInitialState() {
        assignHomeWork = this;
        clazzIds = "";
        dateTime = "";
        assignHomeWork.getTeacherClasses(sessionStorage.getItem("ident"));
        return {
            visible: false,
            optType: 'add',
            editSchuldeId: this.props.editSchuldeId,
            classCount: 0,
            selectedRowKeys: [],
            loading: false,
            scheduleCount: 0,
            checkedList: [],
            indeterminate: true,
            selectedSubjectKeys: [],
            selectedSubjectKeysForTable: [],
            subjectCount: 0,
            subjectModalVisible: false,
            totalSubjectCount: 0,
            currentScheduleId: 0,
            isNewPage: false,
            classList: [],
            selectedSubjectData: [],
            selectedSubjectTableCurrentPage:1,
            selectedSubjectTotalCount:0,
        };
    },

    publishHomeworkSubject(ident, clazzIds, dateTime){
        var sids="";
        for (var i = 0; i < assignHomeWork.state.selectedSubjectData.length; i++) {
            var subjectInfo = assignHomeWork.state.selectedSubjectData[i];
            var subjectKey = subjectInfo.key;
            var subjectKeyArray = subjectKey.split("^");
            var addKey = subjectKeyArray[0];
            if (i != assignHomeWork.state.selectedSubjectData.length-1) {
                sids += addKey + ",";
            } else {
                sids += addKey
            }
        }
        var param = {
            "method": 'publishHomeworkSubject',
            "ident": ident,
            "sids": sids,
            "clazzIds": clazzIds,
            "dateTime": dateTime
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("作业布置成功");
                } else {
                    message.error("作业布置失败");
                }
                assignHomeWork.props.callbackParent();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        var ident = sessionStorage.getItem("ident");
        if (assignHomeWork.isEmpty(dateTime)) {
            message.warning("请选择日期");
        } else if (assignHomeWork.isEmpty(clazzIds)) {
            message.warning("请选择班级");
        } else if (assignHomeWork.state.selectedSubjectData.length==0) {
            message.warning("请选择题目");
        } else {
            assignHomeWork.publishHomeworkSubject(ident, clazzIds, dateTime);
            //保存之后，将已选题目列表清空
            assignHomeWork.setState({"selectedSubjectData":[]});
        }
    },

    isEmpty(content){
        if (content == null || content == "null" || content == "" || typeof(content) == "undefined") {
            return true;
        } else {
            return false;
        }
    },

    handleCancel(e) {
        // 保存之后，将已选题目列表清空
        assignHomeWork.setState({"selectedSubjectData":[]});
        assignHomeWork.props.callbackParent();
    },

    componentDidMount(){
        assignHomeWork.getTeacherClasses(sessionStorage.getItem("ident"));
    },

    //日期控件值改变时，获取当前选择的日期（第一个参数表示的是时间戳，第二个是YYYY-MM-dd格式的日期）
    assignDateOnChange(date, dateString) {
        if (assignHomeWork.isEmpty(date)) {
            dateTime = "";
        }
        dateTime = "" + date;
    },

    getTeacherClasses(ident){
        var param = {
            "method": 'getTeacherClasses',
            "ident": ident,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                classList.splice(0, classList.length);
                response.forEach(function (e) {
                    var classArray = e.split("#");
                    var classId = classArray[0];
                    var className = classArray[1];
                    classList.push({label: className, value: classId})
                });
                assignHomeWork.getScheduleList();
                assignHomeWork.setState({classCount: classList.length});
                assignHomeWork.setState({classList: classList});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    classListOnChange: function (checkedValues) {
        clazzIds = "";
        for (var i = 0; i < checkedValues.length; i++) {
            var checkedValue = checkedValues[i];
            if (i != checkedValues.length - 1) {
                clazzIds += checkedValue + ",";
            } else {
                clazzIds += checkedValue;
            }
        }
    },

    //获取老师名下的备课计划
    getScheduleList(){
        var param = {
            "method": 'getTeachScheduleByIdent',
            "ident": sessionStorage.getItem("ident")
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
                assignHomeWork.setState({scheduleCount: scheduleData.length});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    onScheduleSelectChange(selectedRowKeys) {
        var scheduleId = selectedRowKeys.key;
        subjectData = [];
        assignHomeWork.getSubjectDataBySchedule(sessionStorage.getItem("ident"), scheduleId, 1);
        assignHomeWork.setState({selectedRowKeys});
        assignHomeWork.setState({currentScheduleId: scheduleId});
    },

    //根据备课计划获取题目列表
    getSubjectDataBySchedule: function (ident, ScheduleOrSubjectId, pageNo) {
        var param = {
            "method": 'getClassSubjects',
            "ident": ident,
            "teachScheduleId": ScheduleOrSubjectId,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var key = e.id;
                    var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + e.content + '<hr/><span class="answer_til answer_til_2">答案：</span>' + e.answer + '</div>';
                    var content = <Popover placement="rightTop"
                                           content={<article id='contentHtml' className='content Popover_width'
                                                             dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                        <article id='contentHtml' className='content'
                                 dangerouslySetInnerHTML={{__html: e.content}}></article>
                    </Popover>;
                    var subjectType = e.typeName;
                    subjectData.push({
                        key: key + "^" + e.content + "^" + e.answer,
                        content: content,
                        subjectType: subjectType,
                    });
                    var pager = ret.pager;
                    assignHomeWork.setState({totalSubjectCount: parseInt(pager.rsCount)});
                });
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    //题目表格行被选中时获取被选中项目
    onSubjectTableSelectChange(selectedSubjectKeys) {
        this.setState({selectedSubjectKeys});
    },
    /**
     * 已选题目列表的选中处理函数
     * @param selectedSubjectKeys
     */
    onSelectedSubjectTableSelectChange(selectedSubjectKeys){
        this.setState({"selectedSubjectKeysForTable": selectedSubjectKeys});
    },

    /**
     * 创建已选题目列表的数组数据
     * @param selectedSubjectKeys
     */
    buildSubjectCheckList(selectedSubjectKeys){
        assignHomeWork.state.selectedSubjectData.splice(0);
        selectedSubjectKeys.forEach(function (e) {
            var subjectArray = e.split("^");
            var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + subjectArray[1] + '<hr/><span class="answer_til answer_til_2">答案：</span>' + subjectArray[2] + '</div>';
            var content = <Popover placement="rightTop"
                                   content={<article id='contentHtml' className='content Popover_width'
                                                     dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                <article id='contentHtml' className='content content_2'
                         dangerouslySetInnerHTML={{__html: subjectArray[1]}}></article>
            </Popover>;
            assignHomeWork.state.selectedSubjectData.push({
                key: e,
                content: content,
            });
        });
        assignHomeWork.setState({selectedSubjectTotalCount:assignHomeWork.state.selectedSubjectData.length});
    },

    //移除所有已选择的题目
    removeAllSelectedSubject(){
        if (assignHomeWork.state.selectedSubjectKeysForTable.length == 0) {
            message.warning("请选择题目后，再删除！");
        } else {
            var selectedSubjectData = assignHomeWork.state.selectedSubjectData;
            var selectedSubjectKeys=[];
            for (var i = 0; i < assignHomeWork.state.selectedSubjectKeysForTable.length; i++) {
                var removeInfo = assignHomeWork.state.selectedSubjectKeysForTable[i];
                var removeInfoArray = removeInfo.split("^");
                var removeId = removeInfoArray[0];
                for (var j = 0; j < selectedSubjectData.length; j++) {
                    var subjectInfo = selectedSubjectData[j];
                    var subjectInfoKey = subjectInfo.key;
                    var subjectInfoKeyArray = subjectInfoKey.split("^");
                    if (removeId == subjectInfoKeyArray[0]) {
                        selectedSubjectData.splice(j, 1);
                        break;
                    }
                }
            }
            for (var j = 0; j < selectedSubjectData.length; j++) {
                var subjectInfo = selectedSubjectData[j];
                selectedSubjectKeys.push(subjectInfo.key);
            }
            assignHomeWork.setState({"selectedSubjectData": selectedSubjectData,"selectedSubjectKeys":selectedSubjectKeys,selectedSubjectKeysForTable:[]});
        }
    },

    showSubjectModal() {
        assignHomeWork.setState({
            subjectModalVisible: true,
        });
    },
    /**
     * 选择题目窗口中的确定操作响应函数
     */
    subjectModalHandleOk() {
        assignHomeWork.buildSubjectCheckList(assignHomeWork.state.selectedSubjectKeys);
        assignHomeWork.setState({
            subjectModalVisible: false,
        });
    },
    /**
     * 选择题目窗口中的取消操作响应函数
     */
    subjectModalHandleCancel(e) {
        assignHomeWork.setState({
            subjectModalVisible: false,
        });
    },

    pageOnChange(pageNo) {
        assignHomeWork.getSubjectDataBySchedule(sessionStorage.getItem("ident"), assignHomeWork.state.currentScheduleId, pageNo);
        this.setState({
            currentPage: pageNo,
        });
    },

    selectedSubjectTablePageOnChange(pageNo) {
        this.setState({
            selectedSubjectTableCurrentPage: pageNo,
        });
    },


    render() {
        const { selectedSubjectKeysForTable} = assignHomeWork.state;
        const subjectRowSelection = {
            selectedRowKeys: assignHomeWork.state.selectedSubjectKeys,
            onChange: assignHomeWork.onSubjectTableSelectChange,
        };
        const selectedSubjectRowSelection = {
            selectedRowKeys: assignHomeWork.state.selectedSubjectKeysForTable,
            onChange: assignHomeWork.onSelectedSubjectTableSelectChange,
        };
        const hasSelected = assignHomeWork.state.selectedSubjectKeysForTable.length > 0;
        return (
            <div>
                <div className="ant-collapse ant-modal-footer homework">

                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="date_tr text_30">日期:</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control">
                            <span className="date_tr"><DatePicker onChange={assignHomeWork.assignDateOnChange}/></span>
                        </Col>
                    </Row>

                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="date_tr text_30">班级:</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control">
                            <span className="date_tr"><CheckboxGroup options={assignHomeWork.state.classList}
                                                                     onChange={assignHomeWork.classListOnChange}/></span>
                        </Col>
                    </Row>

                    <Row className="date_tr ant-form-item">
                        <Col span={3}>
                            <span className="text_30">题目:</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control">
                            <div>
                                <Row>
                                    <Col span={24}>
                                        <div>
                                            <Button type="add_study add_study-b"
                                                    onClick={assignHomeWork.showSubjectModal}><Icon
                                                type="check-circle-o"/>选择题目</Button>
                                            <div className="class_bo">
                                                <Button
                                                    onClick={assignHomeWork.removeAllSelectedSubject}>删除已选题目</Button>
                                                {hasSelected ? `已选中 ${assignHomeWork.state.selectedSubjectKeysForTable.length} 条记录` : ''}
                                            </div>
                                            <Table rowSelection={selectedSubjectRowSelection}
                                                   columns={selectedSubjectColumns}
                                                   dataSource={assignHomeWork.state.selectedSubjectData} pagination={{
                                                total: assignHomeWork.state.selectedSubjectTotalCount,
                                                pageSize: getPageSize(),
                                                onChange: assignHomeWork.selectedSubjectTablePageOnChange
                                            }} scroll={{y: 300}}/>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                </div>

                <Row className="homework_out ant-modal-footer">
                    <Col span={24}>
                 <span>
                   <Button type="primary" htmlType="submit" className="login-form-button class_right"
                           onClick={assignHomeWork.handleSubmit}>
                    保存
                   </Button>
                   <Button type="ghost" htmlType="reset" className="login-form-button" onClick={this.handleCancel}>
                    取消
                   </Button>
                 </span>
                    </Col>
                </Row>
                <Modal title="选择题目" className="choose_class" visible={assignHomeWork.state.subjectModalVisible}
                       onCancel={assignHomeWork.subjectModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       footer={[

                           <Button key="return" type="primary" size="large"
                                   onClick={assignHomeWork.subjectModalHandleOk}>确定</Button>,

                           <Button key="ok" type="ghost" size="large" onClick={assignHomeWork.subjectModalHandleCancel}>取消</Button>,

                       ]}
                >
                    <Row style={{height: 400}}>
                        <Col span={7} className="ant-form"><Table size="small"
                                                                  onRowClick={assignHomeWork.onScheduleSelectChange}
                                                                  selectedRowKeys={assignHomeWork.selectedRowKeys}
                                                                  columns={scheduleColumns} dataSource={scheduleData}
                                                                  scroll={{y: 300}}/></Col>
                        <Col span={17} className="col17_le 17_hei ant-form">
                            <div className="17_hei1">
                                <Table rowSelection={subjectRowSelection} columns={subjectColumns}
                                       dataSource={subjectData} pagination={{
                                    total: assignHomeWork.state.totalSubjectCount,
                                    pageSize: getPageSize(),
                                    onChange: assignHomeWork.pageOnChange
                                }} scroll={{y: 300}}/>
                            </div>
                        </Col>
                    </Row>
                </Modal>
            </div>
        );
    },
});
export  default AssignHomeWorkComponents;

