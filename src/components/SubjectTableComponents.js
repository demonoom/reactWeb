import React, {PropTypes} from 'react';
import {Table, Button, Icon, Popover, message, Checkbox} from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import SubjectEditByTextboxioTabComponents from './SubjectEditByTextboxioTabComponents';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {isEmpty} from '../utils/Const';
import ConfirmModal from './ConfirmModal';

const columns = [{
    title: '出题人',
    className: 'ant-table-selection-user',
    dataIndex: 'name',
}, {
    title: '内容',
    className: 'ant-table-selection-cont',
    dataIndex: 'content',
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
    {
        title: '分值',
        className: 'ant-table-selection-score',
        dataIndex: 'subjectScore',
    }, {
        title: '操作',
        className: 'ant-table-selection-score3',
        dataIndex: 'subjectOpt',
    },
];

var data = [];
var subjectList = [];
class SUbjectTable extends React.Component{


    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            selectedRowKeysStr: '',
            loading: false,
            count: 0,
            totalCount: 0,
            optType: '',
            ScheduleOrSubjectId: '',
            ident: '',
            knowledgeName: '',
            currentPage: 1,
            data: data,
            subjectParams: '',
            isOwmer: 'N',
            isDeleteAllSubject: false,



        }

    }


    componentDidMount(){
         this.initGetSubjectInfo(this.props.params);
    }



    componentWillReceiveProps(nextProps) {

        let obj = nextProps || this.props.params ? this.props.params : null;
        if (!obj)   return;
        this.initGetSubjectInfo(obj)
    }

    start() {
        this.setState({loading: true});
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    }

    onSelectChange(selectedRowKeys) {
        var selectedRowKeysStr = selectedRowKeys.join(",");
        this.setState({selectedRowKeys, selectedRowKeysStr});
    }

    getSubjectData(ident, ScheduleOrSubjectId, pageNo, optType, knowledgeName, isOwmer){
        data = [];
        this.setState({optType: optType, knowledgeName: knowledgeName, ScheduleOrSubjectId: ScheduleOrSubjectId});
        if (optType == "bySchedule") {
            this.getSubjectDataBySchedule(ident, ScheduleOrSubjectId, pageNo);
        } else {
            this.getSubjectDataByKnowledge(ident, ScheduleOrSubjectId, pageNo, isOwmer);
        }
    }

    getSubjectDataBySchedule (ident, ScheduleOrSubjectId, pageNo) {
        let _this = this;
        var param = {
            "method": 'getClassSubjects',
            "ident": ident,
            "teachScheduleId": ScheduleOrSubjectId,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                subjectList.splice(0);
                data.splice(0);
                var response = ret.response;
                if (!response) {
                    _this.setState({totalCount: 0});
                } else {
                    response.forEach(function (e) {
                        var key = e.id;
                        var name = e.user.userName;
                        var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + e.content + '<hr/><span class="answer_til answer_til_2">答案：</span>' + e.answer + '</div>';
                        var content = <Popover placement="rightTop"
                                               content={<article id='contentHtml' className='content Popover_width'
                                                                 dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                            <article id='contentHtml' className='content'
                                     dangerouslySetInnerHTML={{__html: e.content}}></article>
                        </Popover>;
                        var subjectType = e.typeName;
                        var subjectScore = e.score;
                        if (parseInt(e.score) < 0) {
                            subjectScore = '--';
                        }
                        var subjectOpt = <div className="smallclass"><span className="toobar"><Button value={e.id}
                                                                                                      title="删除"
                                                                                                      onClick={_this.showConfirmModal}><Icon
                            type="delete"/></Button></span></div>;
                        data.push({
                            key: key,
                            name: name,
                            content: content,
                            subjectType: subjectType,
                            subjectScore: subjectScore,
                            subjectOpt: subjectOpt,
                        });
                        var pager = ret.pager;
                        _this.setState({totalCount: parseInt(pager.rsCount)});
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    }

    editSubject (e) {

    }

    isDeleteAll(e){

        this.setState({isDeleteAllSubject: e.target.checked});
    }

    showDelSubjectConfirmModal(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectIds = target.value;
        this.setState({"delSubjectId": subjectIds});
        this.refs.delSubjectConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelSubjectConfirmModal(){
        this.refs.delSubjectConfirmModal.changeConfirmModalVisible(false);
    }

    showConfirmModal(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectIds = target.value;
        this.setState({"delSubjectId": subjectIds});
        this.refs.confirmModal.changeConfirmModalVisible(true);
    }

    closeConfirmModal(){
        this.refs.confirmModal.changeConfirmModalVisible(false);
    }

    showDelAllSubjectConfirmModal(){
        this.refs.delAllSubjectConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelAllSubjectConfirmModal(){
        this.refs.delAllSubjectConfirmModal.changeConfirmModalVisible(false);
    }

    showdelAllSubjectInScheduleConfirmModal(){
        this.refs.delAllSubjectInScheduleConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelAllSubjectInScheduleConfirmModal(){
        this.refs.delAllSubjectInScheduleConfirmModal.changeConfirmModalVisible(false);
    }


    /**
     * 批量或单独删除备课计划下的题目
     * @param subjectIds
     */
    deleteSubjectsByConditonForSchedule(subjectIds){
        let _this = this;
        var param = {
            "method": 'deleteScheduleSubjects',
            "ident": sessionStorage.getItem("ident"),
            "scheduleId": this.state.ScheduleOrSubjectId,
            "subjectIds": subjectIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {

                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("题目删除成功");
                } else {
                    message.error("题目删除失败");
                }
                _this.getSubjectDataBySchedule(sessionStorage.getItem("ident"), _this.state.ScheduleOrSubjectId, _this.state.currentPage);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 批量或单独删除资源库下的题目
     * @param subjectIds
     */
    deleteSubjectsByConditon(subjectIds){
        let _this = this;
        //同时删除此人教学进度和知识点下面的这些题目
        var param
        if (this.state.isDeleteAllSubject) {
            param = {
                "method": 'deleteScheduleAndKnowledgeSubjects',
                "userId": sessionStorage.getItem("ident"),
                "subjects": subjectIds
            };
        } else {
            param = {
                "method": 'delMySubjects',
                "userId": sessionStorage.getItem("ident"),
                "subjects": subjectIds
            };
        }
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {

                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("题目删除成功");
                } else {
                    message.error("题目删除失败");
                }
                _this.getSubjectDataByKnowledge(sessionStorage.getItem("ident"), _this.state.ScheduleOrSubjectId, _this.state.currentPage, "Y");
            },
            onError: function (error) {
                message.error(error);
            }
        });
        this.setState({isDeleteAllSubject: false});
    }

    //删除备课计划下的题目
    deleteSubject (e) {
        this.deleteSubjectsByConditonForSchedule(this.state.delSubjectId);
        this.closeConfirmModal();
    }

    /**
     * 根据复选框的选择，批量删除资源库下的题目
     */
    deleteAllSelectedSubjectS(){
        //已选中的题目的id字符串，使用逗号进行分割
        var subjectIds = this.state.selectedRowKeysStr;
        if (this.state.optType == "bySchedule") {
            this.deleteSubjectsByConditonForSchedule(subjectIds);
            this.closeDelAllSubjectInScheduleConfirmModal();
        } else {
            this.deleteSubjectsByConditon(subjectIds);
            this.closeDelAllSubjectConfirmModal();
        }
        this.setState({selectedRowKeysStr: '', selectedRowKeys: []});
    }

    //删除资源库下的题目
    delMySubjects () {
        this.deleteSubjectsByConditon(this.state.delSubjectId);
        this.closeDelSubjectConfirmModal();
    }

    /**
     * 根据资源库的知识点id获取知识点下的题目
     * @param ident
     * @param ScheduleOrSubjectId
     * @param pageNo
     * @param isOwmer
     */
    getSubjectDataByKnowledge (ident, ScheduleOrSubjectId, pageNo, isOwmer) {
        let _this = this;
        var param = {
            "method": 'getUserSubjectsByKnowledgePoint',
            "ident": ident,
            "pointId": ScheduleOrSubjectId,
            "isOwmer": isOwmer,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
debugger
                subjectList.splice(0);
                data.splice(0);
                var response = ret.response;
                if (response == null || response.length == 0) {
                    _this.setState({totalCount: 0});
                } else {
                    response.forEach(function (e) {
                        var key = e.id;
                        var name = e.user.userName;
                        var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + e.content + '<hr/><span class="answer_til answer_til_2">答案：</span>' + e.answer + '</div>';
                        var content = <Popover placement="rightTop"
                                               content={<article id='contentHtml' className='content Popover_width'
                                                                 dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                            <article id='contentHtml' className='content'
                                     dangerouslySetInnerHTML={{__html: e.content}}></article>
                        </Popover>;
                        var subjectType = e.typeName;
                        var subjectScore = e.score;
                        if (parseInt(e.score) < 0) {
                            subjectScore = '--';
                        }
                        var answer = e.answer;
                        var userId = e.user.colUid;
                        var subjectOpt = <Button value={e.id} onClick={_this.showModal} icon="export"
                                                 title="使用"></Button>;
                        if (userId == sessionStorage.getItem("ident")) {
                            subjectOpt = <div><Button value={e.id} onClick={_this.showModal} icon="export" title="使用"
                                                      className="score3_i"></Button>
                                <Button style={{}} value={e.id + "#" + e.typeName}
                                        onClick={_this.showModifySubjectModal} icon="edit" title="修改"
                                        className="score3_i"></Button>
                                <Button style={{}} value={e.id} onClick={_this.showDelSubjectConfirmModal} icon="delete"
                                        title="删除" className="score3_i"></Button></div>;
                        } else {
                            subjectOpt =
                                <Button value={e.id} onClick={_this.showModal} icon="export" title="使用"></Button>;
                        }
                        data.push({
                            key: key,
                            name: name,
                            content: content,
                            subjectType: subjectType,
                            subjectScore: subjectScore,
                            subjectOpt: subjectOpt,
                            answer: answer
                        });
                        var pager = ret.pager;
                        _this.setState({totalCount: parseInt(pager.rsCount)});
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }

        });
    }



    initGetSubjectInfo (subjectParams, currentPageNo) {
        debugger
        var subjectParamArray = this.props.params.split("#");
        this.setState({subjectParams: this.props.params});
        if (subjectParams) {
            subjectParamArray = subjectParams.split("#");
            this.setState({subjectParams: subjectParams});
        }
        var ident = subjectParamArray[0];
        var ScheduleOrSubjectId = subjectParamArray[1];
        var pageNo = 1;
        if (!currentPageNo) {
            pageNo = subjectParamArray[2];
        } else {
            pageNo = currentPageNo || subjectParamArray[2];
        }
        var optType = subjectParamArray[3];
        var knowledgeName = subjectParamArray[4];
        var dataFilter = subjectParamArray[5];
        var isOwmer = "Y";
        if (dataFilter == "self") {
            isOwmer = "Y";
        } else if (dataFilter == "other") {
            isOwmer = "N";
        }
        this.getSubjectData(ident, ScheduleOrSubjectId, pageNo, optType, knowledgeName, isOwmer);
        if (isEmpty(subjectParamArray[6]) && "fromUpload" == subjectParamArray) {
            this.setState({isOwmer, currentPage: 1});
        } else {
            this.setState({isOwmer, currentPage: parseInt(pageNo)});
        }
    }

    showModal (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentKnowledge = target.value;
        this.refs.useKnowledgeComponents.showModal(currentKnowledge, "knowledgeSubject", this.state.knowledgeName);
    }

    showModifySubjectModal (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentSubjectInfo = target.value;
        this.refs.subjectEditTabComponents.showModal(currentSubjectInfo);
    }

    pageOnChange(pageNo) {
        this.initGetSubjectInfo(this.state.subjectParams, pageNo);
        this.setState({
            currentPage: pageNo,
        });
    }

    subjectEditCallBack(){

        this.getSubjectDataByKnowledge(sessionStorage.getItem("ident"), this.state.ScheduleOrSubjectId, this.state.currentPage, "Y");
    }

    render() {
        const {loading, selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        var delBtn;
        var subjectTable;
        if (this.state.isOwmer == "Y") {
            if (this.state.optType == "bySchedule") {
                delBtn = <div><Button type="primary" onClick={this.showdelAllSubjectInScheduleConfirmModal}
                                      disabled={!hasSelected} loading={loading}
                >批量删除</Button><span
                    style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;
            } else {
                delBtn = <div><Button type="primary" onClick={this.showDelAllSubjectConfirmModal}
                                      disabled={!hasSelected} loading={loading}
                >批量删除</Button><span
                    style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;
            }
            subjectTable =
                <div className="pl_hei"><Table rowSelection={rowSelection} columns={columns} dataSource={data}
                                               pagination={{
                                                   total: this.state.totalCount,
                                                   pageSize: getPageSize(),
                                                   defaultCurrent: this.state.currentPage,
                                                   current: this.state.currentPage,
                                                   onChange: this.pageOnChange
                                               }} scroll={{y: 400}}/></div>;
        } else {
            delBtn = '';
            subjectTable = <div className="pl_hei2"><Table columns={columns} dataSource={data} pagination={{
                total: this.state.totalCount,
                pageSize: getPageSize(),
                defaultCurrent: this.state.currentPage,
                current: this.state.currentPage,
                onChange: this.pageOnChange
            }} scroll={{y: 400}}/></div>;
        }

        var title;
        if (this.state.optType == "bySchedule") {
            title = <div>
                <span>确定要删除选定的题目?</span>
            </div>;
        } else {
            title = <div>
                <span>确定要删除选定的题目?</span>
                <Checkbox defaultChecked={false} onChange={this.isDeleteAll}>同步删除备课计划下的题目</Checkbox>
            </div>;
        }

        return (
            <div >
                <ConfirmModal ref="confirmModal"
                              title="确定要删除该题目?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.deleteSubject}
                ></ConfirmModal>
                <ConfirmModal ref="delSubjectConfirmModal"
                              title={title}
                              onConfirmModalCancel={this.closeDelSubjectConfirmModal}
                              onConfirmModalOK={this.delMySubjects}
                ></ConfirmModal>
                <ConfirmModal ref="delAllSubjectConfirmModal"
                              title={title}
                              onConfirmModalCancel={this.closeDelAllSubjectConfirmModal}
                              onConfirmModalOK={this.deleteAllSelectedSubjectS}
                ></ConfirmModal>
                <ConfirmModal ref="delAllSubjectInScheduleConfirmModal"
                              title="确定要删除选中的题目?"
                              onConfirmModalCancel={this.closeDelAllSubjectInScheduleConfirmModal}
                              onConfirmModalOK={this.deleteAllSelectedSubjectS}
                ></ConfirmModal>
                <SubjectEditByTextboxioTabComponents ref="subjectEditTabComponents"
                                                     subjectEditCallBack={this.subjectEditCallBack}></SubjectEditByTextboxioTabComponents>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                <div className="pl_del">
                    {delBtn}
                </div>
                {subjectTable}
            </div>
        );
    }
};

export default SUbjectTable;
