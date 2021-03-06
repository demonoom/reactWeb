import React  from 'react';
import { Menu,Icon } from 'antd';

class StudentPersonCenterMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    searchOwnerCourseWare(){
        this.props.callbackParent("getCourseWares");
    }

    searchOwnerSubject(){
        this.props.callbackParent("getSubjects");
    }


    myMTV(){
        this.props.callEvent({
            resouceType: 'visitAntGroup',
            ref: 'antGroupTabComponents',
            methond: 'callBackGetLiveInfo',
            param: {user: teacherInfo.user, visiable: false}
        });
    }


    handleClick = (e) => {

        this.props.callbackParent(e.key);
    }

    render() {
        return (
            <div>
                <div className="menu_til">个人中心</div>
                <Menu
                    onClick={this.handleClick}
                    defaultSelectedKeys={['1']}
                    mode="vertical"
                >
                    <Menu.Item key="myAskList"><i className="iconfont menu_left_i">&#xe628;</i>我的提问</Menu.Item>
                    <Menu.Item key="myStudyTrack"><i className="iconfont menu_left_i">&#xe6f8;</i>我的学习轨迹</Menu.Item>
                    <Menu.Item key="myFollows"><Icon type="heart-o" className="menu_left_i" />我的关注</Menu.Item>
                </Menu>

            </div>
        );
    }
}
;
export default StudentPersonCenterMenu;