/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Radio, Button, Row, Col,message,Input,Select,Cascader} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
const RadioGroup = Radio.Group;
const Option = Select.Option;
/**
 * 部门设置
 */
class GroupSettingModal extends React.Component {

  constructor(props) {
    super(props);
    var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    this.state = {
      loginUser : loginUser,
      isShow: false,
      parentGroup:'',  //部门信息
      groupOptions:[],
    };
    this.closeGroupSettingModal = this.closeGroupSettingModal.bind(this);
    this.handleOk = this.handleOk.bind(this);
    this.getChatGroupById = this.getChatGroupById.bind(this);
    this.getStructureById = this.getStructureById.bind(this);
    this.listStructures = this.listStructures.bind(this);
    this.getStrcutureMembers = this.getStrcutureMembers.bind(this);
    this.updateStructureChatGroupOwner = this.updateStructureChatGroupOwner.bind(this);
    this.groupMemberHandleChange = this.groupMemberHandleChange.bind(this);
    this.groupSelectOnChange = this.groupSelectOnChange.bind(this);
    this.loadGroupSelectData = this.loadGroupSelectData.bind(this);
  }

  componentDidMount(){
    var _this = this;
    var isShow = _this.props.isShow;
    var rootStructureId = -1;
    this.getStructureById(rootStructureId);
    this.setState({isShow});
  }

  componentWillReceiveProps(nextProps) {
    var isShow = nextProps.isShow;
    //部门设置时，获取部门信息
    var parentGroup = nextProps.parentGroup;
    var parentGroupName="";
    var parentId = "";
    var chatGroupId ="";
    if(isEmpty(parentGroup)==false){
      parentGroupName = parentGroup.name;
      parentId = parentGroup.id;
      chatGroupId = parentGroup.chatGroupId;
    }
    this.getStrcutureMembers(parentId,1);
    this.getChatGroupById(chatGroupId);
    this.setState({isShow,parentGroup,parentGroupName,parentId});
  }

