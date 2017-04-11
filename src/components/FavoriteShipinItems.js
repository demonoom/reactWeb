import React from 'react';
import {Pagination, Button} from 'antd';
import {getLocalTime} from '../utils/utils';

let coursePanelChildren;
// 我的收藏类型
const FAVTYPE = {
    OTHER: '0',
    SUBJECT: '1',
    WEIKE: '2',
    JIANGYI: '3',
    SHIPIN: '4'
}
const FavoriteShipinItems = React.createClass({

    getInitialState() {
        return {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            type: FAVTYPE.SHIPIN,
            data: [],
            pageNo: 1
        };
    },

    activeKey: [],


    download: function (e) {
        window.open(e.target.value);
    },

    view: function (e) {
        window.location.href = e.target.value;

    },

    buildFavShipionUi: function (courseWareList) {
        coursePanelChildren = null;
        console.log("Favorite shipin Items.");
        this.activeKey = [];
        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        coursePanelChildren = courseWareList.map((e, i) => {
            let content = e.content;
            let refkey = e.type + "#" + e.favoriteId;
            this.activeKey.push(refkey);
            return <div className="ant-card-body">
                <div style={{width: 240, display: 'inline-block'}} bodyStyle={{padding: '5px'}} key={refkey}>
                    <div className="custom-image">
                        <a href={e.address} target="_blank"><img alt="example" className="attention_img" width="100%"
                                                                 src={e.cover}/></a>
                    </div>
                    <div className="custom-card">
                        <p><a target="_blank" title="查看" href={e.address}><Button icon="eye-o"/></a>
                            <a target="_blank" title="取消收藏"
                               onClick={this.props.onCancelfavrite.bind(this, e.address, this.props.upgradeData)}><Button
                                icon="star"/></a>
                        </p>
                        <h3>{content}</h3>
                    </div>
                </div>
            </div>
        });

    },

    //列表分页响应事件
    pageOnChange(pageNo) {

        this.setState({
            currentPage: pageNo,
        });
    },


    render: function () {
        console.log('buildFavShipionUi');
        this.buildFavShipionUi(this.props.param.data, this.props.param.type);
        return (
            <div>
                {coursePanelChildren}
                <Pagination onChange={this.props.pageChange} total={this.props.param.total}
                            current={this.props.param.pageNo} defaultCurrent={1}/>
            </div>
        );
    },

});

export default FavoriteShipinItems;
