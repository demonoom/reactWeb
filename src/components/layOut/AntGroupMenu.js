import React, { PropTypes,Link } from 'react';
import { Table} from 'antd';
import { Menu, Button } from 'antd';
import {doWebService} from '../../WebServiceHelper';
var mMenu;

var columns = [ {
  title:'头像',
  dataIndex:'userHeadIcon'
},{
  title: '联系人',
  dataIndex: 'userContacts',
}];

const AntGroupMenu = React.createClass({
  getInitialState() {
    mMenu = this;
    return {
      userContactsData:[],
    };
  },

  componentDidMount(){
    mMenu.getAntGroup()
  },

  /**
   * 获取联系人列表
   */
  getAntGroup(){
    var userContactsData=[];
    var param = {
      "method": 'getUserContacts',
      "ident": sessionStorage.getItem("ident"),
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        var response = ret.response;
        response.forEach(function (e) {
          var userId = e.colUid;
          var userName = e.userName;
          var imgTag = <div><img src={e.avatar}  className="antnest_38_img" height="38" ></img></div>;
          var userJson = {key:userId,userContacts:userName,userObj:e,"userHeadIcon":imgTag};
          if(userId != sessionStorage.getItem("ident")){
            userContactsData.push(userJson);
          }
        });
        mMenu.setState({"userContactsData":userContactsData});
      },
      onError: function (error) {
        message.error(error);
      }
    });
  },

  getPersonCenterInfo(){},

  getUserChatGroup(){},

  showCreateChatGroup(){},

  render() {
    return (
        <div>
          <div className="menu_til">
            <Button onClick={mMenu.showCreateChatGroup}>创建群聊</Button>
          </div>
          <div className="maaee_group" onClick={mMenu.getUserChatGroup}>
            <img src={require('../images/groupTitle.png')} className="antnest_38_img" />
            <span className=""　icon="usergroup-add">我的群组</span>
          </div>
          <Table className="maaeegroup" onRowClick={mMenu.getPersonCenterInfo} showHeader={false}
                 scroll={{ x: true, y: 430}} columns={columns} dataSource={mMenu.state.userContactsData}
                 pagination={false}/>
        </div>
    );
  },
});
export default AntGroupMenu;