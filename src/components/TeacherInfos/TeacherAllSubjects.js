import React, {PropTypes} from 'react';
import {Table, Button, Popover, message, Breadcrumb, Icon,Modal} from 'antd';
import ConfirmModal from '../ConfirmModal';
import {getPageSize,isEmpty} from '../../utils/Const';
import {QUESTION_DETAIL_URL} from '../../utils/Const';
import {doWebService} from '../../WebServiceHelper';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import SubjectEditComponents from '../subjectManager/SubjectEditComponents';

const columns = [
    {
        title: '出题人',
        className: 'ant-table-selection-user2 left-12 ant-table-selection-user2-again',
        dataIndex: 'name',
    }, {
        title: '内容',
        className: 'ant-table-selection-cont ant-table-selection-cont-again',
        dataIndex: 'content',
    },
    {
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
        title: '操作',
        className: 'ant-table-selection-score3 ant-table-selection-score3-again Operating-Air',
        dataIndex: 'subjectOpt',
    },
];

var data = [];

const TeacherAllSubjects = React.createClass({
    getInitialState() {
        return {
            selectedRowKeys: [],  // Check here to configure the default column
            loading: false,
            count: 0,
            totalCount: 0,
            optType: '',
            ScheduleOrSubjectId: '',
            ident: '',
            knowledgeName: '',
            currentPage: 1,
            data: data,
            subjectParams: ''
        };
    },

    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    //页面组件加载完成后的回调函，用来向已加载的组件填充数据
    componentDidMount(){
        var initPageNo = 1;
        this.getUserSubjectsByUid(sessionStorage.getItem("ident"), initPageNo);
    },

    //列表分页响应事件
    pageOnChange(pageNo) {
        this.getUserSubjectsByUid(sessionStorage.getItem("ident"), pageNo);
        this.setState({
            currentPage: pageNo,
        });
    },
    //题目修改完成后的回调函数，用来刷新
    subjectEditCallBack(){
        this.getUserSubjectsByUid(sessionStorage.getItem("ident"), this.state.currentPage);
    },


    getUserSubjectsByUid: function (ident, pageNo) {
        let _self = this;
        var param = {
            "method": 'getUserSubjectsByUid',
            "userId": ident,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                data.splice(0);
                console.log(ret,"ret题目")
                var response = ret.response;
                if (response == null || response.length == 0) {
                    _self.setState({totalCount: 0});
                } else {
                    response.forEach(function (e) {
                        var key = e.id;
                        var name = e.user.userName;
                        var content = <article id='contentHtml' className='content'
                                               dangerouslySetInnerHTML={{__html: e.content}} onClick={_self.showDetailPanel.bind(_self,key,e.subjectType)}></article>;
                        var subjectType = e.typeName;
                        var subjectScore = e.score;
                        if (parseInt(e.score) < 0) {
                            subjectScore = '--';
                        }
                        var answer = e.answer;
                        var subjectOpt = <div>
                            <Button value={e.id} onClick={_self.showModal} icon="export" title="使用"
                                    className="score3_i"/>
                            <Button value={e.id + "#" + e.typeName} onClick={_self.showModifySubjectModal} icon="edit"
                                    title="修改" className="score3_i"/>
                            <Button value={e.id} onClick={_self.showConfirmModal} icon="delete" title="删除"
                                    className="score3_i"/>
                        </div>;
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
                            answer: answer
                        });
                        _self.setState({totalCount: parseInt(ret.pager.rsCount)});
                    });
                }
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


    //删除资源库下的题目
    delMySubjects: function () {
        console.log("4567890")
        let _self = this;
        var subjectIds = this.state.delSubjectIds;
        var param = {
            "method": 'delMySubjects',
            "userId": sessionStorage.getItem("ident"),
            "subjects": subjectIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret,"delete")
                _self.closeConfirmModal();
                if (ret.response) {
                    message.success("删除成功");
                    _self.getUserSubjectsByUid(sessionStorage.getItem("ident"), _self.state.currentPage);
                } else {
                    message.error("删除失败");
                }

            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //题目修改功能
    showModifySubjectModal: function (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentSubjectInfo = target.value;
        this.refs.subjectEditTabComponents.showModal(currentSubjectInfo);
    },

    //弹出题目使用至备课计划的窗口
    showModal: function (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentKnowledge = target.value;
        this.refs.useKnowledgeComponents.showModal(currentKnowledge, "TeacherAllSubjects", this.state.knowledgeName);
    },

    showConfirmModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectIds = target.value;
        this.setState({"delSubjectIds": subjectIds,calmSureDeleteThisTitle:true});
        // this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal(){
        this.setState({calmSureDeleteThisTitle:false})
        // this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    render() {
        const {loading, selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <div className='ant-tabs ant-tabs-top ant-tabs-line8888888'>
                <div className="public—til—blue">我的题目</div>
                {/* <ConfirmModal ref="confirmModal"
                              title="确定要删除该题目?444"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.delMySubjects}
                /> */}
                <Modal
                            className="calmModal"
                            visible={this.state.calmSureDeleteThisTitle}
                            title="提示"
                            onCancel={this.closeConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.delMySubjects}  >确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeConfirmModal} >取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../../jquery-photo-gallery/icon/sad.png")} />
                                确定要删除该题目?
                            </div>
                        </Modal>
				<div className="favorite_scroll">
                <div className='ant-tabs-tabpane ant-tabs-tabpane-active pers_bo_ra'>
                    <SubjectEditComponents ref="subjectEditTabComponents"
                                           subjectEditCallBack={this.subjectEditCallBack}></SubjectEditComponents>
                    <UseKnowledgeComponents ref="useKnowledgeComponents"/>
                    <Table columns={columns} dataSource={data} pagination={{
                        total: this.state.totalCount,
                        pageSize: getPageSize(),
                        onChange: this.pageOnChange
                    }} scroll={{y: 400}}/>
                </div>
				</div>
            </div>
        );
    },

    });


export default TeacherAllSubjects;
