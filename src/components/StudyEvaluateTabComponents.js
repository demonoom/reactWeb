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
                <h3 className="public—til—blue">学情分析</h3>
                <button onClick={this.goBack} className="add_study">返回</button>
                <iframe ref="study" src={this.state.initUrl} className="analyze_iframe"/>
            </div>
        );
    },
});

export default StudyEvaluateTabComponents;
