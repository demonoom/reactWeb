import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Radio,Table,message,Modal,Input,Transfer} from 'antd';
import {isEmpty} from '../../utils/utils';
import {getCloudClassRoomRequestURL} from '../../utils/CloudClassRoomURLUtils';
import {cloudClassRoomRequestByAjax} from '../../utils/CloudClassRoomURLUtils';
import {getPageSize} from '../../utils/Const';
const RadioGroup = Radio.Group;

var userTeamColumns = [ {
    title: '团队头像',
    dataIndex: 'teamPhoto',
    className: 'left-12',
},{
    title: '团队名称',
    dataIndex: 'teamName',
},{
    title: '团队人数',
    dataIndex: 'teamCount',
},{
    title: '团队设置',
    dataIndex: 'teamSet',
},];

const AntTeamComponents = React.createClass({

    getInitialState() {
        return {
            currentPage:1,
            userTeamData:[],
            createTeamModalVisible:false,
            totalTeamCount:0,
        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
        this.getTeamList(this.state.currentPage);
    },

    getTeamList(pageNo,whereJson){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("teamList");
        var requestType ="POST";
        var propertyJson={
            "numPerPage": getPageSize(),
            "currentPage": pageNo
        };
        if(typeof(whereJson)!="undefined" ){
            propertyJson.where=JSON.stringify(whereJson);
        }
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    var total = response.total;
                    var responseRows=response.rows;
                    var teamTableData = [];
                    responseRows.forEach(function (team) {
                        var subjectOpt=<div><Button style={{ }} type=""  value={team.id} onClick={_this.showTeamSettingModal}  icon="setting" title="设置" className="score3_i"></Button></div>;
                        var teamUsersPhoto=[];
                        var imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
                        if(isEmpty(team.users)==false ){
                            for(var i=0;i<team.users.length;i++){
                                var user = team.users[i];
                                var userAvatarTag = <img src={user.avatar} ></img>;
                                teamUsersPhoto.push(userAvatarTag);
                                if(i>=3){
                                    break;
                                }
                            }
                            switch (teamUsersPhoto.length){
                                case 1:
                                    imgTag = <div className="maaee_group_face1">{teamUsersPhoto}</div>;
                                    break;
                                case 2:
                                    imgTag = <div className="maaee_group_face2">{teamUsersPhoto}</div>;
                                    break;
                                case 3:
                                    imgTag = <div className="maaee_group_face3">{teamUsersPhoto}</div>;
                                    break;
                                case 4:
                                    imgTag = <div className="maaee_group_face">{teamUsersPhoto}</div>;
                                    break;
                            }
                        }
                        var teamUserCount=0;
                        if(isEmpty(team.users)==false){
                            teamUserCount = team.users.length;
                        }
                        teamTableData.push({
                            key: team.id,
                            teamPhoto:imgTag,
                            teamName: team.name,
                            teamCount: teamUserCount,
                            teamSet:subjectOpt
                        });
                    });
                    _this.setState({userTeamData:teamTableData,totalTeamCount:total});
                } else {
                    message.error("失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    showTeamSettingModal(){

    },

    teamTypeFliterOnChange(e){
        console.log('radio checked', e.target.value);
        this.setState({
            teamTypeFliterValue: e.target.value,
        });
        /*var whereJson={};
        if(e.target.value==0){
            whereJson.is_publish="";
        }else{
            whereJson.is_publish=e.target.value;
        }*/
        //this.getCourseList(this.state.currentPage,whereJson);
    },

    onTeamPageChange(page){
        // this.getUserChatGroupById(page);
        this.setState({
            currentPage: page,
        });
    },

    /**
     * 创建群组时，获取当前用户的联系人列表
     */
    getUserContactsMockData(){

        var _this = this;
        const mockData = [];
        var targetKeys = [];
        var requestUrl = getCloudClassRoomRequestURL("findClass");
        var requestType ="POST";
        var propertyJson={};
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    response.forEach(function (e) {
                        /*var userId = e.colUid;
                        var userName = e.userName;
                        var userType = e.colUtype;
                        if(userType!="SGZH" && parseInt(userId) != sessionStorage.getItem("ident")){
                            const data = {
                                key: userId,
                                title: userName,
                            };
                            mockData.push(data);
                        }*/
                    });
                    _this.setState({ mockData, targetKeys });
                } else {
                    message.error("失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    createTeamModalHandleCancel(){
        this.setState({"createTeamModalVisible":false,"updateGroupId":''});
    },

    createTeam(){

    },

    teamNameOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var teamName = target.value;
        this.setState({"teamName":teamName});
    },

    showCreateTeamModal(){
        this.setState({"createTeamModalVisible":true});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <div style={{overflow:'scroll'}}>
                <div>
                    <RadioGroup onChange={this.teamTypeFliterOnChange} value={this.state.teamTypeFliterValue}>
                        <Radio value="0">我创建的团队</Radio>
                        <Radio value="1">我加入的团队</Radio>
                    </RadioGroup>
                </div>
                <div>
                    <Table
                           scroll={{ x: true, }} columns={userTeamColumns} showHeader={false}
                           dataSource={this.state.userTeamData}
                           pagination={{ total:this.state.totalCount,
                               pageSize: getPageSize(),onChange:this.onTeamPageChange }}/>
                </div>

                <Modal
                    visible={this.state.createTeamModalVisible}
                    title="创建团队"
                    onCancel={this.createTeamModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={this.createTeam}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={this.createTeamModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <span >
                            <Input placeholder="请输入团队名称" value={this.state.teamName} defaultValue={this.state.teamName} onChange={this.teamNameOnChange} />
                        </span>
                    </Row>
                    <Row className="ant-form-item">
                        <Col span={24}>
                            <Transfer
                                dataSource={this.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 320,
                                }}
                                titles={['待选联系人','已选联系人']}
                                operations={['', '']}
                                targetKeys={this.state.targetKeys}
                                onChange={this.transferHandleChange}
                                render={item => `${item.title}`}
                            />
                        </Col>
                    </Row>

                </Modal>
            </div>
        );
    },
});

export default AntTeamComponents;
