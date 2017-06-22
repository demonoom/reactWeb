import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';

const AntSingleClassComponents = React.createClass({

    getInitialState() {
        return {

        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <div>
                单节课程
            </div>
        );
    },
});

export default AntSingleClassComponents;
