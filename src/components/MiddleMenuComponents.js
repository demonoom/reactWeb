import React, { PropTypes,Link } from 'react';
import { Table, Popconfirm, Button } from 'antd';
import ReactDOM from 'react-dom';
import { Menu, Icon } from 'antd';
import { Badge } from 'antd';
import TeachingComponents from '../components/TeachingComponents';
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

// let uuid = 0;



let lessonData=new Array();
let List=new Array();
const MiddleMenuComponents = React.createClass({
  getInitialState() {
    return {
      current: '6',
      openSubMenu:this.props.activeMenu,
      show: 1,
      lessonCount:3,
      //titleList:{1: ['新增菜单'],2: ['新增菜单111']},
      titleList:['新增菜单','新增菜单111'],
    };
    List = this.state.titleList;
  },

  componentWillReceiveProps(){
      this.setState({openSubMenu:this.props.activeMenu});
  },
  handleClick(e) {
    alert(e.key);
    this.setState({
      current: e.key,
    });
    //location.hash=e.key;
  },
  subMenuTitleClick(e){
    this.setState({openSubMenu:e.key});
  },
  openMenu:function (e) {
    alert(e.key);
  },

  handleEmail: function(values){
    lessonData=new Array();
    for(let i=1;i<=values.courseTimes;i++){
      lessonData.push({lessonid:i,lessonName:`第${i}课时`});
    }
    console.log("lessonData:"+lessonData);
    this.setState({titleList:{1: [values.nickname],}});
    this.setState({lessonCount: values.courseTimes});
    //List.push(this.state.titleList);
    List.push(values.nickname);
    ///this.refs.middleMenu.appendChild(children);
    //ReactDOM.findDOMNode(this.refs.middleMenu).append("surprise");
    //this.refs.middleMenu.render(children);
    //this.refs.middleMenu;
  },

  render() {
    const Options = lessonData.map(lesson => <Menu.Item key={lesson.lessonid}>{lesson.lessonName}</Menu.Item>);
    const children = List.map((e, i)=> {
      return <SubMenu key={e} onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>{e}</span><Badge count={this.state.lessonCount}/></span>}>
        {Options}
      </SubMenu>
    });

    return (
      <div>
        <TeachingComponents callbackParent={this.handleEmail}/>
        <Menu ref="middleMenu" onClick={this.handleClick}
              style={{ width: 240 }}
              defaultOpenKeys={[this.state.openSubMenu]}
              openKeys={[this.state.openSubMenu]}
              selectedKeys={[this.state.current]}
              mode="inline"
        >
          {/*添加了徽标，用来显示菜单下的课时数*/}
          <SubMenu key="goSchool" onTitleClick={this.subMenuTitleClick} title={<span><Icon type="mail" /><span>上学啦</span><Badge count={4}/></span>}>
            <Menu.Item key="LeftNav">第1课时</Menu.Item>
            <Menu.Item key="2">第2课时</Menu.Item>
            <Menu.Item key="3">第3课时</Menu.Item>
            <Menu.Item key="4">第4课时</Menu.Item>
          </SubMenu>

          {children}

        </Menu>
      </div>
    );
  },
});
export default MiddleMenuComponents;
