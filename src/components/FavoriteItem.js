import React from 'react';
import {  Pagination, Collapse, Button, message, Modal} from 'antd';
import {getPageSize} from '../utils/Const';
import {getLocalTime} from '../utils/utils';

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
        this.activeKey = [];

        this.coursePanelChildren = datalist.map((e, i) => {
            if(type != e.type) return{};


            //
            //
            let content = e.content;
            type +='';
            let key = type +'-'+e.favoriteId;
            this.activeKey.push( key );
            switch (type) {


                // 2 微课
                case '2':
                    return <Panel header={<span>{content}</span>} key={ key } >
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
                case '3':
                    return <Panel header={<span>{content}</span>} key={ key }>
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



    render: function () {
        console.log('buildItemPanels');
         this.buildItemPanels(this.props.param.data, this.props.param.type);

        var CollapseStyle = {
           height:"360px"
        };

        return ( <div>
                <div>
                	<Collapse defaultActiveKey={this.activeKey} activeKey={this.activeKey} style={CollapseStyle}>{ this.coursePanelChildren }</Collapse>
                </div>
            	<Pagination total={this.props.param.totalCount} pageSize={getPageSize()} current={this.props.param.currentPage} onChange={this.props.pageChange} />
        </div> );
    },

});

export default FavoriteItem;
