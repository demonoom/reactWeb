import React  from 'react';
import { Menu } from 'antd';

class PersonCenterMenu extends React.Component {

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
                    style={{ width: 240 }}
                    defaultSelectedKeys={['1']}
                    mode="vertical"
                >
                    <Menu.Item key="myResource"><i className="iconfont menu_left_i">&#xe628;</i>我的资源</Menu.Item>
                    <Menu.Item key="mySubject"><i className="iconfont menu_left_i">&#xe6f8;</i>我的题目</Menu.Item>
                    <Menu.Item key="myFavorites"><i className="iconfont menu_left_i">&#xe60a;</i>我的收藏</Menu.Item>
                    <Menu.Item key="myFollows"><i className="iconfont menu_left_i">&#xe87b;</i>我的关注</Menu.Item>
                    <Menu.Item key="myMTV"><i className="iconfont menu_left_i">&#xe617;</i>我的直播课</Menu.Item>
                    {/*<Menu.Item key="findStudentPwd">找回学生密码</Menu.Item>*/}
                </Menu>


            </div>
        );
    }
}
;
export default PersonCenterMenu;