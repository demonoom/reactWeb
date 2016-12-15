import React, { PropTypes } from 'react';
import { Popover, Affix, Button } from 'antd';
import { doWebService } from '../WebServiceHelper';


const FloatButton = React.createClass({

    logOut(){
        // alert(sessionStorage.getItem("openKeysStr"));
        var openKeysStr = sessionStorage.getItem("openKeysStr");
        if(confirm("您确定退出登录么?")){
            if(openKeysStr!=null && openKeysStr!=""){
                //已有访问记录，本地移除后，保存到数据库
                var userId = sessionStorage.getItem("ident");
                this.saveHistoryAccessPointId(userId,openKeysStr);
            }else{
                location.hash="Login";
            }
        }
    },

    saveHistoryAccessPointId(userId,pointId){
        var param = {
            "method":'saveHistoryAccessPointId',
            "userId":userId,
            "pointId":pointId
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.response==true){
                    console.log("保存此用户上次访问的知识点id成功");
                    sessionStorage.removeItem("openKeysStr");
                    sessionStorage.removeItem("ident");
                }else{
                    console.log("保存此用户上次访问的知识点id失败");
                }
                location.hash="Login";
            },
            onError : function(error) {
                console.log(error);
            }
        });
    },

    render() {
        return (
            <Affix className="affix_bottom" onClick={this.logOut}>
                {/*<Popover content={<div><span className="affix_bottom_tc" onClick={this.logOut}>退出登录</span></div>}>*/}

                <img src={('../../src/components/images/exit_ma.png')}/>
            </Affix>
        );
    }

});
export default FloatButton;



