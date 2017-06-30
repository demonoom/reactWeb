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
                <Card className="information">
                    <div className="info_user">
                        <img className="person_user pers_bo_ra" src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" />
                    </div>
                    <div>
						<div className="info_school"><span className="info_school_s">李老师</span><span className="live_color live_orange">数学</span></div>
						<div className="apply_for">恒坐标学校</div>
						<div className="exam-particulars_time">王老师申请加入您的java团队</div>
					</div>
                    <div className="info_btn">
                        <Button className="add_study-b">同意</Button>
                        <Button className="correct_name">拒绝</Button>
                    </div>
                </Card>
                <Card className="information">
                    <div className="info_user">
                        <img className="person_user pers_bo_ra" src="http://www.maaee.com:80/Excoord_For_Education/userPhoto/default_avatar.png" />
                    </div>
                    <div>
						<div><span className="info_name">李老师</span><span className="live_color live_orange">数学</span></div>
						<div className="exam_gray">恒坐标学校</div>
						<div className="exam-particulars_time">王老师申请加入您的java团队</div>
					</div>
                    <div className="info_btn">
                        <Button >拒绝</Button>
						<Button className="correct_name add_study-b">同意</Button>
                    </div>
                </Card>
            </div>
        );
    },
});

export default MyMessageComponents;
