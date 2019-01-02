/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Button, Row, Col, message,Table,Popover} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import {getPageSize} from '../../utils/Const';

var scheduleData = [];
var subjectData = [];
var subjectColumns = [{
    title: '内容',
    className: 'ant-table-selection-cont2',
    dataIndex: 'content'
},
];

var scheduleColumns = [{
    title: '备课计划',
    dataIndex: 'scheduleName',

},
];

/**
 * 从备课计划选题的modal
 */
//是否给出无更多数据的提示
var isTipNoDataMessage=true;
class SelectSubjectModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            selectedSubjectKeys:[], //选中的题目
        };
        this.SelectSubjectModalHandleCancel = this.SelectSubjectModalHandleCancel.bind(this);
        this.initPage = this.initPage.bind(this);
        this.subjectModalHandleOk = this.subjectModalHandleOk.bind(this);
        this.loadMoreSubject = this.loadMoreSubject.bind(this);
        this.getScheduleList = this.getScheduleList.bind(this);
        this.onScheduleSelectChange = this.onScheduleSelectChange.bind(this);
        this.getSubjectDataBySchedule = this.getSubjectDataBySchedule.bind(this);
        this.onSubjectTableSelectChange = this.onSubjectTableSelectChange.bind(this);
        this.subjectModalHandleOk = this.subjectModalHandleOk.bind(this);
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

    SelectSubjectModalHandleCancel() {
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
     * 本地课堂中，加载更多的题目，以完成数据分页获取
     */
    loadMoreSubject(){
        var newPage = parseInt(this.state.currentPage)+1;
        this.getSubjectDataBySchedule(this.state.currentScheduleId, newPage);
    }

    //在选择题目的窗口中，先获取老师名下的备课计划
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
                _this.setState({scheduleCount: scheduleData.length,scheduleData});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 选中备课计划后，根据选定的备课计划，获取指定备课计划下的题目
     * @param selectedRowKeys
     */
    onScheduleSelectChange(selectedRowKeys) {
        var scheduleId = selectedRowKeys.key;
        subjectData = [];
        //切换备课计划时，不提示无更多数据
        isTipNoDataMessage = false;
        this.getSubjectDataBySchedule(scheduleId, 1);
        this.setState({currentScheduleId: scheduleId});
    }

    //根据备课计划获取题目列表
    getSubjectDataBySchedule (ScheduleOrSubjectId, pageNo) {
        var _this = this;
        var param = {
            "method": 'getClassSubjects',
            "ident": _this.state.loginUser.colUid,
            "teachScheduleId": ScheduleOrSubjectId,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(isEmpty(response)==false && response.length>0){
                    isTipNoDataMessage = true;
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
                            key: key,
                            content: content,
                            subjectType: subjectType,
                            subjectObj:e
                        });
                    });
                    _this.setState({currentPage: pageNo});
                }else{
                    if(isTipNoDataMessage==true){
                        message.success("无更多数据");
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    }

    //题目表格行被选中时获取被选中项目
    onSubjectTableSelectChange(selectedSubjectKeys) {
        this.setState({selectedSubjectKeys});
    }

    /**
     * 选择题目后的确定操作
     */
    subjectModalHandleOk(){
        //通过回调的形式，将选中的题目回调给父组件，并完成推题的操作
        if(isEmpty(this.state.selectedSubjectKeys)==false){
            this.props.pushSubjectToClass(this.state.selectedSubjectKeys);
        }
        this.SelectSubjectModalHandleCancel();
    }

    render() {
        const subjectRowSelection = {
            selectedRowKeys: this.state.selectedSubjectKeys,
            onChange: this.onSubjectTableSelectChange,
        };

        return (
            <Modal title="推送题目" className="modal_classroom modal_classroom_push modal_classroom_push_new" visible={this.state.isShow}
                   onCancel={this.SelectSubjectModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   maskClosable={false} //设置不允许点击蒙层关闭
                   width={750}
                   footer={null}
            >
                <Row className="modal_flex">
                    <Col className="ant-form modal_classroom_push_left"><Table className="lesson classroom_prepare_lessons"
                                                              onRowClick={this.onScheduleSelectChange}
                                                              columns={scheduleColumns} dataSource={this.state.scheduleData}
                                                              pagination={false}
                                                              scroll={{y: 300}}/></Col>
                    <Col className="col17_le 17_hei ant-form modal_flex_1 btn_push_box">
                        <Button key="return" type="primary" size="large" className="btn_push_i"
                                onClick={this.subjectModalHandleOk}>推送</Button>
                        <div >
                            <Table  className="modal_classroom_push_right" columns={subjectColumns}
                                   dataSource={subjectData}
                                   rowSelection={subjectRowSelection}
                                   showHeader={false}
                                   pagination={false} scroll={{y: 300}}/>
                            <div className="schoolgroup_operate schoolgroup_more more_classroom">
                                <a onClick={this.loadMoreSubject} className="schoolgroup_more_a">加载更多</a>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectSubjectModal;
