/**
 * Created by madapeng on 17-5-22.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import {Card, Row, message, Col, Icon, Input, Modal, Pagination} from 'antd';
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
        this.currentTab = 'liveTV_tab';
        this.view = this.view.bind(this);
        this.change = this.change.bind(this);
        this._getLives = this._getLives.bind(this);
        this._buildLivesUi = this._buildLivesUi.bind(this);
        this._getHistoryLives = this._getHistoryLives.bind(this);
        this.videoPwdModalHandleOk = this.videoPwdModalHandleOk.bind(this);
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

    _getHistoryLives(cityCode, schoolId, kemu, pageNo, fn) {

        let _this = this;
        var param = {
            "method": 'getLivedLiveInfos',
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
                    _this.view(item,_this.currentTab)
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


    view(objref,tab) {
        let _this = this;
        let title = objref.liveCover.user.userName + '正在直播';
        let obj = {
            title: title,
            livelurl: "",
            panelurl: "",
            param: {uid: this.state.ident, vid: objref.vid},
            mode: tab.replace('_tab','')
        }
        if (objref.password) {
            let password = objref.password;
            // 显示弹窗
            Modal.confirm({
                title: '请输入密码',
                content: <Input id="tmppwd"/>,
                okText: '确定',
                cancelText: '取消',
                onOk: _this.videoPwdModalHandleOk.bind(_this, password, obj),
            });

        } else {
            LP.Start(obj);
        }


    }

    videoPwdModalHandleOk(pwd, obj) {

        if (pwd == $('#tmppwd').val()) {
            LP.Start(obj);
        } else {
            message.warn('密码错误!')
        }

    }

    change(type) {

        this.currentTab = type+'_tab';
        switch (type) {
            case 'liveTV':

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
            <ul className={this.currentTab + " pabulum"} >
                <li className='liveTV' onClick={() => {
                    this.change('liveTV')
                }}><i className="iconfont menu_left_i">&#xe609;</i>直播课堂
                </li>
                <li className='history' onClick={() => {
                    this.change('history')
                }}><i className="iconfont menu_left_i">&#xe602;</i>历史回顾
                </li>
            </ul>
        </div>;

        let livePanel = <div>
            <div className="public—til—blue">直播课堂</div>
            <div className="favorite_scroll2 favorite_up favorite_le_h">{this.livesUi}</div>
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
