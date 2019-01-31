import React from 'react';
import {Table, Button, Popover} from 'antd';
import {getPageSize} from '../utils/Const';

// 我的收藏类型
const FAVTYPE = {
    OTHER: '0',
    SUBJECT: '1',
    WEIKE: '2',
    JIANGYI: '3',
    SHIPIN: '4'
}


const FavoriteSubjectItems = React.createClass({

    data: [],
    columnsAll: [
        {
            title: '出题人',
            className: 'ant-table-selection-score3',
            dataIndex: 'name',
        },
        {
            title: '内容',
            className: 'ant-table-selection-cont',
            dataIndex: 'content',
        },
        {
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
            filterMultiple: true,
            onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
        },
        {
            title: '分值',
            className: 'ant-table-selection-score',
            dataIndex: 'subjectScore',
        }, {
            title: '操作',
            className: 'ant-table-selection-score Operating-Air',
            dataIndex: 'subjectOpt',
        },
    ],
    columnsNoPermission: [
        {
            title: '出题人',
            className: 'ant-table-selection-score3',
            dataIndex: 'name',
        },
        {
            title: '内容',
            className: 'ant-table-selection-cont',
            dataIndex: 'content',
        },
        {
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
            filterMultiple: true,
            onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
        },
        {
            title: '分值',
            className: 'ant-table-selection-score',
            dataIndex: 'subjectScore',
        },
    ],
    columns:[],

    getInitialState() {

        return {
            ident: sessionStorage.getItem("ident"),
            type: this.props.type || FAVTYPE.SUBJECT,
            pageNo: 1,
            data: [],
            totalCount: 0
        };

    },


    buildSubjectUi: function () {

        let courseWareList = this.props.param.data;
        this.data = [];
        if (!courseWareList || !courseWareList.length) {
            return;
        }

        courseWareList.map((e, i) => {
            let subjectScore = e.subjects.score;
            if (parseInt(subjectScore) < 0) {
                subjectScore = '--';
            }
            let subjectOpt = '';

            if (this.state.ident == this.props.userid) {
                subjectOpt = <div>
                    <a target="_blank" title="取消收藏"
                       onClick={this.props.onCancelfavrite.bind(this, e.address, this.props.upgradeData)}><Button
                        icon="star"/></a>
                </div>;
            }

            let popOverContent1 = '<div>' + e.subjects.content + '' + e.subjects.answer + '</div>';
            let popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + e.subjects.content + '<hr/><span class="answer_til answer_til_2">答案：</span>' + e.subjects.answer + '</div>';

            let content = <Popover placement="rightTop" content={
                <article id='contentHtml' className='content Popover_width'
                         dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                <article id='contentHtml' className='content'
                         dangerouslySetInnerHTML={{__html: popOverContent1}}></article>
            </Popover>;

            this.data.push({
                key: e.favoriteId,
                name: e.subjects.user.userName,
                content: content,
                subjectType: e.subjects.typeName,
                subjectScore: subjectScore,
                subjectOpt: subjectOpt,
                answer: e.subjects.answer
            });

        });

        if (this.state.ident == this.props.userid) {
            this.columns = this.columnsAll;
        } else {
            this.columns = this.columnsNoPermission;
        }


    },
    //列表分页响应事件
    pageOnChange(pageNo) {
        this.setState({
            currentPage: pageNo,
        });
    },


    render: function () {

        this.buildSubjectUi();
        return ( <Table columns={this.columns} dataSource={this.data}
                        pagination={{
                            total: this.state.totalCount,
                            pageSize: getPageSize(),
                            onChange: this.pageOnChange
                        }}
                        scroll={{y: 390}}/>

        );
    },

});

export default FavoriteSubjectItems;
