/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Input, Button, Row, Col,message,Checkbox,Transfer, Table} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import {TYPE_TEACHER} from '../../utils/Const';
const CheckboxGroup = Checkbox.Group;

const columns = [{
    title: '全选',
    dataIndex: 'name',
    className:'dold_text'
}];

const data = [{
    key: '1',
    name: 'John Brown',
}, {
    key: '2',
    name: 'Jim Green',
}];

class MakeDingModal extends React.Component {

  constructor(props) {
    super(props);
    var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
    this.state = {
      loginUser : loginUser,
      isShow: false,
      selectedRowKeys: [],
    };
    this.MakeDingModalHandleCancel = this.MakeDingModalHandleCancel.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
    this.getPerson = this.getPerson.bind(this);

  }

  componentDidMount(){
    var _this = this;
    var isShow = _this.props.isShow;
    this.setState({isShow});
    this.getPerson();
  }

  componentWillReceiveProps(nextProps) {
    var isShow = nextProps.isShow;
    this.setState({isShow});
  }

    /**
     * 模态框关闭回调
     * @constructor
     */
    MakeDingModalHandleCancel(){
    this.setState({"isShow":false});
    this.props.closeDingModel();
  }

    /*选中人员的回调*/
    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({selectedRowKeys});
    }

    /*获取组织架构的全部人员*/
    getPerson() {
        var param = {
            "method": 'getStructureUsers',
            "operateUserId": this.state.loginUser.colUid,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                console.log(data);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

  render() {
      const rowSelection = {
          selectedRowKeys: this.state.selectedRowKeys,
          onChange: this.onSelectChange,
      };
    return (
        <Modal
            visible={this.state.isShow}
            width={850}
            title="创建叮"
            onCancel={this.MakeDingModalHandleCancel}
            transitionName=""  //禁用modal的动画效果
            maskClosable={false} //设置不允许点击蒙层关闭
            footer={[
              <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn">发送</button>,
              <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={this.MakeDingModalHandleCancel} >取消</button>
            ]}
        >


          <Row className="ant-form-item">
            <Col span={24}>
              <div className="ant-transfer make_dingPanel">
                {/*左*/}
                <Col className="ant-transfer-list team_add">

                </Col>

                {/*右*/}
                <Col className="ant-transfer-list team_add">
                  <Table rowSelection={rowSelection} columns={columns} dataSource={data}  pagination={false}/>
                </Col>
              </div>
            </Col>
          </Row>

        </Modal>
    );
  }

}

export default MakeDingModal;
