import React from 'react';
import {Pagination, Input, Modal, message} from 'antd';
import {getLocalTime} from '../utils/utils';
import {getPageSize} from '../utils/Const';


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
            ident: sessionStorage.getItem("ident"),
            type: FAVTYPE.SHIPIN,
            data: [],
            pageNo: 1,
            videoPwdModalVisible: false,
        };
        this.coursePanelChildren = {};
        this.videoPwdModalHandleOk = this.videoPwdModalHandleOk.bind(this);
        this.buildFavShipionUi = this.buildFavShipionUi.bind(this);
        this.confirmVideoPwd = this.confirmVideoPwd.bind(this);
        this.view = this.view.bind(this);
    },

    activeKey: [],

    download: function (e) {
        window.open(e.target.value);
    },

    view: function (objref) {

        if (!objref.liveInfo.liveVideos[0]) {
            message.info("无效的视频！");
            return;
        }

        let url = objref.liveInfo.liveVideos[0].path;

        let obj = {
            title: objref.content,
            url: url,
            param: objref,
            mode: 'html',
            width: '400px',

        }

        this.props.onPreview(obj);


    },


    confirmVideoPwd: function (obj) {

        if (this.state.ident !== this.props.userid) {
            return this.view(obj);
        }
        var password = obj.liveInfo.password;

        if (password) {
            let _this = this;
            Modal.confirm({
                title: '请输入密码',
                content: <Input id="tmppwd"  />,
                okText: '确定',
                cancelText: '取消',
                onOk: this.videoPwdModalHandleOk.bind(_this, password, obj),
            });
        } else {
            this.view(obj);
        }


    },

    videoPwdModalHandleOk: function (pwd, obj) {

        if (pwd == $('#tmppwd').val()) {
            this.view(obj);
        } else {
            message.warn('密码错误!')
        }

    },

    buildFavShipionUi: function () {
        let courseWareList = this.props.param.data;
        this.coursePanelChildren = null;

        this.activeKey = [];
        if (!courseWareList || !courseWareList.length) {
            this.coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        this.coursePanelChildren = courseWareList.map((e, i) => {

            let content = e.content;
            let refkey = e.favoriteId;
            let password = e.liveInfo.password;
            let showCancelBtn = this.state.ident == this.props.userid ? true : false;

            let showKeyIcon = password ? true : false;

            return <div className="ant-card live ant-card-bordered" key={refkey}>
                <div >
                    <p className="live_h3">{content}</p>
                    <div className="live_img">
                        <a onClick={()=>{this.confirmVideoPwd(e)} } target="_blank">
                            <img alt="example" className="attention_img" width="100%" src={e.cover}/>
                        </a>
                        <div className="live_green"><span>{e.liveInfo.user.schoolName}</span></div>
                    </div>
                    <div className="custom-card">
                        <ul className="live_cont">
                            <li className="li_live_span_3">
                                <span className="attention_img2"><img style={{width: '30px', height: '30px', border: 0}}
                                                                      src={e.liveInfo.user.avatar}></img></span>
                                <span className="live_span_1 live_span_3">{e.liveInfo.user.userName}</span>
                                <span className="right_ri live_span_2">{getLocalTime(e.liveInfo.startTime)}</span>
                            </li>
                            <li>
                                <span className="live_color live_orange">{e.liveInfo.courseName}</span>
                                <a className={showCancelBtn ? 'show' : 'hide'  } target="_blank" title="取消收藏"
                                   onClick={()=>{this.props.onCancelfavrite(  e.address, this.props.upgradeData)}} >
                                    <span className="right_ri focus_btn star_span"><i
                                        className="iconfont star">&#xe646;</i></span>
                                </a>
                                <span
                                    className={showKeyIcon ? 'right_ri focus_btn key_span show' : 'right_ri focus_btn key_span hide'  }><i
                                    className="iconfont key">&#xe621;</i></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        });

    },


    render: function () {
        this.buildFavShipionUi();
        return (
            <div className="favorite_scroll">
                <div className="favorite_up topics_calc">
                    {this.coursePanelChildren}
                </div>
                <Pagination total={this.props.param.totalCount} pageSize={getPageSize()}
                            current={this.props.param.currentPage} onChange={this.props.pageChange}/>
            </div>


        );

    },


});

export default FavoriteShipinItems;
