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
        var i=0;
        response.forEach(function (e) {
          var userId = e.colUid;
          var userName = e.userName;
          var imgTag = <img src={e.avatar}  className="antnest_38_img" height="38" ></img>;
          var userJson = {key:userId,userContacts:userName,userObj:e,"userHeadIcon":imgTag};
          if(userId != sessionStorage.getItem("ident")){
            userContactsData.push(userJson);
          }
          if(i==0){
            mMenu.setState({selectRowKey:userId});
          }
          i++;
        });
        mMenu.setState({"userContactsData":userContactsData});
        mMenu.props.callbackSetFirstPerson(userContactsData);
      },
      onError: function (error) {
        message.error(error);
      }
    });
  },

  /**
   * 点击联系人列表表格行时，获取当前行对应的记录信息
   * @param record　当前行的用户信息
   * @param index　当前行的索引顺序，从０开始
   */
  getPersonCenterInfo(record, index){
    mMenu.setState({selectRowKey:record.key});
    mMenu.props.callbackPersonCenterData(record.key);
  },

  getUserChatGroup(){
    //获取我的群组列表
    mMenu.props.callbackGetGroupInfo();
  },

  /**
   * 设置当前选中行的背景颜色
   * @param record
   * @param index
   * @returns {string}
   */
  getRowClassName(record, index){
    if(record.key==mMenu.state.selectRowKey){
      return "tableRow";
    }
  },

  render() {
    return (
        <div>
          <div className="menu_til">
            蚁群
          </div>
          <div className="maaee_group affix_bottom_tc" onClick={mMenu.getUserChatGroup}>
            <img src={require('../images/groupTitle.png')} className="antnest_38_img" />
            <span className=""　icon="usergroup-add">我的群组</span>
          </div>

          <Table className="maaeegroup yiqun" onRowClick={mMenu.getPersonCenterInfo} showHeader={false}  columns={columns} dataSource={mMenu.state.userContactsData}
                 pagination={false} rowClassName={mMenu.getRowClassName}/>
        </div>
    );
  },
});
export default AntGroupMenu;