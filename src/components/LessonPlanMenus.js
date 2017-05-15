import React, {PropTypes, Link} from 'react';
import {Menu, Icon, message, Dropdown, Button, Pagination} from 'antd';
import TeachingComponents from '../components/TeachingComponents';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import ConfirmModal from './ConfirmModal';


class LessonPlanMenus extends React.Component{

    constructor(props){
        super(props);
        this.state={
            currentMenu: 'goSchool',
            currentPage: 1,
            show: 1,
            lessonCount: 0,
            menuList: [],
            selectedKey: '',
            delScheduleId: '',
            menuChildren:[],
        }

        this.children=null;
        this.showModal=this.showModal.bind(this);
        this.handleClick=this.handleClick.bind(this);
        this.getLessonMenu=this.getLessonMenu.bind(this);
        this.menuItemOnClick=this.menuItemOnClick.bind(this);
        this.buildMenuChildren=this.buildMenuChildren.bind(this);
        this.deleteTeachSchedule=this.deleteTeachSchedule.bind(this);
        this.showDelScheduleConfirmModal=this.showDelScheduleConfirmModal.bind(this);
        this.handleMenu = this.handleMenu.bind(this);
    }


    componentWillMount(){
        this.getLessonMenu(this.state.currentPage);
    }

    getLessonMenu(pageNo){
        let _this=this;
        var param = {
            "method": 'getTeachScheduls',
            "ident": sessionStorage.getItem("ident"),
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                let List = [];
                ret.response.forEach(function (e) {
                    var scheduleId = e.colTsId;
                    var courseName = e.colTitle;
                    var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
                    List.push([scheduleId, courseName, courseTimes]);
                });
                _this.setState({menuList: List, lessonCount: ret.pager.rsCount});
                _this.buildMenuChildren(List);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }



    handleClick(e) {

        this.setState({currentMenu: ''+ e.key, openSubMenu: e.key});
        var optContent = e.key + "#" + "bySchedule";
        this.props.callbackParent(optContent);
    }




    /**
     * 备课计划名称右侧的DropDownMenu点击响应处理函数
     * @param key 被点击menu item的key
     */
    menuItemOnClick ({key}) {
        var clickKey = `${key}`;
        var keyArray = clickKey.split("#");
        if (keyArray.length == 2) {
            //修改
            this.showModal('edit', clickKey);
        } else {
            //删除
            this.showDelScheduleConfirmModal(clickKey);
        }
    }

    /**
     * 构建备课计划菜单对象
     * @param menuList 菜单对象值的数组
     */
    buildMenuChildren (menuList) {
        var _this = this;
        _this.children = menuList.map((e, i) => {

            const menu = (
                <Menu onClick={_this.menuItemOnClick}>
                    <Menu.Item key={e[0] + "#" + e[1]} className="popup_i_icon"><Icon className="icon_right"
                                                                                      type="edit"/>修改</Menu.Item>
                    <Menu.Item key={e[0]} className="popup_i_icon"><Icon className="icon_right"
                                                                         type="delete"/>删除</Menu.Item>
                </Menu>
            );
            if (i == 0) {

                _this.setState({ currentMenu: ''+ e[0] });
                var optContent = e[0] + "#" + "bySchedule" + '#' + e[1]+ '#' + e[2];
                _this.props.callbackParent(optContent);
                //div显示的内容过长时，使用title提示
                if (e[1].length > 10) {
                    return <Menu.Item key={e[0]} style={{backgroundColor: '#e5f2fe'}}>
                        <div title={e[1]} className="submenu_left_hidden title_1">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                } else {
                    return <Menu.Item key={e[0]} style={{backgroundColor: '#e5f2fe'}}>
                        <div className="submenu_left_hidden">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                }
            } else {
                if (e[1].length > 10) {
                    return <Menu.Item key={e[0]}>
                        <div title={e[1]} className="submenu_left_hidden">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                } else {
                    return <Menu.Item key={e[0]}>
                        <div className="submenu_left_hidden">{e[1]}</div>
                        <Dropdown overlay={menu} trigger={['click']} className='del_right'><i
                            className="iconfont iconfont_more">&#xe60e;</i></Dropdown>
                    </Menu.Item>
                }

            }

        });
        debugger
        this.setState({menuChildren:_this.children});
    }

    onChange(page) {
        this.getLessonMenu(page);
        this.setState({
            currentPage: page,
        });
    }


    /**
     * 删除备课计划
     * @param key 被删除备课计划的id
     */
    deleteTeachSchedule () {
        let _this=this;
        var sids = this.state.delScheduleId;
        var param = {
            "method": 'deleteTeachSchedules',
            "ident": sessionStorage.getItem("ident"),
            "sids": sids
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("备课计划删除成功");
                } else {
                    message.error("备课计划删除失败");
                }
                _this.closeDelScheduleConfirmModal();
                _this.getLessonMenu(_this.state.currentPage);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 新增和修改备课计划的弹窗
     * @param optType 操作方式  add/edit,通过该值区分是新增操作还是修改操作
     * @param editSchuldeId 如果是修改操作，则该值为被修改备课计划的id，不能为空
     */
    showModal (optType, editSchuldeId) {
        optType = (optType == "edit" ? "edit" : "add");
        this.refs.teachingComponents.showModal(optType, editSchuldeId);
    }


    handleMenu(){
        debugger
        this.getLessonMenu(this.state.currentPage);
    }


    showDelScheduleConfirmModal(scheduleId){
        this.setState({"delScheduleId": scheduleId});
        this.refs.delScheduleConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelScheduleConfirmModal(){
        this.refs.delScheduleConfirmModal.changeConfirmModalVisible(false);
    }

    render() {
        return (
            <div>

                <ConfirmModal ref="delScheduleConfirmModal"
                              title="确定要删除该备课计划?"
                              onConfirmModalCancel={this.closeDelScheduleConfirmModal}
                              onConfirmModalOK={this.deleteTeachSchedule}
                ></ConfirmModal>
                <div className="menu_til"><Button type="primary" icon="plus-circle" onClick={this.showModal}
                                                  className='add_study-d add_study-d-le1'>添加备课计划</Button></div>
                <TeachingComponents ref="teachingComponents" callbackParent={this.handleMenu}/>
                <Menu ref="middleMenu" onClick={this.handleClick}
                      className="cont_t2"
                      defaultOpenKeys={[''+this.state.currentMenu]}
                      openKeys={[''+ this.state.currentMenu]}
                      selectedKeys={[''+this.state.currentMenu]}
                      mode="inline"
                >
                    {this.state.menuChildren}

                </Menu>
                <Pagination size="small" total={this.state.lessonCount} pageSize={getPageSize()}
                            current={this.state.currentPage} onChange={this.onChange}/>
            </div>
        );
    }
};

export default LessonPlanMenus;
