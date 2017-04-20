/**
 * Created by madapeng on 17-4-5.
 */
import {Tabs, Breadcrumb, Icon,message,Pagination} from 'antd';
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
        this.state = {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            breadcrumbVisible: this.props.breadcrumbVisible,
            method: 'getUserFavorite',
            type: 1,
            pageNo: 1,
            data: [],
            activeKey: '1',
            // 默认数据
            other: {type: 0, pageNo: 1, total:10, data: null},
            subject: {type: 1, pageNo: 1,total:10, data: null, activeKey: '1'},
            weike: {type: 2, pageNo: 1,total:10, data: null},
            jiangyi: {type: 3, pageNo: 1,total:10, data: null},
            shipin: {type: 4, pageNo: 1,total:10, data: null}

        };

        this.FAVTYPE = [
            ['0', 'other', '其它'],
            ['1', 'subject', '题目'],
            ['2', 'weike', '微课'],
            ['3', 'jiangyi', '讲义'],
            ['4', 'shipin', '直播课']
        ];
        this.pageChange = this.pageChange.bind(this);
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
                    args.pageNo = res.pager.pageNo || 0;
                    args.total = res.pager.pageCount || 0;
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
                this.setState({'other': obj, type:obj.type,total:obj.total,pageNo:obj.pageNo });
                break;
            case 1:
                this.setState({'subject': obj, type:obj.type,total:obj.total,pageNo:obj.pageNo });
                break;
            case 2:
                this.setState({'weike': obj, type:obj.type,total:obj.total,pageNo:obj.pageNo });
                break;
            case 3:
                this.setState({'jiangyi': obj, type:obj.type,total:obj.total,pageNo:obj.pageNo });
                break;
            case 4:
                this.setState({'shipin': obj, type:obj.type,total:obj.total,pageNo:obj.pageNo });
                break;
        }
    }

    // 刷新当前栏目数据
    upgradeCurrent(type) {
        this.tabClick(type);
    }

// tab切换
    tabClick(type,pageNo) {
        let ref = this.FAVTYPE[type][1];
        var param = {
            method: this.state.method,
            ident: this.state.ident,
            type: type,
            pageNo: pageNo || this.state[ref]['pageNo']
        }
        this.getDate(this.changeState, param);
    }

    // 翻页
    pageChange(pageNo){
       this.tabClick(this.state.type,pageNo);

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

                message.info("Cancel successfed!");
                if (!!fn){
                    fn(_self.props.param.type);
                }else{
                    _self.upgradeCurrent(_self.props.param.type);
                }
            },
            onError: function (error) {

                message.error(error);
            }
        });
    }



    getBreadCrumb(){
        let tag;
        this.props.breadcrumbVisible === undefined ? tag= true : tag=this.props.breadcrumbVisible;
        if(tag ){
            this.breadcrumb = <Breadcrumb separator=">"  >
                <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                <Breadcrumb.Item href="#/MainLayout">我的收藏</Breadcrumb.Item>
            </Breadcrumb>
        }
    }

    render() {
        this.getBreadCrumb();

        return (
            <div className="favorite_scroll">
                {this.breadcrumb}
                <Tabs onTabClick={this.tabClick.bind(this)} defaultActiveKey={this.state.activeKey}>
                    {/*题目*/}
                    <TabPane tab={this.FAVTYPE[1][2]} key='1' className="topics_rela">
                        <SubjectItem param={this.state.subject}   onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}/>
                    </TabPane>
                    {/*微课*/}
                    <TabPane tab={this.FAVTYPE[2][2]} key='2' className="topics_rela">
                        <FavItem param={this.state.weike} onPreview={this.props.onPreview} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)} pageChange={this.pageChange}/>
                    </TabPane>
                    {/*讲义*/}
                    <TabPane tab={this.FAVTYPE[3][2]} key='3' className="topics_rela">
                        <FavItem param={this.state.jiangyi} onPreview={this.props.onPreview} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}  pageChange={this.pageChange}/>
                    </TabPane>
                    {/*我的直播课*/}
                    <TabPane tab={this.FAVTYPE[4][2]} key='4' className="topics_rela">
                        <ShippinItem param={this.state.shipin} onPreview={this.props.onPreview} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}  pageChange={this.pageChange}/>
                    </TabPane>
                    {/*其他*/}
                    <TabPane tab={this.FAVTYPE[0][2]} key='0' className="topics_rela">
                        <OtherItem param={this.state.other} onPreview={this.props.onPreview} onCancelfavrite={this.cancelFav} upgradeData={this.upgradeCurrent.bind(this)}  pageChange={this.pageChange}/>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

export default Favorites;
