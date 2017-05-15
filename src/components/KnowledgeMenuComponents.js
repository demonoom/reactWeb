import React, {PropTypes, Link} from 'react';
import {Menu, Button, message} from 'antd';
import {doWebService} from '../WebServiceHelper';
import BindKnowledgeComponents from './BindKnowledgeComponents';
const SubMenu = Menu.SubMenu;


class KnowledgeMenuComponents extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            currentMenu: '',
            currentPage: 1,
            show: 1,
            lessonCount: 0,
            menuList: [],
            totalCount: 0,
            fatherMenuName: '',
            noHaveKnowledgeTip: ''
        }
        this.children = null;
        this.openKeys = [];
        this.breadCrumbArray = [];
        this.buildOpenMenuKeysArray =  this.buildOpenMenuKeysArray.bind(this);
        this.subMenuTitleClick =  this.subMenuTitleClick.bind(this);
        this.showModal =  this.showModal.bind(this);
        this.handleMenu =  this.handleMenu.bind(this);
    }

    componentWillMount(){
        this.getLessonMenu();
      //  this.initOpenSubMenu();
    }



    initOpenSubMenu(){

        var openKeysStr = sessionStorage.getItem("openKeysStr");


        var openKeysArray = [];
        if (openKeysStr) {
            openKeysArray = openKeysStr.split(",");
        }
        for (var i = 0; i < openKeysArray.length; i++) {
            var openKey = openKeysArray[i];
            var keyArray = openKey.split("#");
            // 89#7#2#一年级上#小学
            var menuId = keyArray[0];
            var childrenCount = keyArray[1];
            var menuLevel = keyArray[2];
            var menuName = keyArray[3];
            var fatherMenuName = keyArray[4];
            this.buildOpenMenuKeysArray(openKey, menuLevel);
            if (menuLevel != 0 && childrenCount == 0) {
                this.bulidBreadCrumbArray(fatherMenuName, menuLevel - 1, menuId, openKeysStr);
            } else {
                this.bulidBreadCrumbArray(menuName, menuLevel, menuId, openKeysStr);
            }
            if (i == openKeysArray.length - 1) {
                this.setState({
                    currentMenu: openKey,
                });
                var optContent = sessionStorage.getItem("lastClickMenuId") + "#" + "bySubjectId" + "#" + sessionStorage.getItem("lastClickMenuName") + "#" + childrenCount;

                this.props.callbackParent(optContent, this.breadCrumbArray);
            }
        }
    }

    //菜单被选择时执行的函数
    subMenuTitleClick(e){
        var domE = e.domEvent;
        var target = domE.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = domE.currentTarget;
        } else {
            target = domE.target;
        }

        $("div[style]").each(function () {
            $(this).css("background-color", "");
        });
        target.style.backgroundColor = "#e5f2fe";
        var menuKeyArray = e.key.split("#");
        var menuId = menuKeyArray[0];
        var childrenCount = menuKeyArray[1];
        var menuLevel = menuKeyArray[2];
        var menuName = menuKeyArray[3];
        var fatherMenuName = menuKeyArray[4];

        this.buildOpenMenuKeysArray(e.key, menuLevel);
      let  openKeysStr = this.openKeys.join(',');
        // defaultOpenKeys={['81#3#0#数学#','86#13#1#小学#数学','89#7#2#一年级上#小学']}
        // openKeys={['81#3#0#数学#','86#13#1#小学#数学','89#7#2#一年级上#小学']}
        //全局存放用户在知识点导航下的访问路径，退出时将此值保存到数据库，下次登录时获取
        sessionStorage.setItem("openKeysStr", openKeysStr);
        this.setState({
            currentMenu: e.key
        });
        if (menuLevel != 0 && childrenCount == 0) {
            this.bulidBreadCrumbArray(fatherMenuName, menuLevel - 1, menuId, openKeysStr);
        } else {
            this.bulidBreadCrumbArray(menuName, menuLevel, menuId, openKeysStr);
        }
        sessionStorage.setItem("lastClickMenuName", menuName);
        sessionStorage.setItem("lastClickMenuId", menuId);
        var optContent = menuId + "#" + "bySubjectId" + "#" + menuName + "#" + childrenCount;
        this.props.callbackParent(optContent, this.breadCrumbArray);
    }
    //判断当前点击的菜单key是否已经在被点击key的数组中
    checkCurrentMenuKeyIsExist(currentClickKey){

        for (var i = 0; i < this.openKeys.length; i++) {
            var existKeyArray = this.openKeys[i].split("#");
            var menuId = existKeyArray[0];
            var menuName = existKeyArray[2];

            var currentMenuKeyArray = currentClickKey.split("#");
            var currentMenuId = currentMenuKeyArray[0];
            var currentMenuName = currentMenuKeyArray[2];

            if (menuId == currentMenuId && menuName == currentMenuName) {
                return true;
            }
        }
        return false;
    }

    //构建被点击菜单key的数组
    buildOpenMenuKeysArray(currentClickKey, menuLevel){
        if (menuLevel == 0) {
            this.openKeys.push(currentClickKey);
        } else {
            var isExist = this.checkCurrentMenuKeyIsExist(currentClickKey);
            if (isExist == false) {
                this.openKeys.push(currentClickKey);
            }
        }
    }

    bulidBreadCrumbArray (menuText, menuLevel, menuId, openKeys) {
        var breadJson = {
            hrefLink: '#/MainLayout',
            hrefText: menuText,
            menuLevel: menuLevel,
            menuId: menuId,
            openKeysStr: this.openKeys
        };
        if (menuLevel == 0) {
            this.breadCrumbArray = [];
            this.breadCrumbArray.push(breadJson);
        } else {
            this.checkSameLevelBread(breadJson, this.breadCrumbArray);
        }

        //全局存放用户在知识点导航下的访问路径，退出时将此值保存到数据库，下次登录时获取
        sessionStorage.setItem("openKeysStr", this.openKeys);
        this.setState({breadCrumbArray: this.breadCrumbArray });
        return this.breadCrumbArray;
    }



    checkIsFatherLevel(breadJson, breadCrumbArr){
        var index = -1;
        for (var i = 0; i < breadCrumbArr.length; i++) {
            //如果是相同层次的菜单，则返回当前的菜单索引位置
            if (breadJson.menuLevel == breadCrumbArr[i].menuLevel) {
                index = i;
                break;
            }
        }
        if (index != -1) {
            //如果点击的是同级菜单，则替换当前的菜单，并删除之后的所有菜单项目
            breadCrumbArr[index] = breadJson;
            for (var i = 0; i < breadCrumbArr.length; i++) {
                if (i > index) {
                    breadCrumbArr.splice(i, 1);
                }
            }
            breadCrumbArr.push(breadJson);
        } else {
            breadCrumbArr.push(breadJson);
        }
        return breadCrumbArr;
    }

    checkSameLevelBread (breadJson, breadCrumbArr) {
        var index = -1;
        for (var i = 0; i < breadCrumbArr.length; i++) {
            //如果是相同层次的菜单，则返回当前的菜单索引位置
            if (breadJson.menuLevel <= breadCrumbArr[i].menuLevel) {
                index = i;
                break;
            }
        }
        var removeArray = [];
        if (index != -1) {
            //如果点击的是同级菜单，则替换当前的菜单，并删除之后的所有菜单项目
            breadCrumbArr[index] = breadJson;
            for (var i = 0; i < breadCrumbArr.length; i++) {
                if (i > index) {
                    removeArray.push(i);
                }
            }
            breadCrumbArr.splice(removeArray[0], removeArray.length);
        } else {
            breadCrumbArr.push(breadJson);
        }

        return breadCrumbArr;
    }

    getLessonMenu(){
        let _this = this;
        var param = {
            "method": 'getUserRalatedPoints',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {

                if (!ret.response || !ret.response.length) {
                        this.children = "";
                        _this.setState({noHaveKnowledgeTip: <div className="binding_a">您目前还没有知识点，请先点击下方按钮绑定知识点</div>});
                    return message.info(ret.msg);
                }

                _this.buildMenuChildren(ret.response);
                _this.setState({totalCount: ret.response.length, noHaveKnowledgeTip: ''});

            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    buildMenuChildren (menuList) {
        var menuContent;
        this.children = menuList.map((e, i) => {
            menuContent = (e[0] != null ? e[0] : e);

            return <SubMenu
                key={menuContent.id + "#" + menuContent.children.length + "#" + "0" + "#" + menuContent.content + "#" + ""}
                style={{backgroundColor: '#e5f2fe'}} isRootMenu="true" onTitleClick={this.subMenuTitleClick}
                title={<span>{menuContent.content}</span>}>
                {
                    menuContent.children.map(konwledge1 => <SubMenu
                        key={konwledge1.id + "#" + konwledge1.children.length + "#" + "1" + "#" + konwledge1.content + "#" + menuContent.content}
                        style={{}} isRootMenu="false" onTitleClick={this.subMenuTitleClick}
                        title={<span>{konwledge1.content}</span>}>
                        {konwledge1.children.map(konwledge2 => <SubMenu
                            key={konwledge2.id + "#" + konwledge2.children.length + "#" + "2" + "#" + konwledge2.content + "#" + konwledge1.content}
                            style={{}} isRootMenu="false" onTitleClick={this.subMenuTitleClick}
                            title={<span>{konwledge2.content}</span>}>
                            {konwledge2.children.map(konwledge3 => <SubMenu
                                key={konwledge3.id + "#" + konwledge3.children.length + "#" + "3" + "#" + konwledge3.content + "#" + konwledge2.content}
                                style={{}} isRootMenu="false" onTitleClick={this.subMenuTitleClick}
                                title={<span>{konwledge3.content}</span>}>
                                {konwledge3.children.map(konwledge4 => <SubMenu
                                    key={konwledge4.id + "#" + konwledge4.children.length + "#" + "4" + "#" + konwledge4.content + "#" + konwledge3.content}
                                    style={{}} isRootMenu="false" onTitleClick={this.subMenuTitleClick}
                                    title={<span>{konwledge4.content}</span>}>
                                    {konwledge4.children.map(konwledge5 => <SubMenu
                                        key={konwledge5.id + "#" + konwledge5.children.length + "#" + "5" + "#" + konwledge5.content + "#" + konwledge4.content}
                                        style={{}} isRootMenu="false" onTitleClick={this.subMenuTitleClick}
                                        title={<span>{konwledge5.content}</span>}>
                                        {konwledge5.children.map(konwledge6 => <SubMenu
                                            key={konwledge6.id + "#" + konwledge6.children.length + "#" + "6" + "#" + konwledge6.content + "#" + konwledge5.content}
                                            style={{}} isRootMenu="false" onTitleClick={this.subMenuTitleClick}
                                            title={<span>{konwledge6.content}</span>}>
                                        </SubMenu>)}
                                    </SubMenu>)}
                                </SubMenu>)}
                            </SubMenu>)}
                        </SubMenu>)}
                    </SubMenu>)
                }
            </SubMenu>
        });
    }

    hasChild (menuContent) {
        if (menuContent.children.length != 0) {
            return true;
        } else {
            return false;
        }
    }

    handleClick(e) {
        this.setState({
            currentMenu: e.key,
        });
    }

    showModal (optType, editSchuldeId) {
        this.refs.bindKnowledgeComponent.showModal();
    }

    handleMenu(){
        this.getLessonMenu();
    }

    render() {
        return (
            <div>
                {this.state.noHaveKnowledgeTip}
                <div className="menu_til">
                    <Button type="primary" onClick={this.showModal}
                            className="add_study-d add_study-d-le">管理知识点</Button>
                </div>
                <BindKnowledgeComponents ref="bindKnowledgeComponent" callbackParent={this.handleMenu}/>
                <Menu ref="middleMenu" onClick={this.handleClick}
                      selectedKeys={[this.state.currentMenu]}
                      className="cont_t"
                      mode="inline"
                >
                    {this.children}
                </Menu>
            </div>
        );
    }
};
export default KnowledgeMenuComponents;
