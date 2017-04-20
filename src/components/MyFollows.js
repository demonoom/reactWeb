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
            followUser: {},
            followUserVisible: true,
            visible: true,
            method: 'getUserFavorite',
            type: 1,
            pageNo: 1,
            data: [],
            antGroupTabResouceType: 'personCenter',
            antGroupTabVisible: false
        };
        this.htmlTemplet = {};
    }

    changeState(dataa) {
        this.setState({data: dataa});
    };

    componentWillMount() {

        this.getData(this.changeState.bind(this));
    }

    getData(fn) {
        var param = {
            "method": 'getMyFollows',
            "userId": this.state.ident,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    if (fn) fn(res.response);
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

    viewProsenInfo(userinfo) {
        this.props.callEvent({
            resouceType: 'visitAntGroup',
            ref: 'antGroupTabComponents',
            methond: 'getOtherPersonalCenterPage',
            param: userinfo
        });
    }

    buildTemplet(dataArray) {

        this.htmlTemplet = null;
        if (!dataArray || !dataArray.length) {
            this.htmlTemplet = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        this.htmlTemplet = dataArray.map((e, i) => {
            let refkey = e.uid + "#" + e.courseId;

            return <div><Card key={refkey} className="focus">
                <span className="person_user_bg">
                    <a onClick={this.viewProsenInfo.bind(this,e.user)} target="_blank"><img alt={e.user.userName + '头像'} width="100%" src={e.user.avatar} className="person_user" /></a>
                </span>
                <div className="custom-card focus_2">
				    <div className="focus_1">
					    <span className="antnest_name focus_3">{e.user.userName}</span>
                        <a target="_blank" title="查看"  onClick={this.viewProsenInfo.bind(this,e.user)} className="right_ri"><Button icon="eye-o" className="focus_btn"/></a>
                    </div>
                    <div className="focus_3">学校：{e.user.schoolName}</div>
                    <div className="focus_3">科目：{e.course.colCourse}</div>
                </div>		
</Card></div>

        } );
    }

    render() {
        this.buildTemplet(this.state.data);
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">我的关注</Breadcrumb.Item>
                </Breadcrumb>
                { this.htmlTemplet }
                <PersonCenterV2 userInfo={this.state.followUser } visible={this.state.followUserVisible} />
            </div>
        );
    }
}

export default MyFollows;
