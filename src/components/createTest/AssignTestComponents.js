import React, {PropTypes} from 'react';
import {  Icon,   Row, Col, Checkbox, Table, Popover,Modal, Button, message} from 'antd';
import {DatePicker,TimePicker,Radio,Pagination} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getCurrentHM} from '../../utils/utils';
import {formatYMD} from '../../utils/utils';
import {QUESTION_DETAIL_URL} from '../../utils/Const';
import UpdateExamPagerComponents from '../exam/UpdateExamPagerComponents';
import moment from 'moment';

const format = 'HH:mm';
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;

var assignHomeWork;
var classList = [];
var scheduleData = [];
var subjectData = [];
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

var clazzIds = "";
var dateTime = "";
var radioArray = [];
const radioStyle = {
    display: 'block',
    height: '30px',
    lineHeight: '30px',
};
const AssignTestComponents = React.createClass({

    getInitialState() {
        assignHomeWork = this;
        clazzIds = "";
        dateTime = "";
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
            pagerModalVisible: false,
            totalSubjectCount: 0,
            currentScheduleId: 0,
            isNewPage: false,
            classList: [],
            selectedSubjectData: [],
            selectedSubjectTableCurrentPage:1,
            selectedSubjectTotalCount:0,
            currentTime:getCurrentHM(),
            value:'',
            currentPageOfPager:1,
        };
    },

    /**
     * 布置某天考试时间\班级和试卷等信息
     */
    pushExm(){
        var dateTimeYMD = formatYMD(dateTime);
        var startTime = dateTimeYMD+" "+ this.state.startTimeString+":00";
        var endTime = dateTimeYMD+" "+ this.state.endTimeString+":00";
        var startTimestamp = new Date(startTime).valueOf()+"";
        var endTimestamp = new Date(endTime).valueOf()+"";
        console.log(startTimestamp+"\t"+endTimestamp);
        var param = {
            "method": 'pushExm',
            "ident": sessionStorage.getItem("ident"),
            "paperId": this.state.value,
            "clazzIds": clazzIds,
            "startTime": startTimestamp,
            "endTime":endTimestamp,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("考试试卷布置成功");
                } else {
                    message.error("考试试卷布置失败");
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
            message.warning("请选择考试日期");
        }else if (assignHomeWork.isEmpty(this.state.startTimeString)) {
            message.warning("请选择考试开始时间");
        }else if (assignHomeWork.isEmpty(this.state.endTimeString)) {
            message.warning("请选择考试结束时间");
        } else if (assignHomeWork.isEmpty(clazzIds)) {
            message.warning("请选择班级");
        } else if (assignHomeWork.isEmpty(assignHomeWork.state.value)) {
            message.warning("请选择试卷");
        } else {
            assignHomeWork.pushExm();
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
        assignHomeWork.props.callbackParent();
    },

    componentDidMount(){
        this.initPage();
    },

    initPage(){
        assignHomeWork.getTeacherClasses(sessionStorage.getItem("ident"));
        assignHomeWork.getExamPagerList(1);
    },

    //日期控件值改变时，获取当前选择的日期（第一个参数表示的是时间戳，第二个是YYYY-MM-dd格式的日期）
    assignDateOnChange(date, dateString) {
        if (assignHomeWork.isEmpty(date)) {
            dateTime = "";
        }
        dateTime = "" + date;
    },
    /**
     * 获取当前登录的老师所带班级列表
     * @param ident
     */
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
        scheduleData.splice(0);
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
        var _this = this;
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
                    var subjectType = e.typeName;
                    var content = <article id='contentHtml' className='content'
                                           dangerouslySetInnerHTML={{__html: e.content}} onClick={_this.showDetailPanel.bind(_this,key,subjectType)}></article>;
                    subjectData.push({
                        key: key + "^" + e.content + "^" + e.answer + "^" + e.subjectType,
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

    /**
     * 在侧边栏中，显示当前题目的详情信息
     * @param subjectId
     * @param subjectType
     */
    showDetailPanel(subjectId,subjectType){
        var url = QUESTION_DETAIL_URL+"?courseId=" + subjectId + "&subjectType=" + subjectType;
        let param = {
            mode: 'teachingAdmin',
            title: "题目详情",
            url: url,
        };
        LP.Start(param);
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
        var _this = this;
        assignHomeWork.state.selectedSubjectData.splice(0);
        selectedSubjectKeys.forEach(function (e) {
            var subjectArray = e.split("^");
            var content = <article id='contentHtml' className='content content_3'
                                   dangerouslySetInnerHTML={{__html: subjectArray[1]}} onClick={_this.showDetailPanel.bind(_this,subjectArray[0],subjectArray[3])}></article>;
            assignHomeWork.state.selectedSubjectData.push({
                key: e,
                content: content,
            });
        });
        assignHomeWork.setState({selectedSubjectTotalCount:assignHomeWork.state.selectedSubjectData.length});
    },

    /**
     * 修改试卷窗口中的确定操作响应函数
     */
    pagerModalHandleOk() {
        this.getExamPagerList(this.state.currentPageOfPager);
        assignHomeWork.setState({
            pagerModalVisible: false,
        });
    },
    /**
     * 修改试卷窗口中的取消操作响应函数
     */
    pagerModalHandleCancel(e) {
        assignHomeWork.setState({
            pagerModalVisible: false,
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

    //进入  页面时,获取试卷列表
    getExamPagerList(pageNo) {

        var _this = this;
        var param = {
            "method": 'getUserExmPapers',
            "ident": sessionStorage.getItem("ident"),
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                radioArray.splice(0);
                var keyId = Math.floor(Math.random()*1000);
                ret.response.forEach(function (e) {
                    var jsonstr = JSON.stringify(e);
                    var viewButton = <Button icon="search" onClick={_this.editPager.bind(_this,jsonstr)}></Button>;
                    var radioObj = <Radio  style={radioStyle} value={e.id}>{e.title}{viewButton}</Radio>;
                    radioArray.push(radioObj);
                });
                var radioGroupObj = null;
                radioGroupObj = <RadioGroup key={keyId} onChange={_this.examPagerOnChange}>
                    {radioArray}
                </RadioGroup>;
                _this.setState({"radioGroupObj":radioGroupObj,"totalPagerCount":ret.pager.rsCount});
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },
    /**
     * 进入试卷修改页面
    */
    editPager(pagerInfoJson){
        console.log("pagerInfoJson:"+pagerInfoJson);
        assignHomeWork.setState({
            "pagerInfoJson":pagerInfoJson,
            pagerModalVisible: true,
        });
    },

    examPagerOnChange(e){
        this.setState({
            value: e.target.value,
        });
    },

    startTimeOnChange(time, timeString){
        this.setState({"startTimeString":timeString});
    },
    endTimeOnChange(time, timeString){
        this.setState({"endTimeString":timeString});
    },
    pagerOnChange(page){
        this.getExamPagerList(page);
        this.setState({
            currentPageOfPager: page,
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
            <div className="follow_my padding_menu">
                <div className="ant-collapse ant-modal-footer homework exam_paper">

                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="date_tr text_30">考试日期：</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control">
                            <span className="date_tr">
                                <DatePicker onChange={assignHomeWork.assignDateOnChange}/>
                            </span>
                        </Col>
                    </Row>
                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="date_tr text_30">起止时间：</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control">
                            <span className="date_tr">
                                {/*defaultValue={moment(this.state.currentTime, format)}*/}
                                <TimePicker format={format} onChange={this.startTimeOnChange}  />
								<span className="septal_line">-</span>
                                <TimePicker format={format} onChange={this.endTimeOnChange} />

                            </span>
                        </Col>
                    </Row>

                    <Row className="ant-form-item">
                        <Col span={3}>
                            <span className="date_tr text_30">班&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control max_class">
                            <span className="date_tr"><CheckboxGroup options={assignHomeWork.state.classList}
                                                                     onChange={assignHomeWork.classListOnChange}/></span>
                        </Col>
                    </Row>

                    <Row className="date_tr ant-form-item topic">
                        <Col span={3}>
                            <span className="text_30">试&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;卷：</span>
                        </Col>
                        <Col span={21} className="ant-form-item-control topic_list">
                            <div className="follow_my">
                                <Row>
                                    <Col span={24}>
                                        {this.state.radioGroupObj}
                                        <span className="pagination">
                                            <Pagination defaultCurrent={this.state.currentPageOfPager} total={this.state.totalPagerCount}
                                                        pageSize={getPageSize()} current={this.state.currentPageOfPager}
                                                        onChange={this.pagerOnChange} />
                                        </span>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>

                </div>

                <Row className="homework_out ant-modal-footer">
                    <Col span={24}>
                 <span>
                   <Button type="ghost" htmlType="reset" className="login-form-button" onClick={this.handleCancel}>
                    取消
                   </Button>
                   <Button type="primary" htmlType="submit" className="login-form-button class_right"
                           onClick={assignHomeWork.handleSubmit}>
                    保存
                   </Button>
                 </span>
                    </Col>
                </Row>
                <Modal title="修改试卷" className="choose_class" visible={assignHomeWork.state.pagerModalVisible}
                       onCancel={assignHomeWork.pagerModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[]}
                >
                    <div style={{height:'460px', overflow:'scroll'}}>
                        <UpdateExamPagerComponents params={this.state.pagerInfoJson} fatherPage="assignTestModal"
                        callbackCloseModal={assignHomeWork.pagerModalHandleCancel}
                        callbackGetPagerList={assignHomeWork.pagerModalHandleOk}
                        />
                    </div>
                </Modal>
            </div>
        );
    },
});
export  default AssignTestComponents;

