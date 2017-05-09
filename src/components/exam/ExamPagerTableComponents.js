import React, {PropTypes} from 'react';
import {Table, Button, Popover, message} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';

var columns = [{
    title: '标题',
    dataIndex: 'title',
}, {
    title: '操作',
    className: 'ant-table-selection-topic',
    dataIndex: 'subjectOpt',
},
];

var subjectList;
const ExamPagerTableComponents = React.createClass({
    getInitialState() {
        return {
            selectedRowKeys: [],
            loading: false,
            count: 0,
            totalCount: 0,
            currentPage: 1,
            currentView: 'examPagerList',
            clazzId: '',
            dateTime: ''
        };
        this.data = [];
        this.getExamPagerList = this.getExamPagerList.bind(this);
    },

    componentWillMount(){
        this.getExamPagerList(sessionStorage.getItem("ident"), 1);
    },

    start() {
        this.setState({loading: true});
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    },
    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    buildPageView(optSource){
        if (optSource == "查看") {
            columns = [{
                title: '内容',
                dataIndex: 'subjectContent',
                className: 'ant-table-selection-cont3'
            }, {
                title: '类型',
                className: 'ant-table-selection-topic',
                dataIndex: 'subjectType',
            }
            ];
        } else {
            columns = [{
                title: '试卷名称',
                dataIndex: 'title',
            }, {
                title: '操作',
                className: 'ant-table-selection-topic',
                dataIndex: 'subjectOpt',
            },
            ];
        }
    },

    //点击查看时,进入题目列表
    getSubjectData(e, handler){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        data = [];
        var value = target.value;
        var valueArray = value.split("#");
        var ident = valueArray[0];
        var clazzId = valueArray[1];
        var dateTime = valueArray[2];
        var optSource = valueArray[3];
        var pageNo = 1;
        this.buildPageView(optSource);
        this.getHomeworkSubjects(ident, clazzId, dateTime, pageNo);
        this.setState({currentView: 'subjectDetailList', clazzId: clazzId, dateTime: dateTime});
    },

    getExamPagerInfo(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var subjectInfoJson = target.value;
        this.props.callBackParent(subjectInfoJson);
    },

    //点击导航时，进入的试卷列表
    getExamPagerList: function (ident, pageNo) {

        let _this = this;

        this.data = [];
        this.setState({currentView: 'subjectList', totalCount: 0});
        this.buildPageView();
        var param = {
            "method": 'getUserExmPapers',
            "ident": ident,
            "pageNo": pageNo,

        };
        doWebService(JSON.stringify(param), {

            onResponse: function (ret) {

                subjectList = [];
                ret.response.forEach(function (e) {
                    var jsonstr = JSON.stringify(e);
                    var subjectOpt = <Button type="button" value={jsonstr} text={e.pagerId}
                                             onClick={_this.getExamPagerInfo} icon="edit"></Button>;
                    _this.data.push({
                        key: e.id,
                        title: e.title,
                        subjectOpt: subjectOpt,
                    });
                });
                _this.setState({totalCount: parseInt(ret.pager.rsCount), currentView: 'examPagerList'});
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    getLocalTime: function (nS) {
        var newDate = new Date();
        newDate.setTime(nS);
        return newDate.toLocaleDateString();
    },

    //点击作业列表中的查看时，进入题目列表
    getHomeworkSubjects: function (ident, clazzId, dateTime, pageNo) {
        let _this = this;
        this.data = [];
        var param = {
            "method": 'getHomeworkSubjects',
            "ident": ident,
            "clazzId": clazzId,
            "dateTime": dateTime,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                subjectList = new Array();
                var response = ret.response;
                response.forEach(function (e) {
                    var id = e.id;
                    var content = <Popover placement="rightTop"
                                           content={<article id='contentHtml' className='content Popover_width'
                                                             dangerouslySetInnerHTML={{__html: e.content}}></article>}>
                        <article id='contentHtml' className='content Popover_width'
                                 dangerouslySetInnerHTML={{__html: e.content}}></article>
                    </Popover>;
                    _this.data.push({
                        key: id,
                        subjectContent: content,
                        subjectType: e.typeName,
                        subjectScore: e.score,
                    });
                });
                _this.setState({totalCount: parseInt(ret.pager.rsCount), currentView: 'subjectList'});
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    pageOnChange(pageNo) {
        var currentView = this.state.currentView;
        if (currentView == "examPagerList") {
            this.getExamPagerList(sessionStorage.getItem("ident"), pageNo);
        } else {
            this.getHomeworkSubjects(sessionStorage.getItem("ident"), this.state.clazzId, this.state.dateTime, pageNo)
        }

        this.setState({
            currentPage: pageNo,
        });
    },


    render() {

        return (
            <div >
                <Table columns={columns} dataSource={this.data}
                       pagination={{total: this.state.totalCount, pageSize: getPageSize(), onChange: this.pageOnChange}}
                       scroll={{y: 400}}/>
            </div>
        );
    },
});

export default ExamPagerTableComponents;
