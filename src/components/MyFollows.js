/**
 * Created by madapeng on 17-4-5.
 */
import {Tabs, Breadcrumb, Icon, message, Card, Button} from 'antd';
import React from 'react';
import {doWebService} from '../WebServiceHelper';
import MyFollowExtend from './MyFollowExtend';

class MyFollows extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident: sessionStorage.getItem("ident"),
            followsListVisible: true,
            prosonCenterVisible: false,
            type: 1,
            pageNo: 1,
            userInfo: [],
            userList: [],
        };
        this.previouUserId = []; // 进入时加，返回时减
        this.currentUser = '';
        this.gobackBtn = null;
        this.htmlTempletContent = {};
        this.getMyFollows = this.getMyFollows.bind(this);
        this.intoFollowsList = this.intoFollowsList.bind(this);
        this.intoProsoncenter = this.intoProsoncenter.bind(this);
        this.returnPersonCenter = this.returnPersonCenter.bind(this);
        this.notInterProsonCenter = this.notInterProsonCenter.bind(this);
        this.returnParentFollowsList = this.returnParentFollowsList.bind(this);
    }


    componentWillMount() {
        this.getMyFollows(sessionStorage.getItem("ident"));
    }


    showMyFollowsListUI(userinfo) {
        this.getMyFollows(userinfo.colUid);
    }

    // 进入列表
    getMyFollows(userid, visiableGoBackBtn) {

        let _this = this;
        var param = {
            method: 'getMyFollows',
            userId: userid || _this.state.ident,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    if (!res.response.length) {
                        message.info('没有关注的内容！');
                        return;
                    }

                    _this.setState({
                        followsListVisible: true,
                        prosonCenterVisible: false,
                        userList: res.response,
                    });

                } else {
                    message.error(res.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    unFollow(toUser) {
        var _this = this;
        var param = {
            "method": 'unFollow',
            "userId": this.state.ident,
            "toUserId": toUser.colUid,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    message.info("取消成功！");
                    _this.setState({data: []})
                } else {
                    message.error(res.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    }

    // 展示个人信息
    viewProsenInfo(userid) {
        let _this = this;
        var param = {
            "method": 'getPersonalCenterData',
            "userId": userid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success) {
                    var userInfo = ret.response;
                    _this.setState({
                        followsListVisible: false,
                        prosonCenterVisible: true,
                        userInfo: userInfo
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    // 进入关注列表
    intoFollowsList(userid) {

        let curUser = this.currentUser = userid;
        if (!curUser) {
            curUser = this.state.ident;
        }
        this.getMyFollows(curUser)

    }

    // 返回父级关注列表
    returnParentFollowsList() {
        let parentUser = null;

        this.currentUser = this.previouUserId.pop();
        if (this.previouUserId.length) {
            this.currentUser = this.previouUserId.pop();
        } else {
            this.currentUser = this.state.ident;
        }

        parentUser = this.currentUser;

        this.getMyFollows(parentUser)
        // console.log('返回父级关注列表：' + parentUser);
    }

    // 返回个人中心
    returnPersonCenter() {
        if (!this.currentUser) {
            this.currentUser = this.state.ident;
            this.previouUserId = [];
        }

        this.viewProsenInfo(this.currentUser);
        // console.log('返回个人中心：' + this.currentUser);

    }


    // 进入个人中心
    intoProsoncenter(userinfo) {
        this.viewProsenInfo(userinfo.colUid);
        this.previouUserId.push(userinfo.colUid);
        this.currentUser = userinfo.userId;
        // console.log('进入的用户层级');
        // console.log(this.previouUserId);
    }


    // 登录的操作用户不能返回个人中心
    notInterProsonCenter() {
        if(!this.currentUser){
            this.currentUser = this.state.ident;
        }

        if (!this.previouUserId.length && this.currentUser == this.state.ident) {
            return false;
        } else {
            return true;
        }
    }


    showpanle(obj) {
        LP.Start(obj);
    }


    _buildMyFollowsList() {

        let dataArray = this.state.userList;
        if (!dataArray || !dataArray.length) {
            this.htmlTempletContent = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        this.htmlTempletContent = dataArray.map((e, i) => {
            let refkey = e.uid + "#" + e.courseId;

            return <Card key={refkey} className="focus">
                    <span className="person_user_bg upexam_float">
                        <a onClick={this.intoProsoncenter.bind(this, e.user)} target="_blank">
                            <img alt={e.user.userName + '头像'} width="100%" src={e.user.avatar} className="person_user"/></a>
                    </span>
                <div className="custom-card focus_2">
                    <div className="focus_1">
                        <span className="antnest_name focus_3"
                              onClick={this.intoProsoncenter.bind(this, e.user)}>{e.user.userName}</span>
                    </div>
                    <div className="focus_3">学校：{e.user.schoolName}</div>
                    <div className="focus_3">科目：{e.course.colCourse}</div>
                </div>
            </Card>
        });

    }


    buildContent() {

        this.htmlTempletContent = null;
        this.gobackBtn = '';


        switch (true) {
            // 个人信息
            case this.state.prosonCenterVisible:
                this.htmlTempletContent = <MyFollowExtend userinfo={this.state.userInfo}
                                                          intoMyFollows={this.intoFollowsList}
                                                          returnParentFollows={this.returnParentFollowsList}
                                                          onPreview={ this.showpanle }/>;
                break;

            // 关注列表
            case this.state.followsListVisible:

                if (this.notInterProsonCenter()) {
                    this.gobackBtn =
                        <div className="back_follow ant-tabs-bar"><Button onClick={this.returnPersonCenter}>返回</Button></div>;
                }
                this._buildMyFollowsList();
                break;
        }
    }

    render() {
        this.buildContent();
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">我的关注</Breadcrumb.Item>
                </Breadcrumb>
                {this.gobackBtn}
                <div className="follow_my">{ this.htmlTempletContent }</div>

            </div>
        );
    }
}

export default MyFollows;
