import React from 'react';
import {Checkbox, Card, Table, Collapse, Button, Pagination, message, Modal} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {getLocalTime} from '../utils/utils';
import UseKnowledge from './UseKnowledgeComponents';

const Panel = Collapse.Panel;
const confirm = Modal.confirm;


const FavoriteItem = React.createClass({
    // 我的收藏类型
    FAVTYPE: [
        ['0', 'other', '其它'],
        ['1', 'subject', '题目'],
        ['2', 'weike', '微课'],
        ['3', 'jiangyi', '讲义'],
        ['4', 'shipin', '直播课']
    ],

    columns : [
        {
            title: '出题人',
            className: 'ant-table-selection-user',
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
    ],
    activeKey: [],
    data: [],
    totalCount:0,
    coursePanelChildren: {},
    getInitialState() {

        return {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            pageNo: 1,

        };
    },


    download: function (e) {
        window.open(e.target.value);
    },

    view: function (e) {
        window.location.href = e.target.value;

    },


    buildItemPanels: function (datalist, type) {
        this.coursePanelChildren = null;
        if (!datalist || !datalist.length) {
            this.coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        this.data = [];

        this.coursePanelChildren = datalist.map((e, i) => {

            let tmpType = e.type;
            if(type != tmpType) return{};

            let content = e.content;

            type +='';
            switch (type) {

                // 2 微课
                case this.FAVTYPE[2][0]:
                    return <Panel header={<span>{content}</span>} key={'fav_weikeitem_' + e.favoriteId}>
                        <div className="bnt2_tex">
                                <span><span className="col1">创建人：</span><span
                                    className="col2">{e.material.user.userName}</span></span>
                            <span><span className="col1">上传时间：</span><span
                                className="col2">{getLocalTime(e.material.createTime)}</span></span>
                        </div>
                        <div className="bnt2_right">
                            <a target="_blank" title="查看" className="right_ri" href={e.address}><Button
                                icon="eye-o"/></a>
                            <a target="_blank" title="取消收藏" className="right_ri" 
                                 onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)}><Button icon="star-o"/></a>
                        </div>
                    </Panel>
                    break;


                // 3 讲义
                case this.FAVTYPE[3][0]:
                    return <Panel header={<span>{content}</span>} key={'fav_jiangyiitem_' + e.favoriteId}>
                        <div className="bnt2_tex">
                                <span><span className="col1">创建人：</span><span
                                    className="col2">{e.material.user.userName}</span></span>
                            <span><span className="col1">上传时间：</span><span
                                className="col2">{getLocalTime(e.material.createTime)}</span></span>
                        </div>
                        <div className="bnt2_right">
                            <a target="_blank" title="下载" className="right_ri" href={e.material.path}
                               download={e.material.path}><Button icon="download"/></a>
                            <a target="_blank" title="查看" className="right_ri" href={e.address}><Button
                                icon="eye-o"/></a>
                            <a target="_blank" title="取消收藏" className="right_ri"
                               onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)} ><Button icon="star-o"/></a>
                        </div>
                    </Panel>
                    break;


            }
        });

        return

    },
    //列表分页响应事件
    pageOnChange(pageNo) {

        this.setState({
            currentPage: pageNo,
        });
    },


    render: function () {
        console.log('buildItemPanels');
         this.buildItemPanels(this.props.param.data, this.props.param.type);
        return ( <div>
            <Collapse defaultActiveKey={this.activeKey}>{ this.coursePanelChildren }</Collapse>
        </div> );
    },

});

export default FavoriteItem;
