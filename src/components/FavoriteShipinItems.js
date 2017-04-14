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

    view: function (e,url,tit) {
        e = e || window.event;
        if(e.nativeEvent){
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;
        let obj ={
            title:tit,
            url:url,
            width:'400px',

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
                <div  key={refkey}>
                    <div className="live_img">
                        <a  onClick={event => {this.view(event,e.address,e.content)} }  target="_blank"><img alt="example" className="attention_img" width="100%"
                                                                 src={e.cover}/></a>
                    </div>
                    <div className="custom-card">
						<p className="live_h3">{content}</p>
						<ul className="live_cont">
                                    <li>
                                        <span className="attention_img"><img style={{width:'30px',height:'30px'}} src={user.avatar}></img></span>
                                        <span className="live_span_1">{userName}</span>
                                        <span className="right_ri live_span_2">{startTime}</span>
                                    </li>
                                    <li>
                                        <a target="_blank" title="取消收藏"
										   onClick={this.props.onCancelfavrite.bind(this, e.address, this.props.upgradeData)}><Buttonn icon="star-o"  className="right_ri focus_btn"/>
										</a>
                                    </li>
                                </ul>
                        <p>
                            
                        </p>
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
				<div className="favorite_up">
					{coursePanelChildren}
				</div>
				<Pagination total={this.props.param.totalCount} pageSize={getPageSize()} current={this.props.param.currentPage} onChange={this.props.pageChange} />
            </div>


        );
		
    },
	

});

export default FavoriteShipinItems;
