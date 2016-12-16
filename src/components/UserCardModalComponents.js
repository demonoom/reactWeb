import React, { PropTypes } from 'react';
import { Modal } from 'antd';
import { doWebService } from '../WebServiceHelper';

var teacherInfo;
const UserCardModalComponents = React.createClass({
  getInitialState() {
    teacherInfo = this;
    return {
      loading: false,
      visible: false,
      userName:'',
      userHeadIcon:'',
      courseName:'',
      schoolName:'',
      schoolAddress:'',
    };
  },
  showModal() {
    var ident = sessionStorage.getItem("ident");
    teacherInfo.getTeacherInfo(ident);
    teacherInfo.setState({
      visible: true,
    });
  },
  handleOk() {
    teacherInfo.setState({ loading: true });
    setTimeout(() => {
      teacherInfo.setState({ loading: false, visible: false });
    }, 3000);
  },
  handleCancel() {
    teacherInfo.setState({ visible: false });
  },

  componentWillMount(){
    var ident = sessionStorage.getItem("ident");
    // alert("will"+ident);
    teacherInfo.getTeacherInfo(ident);
  },

  getTeacherInfo(ident){
    var param = {
      "method":'getTeacherInfo',
      "ident":ident,
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        console.log(ret.msg);
        var response = ret.response;
        if(ret.msg=="调用成功" && response!=null){
          // alert("老师信息获取成功");
          var userName = response.user.userName;//用户名
          var userHeadIcon = response.antLevel.icon;//头像
          var courseName = response.course.colCourse;//科目
          var schoolName = response.school.name;//学校名称
          var schoolAddress = response.school.address;
          teacherInfo.setState({userName:userName,userHeadIcon:userHeadIcon,courseName:courseName,schoolName:schoolName,schoolAddress:schoolAddress});
        }else{
          alert("老师信息获取失败");
        }
      },
      onError : function(error) {
        alert(error);
      }
    });
  },

  render() {
    return (
        <div className="layout_logo">
          <img src={teacherInfo.state.userHeadIcon}  onClick={teacherInfo.showModal}/>
          <Modal
              visible={teacherInfo.state.visible}
              title={<p className="user_cont1"> <img className="img_us" src={teacherInfo.state.userHeadIcon}  onClick={teacherInfo.showModal}/><span>{teacherInfo.state.userName}</span><img src={teacherInfo.state.userHeadIcon} className="blur"/><br/></p>}
              onOk={teacherInfo.handleOk}
              onCancel={teacherInfo.handleCancel}
              className="model_wi"
              transitionName=""  //禁用modal的动画效果
              footer={[

              ]}
          >
            {/*<p className="user_cont model_to"><span className="name">学校名称：{teacherInfo.state.schoolName}</span><span className="name1"></span></p>*/}
            <p className="user_cont model_to"><span className="name">学校名称：</span><span className="name1">{teacherInfo.state.schoolName}</span></p>
            <p className="user_cont"><span className="name">地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;区：</span><span className="name1">{teacherInfo.state.schoolAddress}</span></p>

            {/* userName:userName,
             userHeadIcon:userHeadIcon,
             courseName:courseName,
             schoolName*/}
            <p className="user_cont"><span className="name">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</span><span className="name1">{teacherInfo.state.userName}</span></p>
            {/*<p className="user_cont"><span className="name">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span><span className="name1">一年级</span></p>
             <p className="user_cont"><span className="name">班&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span><span className="name1">一班</span></p>*/}
            <p className="user_cont"><span className="name">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="name1">{teacherInfo.state.courseName}</span></p>

          </Modal>
        </div>
    );
  },
});
export  default UserCardModalComponents;

