import React from 'react';
import ReactDOM from 'react-dom';
import {Card, Button, message, Breadcrumb, Icon, Pagination, Modal} from 'antd';
import {getLocalTime} from '../utils/utils';
import {getPageSize, isEmpty} from '../utils/Const';
import {doWebService} from '../WebServiceHelper';

let coursePanelChildren;

class MyMTV extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            data: [],
            pageNo: 1,
            pager: {pageNo: 1, rsCount: 30},
            method: 'getLiveInfoByUid',
            downloadArray: ''
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


    _updateLiveInfos(pageNo) {
        var param = {
            method: this.state.method,
            ident: this.state.ident,
            pageNo: pageNo || this.state.pageNo
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
        if (arr.liveVideos.length == 0) {
            message.info('无效的视频地址！');
            return;
        }

        if (arr.liveVideos.length == 1) {
            var downloadArr = arr.liveVideos;
            document.getElementById(downloadArr[0].id + '_download').click();
            return;
        }

        var array = [];
        arr.liveVideos.forEach(function (v, i) {
            array.push(
                <div className='noom_downloadLive_item'>
                    <div className='noom_downloadLive_span'>
                        <div className="noom_downloadLive_title">{arr.title}</div>
                        <div className="noom_downloadLive_cont">
                            <span className='noom_downloadLive_name'>{arr.schoolName}</span>
                            <span className='noom_downloadLive_name'>{arr.courseName}</span>
                        </div>
                    </div>

                    <a className='noom_downloadLive' href={v.path} target="_blank" title="下载"
                       download={v.path}>
                        <Icon type="download" className="noom_downloadLive_i" /></a>

                </div>
            )

        });

        //打开model
        this.setState({downloadArray: array, fileDownLoadModalVisible: true});

        // var downloadArr = arr.liveVideos;
        // for (var i = 0; i < downloadArr.length; i++) {
        //     // console.log(document.getElementById(downloadArr[i].id + '_download'));
        //     document.getElementById(downloadArr[i].id + '_download').click();
        // }
        // let ifrArr = [];
        // for (let i = 0; i < arr.liveVideos.length; i++) {
        //     let obj = arr.liveVideos[i];
        //
        //     // ifrArr.push(<iframe src={obj.path} key={'download_' + i}/>);
        //     ifrArr.push(<a href={obj.path} key={'download_' + i} className="noom_downLoad" download="help"></a>);
        // }
        // ReactDOM.render(<div>{ifrArr}</div>, document.querySelector('.downloadArea'));
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
            let downloadnoom = [];
            if (e.password) {
                keyIcon = <span className="key_span"><i className="iconfont key">&#xe621;</i></span>;
            }
            if (user.colUid == sessionStorage.getItem("ident")) {
                //如果是当前用户，可以删除自己的直播课
                delButton = <Button icon="delete" className="star_del" onClick={() => {
                    this.deleteLiveVideos(id)
                }}/>
                downloadBtn = <Button icon="download" className="star_del" onClick={() => {
                    this.downloadLiveVideos(e)
                }}/>
                if (e.liveVideos.length == 1) {
                    let obj = liveVideos[0];
                    downloadnoom.push(<a href={obj.path} key={'download_' + 0} id={obj.id + '_download'}
                                         download="help"></a>);
                }
            }
            let liveCard = <Card className="live">
                <p className="h3">{title}</p>
                <div className="live_img" id={id} onClick={() => {
                    this.view(e)
                }}>
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
                            {downloadnoom}
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

    /**
     * 关闭文件下载窗口
     */
    fileDownLoadModalHandleCancel = () => {
        this.setState({fileDownLoadModalVisible: false});
    }

    render() {

        this.buildFavShipionUi();
        return ( <div>
                <div className="public—til—blue">我的直播课</div>
                <div className="favorite_scroll2 favorite_up favorite_le_h">{coursePanelChildren}</div>
                <Pagination total={this.state.pager.rsCount}
                            pageSize={getPageSize()}
                            current={this.state.pager.pageNo}
                            onChange={this._updateLiveInfos}/>

                <Modal title="文件下载列表"
                       visible={this.state.fileDownLoadModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={this.fileDownLoadModalHandleCancel}
                       footer={null}
                       width={450}
                >
                    <div className="noom_downloadLive_div">
                        {this.state.downloadArray}
                    </div>
                </Modal>

            </div>
        );
    }

}
;

export default MyMTV;
