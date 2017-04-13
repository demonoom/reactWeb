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

    view: function (e) {
        window.location.href = e.target.value;

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
                        <a href={e.address} target="_blank"><img alt="example" className="attention_img" width="100%"
                                                                 src={e.cover}/></a>
                    </div>
                    <div className="custom-card">
						<p className="live_h3">{content}</p>
                        <ul className="live_cont">
							<li>
								<span className="right_ri">
									<a target="_blank" title="查看" href={e.address}><Button icon="eye-o" className="ant-btn focus_btn"/></a>
                            		<a target="_blank" title="取消收藏" className="toobar" onClick={this.props.onCancelfavrite.bind(this, e.address, this.props.upgradeData)}>
										<Button icon="star-o" className="ant-btn focus_btn" />
									</a>
								</span>
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
            <div>
				<div className="topics_calc favorite_up">
					{coursePanelChildren}
				</div>
				<Pagination total={this.props.param.totalCount} pageSize={getPageSize()} current={this.props.param.currentPage} onChange={this.props.pageChange} />
            </div>


        );
		
    },
	

});

export default FavoriteShipinItems;
