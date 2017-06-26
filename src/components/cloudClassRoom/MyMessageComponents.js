import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';

const MyMessageComponents = React.createClass({

    getInitialState() {
        return {

        };
    },

    componentDidMount(){

    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <div>
                <Card>
                    <div>
                        <img style={{width:'30px',height:'30px'}} src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" />
                    </div>
                    <div><span>王老师</span><span>数学</span></div>
                    <div>恒坐标学校</div>
                    <div>王老师申请加入您的java团队</div>
                    <div>
                        <Button>同意</Button>
                        <Button>拒绝</Button>
                    </div>
                </Card>
                <Card>
                    <div>
                        <img style={{width:'30px',height:'30px'}} src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" />
                    </div>
                    <div><span>李老师</span><span>数学</span></div>
                    <div>恒坐标学校</div>
                    <div>王老师申请加入您的java团队</div>
                    <div>
                        <Button>同意</Button>
                        <Button>拒绝</Button>
                    </div>
                </Card>
            </div>
        );
    },
});

export default MyMessageComponents;
