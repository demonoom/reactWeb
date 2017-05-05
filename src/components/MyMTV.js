import React from 'react';
import {Card, Button,message,Breadcrumb,Icon} from 'antd';
import {getLocalTime} from '../utils/utils';
import {doWebService} from '../WebServiceHelper';

let coursePanelChildren;

class MyMTV extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            data: [],
            pageNo: 1,
             method:'getLiveInfoByUid'
        };
        this.changeState = this.changeState.bind(this);
    }

    componentWillMount() {
        this.tabClick(1);
    }

    getDate(fn, param) {
        debugger
        var args = {
            "method": param.method,
            "userId": param.ident,
            "type": param.type,
            "pageNo": param.pageNo
        };
        var _this = this;
        doWebService(JSON.stringify(args), {
            onResponse: function (res) {
                debugger
                if (!res.success) {
                    message.error(res.msg);
                    return;
                }
                if (res.pager.rsCount) {
                    args.data = res.response || [];
                    args.pager = res.pager || [];
                    debugger
                    if (fn) fn.call(_this, args);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    changeState(args){

        this.setState({...args});

    }

    tabClick(type) {

        var param = {
            method: this.state.method,
            ident: this.state.ident,
            pageNo: this.state.pageNo
        }
        this.getDate(this.changeState, param);
    }

    cancelFav(address, fn) {
        var _self = this;
        var args = {
            "method": 'removeFavorite',
            "userId": _self.state.ident,
            "address": address
        };

        doWebService(JSON.stringify(args), {
            onResponse: function (res) {
                message.info(res.msg);
                if (!!fn) fn(_self.props.param.type);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    buildFavShipionUi( ) {

       let  courseWareList = this.state.data;
            coursePanelChildren = null;

        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        coursePanelChildren = courseWareList.map((e, i) => {

            let content = e.content;
            let refkey = e.type + "#" + e.favoriteId;

            return <Card style={{width: 240, display: 'inline-block'}} bodyStyle={{padding: '5px'}} key={refkey}>
                <div className="custom-image">
                    <a href={e.address} target="_blank"> <img alt="example" width="100%" src={e.cover}/></a>
                </div>
                <div className="custom-card">
                    <p><a target="_blank" title="查看" href={e.address}><Button icon="eye-o"/></a>
                        <a target="_blank" title="取消收藏"
                           onClick={this.props.onCancelfavrite.bind(this, e.address, this.props.upgradeData)}><Button
                            icon="star"/></a>
                    </p>
                    <h3>{content}</h3>
                    <p>学校：{e.liveInfo.schoolName}</p>
                    <p>上传者：{e.liveInfo.user.userName}</p>
                    <p>时间：{getLocalTime(e.liveInfo.startTime)}</p>
                </div>
            </Card>

        });

    }

    //列表分页响应事件
    pageOnChange(pageNo) {

        this.setState({
            currentPage: pageNo,
        });
    }

    render() {

        this.buildFavShipionUi();

        let breadcrumb = <Breadcrumb separator=">">
            <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
            <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
            <Breadcrumb.Item href="#/MainLayout">我的直播课</Breadcrumb.Item>
        </Breadcrumb>;

        if(this.props.hideBreadcrumb){
            breadcrumb = null;
        }

        return ( <div>
                {breadcrumb}
                {coursePanelChildren}
            </div>
        );
    }

}
;

export default MyMTV;
