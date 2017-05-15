import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';
import React  from 'react';


const StudyEvaluateTabComponents = React.createClass({

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
            <div>
                <h3 className="public—til—blue"><div className="ant-tabs-right"><button onClick={this.goBack} ><Icon type="left" /></button></div>学情分析</h3>
                <iframe ref="study" src={this.state.initUrl} className="analyze_iframe"/>
            </div>
        );
    },
});

export default StudyEvaluateTabComponents;
