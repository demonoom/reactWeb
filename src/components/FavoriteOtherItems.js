import React from 'react';
import {Button, Pagination, message} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {getLocalTime} from '../utils/utils';
import UseKnowledge from './UseKnowledgeComponents';

let coursePanelChildren;
// 我的收藏类型
const FAVTYPE = {
    OTHER: '0',
    SUBJECT: '1',
    WEIKE: '2',
    JIANGYI: '3',
    SHIPIN: '4'
}
const FavoriteOtherItems = React.createClass({

    getInitialState() {
        return {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            type: FAVTYPE.OTHER,
            data: [],
            pageNo: 1
        };

    },

    activeKey:[],

    download: function (e) {
        window.open(e.target.value);
    },

    view: function (e) {
        window.location.href = e.target.value;
    },


    buildFavOtherUi: function (courseWareList) {

        coursePanelChildren = null;
        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }
        coursePanelChildren = courseWareList.map((e, i) => {
            let content = e.content;


            return <div key={e.id}>
                <div className="left">
                    <a target="_blank" href={e.address}><img style={{width: '42px'}} src={e.cover}/></a>
                    <span className="col2"><a href={e.address}>{content}</a></span><br/>
                    <span className="col2"> {getLocalTime(e.time)}</span>
                </div>
                <div className="right">
                    <span className="col2">
                        <a target="_blank" title="取消收藏" onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)} ><Button icon="star"/></a></span>
                    <span className="col2">
                        <a target="_blank" title="查看"  href={e.address}><Button icon="eye-o"/></a></span>
                </div>
            </div>
        });

    },


    render: function () {
        console.log('buildFavOtherUi');
        this.buildFavOtherUi(this.props.param.data);
        return (
            <div>
            <div>
                {coursePanelChildren}
            </div>
            <div>
                    <Pagination total={this.props.param.totalCount} pageSize={getPageSize()} current={this.props.param.currentPage} onChange={this.props.pageChange} />
                </div>
            </div>
        );
    },

});

export default FavoriteOtherItems;
