/**
 * Created by madapeng on 17-5-22.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Card, Row, message, Col, Icon, Pagination} from 'antd';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';


class LiveTV extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            lives: [],
            pageNo: 1,
        };
        this.view = this.view.bind(this);
        this.change = this.change.bind(this);
        this._getLives = this._getLives.bind(this);
        this._buildLivesUi = this._buildLivesUi.bind(this);
        this._getHistoryLives = this._getHistoryLives.bind(this);
    }

    componentWillMount() {
        this._getLives(1);

    }


    _getLives(pageNo, fn) {
        let _this = this;
        var param = {
            "method": 'getLiveInfos',
            "pageNo": pageNo || 1,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success && !res.response.length) {
                    message.info("没有直播课堂！");
                    return;
                }
                if (fn) fn(res.response);
                _this.setState({lives: res.response, ...res.pager});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    _getHistoryLives(cityCode,schoolId,kemu,pageNo, fn) {
        let _this = this;
        var param = {
            "method": 'getLivedLiveInfos',
            "cityCode": xxxxx,
            "schoolId": xxxxxxxx,
            "kemu": xxxxx,
            "pageNo": pageNo || 1,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success && !res.response.length) {
                    message.info("没有直播课堂！");
                    return;
                }
                if (fn) fn(res.response);
                _this.setState({lives: res.response, ...res.pager});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }


    _buildLivesUi(dataArr) {

        this.livesUi = null;
        let _this = this;

        if (!dataArr || !dataArr.length) {
            this.livesUi = <img className="noDataTipImg" src={require('../images/noDataTipImg.png')}/>;
            return;
        }


        this.livesUi = dataArr.map(function (item) {

            let keyIcon;
            let id = item.id;
            let user = item.user;
            let title = item.title;
            let userName = user.userName;
            let cover = item.liveCover.cover;
            let schoolName = item.schoolName;
            let courseName = item.courseName;
            let startTime = getLocalTime(item.startTime);

            if (item.password) {
                keyIcon = <span className="key_span"><i className="iconfont key">&#xe621;</i></span>;
            }

            return <Card className="live" key={id}>
                <p className="h3">{title}</p>
                <div className="live_img" id={id} onClick={ () => {
                    _this.view(item)
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
                            {keyIcon}
                            <span className="time right_ri">{startTime}</span>
                        </li>
                    </ul>
                </div>
            </Card>;

        });

    }


    view(objref) {

        // if (!objref.liveVideos[0]) {
        //     message.info("无效的视频！");
        //     return;
        // }

        let obj = {
            title: objref.title,
            url: "",
            param: 'XXXXXXX直播课堂',
            mode: 'liveTV',
        }

        LP.Start(obj);

    }


    change(type) {


        switch (type) {
            case 'live':
                this._getLives(1);
                break;
            case 'history':
                this._getHistoryLives(1);
                break;
        }


    }

    render() {
        this._buildLivesUi(this.state.lives);

        let liveNav = <div>
            <div className="menu_til">营养池</div>
            <ul className="pabulum">
                <li className="select" onClick={() => {
                    this.change('live')
                }}><i className="iconfont menu_left_i">&#xe609;</i>直播课堂
                </li>
                <li onClick={() => {
                    this.change('history')
                }}><i className="iconfont menu_left_i">&#xe602;</i>历史回顾
                </li>
            </ul>
        </div>;

        let livePanel = <div>
            {this.livesUi}
            <Pagination total={this.state.pageCount} pageSize={getPageSize()} onchange={this._getLives}/>
        </div>;

        return (
            <Row>
                <Col span={5}>
                    {liveNav}
                </Col>
                <Col span={19}>
                    {livePanel}
                </Col>
            </Row>
        );
    }
}

export default LiveTV;
