/**
 * Created by madapeng on 17-4-5.
 */
import {Tabs, Breadcrumb, Icon, message, Card, Button} from 'antd';
import React from 'react';
import {doWebService} from '../WebServiceHelper';
import PersonCenterV2 from './PersonCenterV2';

class MyFollows extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // define this.state in constructor
            ident: this.props.userid || sessionStorage.getItem("ident"),
            followUserInfo: {},
            followUserVisible: false,
            myFollowsListVisible: true,
            method: 'getUserFavorite',
            type: 1,
            pageNo: 1,
            data: []
        };
        this.htmlTempletContent = {};
    }


    componentWillMount() {

        this.getMyFollows();
    }


// 外部调用显示
    showMyFollowsListUI(userinfo) {
        this.getMyFollows(userinfo.colUid);
    }

    // 内部调用
    getMyFollows(myIdent) {
        let _this = this;
        var param = {
            "method": 'getMyFollows',
            "userId": myIdent || this.state.ident,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    _this.setState({
                        myFollowsListVisible: true,
                        followUserVisible: false,
                        data: res.response
                    });
                    // if (fn) fn(res.response);
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
    viewProsenInfo(userinfo) {

        let _this = this;
        var param = {
            "method": 'getPersonalCenterData',
            "userId": userinfo.colUid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success) {
                    var userInfo = ret.response;

                    _this.setState({
                        followUserVisible: true,
                        myFollowsListVisible: false,
                        followUserInfo: userInfo
                    });
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }


    _buildMyFollowsList() {

        let dataArray = this.state.data;
        if (!dataArray || !dataArray.length) {
            this.htmlTempletContent = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        this.htmlTempletContent = dataArray.map((e, i) => {
            let refkey = e.uid + "#" + e.courseId;

            return <Card key={refkey} className="focus">
                            <span className="person_user_bg upexam_float">
                                <a onClick={this.viewProsenInfo.bind(this, e.user)} target="_blank"><img
                                    alt={e.user.userName + '头像'} width="100%" src={e.user.avatar}
                                    className="person_user"/></a>
                            </span>
                <div className="custom-card focus_2">
                    <div className="focus_1">
                        <span className="antnest_name focus_3" onClick={this.viewProsenInfo.bind(this, e.user)} >{e.user.userName}</span>
                    </div>
                    <div className="focus_3">学校：{e.user.schoolName}</div>
                    <div className="focus_3">科目：{e.course.colCourse}</div>
                </div>
            </Card>
        });

    }

    buildContent() {

        this.htmlTempletContent = null;

        switch (true) {
            // 显示被关注的个人信息
            case this.state.followUserVisible:
                this.htmlTempletContent =
                    <PersonCenterV2 userInfo={this.state.followUserInfo }
                                    visible={this.state.followUserVisible}
                                    callEvent={ this.props.callEvent }/>;
                break;
            // 显示我的关注列表
            case this.state.myFollowsListVisible:
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
                <div className="focus_auto favorite_pa_le"> { this.htmlTempletContent }</div>
            </div>
        );
    }
}

export default MyFollows;
