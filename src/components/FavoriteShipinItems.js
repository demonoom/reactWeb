import React from 'react';
import {Pagination, Button} from 'antd';
import {getLocalTime} from '../utils/utils';
import {getPageSize} from '../utils/Const';
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

    view: function (e, url, tit) {
        e = e || window.event;
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;

        let urlRef = url.split('/Excoord_PC/')[1];
        if (urlRef) {
            url = "/proxy/Excoord_PC/" + urlRef;
        }

        let obj = {
            title: tit,
            url: url,
            width: '400px',

        }
        this.props.onPreview(obj)

    },


    buildFavShipionUi: function (courseWareList) {
        coursePanelChildren = null;
        this.activeKey = [];
        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        coursePanelChildren = courseWareList.map((e, i) => {

            let content = e.content;
            let refkey = e.type + "#" + e.favoriteId;
            this.activeKey.push(refkey);
            return <div className="ant-card live ant-card-bordered">
                <div key={refkey}>
				<p className="live_h3">{content}</p>
                    <div className="live_img">
                        <a onClick={event => {
                            this.view(event, e.address, e.content)
                        } } target="_blank"><img alt="example" className="attention_img" width="100%"
                                                 src={e.cover}/></a>
						<div className="live_green"><span>{e.liveInfo.user.schoolName}</span></div>
                    </div>
                    <div className="custom-card">
                        
                        <ul className="live_cont">
                            <li>
                                <span className="attention_img"><img style={{width: '30px', height: '30px'}}
                                                                     src={e.liveInfo.user.avatar}></img></span>
                                <span className="live_span_1">{e.liveInfo.user.userName}</span>
                                <span className="right_ri live_span_2">{getLocalTime(e.liveInfo.startTime)}</span>
                            </li>
                            <li>
                                
                                <span className="live_color live_orange">{e.liveInfo.courseName}</span>
                                <a target="_blank" title="取消收藏"
                                   onClick={this.props.onCancelfavrite.bind(this, e.address, this.props.upgradeData)}>
                                    <Button icon="star" className="right_ri focus_btn"/>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        });

    },


    render: function () {
        console.log('buildFavShipionUi');
        this.buildFavShipionUi(this.props.param.data, this.props.param.type);
        return (
            <div className="favorite_scroll">
                <div className="favorite_up favorite_pa_le topics_calc">
                    {coursePanelChildren}
                </div>
                <Pagination total={this.props.param.totalCount} pageSize={getPageSize()}
                            current={this.props.param.currentPage} onChange={this.props.pageChange}/>
            </div>


        );

    },


});

export default FavoriteShipinItems;
