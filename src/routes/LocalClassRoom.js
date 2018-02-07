import React from 'react';
import {Modal, message,Row,Col} from 'antd';

const LocalClassRoom = React.createClass({
    getInitialState() {
        return {
        };
    },

    render() {
        return (
            <div>
                <Row style={{height:'900px'}}>
                    <Col span={18}> 课堂主题内容 </Col>
                    <Col span={4}> 侧边栏互动区 </Col>
                </Row>
            </div>
        );
    },

});

export default LocalClassRoom;

