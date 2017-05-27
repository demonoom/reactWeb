/**
 * Created by madapeng on 17-5-22.
 */

import React from 'react';
import {Card, Row, message, Col, Input, Button, Modal, Pagination} from 'antd';
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
            rsCount: 0,
        };
        this.titleUi = null;
        this.searchUi = null;
        this.currentTab = 'liveTV_tab';
        this.view = this.view.bind(this);
        this.change = this.change.bind(this);
        this._getLives = this._getLives.bind(this);
        this._changePage = this._changePage.bind(this);
        this._buildLivesUi = this._buildLivesUi.bind(this);
        this._buildListTitle = this._buildListTitle.bind(this);
        this._getHistoryLives = this._getHistoryLives.bind(this);
        this._searchHistoryLives = this._searchHistoryLives.bind(this);
        this._okViewHistoryLive3 = this._okViewHistoryLive3.bind(this);
        this.videoPwdModalHandleOk = this.videoPwdModalHandleOk.bind(this);
        this.historySearch_Ui_build = this.historySearch_Ui_build.bind(this);
        this._preRequestHistorySearch = this._preRequestHistorySearch.bind(this);
        this._validateHistoryLiveTvPwd = this._validateHistoryLiveTvPwd.bind(this);
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

    // 历史回顾
    _getHistoryLives2(pageNo, fn) {

        let _this = this;
        var param = {
            "method": 'getLivedLiveInfos',
            "pageNo": pageNo || 1,
            "cityCode": '',
            "schoolId": '',
            "kemu": '',
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {

                if (res.success && !res.response.length) {
                    message.info("没有历史回顾！");
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


// 获取所有直播过的直播主题
    _getHistoryLives(pageNo, fn) {

        let _this = this;
        var param = {
            "method": 'getLivedLiveInfos',
            "pageNo": pageNo || 1,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {

                if (res.success && !res.response.length) {
                    message.info("没有历史回顾！");
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


    // 历史回顾推送的图片
    _getHistoryLiveInfos(objParam, fn) {
        let _this = this;
        var param = {
            "method": 'getHandOutsByVid',
            "vid": objParam.vid,
            "pageNo": 1,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (fn) fn(objParam, res.response);
            },
            onError: function (error) {
                message.error(error);
            }
        });

    }

    _okViewHistoryLive3(objref, dataArr) {

        let obj = {
            title: objref.title,
            livelurl: "",
            panelurl: "",
            param: {
                uid: this.state.ident,
                vid: objref.vid,
                tuipingImgArr: dataArr,
                objref: objref,
                LivedVideos: objref.liveVideos
            },
            mode: 'history'
        }


        LP.Start(obj);

    }

    _validateHistoryLiveTvPwd(objref, pwd) {
        if (pwd == $('#tmppwd2').val()) {
            this._getHistoryLiveInfos(objref, this._okViewHistoryLive3);
        } else {
            message.warn('密码错误!')
        }
    }

    _viewHistoryLiveTV(objref) {

        let _this = this;
        if (objref.password) {
            let password = objref.password;
            // 显示弹窗
            Modal.confirm({
                title: '请输入密码',
                content: <Input id="tmppwd2"/>,
                okText: '确定',
                cancelText: '取消',
                onOk: _this._validateHistoryLiveTvPwd.bind(_this, objref, password),
            });

        } else {
            this._getHistoryLiveInfos(objref, this._okViewHistoryLive3);
        }


    }

    _viewLive11(){


    }

    // 获取历史搜索直播课信息
    _preRequestHistorySearch(objref){
        this._viewHistoryLiveTV(objref);
    }

    view(objref) {
        let _this = this;
        let title = null;
        let mode = this.currentTab.replace('_tab', '');

        switch (mode){
            case 'history':
                this._viewHistoryLiveTV(objref);
                return;
                break;
            case 'historySearch':
                this._preRequestHistorySearch(objref);
                return;
                break;
            case 'liveTV':
                this._viewLive11(objref);
                title = objref.liveCover.user.userName + '正在直播';
                break;


        }


        let obj = {
            title: title,
            livelurl: "",
            panelurl: "",
            param: {uid: this.state.ident, vid: objref.vid},
            mode: mode
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

        this.currentTab = type + '_tab';
        switch (type) {
            case 'liveTV':
                this._getLives(1);
                break;
            case 'history':
                this._getHistoryLives2(1);
                break;
        }


    }


    _changePage(pageno) {
        switch (this.currentTab) {
            case 'liveTV_tab':
                this._getLives(pageno);
                break;
            case 'history_tab':
                this._getHistoryLives2(pageno);
                break;
        }
    }

    _searchHistoryLives(e) {
        let _this = this;
        let txt = $('#searchTxt').val();
        if (!txt) {
            return;
        }

        var param = {
          //  "method": 'searchLiveInfosByKeywords',
            "method": 'searchLiveInfosBeanByKeywords',
            "keywords": txt,
            "pageNo": 1,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
              //  _this.currentTab = 'historySearch_tab';
                _this.setState({lives: res.response, ...res.pager});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    }


    _buildListTitle() {

        switch (this.currentTab) {
            case 'liveTV_tab':
                this.titleUi = <div className="public—til—blue">直播课堂</div>;
                break;
            case 'history_tab':
				this.titleUi = <div className="public—til—blue">
					<div className="search">
                    	<Input id="searchTxt" type="text" placeholder="请输入历史课堂标题！" onPressEnter={(e) => {
                        	this._searchHistoryLives()
                   		 }}/>
                    	<Button icon="search" onClick={(e) => {
                        	this._searchHistoryLives()
                    	}}>搜索</Button>
                	</div>
				</div>;
                break;
            case 'historySearch_tab':
                this.titleUi = <div className="public—til—blue">历史课堂回顾搜索列表</div>;
                this.searchUi = <div>
                    <Input id="searchTxt" type="text" placeholder="请输入历史课堂标题！" onPressEnter={(e) => {
                        this._searchHistoryLives()
                    }}/>
                    <Button icon="search" onClick={(e) => {
                        this._searchHistoryLives()
                    }}>搜索</Button>
                </div>;
                break;
        }

    }

    historySearch_Ui_build() {
        let dataArr = this.state.lives;
        this.livesUi = null;
        let _this = this;

        //
        //
        //
        this.livesUi = dataArr.map(function (item) {
debugger
            let id = item.liveInfoId;
            let liveInfoTitle = item.liveInfoTitle;
            let schoolName = item.schoolName;
            let teacherName = item.teacherName;
            let courseName = item.courseName;
            let teacherFace = item.teacher.avatar;

            return <Card className="live" key={id}>
                <p className="h3">{liveInfoTitle}</p>
                <div className="live_img" id={id} onClick={ () => {
                    _this.view(item)
                } }>
                    <img className="attention_img" width="100%" src={teacherFace}/>
                    <div className="live_green">
                        <span>{schoolName}</span>
                        <span>{teacherName}</span>
                        <span>{courseName}</span>
                    </div>
                </div>
            </Card>;

        });


    }
    _buildLivesUi() {
        let dataArr = this.state.lives;
        this.livesUi = null;
        let _this = this;
        if (!dataArr || !dataArr.length) {
            this.livesUi = <img className="noDataTipImg" src={require('../images/noDataTipImg.png')}/>;
            return;
        }
        if( this.currentTab=='historySearch_tab' ){
            return this.historySearch_Ui_build();
        }
        //
        //
        //
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

    render() {
        window.log = message;
        this._buildListTitle();
        this._buildLivesUi();

        let liveNav = <div>
            <div className="menu_til">营养池</div>
            <ul className={this.currentTab + " pabulum"}>
                <li className='liveTV' onClick={() => {
                    this.change('liveTV')
                }}><i className="iconfont menu_left_i">&#xe609;</i>直播课堂
                </li>
                <li className='history' onClick={() => {
                    this.change('history')
                }}><i className="iconfont menu_left_i">&#xe602;</i>直播回顾
                </li>
            </ul>
        </div>;

        let livePanel = <div className={this.currentTab} >
            { this.titleUi  }
            { this.searchUi  }
            <div id="searchBeforePanel" className="favorite_scroll2 favorite_up favorite_le_h">{this.livesUi}</div>
            <Pagination total={this.state.rsCount} pageSize={getPageSize()} current={this.state.pageNo}
                        onChange={this._changePage}/>
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
