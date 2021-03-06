import React from 'react';
import {Button, Pagination,Card} from 'antd';
import {getPageSize} from '../utils/Const';
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
const FavoriteOtherItems = React.createClass({

    getInitialState() {
        return {
            ident: sessionStorage.getItem("ident"),
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

        let urlRef = url.split('/Excoord_PC/')[1];
        if (urlRef) {
            url = "/proxy/Excoord_PC/" + urlRef;
        }

        let obj ={
            title:tit,
            url:url,
            width:'400px'
        }

        this.props.onPreview(obj)

    },

    getUrl(eObj){

        if(!eObj.material || !eObj.material.name){
            return eObj.address;
        }

        let fileType = eObj.material.name.split(".")[1];
        switch (fileType.toLowerCase()) {
            case 'pptx':
                return eObj.material.htmlPath;
                break;
            case 'ppt':
                return eObj.material.htmlPath;
                break;
            case 'pdf':
                return eObj.material.path;
                break;
            default :
                return eObj.address;

        }

    },


    buildFavOtherUi: function (courseWareList) {

        coursePanelChildren = null;
        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }
        coursePanelChildren = courseWareList.map((e, i) => {

            let content = e.content;

            let cancelBtn = '';

            if (this.state.ident == this.props.userid) {
                cancelBtn = <a target="_blank" title="取消收藏" onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)} className="right_ri"><Button className="ant-btn right_ri focus_btn focus_5" icon="star"/></a>;
            }

            return <Card key={e.id} className="focus_lb">
						<a target="_blank" onClick={event => {this.view(event,this.getUrl(e),e.content)} } className="attention_img"><img src={e.cover} width="100%"/></a>
						<div className="custom-card focus_2">
							<div className="focus_1">
								<a  onClick={event => {this.view(event,this.getUrl(e),e.content)} }  className="antnest_name focus_3" >{content}</a>
                                {cancelBtn}
							</div>
							<div className="focus_3"> {getLocalTime(e.time)}</div>
						</div>

            </Card>

        });

    },


    render: function () {
        this.buildFavOtherUi(this.props.param.data);
        return (
            <div className="favorite_scroll">
            <div className="favorite_up guanzhu topics_calc">
                {coursePanelChildren}
            </div>
                    <Pagination total={this.props.param.totalCount} pageSize={getPageSize()} current={this.props.param.currentPage} onChange={this.props.pageChange} />

            </div>
        );
    },

});

export default FavoriteOtherItems;
