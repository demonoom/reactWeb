import React from 'react';
import {Card, Button, message, Breadcrumb, Icon} from 'antd';
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
            method: 'getLiveInfoByUid'
        };
        this.changeState = this.changeState.bind(this);
    }

    componentWillMount() {
        this.tabClick(1);
    }

    getLiveInfoByUid(fn, param) {
        var args = {
            "method": param.method,
            "userId": param.ident,
            "type": param.type,
            "pageNo": param.pageNo
        };
        var _this = this;
        doWebService(JSON.stringify(args), {
            onResponse: function (res) {

                if (!res.success) {
                    message.error(res.msg);
                    return;
                }
                if (res.pager.rsCount) {
                    args.data = res.response || [];
                    args.pager = res.pager || [];

                    if (fn) fn.call(_this, args);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    changeState(args) {

        this.setState({...args});

    }


    getLocalTime(nS) {
        return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
    }

    tabClick(type) {

        var param = {
            method: this.state.method,
            ident: this.state.ident,
            pageNo: this.state.pageNo
        }
        this.getLiveInfoByUid(this.changeState, param);
    }

    deleteLiveVideos(id) {
        let _this = this;
        var param = {
            "method": 'delLiveInfo',
            "userId": this.state.ident,
            "liveIds": id
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success) {
                    message.success("直播课删除成功");
                } else {
                    message.error("直播课删除失败");
                }

                _this.getLiveInfoByUid(_this.state.ident, 1);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    onPreview(obj) {
        LP.Start(obj);
    }


    view(objref) {

        if (!objref.liveVideos[0]) {
            message.info("无效的视频！");
            return;
        }

        let obj = {
            title: objref.title,
            url: "",
            param: objref.liveVideos,
            htmlMode: true,
            width: '400px',
        }

        this.onPreview(obj)

    }

    buildFavShipionUi() {

        let courseWareList = this.state.data;
        coursePanelChildren = null;

        if (!courseWareList || !courseWareList.length) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }
        var userLiveData = [];
        coursePanelChildren = courseWareList.map((e, i) => {

            let liveCover = e.liveCover;
            let cover = liveCover.cover;
            let liveVideos = e.liveVideos;
            let schoolName = e.schoolName;
            let startTime = this.getLocalTime(e.startTime);
            let title = e.title;
            let user = e.user;
            let userName = user.userName;
            let courseName = e.courseName;
            let id = e.id;
            let keyIcon = '';
            if (e.password) {
                keyIcon = <span className="right_ri focus_btn key_span"><i className="iconfont key">&#xe621;</i></span>;
            }
            let delButton;
            if (user.colUid == sessionStorage.getItem("ident")) {
                //如果是当前用户，可以删除自己的直播课
                delButton = <Button icon="delete" className="right_ri star_del" onClick={  () => {
                    this.deleteLiveVideos(id, e)
                } }></Button>
            }
            let liveCard = <Card className="live">
                <p className="h3">{title}</p>
                <div className="live_img" id={id} onClick={ () => {
                    this.view(e)
                } }>
                    <img className="attention_img" width="100%" src={cover}/>
                    <div className="live_green"><span>{schoolName}</span></div>
                </div>
                <div className="custom-card">
                    <ul className="live_cont">
                        <li className="li_live_span_3">
                            <span className="attention_img2"><img src={user.avatar}></img></span>
                            <span className="live_span_1 live_span_3">{userName}</span>
                            <span className="right_ri live_span_2">{startTime}</span>
                        </li>
                        <li>
                            <span className="live_color live_orange">{courseName}</span>
                            {keyIcon}
                            {delButton}
                        </li>
                    </ul>
                </div>
            </Card>;
            userLiveData.push(liveCard);
            return liveCard;


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

        if (this.props.hideBreadcrumb) {
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
