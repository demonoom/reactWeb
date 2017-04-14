import React from 'react';
import {Button, Pagination, message,Card} from 'antd';
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
            width:'380px'
        }

        this.props.onPreview(obj)
    },


    buildFavOtherUi: function (courseWareList) {

        coursePanelChildren = null;
        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }
        coursePanelChildren = courseWareList.map((e, i) => {
            let content = e.content;

            return <Card key={e.id} className="focus">
                    <a target="_blank" onClick={event => {this.view(event,e.address,e.content)} } className="attention_img"><img src={e.cover}/></a>
                    <div className="focus_2">
						<span className="col2 "><a  onClick={event => {this.view(event,e.address,e.content)} }  className="color_gary_f" >{content}</a></span><br/>
                    	<span className="col2"> {getLocalTime(e.time)}</span>
					</div>
                    <span  className="right_ri">
                        <a target="_blank" title="取消收藏" onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)} ><Button className="ant-btn right_ri focus_btn live_span_2" icon="star-o"/></a>
					</span>

            </Card>

        });

    },


    render: function () {
        console.log('buildFavOtherUi');
        this.buildFavOtherUi(this.props.param.data);
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

export default FavoriteOtherItems;
