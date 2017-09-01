import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';
import React  from 'react';


const OpenNewPage = React.createClass({

    getInitialState() {
        return {
            initUrl: "/proxy/Excoord_PhoneService/subjectReport/xueqingfenxi/" + sessionStorage.getItem("ident"),
        };
    },


    goBack(){
        this.refs.study.contentWindow.location.replace(this.state.initUrl);
    },

    render() {
        return (
            <div className="noom">
                <h3 className="public—til—blue"><div className="ant-tabs-right"><Button onClick={this.goBack} ><Icon type="left" /></Button></div>学情分析</h3>
                <iframe ref="study" src='http://www.maaee.com:80/Excoord_PhoneService/masterAnalysis/getHistoryClass/9/-1/-1/-1/A"' className="analyze_iframe"/>
            </div>
        );
    },
});

export default OpenNewPage;
