import React, {PropTypes} from 'react';
import {Table, Button, Popover, message} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {QUESTION_DETAIL_URL} from '../utils/Const';

var columns = [{
    title: '标题',
    dataIndex: 'title',
}, {
    title: '操作',
    className: 'ant-table-selection-topic',
    dataIndex: 'subjectOpt',
},
];

var data = [];
var subjectList;
var subTable;
const HomeWorkTableComponents = React.createClass({
    getInitialState() {
        subTable = this;

        return {
            ident: sessionStorage.getItem('ident'),
            selectedRowKeys: [],
            loading: false,
            count: 0,
            totalCount: 0,
            currentPage: 1,
            currentView: 'homeWorkList',
            clazzId: '',
            dateTime: '',
            tableData:[]
        };
    },
    componentDidMount(){
        this.getDoneHomeworkList(this.state.ident, 1);

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
                className: 'ant-table-selection-cont3 left-12'
            }, {
                title: '类型',
                className: 'ant-table-selection-user2',
                dataIndex: 'subjectType',
            }
            ];
        } else {
            columns = [{
                title: '标题',
                dataIndex: 'title',
				className: 'left-12',
            }, {
                title: '日期',
                dataIndex: 'useDate',
                className: 'ant-table-selection-user2',
            }, {
                title: '操作',
                className: 'ant-table-selection-topic',
                dataIndex: 'subjectOpt',
            },
            ];
        }
    },

    //点击查看时,进入题目列表
    getSubjectData(e){
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
        subTable.buildPageView(optSource);
        subTable.getHomeworkSubjects(ident, clazzId, dateTime, pageNo);
        subTable.setState({currentView: 'subjectDetailList', clazzId: clazzId, dateTime: dateTime});
        subTable.props.onSearchClick();
    },

    //点击导航时，进入的作业列表
    getDoneHomeworkList: function (ident, pageNo) {
        data = [];
        subTable.setState({currentView: 'subjectList', totalCount: 0});
        subTable.buildPageView();
        var param = {
            "method": 'getUserHomeworkInfoList',
            "ident": ident,
            "pageNo": pageNo,

        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                subjectList = new Array();
                var response = ret.response;
                response.forEach(function (e) {
                    var colCid = e.colCid;
                    //班级编号
                    var colClazzId = e.colClazzId;
                    var clazzName = e.clazzName;
                    var hcount = e.hcount;
                    var colCourse = e.colCourse;
                    //作业日期
                    var useDate = e.useDate;
                    var title = clazzName + " " + hcount + " " + colCourse + "作业";
                    var key = ident + "#" + colClazzId + "#" + useDate + "#查看";
                    var subjectOpt = <Button type="button" value={key} text={key} onClick={subTable.getSubjectData}
                                             icon="search"></Button>;
                    data.push({
                        key: key,
                        title: title,
                        useDate: subTable.getLocalTime(useDate),
                        subjectOpt: subjectOpt,
                    });
                });
                var pager = ret.pager;
                subTable.setState({totalCount: parseInt(pager.rsCount)});
                subTable.setState({currentView: 'homeWorkList',"tableData":data});
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
        var _this = this;
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
                    var subjectType = e.subjectType;
                    var content = <article id='contentHtml' className='content Popover_width'
                                           dangerouslySetInnerHTML={{__html: e.content}} onClick={_this.showDetailPanel.bind(_this,id,subjectType)}></article>
                    var typeName = e.typeName;
                    var score = e.score;
                    data.push({
                        key: id,
                        subjectContent: content,
                        subjectType: typeName,
                        subjectScore: score,
                    });
                });
                var pager = ret.pager;
                subTable.setState({totalCount: parseInt(pager.rsCount)});
                subTable.setState({currentView: 'subjectList',"tableData":data});
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

    pageOnChange(pageNo) {
        var currentView = subTable.state.currentView;
        if (currentView == "homeWorkList") {
            subTable.getDoneHomeworkList(sessionStorage.getItem("ident"), pageNo);
        } else {
            subTable.getHomeworkSubjects(sessionStorage.getItem("ident"), subTable.state.clazzId, subTable.state.dateTime, pageNo)
        }

        this.setState({
            currentPage: pageNo,
        });
    },

    render() {
        const {loading, selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
      
                <Table columns={columns} dataSource={subTable.state.tableData} pagination={{
                    total: subTable.state.totalCount,
                    pageSize: getPageSize(),
                    onChange: subTable.pageOnChange
                }} scroll={{y: 400}}/>

        );
    },
});

export default HomeWorkTableComponents;
