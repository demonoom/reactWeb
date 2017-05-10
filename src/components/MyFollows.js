/**
 * Created by madapeng on 17-4-5.
 */
import {Breadcrumb, Icon, message, Card, Button} from 'antd';
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
            userinfo: [],
            userList: [],
        };
        this.previouUsers = [];
        this.currentUser = this._getCurrentLoginUserInfo();
        this.gobackBtn = null;
        this.htmlTempletContent = {};
        this.getMyFollows = this.getMyFollows.bind(this);
        this.intoFollowsList = this.intoFollowsList.bind(this);
        this.intoProsoncenter = this.intoProsoncenter.bind(this);
        this.returnPersonCenter = this.returnPersonCenter.bind(this);
        this.notInterProsonCenter = this.notInterProsonCenter.bind(this);
        this.returnParentFollowsList = this.returnParentFollowsList.bind(this);
        this._getCurrentLoginUserInfo = this._getCurrentLoginUserInfo.bind(this);
    }


    componentWillMount() {
        let tag = this.props.initType;
        let data = this.props.data;

        if (tag) {
            switch (tag) {
                case 'personCenter':
                    this.viewProsenInfo(this._getCurrentLoginUserInfo());
                    break;
                default:
                    this.getMyFollows(this._getCurrentLoginUserInfo());
            }
            return;
        }
        if (data) {
            if (data instanceof Array) {
                this.getMyFollows(data);
            } else {
                this.viewProsenInfo(data);
            }
            return;
        }

        this.getMyFollows(this._getCurrentLoginUserInfo());

    }


    _getCurrentLoginUserInfo() {
        return eval('(' + sessionStorage.getItem('loginUser') + ')');
    }

    // 进入已关注列表
    getMyFollows(userobj) {

        let _this = this;
        let userid = null;
        if (userobj.colUid) {
            userid = userobj.colUid;
            this.userinfo = userobj;
        }

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

    // 取消关注
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
    viewProsenInfo(user) {
        let _this = this;
        var param = {
            "method": 'getPersonalCenterData',
            "userId": user.colUid,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success) {
                    _this.setState({
                        followsListVisible: false,
                        prosonCenterVisible: true,
                        userinfo: ret.response
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    // 进入关注列表
    intoFollowsList(userobj) {
        this.getMyFollows(userobj)
    }

    // 返回父级关注列表
    returnParentFollowsList() {

        this.currentUser = this.previouUsers.pop();
        if (!this.currentUser) {
            this.userinfo = this._getCurrentLoginUserInfo();
            this.getMyFollows(this.userinfo);
            return;
        }
        if (this.previouUsers.length) {
            this.currentUser = this.previouUsers.pop();
            this.getMyFollows(this.currentUser);
        } else {
            this.userinfo = this._getCurrentLoginUserInfo();
            this.getMyFollows(this.userinfo);
        }

    }

    // 返回个人中心
    returnPersonCenter() {
        if (!this.currentUser) {
            this.currentUser = this._getCurrentLoginUserInfo();
            this.previouUsers = [];
        }

        this.viewProsenInfo(this.currentUser);
    }

    // 进入个人中心
    intoProsoncenter(userinfo) {
        this.viewProsenInfo(userinfo);
        this.previouUsers.push(userinfo);
        this.currentUser = userinfo;
    }


    // 登录的操作用户不能返回个人中心
    notInterProsonCenter() {
        if (!this.currentUser || !this.currentUser.colUid) {
            this.currentUser = this._getCurrentLoginUserInfo();
        }

        if (this.previouUsers.length) {
            return true; // 返回到个人中心
        }
        if (this.currentUser.colUid != this.state.ident) {
            return true; // 返回到个人中心
        }
        return false; // 不返回到自己个人中心
    }

    // 侧边预览
    onPreview(obj) {
        LP.Start(obj);
    }

    _buildMyFollowsList() {
        let dataArray = this.state.userList;
        if (!dataArray || !dataArray.length) {
            this.htmlTempletContent = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }
        this.title = <div className="favorite_scroll line_block">
            <div className="follow_me_til">
                <div className="ant-tabs-ink-bar follow_blue_line"></div>
                {this.userinfo.userName}关注列表
            </div>
        </div>;
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
        this.originHeight='';
        switch (true) {
            // 个人信息
            case this.state.prosonCenterVisible:
                this.title = null;
                this.htmlTempletContent = <MyFollowExtend userinfo={this.state.userinfo}
                                                          intoMyFollows={this.intoFollowsList}
                                                          returnParentFollows={this.returnParentFollowsList}
                                                          onPreview={ this.onPreview }/>;
                break;

            // 关注列表
            case this.state.followsListVisible:
                this.originHeight='enhance';
                if (this.notInterProsonCenter()) {
                    this.gobackBtn =
                        <div className="ant-tabs-extra-content">
                            <div className="ant-tabs-right talk_ant_btn1"><Button onClick={this.returnPersonCenter}>返回</Button></div>
                        </div>;
                }
                this._buildMyFollowsList();
                break;
        }
    }

    render() {
        this.buildContent();
        return (
            <div >
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">我的关注</Breadcrumb.Item>
                </Breadcrumb>
                <div className="group_cont">
                    <div className="ant-tabs-bar">
                        { this.title}
                        { this.gobackBtn}
                    </div>
                    <div className={' favorite_up favorite_scroll ' + this.originHeight}>{ this.htmlTempletContent }</div>
                </div>
            </div>
        );
    }
}

export default MyFollows;
