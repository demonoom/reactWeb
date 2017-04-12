import React from 'react';
import {Table, Button,Popover} from 'antd';
import UseKnowledge from './UseKnowledgeComponents';
import {getPageSize} from '../utils/Const';

// 我的收藏类型
const FAVTYPE = {
    OTHER: '0',
    SUBJECT: '1',
    WEIKE: '2',
    JIANGYI: '3',
    SHIPIN: '4'
}

const columns = [
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
        className: 'ant-table-selection-score3',
        dataIndex: 'subjectOpt',
    },
];
const FavoriteSubjectItems = React.createClass({
    data: [],
    getInitialState() {

        return {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            type: this.props.type || FAVTYPE.SUBJECT,
            pageNo: 1,
            data: [],
            totalCount:0
        };
    },



    buildSubjectUi: function (courseWareList, type) {
        if (!courseWareList || !courseWareList.length) {
            return;
        }
        this.data = [];
        courseWareList.map((e, i) => {
            let subjectScore = e.subjects.score;
            if (parseInt(subjectScore) < 0) {
                subjectScore = '--';
            }
            let subjectOpt = <div>
                <a target="_blank" title="取消收藏"  onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)}><Button
                    icon="star-o"/></a>
            </div>;

            let popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>'+e.subjects.content+'<hr/><span class="answer_til answer_til_2">答案：</span>'+e.subjects.answer+'</div>';

            let content=<Popover  placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: popOverContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;

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


    },
    //列表分页响应事件
    pageOnChange(pageNo) {
        this.setState({
            currentPage: pageNo,
        });
    },


    render: function () {
        console.log('buildSubjectUi');
         this.buildSubjectUi(this.props.param.data, this.props.param.type);
        return (
            <div>
                <UseKnowledge />
                <Table columns={columns} dataSource={this.data}
                       pagination={{total: this.state.totalCount, pageSize: getPageSize(), onChange: this.pageOnChange}}
                       scroll={{y: 400}}/>
            </div>
        );
    },

});

export default FavoriteSubjectItems;
