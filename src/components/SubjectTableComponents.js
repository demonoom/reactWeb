import React, {PropTypes} from 'react';
import {Table, Button, Icon, Popover, message, Checkbox,Modal} from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import SubjectEditComponents from '../components/subjectManager/SubjectEditComponents';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {isEmpty} from '../utils/Const';
import {QUESTION_DETAIL_URL} from '../utils/Const';
import ConfirmModal from './ConfirmModal';

const columns = [{
    title: '出题人',
    className: 'ant-table-selection-user ant-table-selection-user-again',
    dataIndex: 'name',
}, {
    title: '内容',
    className: 'ant-table-selection-cont ant-table-selection-cont-again',
    dataIndex: 'content',
}, {
    title: '题型',
    className: 'ant-table-selection-topic ant-table-selection-topic-again',
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
    /*{
        title: '所属知识点',
        className: 'ant-table-selection-score ant-table-selection-score-again',
        dataIndex: 'subjectKnowledges',
    },*/
    {
        title: '可见性',
        className: 'ant-table-selection-score-visibility',
        dataIndex: 'subjectVisible',
    },
    {
        title: '操作',
        className: 'ant-table-selection-score3 ant-table-selection-score3-again',
        dataIndex: 'subjectOpt',
    },
];

var data = [];
var subjectList = [];

class SUbjectTable extends React.Component {


    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
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
            loginUser: loginUser,
        }
        this.start = this.start.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.getSubjectData = this.getSubjectData.bind(this);
        this.getSubjectDataBySchedule = this.getSubjectDataBySchedule.bind(this);
        this.editSubject = this.editSubject.bind(this);
        this.isDeleteAll = this.isDeleteAll.bind(this);
        this.showDelSubjectConfirmModal = this.showDelSubjectConfirmModal.bind(this);
        this.closeDelSubjectConfirmModal = this.closeDelSubjectConfirmModal.bind(this);
        this.showConfirmModal = this.showConfirmModal.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);
        this.showDelAllSubjectConfirmModal = this.showDelAllSubjectConfirmModal.bind(this);
        this.closeDelAllSubjectConfirmModal = this.closeDelAllSubjectConfirmModal.bind(this);
        this.showdelAllSubjectInScheduleConfirmModal = this.showdelAllSubjectInScheduleConfirmModal.bind(this);
        this.closeDelAllSubjectInScheduleConfirmModal = this.closeDelAllSubjectInScheduleConfirmModal.bind(this);
        this.deleteSubjectsByConditonForSchedule = this.deleteSubjectsByConditonForSchedule.bind(this);
        this.deleteSubjectsByConditon = this.deleteSubjectsByConditon.bind(this);
        this.deleteSubject = this.deleteSubject.bind(this);
        this.deleteAllSelectedSubjectS = this.deleteAllSelectedSubjectS.bind(this);
        this.delMySubjects = this.delMySubjects.bind(this);
        this.getSubjectDataByKnowledge = this.getSubjectDataByKnowledge.bind(this);
        this.initGetSubjectInfo = this.initGetSubjectInfo.bind(this);
        this.showModal = this.showModal.bind(this);
        this.showModifySubjectModal = this.showModifySubjectModal.bind(this);
        this.pageOnChange = this.pageOnChange.bind(this);
        this.subjectEditCallBack = this.subjectEditCallBack.bind(this);
        this.render = this.render.bind(this);
        this.showDetailPanel = this.showDetailPanel.bind(this);
    }


    componentDidMount() {
        this.initGetSubjectInfo(this.props.params);
    }


    componentWillReceiveProps(nextProps) {

        //let obj = nextProps || this.props.params ? this.props.params : null;
        // let obj = nextProps;
        // if (!obj) return;
        this.initGetSubjectInfo(nextProps.params)
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

    getSubjectData(ident, ScheduleOrSubjectId, pageNo, optType, knowledgeName, isOwmer,subjectVisible) {
        data = [];
        this.setState({optType: optType, knowledgeName: knowledgeName, ScheduleOrSubjectId: ScheduleOrSubjectId});
        if (optType == "bySchedule") {
            this.getSubjectDataBySchedule(ident, ScheduleOrSubjectId, pageNo);
        } else {
            this.getSubjectDataByKnowledge(ident, ScheduleOrSubjectId, pageNo, isOwmer,subjectVisible);
        }
    }

    getSubjectDataBySchedule(ident, ScheduleOrSubjectId, pageNo) {
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
                        var content = <article id='contentHtml' className='content'
                                               dangerouslySetInnerHTML={{__html: e.content}} onClick={_this.showDetailPanel.bind(_this,key,e.subjectType)}></article>;
                        var subjectType = e.typeName;
                        var subjectScore = e.score;
                        if (parseInt(e.score) < 0) {
                            subjectScore = '--';
                        }
                        var subjectOpt = <div className="smallclass"><span className="toobar"><Button value={e.id}
                                                                                                      title="删除"
                                                                                                      onClick={_this.showConfirmModal}><Icon
                            type="delete"/></Button></span></div>;
                        var knowledges= [];
                        var knowledgeInfoList = e.knowledgeInfoList;
                        if(isEmpty(knowledgeInfoList)==false){
                            knowledgeInfoList.forEach(function (knowledge) {
                                knowledges.push(knowledge.knowledgeName);
                            });
                        }
                        data.push({
                            key: key,
                            name: name,
                            content: content,
                            subjectType: subjectType,
                            //subjectKnowledges: knowledges.join(","),
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

    editSubject(e) {

    }

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
    }

    isDeleteAll(e) {

        this.setState({isDeleteAllSubject: e.target.checked});
    }

    showDelSubjectConfirmModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectIds = target.value;
        this.setState({"delSubjectId": subjectIds,calmDelModal:true});
        // this.refs.delSubjectConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelSubjectConfirmModal() {
        this.setState({calmDelModal:false})
        // this.refs.delSubjectConfirmModal.changeConfirmModalVisible(false);
    }

    showConfirmModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectIds = target.value;
        this.setState({"delSubjectId": subjectIds,calmSureDelTitle:true});
        // this.refs.confirmModal.changeConfirmModalVisible(true);
    }

    closeConfirmModal() {
        this.setState({calmSureDelTitle:false})
        // this.refs.confirmModal.changeConfirmModalVisible(false);
    }

    showDelAllSubjectConfirmModal() {
        this.refs.delAllSubjectConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelAllSubjectConfirmModal() {
        this.refs.delAllSubjectConfirmModal.changeConfirmModalVisible(false);
    }

    showdelAllSubjectInScheduleConfirmModal() {
        this.refs.delAllSubjectInScheduleConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelAllSubjectInScheduleConfirmModal() {
        this.refs.delAllSubjectInScheduleConfirmModal.changeConfirmModalVisible(false);
    }


    /**
     * 批量或单独删除备课计划下的题目
     * @param subjectIds
     */
    deleteSubjectsByConditonForSchedule(subjectIds) {
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
    deleteSubjectsByConditon(subjectIds) {
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
                _this.getSubjectDataByKnowledge(sessionStorage.getItem("ident"), _this.state.ScheduleOrSubjectId, _this.state.currentPage, "Y",_this.state.subjectVisible);
            },
            onError: function (error) {
                // message.error(error);
            }
        });
        this.setState({isDeleteAllSubject: false});
    }

    //删除备课计划下的题目
    deleteSubject(e) {
        this.deleteSubjectsByConditonForSchedule(this.state.delSubjectId);
        this.closeConfirmModal();
    }

    /**
     * 根据复选框的选择，批量删除资源库下的题目
     */
    deleteAllSelectedSubjectS() {
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
    delMySubjects() {
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
    getSubjectDataByKnowledge(ident, ScheduleOrSubjectId, pageNo, isOwmer,subjectVisible) {
        let _this = this;
        var param = {
            "method": 'getUserSubjectsByKnowledgePoint',
            "ident": ident,
            "pointId": ScheduleOrSubjectId,
            "isOwmer": isOwmer,
            "pageNo": pageNo,
            "subjectVisible":subjectVisible
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {

                subjectList.splice(0);
                data.splice(0);
                var response = ret.response;
                if (response == null || response.length == 0) {
                    _this.setState({totalCount: 0});
                } else {
                    response.forEach(function (e) {
                        var key = e.id;
                        var name = e.user.userName;
                        var content = <article id='contentHtml' className='content'
                                               dangerouslySetInnerHTML={{__html: e.content}} onClick={_this.showDetailPanel.bind(_this,key,e.subjectType)}></article>
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
                        var knowledges= [];
                        var knowledgeInfoList = e.knowledgeInfoList;
                        if(isEmpty(knowledgeInfoList)==false){
                            knowledgeInfoList.forEach(function (knowledge) {
                                knowledges.push(knowledge.knowledgeName);
                            });
                        }
                        var ownerSchoolid = e.ownerSchoolid;
                        var subjectVisible = "全部可见";
                        if(isEmpty(ownerSchoolid)==false && ownerSchoolid == _this.state.loginUser.schoolId){
                            subjectVisible = "本校可见";
                        }
                        data.push({
                            key: key,
                            name: name,
                            content: content,
                            subjectType: subjectType,
                            //subjectScore: subjectScore,
                            //subjectKnowledges: knowledges.join(","),
                            subjectOpt: subjectOpt,
                            answer: answer,
                            subjectVisible:subjectVisible
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


    initGetSubjectInfo(subjectParams, currentPageNo) {

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
        var isOwmer = "";
        var subjectVisible="";
        if (dataFilter == "self") {
            isOwmer = "Y";
        } else if (dataFilter == "other") {
            isOwmer = "N";
        }
        if(isEmpty(dataFilter)==false){
            subjectVisible = dataFilter;
        }
        this.getSubjectData(ident, ScheduleOrSubjectId, pageNo, optType, knowledgeName, isOwmer,subjectVisible);
        if (isEmpty(subjectParamArray[6]) && "fromUpload" == subjectParamArray) {
            this.setState({isOwmer, currentPage: 1,subjectVisible});
        } else {
            this.setState({isOwmer, currentPage: parseInt(pageNo),subjectVisible});
        }
    }

    showModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentKnowledge = target.value;
        this.refs.useKnowledgeComponents.showModal(currentKnowledge, "knowledgeSubject", this.state.knowledgeName);
    }

    showModifySubjectModal(e) {
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

    subjectEditCallBack() {

        this.getSubjectDataByKnowledge(sessionStorage.getItem("ident"), this.state.ScheduleOrSubjectId, this.state.currentPage, "Y",this.state.subjectVisible);
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
                delBtn = <div className="pl_del"><div>
                    <Button type="primary" 
                            className="calmBorderRadius"
                            onClick={this.showdelAllSubjectInScheduleConfirmModal}
                                      disabled={!hasSelected} loading={loading}
                >批量删除</Button><span className="password_ts"
                                    style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span>
                </div></div>;
            } else {
                delBtn = <div className="pl_del"><div>
                    <Button type="primary" 
                            className="calmBorderRadius"
                            onClick={this.showDelAllSubjectConfirmModal}
                                      disabled={!hasSelected} loading={loading}
                >批量删除</Button><span className="password_ts"
                                    style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span>
                </div></div>;
            }
            subjectTable =
                <div className="pl_hei"><Table rowSelection={rowSelection} columns={columns} dataSource={data}
                                               pagination={{
                                                   total: this.state.totalCount,
                                                   pageSize: getPageSize(),
                                                   defaultCurrent: this.state.currentPage,
                                                   current: this.state.currentPage,
                                                   onChange: this.pageOnChange
                                               }} /></div>;
        } else {
            delBtn = '';
            subjectTable = <div className="pl_hei2"><Table columns={columns} dataSource={data} pagination={{
                total: this.state.totalCount,
                pageSize: getPageSize(),
                defaultCurrent: this.state.currentPage,
                current: this.state.currentPage,
                onChange: this.pageOnChange
            }} /></div>;
        }

        var title;
        if (this.state.optType == "bySchedule") {
            title = <div className="isDel">
                        <img className="sadFeel" src={require("../../dist/jquery-photo-gallery/icon/sad.png")} />
                        确定要删除题目吗?
                    </div>
        } else {
            title = <div className="isDel">
                        <img className="sadFeel" src={require("../../dist/jquery-photo-gallery/icon/sad.png")} />
                        确定要删除题目吗?
                        <Checkbox defaultChecked={false} onChange={this.isDeleteAll}>同步删除备课计划下的题目</Checkbox>
                    </div>
        }
        return (
            <div>
                {/* <ConfirmModal ref="confirmModal"
                              title="确定要删除该题目?333"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.deleteSubject}
                ></ConfirmModal> */}
                <Modal
                            className="calmModal"
                            visible={this.state.calmSureDelTitle}
                            title="提示"
                            onCancel={this.closeConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.deleteSubject}  >确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeConfirmModal} >取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../dist/jquery-photo-gallery/icon/sad.png")} />
                                确定要删除该题目?
                            </div>
                        </Modal>

                {/* <ConfirmModal ref="delSubjectConfirmModal"
                              title="提示111"
                              onConfirmModalCancel={this.closeDelSubjectConfirmModal}
                              onConfirmModalOK={this.delMySubjects}
                ></ConfirmModal> */}
                  <Modal
                            className="calmModal"
                            visible={this.state.calmDelModal}
                            title="提示"
                            onCancel={this.closeDelSubjectConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.delMySubjects}  >确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeDelSubjectConfirmModal} >取消</button>
                            ]}
                        >
                        {title}
                            
                </Modal>
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
                <SubjectEditComponents ref="subjectEditTabComponents"
                                                     subjectEditCallBack={this.subjectEditCallBack}></SubjectEditComponents>
                <UseKnowledgeComponents ref="useKnowledgeComponents" divContent={this.state.classDiv}></UseKnowledgeComponents>
                {/*<div className="pl_del">*/}
                    {delBtn}
                {/*</div>*/}
                {subjectTable}
            </div>
        );
    }
};

export default SUbjectTable;
