/**
 * Created by madapeng on 17-4-5.
 */
import {Tabs, Breadcrumb, Icon,message} from 'antd';
import React from 'react';
import FavItem from './FavoriteItem';
import SubjectItem from './FavoriteSubjectItems';
import ShippinItem from './FavoriteShipinItems';
import OtherItem from './FavoriteOtherItems';
import {doWebService} from '../WebServiceHelper';
const TabPane = Tabs.TabPane;


class Favorites extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // define this.state in constructor
            ident: this.props.userid || sessionStorage.getItem("ident"),
            breadcrumbVisible: this.props.breadcrumbVisible && true,
            method: 'getUserFavorite',
            type: 1,
            pageNo: 1,
            data: [],
            activeKey: '1',
// 默认数据
            other: {type: 0, pageNo: 1, data: null},
            subject: {type: 1, pageNo: 1, data: null, activeKey: '1'},
            weike: {type: 2, pageNo: 1, data: null},
            jiangyi: {type: 3, pageNo: 1, data: null},
            shipin: {type: 4, pageNo: 1, data: null}

        };

        this.FAVTYPE = [
            ['0', 'other', '其它'],
            ['1', 'subject', '题目'],
            ['2', 'weike', '微课'],
            ['3', 'jiangyi', '讲义'],
            ['4', 'shipin', '直播课']
        ]
    }

    componentWillMount() {
        this.tabClick(1);

    }

    getDate(fn, param) {
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

    changeState(obj) {
        switch (parseInt(obj.type)) {
            case 0:
                this.setState({'other': obj});
                break;
            case 1:
                this.setState({'subject': obj});
                break;
            case 2:
                this.setState({'weike': obj});
                break;
            case 3:
                this.setState({'jiangyi': obj});
                break;
            case 4:
                this.setState({'shipin': obj});
                break;
        }
    }

    // 刷新当前栏目数据
    upgradeCurrent(type) {
        this.tabClick(type);
    }

// 翻页
    tabClick(type) {
        let ref = this.FAVTYPE[type][1];
        var param = {
            method: this.state.method,
            ident: this.state.ident,
            type: type,
            pageNo: this.state[ref]['pageNo']
        }
        this.getDate(this.changeState, param);
    }

    // 取消收藏
    cancelFav(address, fn) {

        var _self = this;
        var args = {
            "method": 'removeFavorite',
            "userId": _self.state.ident,
            "address": address
        };

        doWebService(JSON.stringify(args), {
            onResponse: function (res) {
                message.info(res.msg);
                if (!!fn) fn(_self.props.param.type);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }


    getBreadCrumb(){
        if( this.state.breadcrumbVisible ){
            return <Breadcrumb separator=">"  style={{display: this.state.breadcrumbVisible}}  >
                <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">我的收藏</Breadcrumb.Item>
            </Breadcrumb>
        }
    }

    render() {

        return (
            <div>
                {this.getBreadCrumb()}
                <Tabs onTabClick={this.tabClick.bind(this)} defaultActiveKey={this.state.activeKey}>
                    <TabPane tab={this.FAVTYPE[1][2]} key='1'>
                        <SubjectItem param={this.state.subject} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}/>
                    </TabPane>
                    <TabPane tab={this.FAVTYPE[2][2]} key='2'>
                        <FavItem param={this.state.weike} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}/>
                    </TabPane>
                    <TabPane tab={this.FAVTYPE[3][2]} key='3'>
                        <FavItem param={this.state.jiangyi} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}/>
                    </TabPane>
                    <TabPane tab={this.FAVTYPE[4][2]} key='4'>
                        <ShippinItem param={this.state.shipin} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}/>
                    </TabPane>
                    <TabPane tab={this.FAVTYPE[0][2]} key='0'>
                        <OtherItem param={this.state.other} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}/>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default Favorites;