  /**
   * 根据群id获取群对象
   * @param chatGroupId 群id
   */
  getChatGroupById(chatGroupId){
    let _this = this;
    var param = {
      "method": 'getChatGroupById',
      "chatGroupId": chatGroupId,
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        var response = ret.response;
        if(isEmpty(response)==false){
          var members = response.members;
          var ownerId = response.ownerId;
          var chatGroupMemberArray=[];
          if(isEmpty(members)==false){
            members.forEach(function (member) {
                var memberId = member.colUid;
                var memberName = member.userName;
                var memberOption = <Option value={memberId}>{memberName}</Option>;
              chatGroupMemberArray.push(memberOption);
            });
          }
          _this.setState({chatGroupMemberArray,ownerId});
        }
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  /**
   * 根据部门id获取部门成员
   * @param operateUserId
   * @param structureId
   */
  getStrcutureMembers(structureId,pageNo){
    let _this = this;
    var param = {
      "method": 'getStrcutureMembers',
      "operateUserId": _this.state.loginUser.colUid,
      "structureId": structureId,
      "pageNo":pageNo,
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        var response = ret.response;
        var subGroupMemberList = [];
        if(isEmpty(response)==false){
          response.forEach(function (member) {
            var user = member.user;
            var userOption = <Option key={member.id}>{user.userName}</Option>;
            subGroupMemberList.push(userOption);
          });
        }
        var pager = ret.pager;
        _this.setState({subGroupMemberList,totalMember:pager.rsCount});
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  /**
   * 获取当前用户的组织根节点
   * @param operateUserId
   * @param structureId
   */
  getStructureById(structureId){
    let _this = this;
    var param = {
      "method": 'getStructureById',
      "operateUserId": _this.state.loginUser.colUid,
      "structureId": structureId,
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        var response = ret.response;
        var groupOptions = [];
        var groupOption = {
          value: response.id,
          label: response.schoolName
        };
        groupOptions.push(groupOption);
        _this.setState({groupOptions});

      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  /**
   * 更改组织架构群对应的群主
   * @param chatGroupId 群id
   */
  updateStructureChatGroupOwner(){
    let _this = this;
    var param = {
      "method": 'updateStructureChatGroupOwner',
      "operateUserId": _this.state.loginUser.colUid,
      "structureId":_this.state.structureId,
      "ownerId":_this.state.ownerId
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        if(ret.msg=="调用成功" && ret.success == true){
          message.success("群主设置成功！");
          _this.closeGroupSettingModal();
        }
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  /**
   * 关闭学校设置窗口
   */
  closeGroupSettingModal(){
    this.setState({"isShow":false});
  }

  /**
   * 确定完成操作
   */
  handleOk(){
    this.updateStructureChatGroupOwner();
  }

  /**
   * 部门主管列表选中响应
   */
  groupMemberHandleChange(value) {
    console.log(`selected ${value}`);
    this.setState({
      "groupManager":value,
    });
  }

  /**
   * 点击部门名称时，查询子部门，并追加到CaseCade组件中
   * @param operateUserId
   * @param structureId
   */
  listStructures(operateUserId,structure){
    let _this = this;
    var param = {
      "method": 'listStructures',
      "operateUserId": operateUserId,
      "structureId": structure.id,
    };
    doWebService(JSON.stringify(param), {
      onResponse: function (ret) {
        _this.buildMenuChildren(ret.response,structure);
      },
      onError: function (error) {
        message.error(error);
      }
    });
  }

  loadGroupSelectData(selectedOptions){
      const targetOption = selectedOptions[selectedOptions.length - 1];
      targetOption.loading = true;

      // load options lazily
      setTimeout(() => {
        targetOption.loading = false;
        targetOption.children = [{
          label: `${targetOption.label} Dynamic 1`,
          value: 'dynamic1',
        }, {
          label: `${targetOption.label} Dynamic 2`,
          value: 'dynamic2',
        }];
        this.setState({
          options: [...this.state.options],
        });
      }, 1000);
  }

  groupSelectOnChange(value, selectedOptions){
    console.log(value, selectedOptions);
    this.setState({
      inputValue: selectedOptions.map(o => o.label).join(', '),
    });
  }

  /**
   * 群主改变的响应
   * @param value
   */
  chatGroupManagerHandleChange(value) {
      console.log(`selected ${value}`);
  }

  chatGroupManagerHandleFocus() {
    console.log('focus');
  }

  chatGroupManagerHandleBlur(){
    console.log('blur');
  }


  render() {
    const { value } = this.state;
    return (
      <Modal
        title="部门设置"
        visible={this.state.isShow}
        width={440}
        transitionName=""  //禁用modal的动画效果
        closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
        maskClosable={false} //设置不允许点击蒙层关闭
        onCancel={this.closeGroupSettingModal}
        onOk={this.handleOk}
        className="schoolgroup_modal"
      >
        <div className="modal_register_main">
          <Row className="ant_row">
            <Col span={24}>
              部门名称:<Input placeholder="部门名称"　value={this.state.parentGroupName} />
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              部门主管:
              <Select
                  mode="tags"
                  tags={true}
                  style={{ width: '100%' }}
                  value={this.state.groupManager}
                  placeholder="Please select"
                  defaultValue={[]}
                  onChange={this.groupMemberHandleChange}
              >
                {this.state.subGroupMemberList}
              </Select>
            </Col>
          </Row>
          <Row className="ant_row">
            <Col span={24}>
              群主设置:
              <Select
                  showSearch
                  style={{ width: 200 }}
                  placeholder="Select a person"
                  optionFilterProp="children"
                  onChange={this.chatGroupManagerHandleChange}
                  onFocus={this.chatGroupManagerHandleFocus}
                  onBlur={this.chatGroupManagerHandleBlur}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.state.chatGroupMemberArray}
              </Select>
            </Col>
          </Row>
          {/*<Row className="ant_row">
            <Col span={24}>
              <span>上级部门：</span>
              <Cascader
                  options={this.state.groupOptions}
                  loadData={this.loadGroupSelectData}
                  onChange={this.groupSelectOnChange}
                  changeOnSelect
              />
            </Col>
          </Row>*/}
        </div>
      </Modal>
    );
  }

}

export default GroupSettingModal;
