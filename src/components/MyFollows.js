/**
 * Created by madapeng on 17-4-5.
 */
import {Tabs, Breadcrumb, Icon,message,Card,Button} from 'antd';
import React from 'react';
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
   changeState(dataa){
        this.setState({data:dataa});
};
    componentWillMount(){

       this.getData(this.changeState.bind(this));
    }

    getData(fn){
        var param = {
            "method":'getMyFollows',
            "userId": this.state.ident,
        };

        doWebService(JSON.stringify(param), {
            onResponse : function(res) {
                if(res.success){
                   if(fn)fn(res.response);
                }else{
                    message.error(res.msg);
                }
            },
            onError : function(error) {
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

            let viewUrl = 'xxxxxxxxx?uid=' + e.uid;
            let refkey = e.uid + "#" + e.courseId;
            return <div className="ant-card-body"><div style={{ width: 240 , display:'inline-block' }} bodyStyle={{ padding:'5px' }}  key={refkey}>
                <div className="custom-image">
                    <a href={viewUrl} target="_blank" > <img alt={e.user.userName + '头像'} width="100%" src={e.user.avatar} /></a>
                </div>
                <div className="custom-card">
                    <p> <a   target="_blank" title="查看"  href={viewUrl} ><Button icon="eye-o"/></a>
                        <a   target="_blank"  title="取消收藏"  ><Button icon="star"/></a>
                    </p>
                    <h3>{e.user.userName}</h3>
                    <p>学校：{e.user.schoolName}</p>
                    <p>科目：{e.course.colCourse}</p>
                </div>
            </div>
			
</div>
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
            </div>
        );
    }
}

export default MyFollows;
