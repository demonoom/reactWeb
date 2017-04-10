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


class MyFollows extends React.Component {

    constructor(props) {
        super(props);
        this.state = { // define this.state in constructor
            ident: this.props.userid || sessionStorage.getItem("ident"),
            visible: true,
            method: 'getUserFavorite',
            type: 1,
            pageNo: 1,
            data: [],
        };
            this.htmlTemplet={}
    }
   changeState(data){
debugger
};
    componentWillMount(){
        debugger
       this.getData(this.changeState);
    }

    getData(fn){
        var param = {
            "method":'getMyFollows',
            "userId": this.state.ident,
        };

        doWebService(JSON.stringify(param), {
            onResponse : function(res) {
                debugger
                if(res.success){
                   if(fn)fn(res);
                }else{
                    message.error(res.msg);
                }
            },
            onError : function(error) {
                debugger
                message.error(error);
            }
        });
    }

    buildTemplet(dataArray) {
        this.htmlTemplet=null;

        if (!dataArray || !dataArray.length) {
            this.htmlTemplet = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
            return;
        }

        this.htmlTemplet = dataArray.map((e, i) => {

            let content = e.content;
            let refkey = e.type + "#" + e.favoriteId;

            return <Card style={{ width: 240 , display:'inline-block' }} bodyStyle={{ padding:'5px' }}  key={refkey}>
                <div className="custom-image">
                    <a href={e.address} target="_blank" > <img alt="example" width="100%" src={e.cover} /></a>
                </div>
                <div className="custom-card">
                    <p> <a   target="_blank" title="查看"  href={e.address} ><Button icon="eye-o"/></a>
                        <a   target="_blank"  title="取消收藏"  onClick={this.props.onCancelfavrite.bind(this, e.address,this.props.upgradeData)} ><Button icon="star"/></a>
                    </p>
                    <h3>{content}</h3>
                    <p>学校：{e.liveInfo.schoolName}</p>
                    <p>上传者：{e.liveInfo.user.userName}</p>
                    <p>时间：{getLocalTime(e.liveInfo.startTime)}</p>
                </div>
            </Card>

        } );

    }

    render() {
        this.buildTemplet();
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home"/></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">我的关注</Breadcrumb.Item>
                </Breadcrumb>
                { this.htmlTemplet }
            </div>
        );
    }
}

export default MyFollows;
