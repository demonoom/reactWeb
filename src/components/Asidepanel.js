/**
 * Created by madapeng on 17-4-12.
 */

import React from 'react';
import WebCall from '../utils/phone';
'use strict';

class Asidepanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
        }
        this.closepanle = this.closepanle.bind(this)
        this.zoomview = this.zoomview.bind(this)
    }

    /**
     * 强制关闭
     * @param ifFoce true|false 是否强制关闭
     */
    closepanle(ifFoce) {
        if (ifFoce) {
            this.setState({isShow: false});
            return;
        }
        this.setState({isShow: true});
    }

    // 放大查看
    zoomview(){
        window.open(this.props.param.url);
    }

    bindIfrCall(e){

        asidepanel.contentWindow.phone = WebCall;
    }

    render() {
        let sty = {
            display: this.state.isShow ? 'block' : 'none',
            width: this.props.param.width ? this.props.param.width : 'initial',
        }
        let sty2 = {
            border: 'none',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
        }

        return (<aside style={{...sty}} className={ "little-layout-aside-r-show"}>
                <div className="little-warp">
                    <div className="little-tilte">
                        <h3 className="title">{ this.props.param.title }</h3>
                        <a onClick={this.closepanle} className="close">X</a>
                        <a onClick={  this.zoomview}  className="zoom">大</a>
                    </div>
                    <section className="littleAnt-iframe-panle">
                        <iframe id="asidepanel" border={0} style={{...sty2}} src={ this.props.param.url } onLoad={  this.bindIfrCall } ></iframe>
                    </section>
                </div>
            </aside>
        );
    }


}


export default Asidepanel;

