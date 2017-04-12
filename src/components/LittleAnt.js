/**
 * Created by madapeng on 17-4-12.
 */

import React from 'react';
'use strict';

class LittleIframe extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: 'block',
            isShow: true,

        }
        this.closepanle = this.closepanle.bind(this)
    }


    closepanle() {
        let isShowa = !this.state.isShow;
        if (isShowa) {
            this.setState({visible: 'block', isShow: isShowa});
        } else {
            this.setState({visible: 'none', isShow: isShowa});
        }

    }

    // 关闭
    foceClose() {

            this.setState({visible: 'none', isShow: false });

    }

    render() {
        let sty = {

            display: this.state.visible
        }
        let sty2 = {
            border: 'none',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: this.state.visible
        }

        return (<aside style={{...sty}} className="little-layout-aside-r">
                <div className="little-tilte" onClick={this.closepanle }>关闭</div>
                <div className="little-menu"></div>

                <aside className="littleAnt-iframe-panle">
                    sdfsfsf
                    <iframe border={0} height='100%' style={{...sty2}} src={this.props.src}></iframe>
                </aside>

            </aside>

        );
    }


}


export default LittleIframe;