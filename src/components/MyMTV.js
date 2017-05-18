import React from 'react';
import ReactDOM from 'react-dom';
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
        this._updateLiveInfos = this._updateLiveInfos.bind(this);
    }

    componentWillMount() {
        this._updateLiveInfos();
    }

    getLiveInfoByUid(fn, param) {
        param = param || {
                method: this.state.method,
                ident: this.state.ident,
                pageNo: this.state.pageNo
            };

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


    _updateLiveInfos() {
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

                _this._updateLiveInfos();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }


    downloadLiveVideos(arr) {

        if (!arr.liveVideos.length) {
            message.info('无效的视频地址！');
            return;
        }
        let ifrArr = [];
        for (let i = 0; i < arr.liveVideos.length; i++) {
            let obj = arr.liveVideos[i];

            ifrArr.push(<iframe src={obj.path} key={'download_' + i}/> );
        }
        ReactDOM.render(<div>{ifrArr}</div>, document.querySelector('.downloadArea'));
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
            mode: 'flv',
            width: '400px',
        }

        LP.Start(obj);

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
            let startTime = getLocalTime(e.startTime);
            let title = e.title;
            let user = e.user;
            let userName = user.userName;
            let courseName = e.courseName;
            let id = e.id;
            let keyIcon;
            let delButton;
            let downloadBtn;
            if (e.password) {
                keyIcon = <span className="focus_btn key_span"><i className="iconfont key">&#xe621;</i></span>;
            }
            if (user.colUid == sessionStorage.getItem("ident")) {
                //如果是当前用户，可以删除自己的直播课
                delButton = <Button icon="delete" className="star_del" onClick={ () => {
                    this.deleteLiveVideos(id)
                } }/>
                downloadBtn = <Button icon="download" className="star_del" onClick={ () => {
                    this.downloadLiveVideos(e)
                } }/>
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
							<span className="live_color live_orange right_ri live_span_2">{courseName}</span>    
                        </li>
                        <li>
                            
                            {delButton}
                            {downloadBtn}
							{keyIcon}
							<span className="time right_ri">{startTime}</span>
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
        return ( <div>
                <div className="public—til—blue">我的直播课</div>
                <div className="favorite_scroll favorite_up favorite_le_h">{coursePanelChildren}</div>
            </div>
        );
    }

}
;

export default MyMTV;
