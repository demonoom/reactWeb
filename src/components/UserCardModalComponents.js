import React, { PropTypes } from 'react';
import { Modal,message,Button,Upload,Icon } from 'antd';
import { doWebService } from '../WebServiceHelper';

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
        message.error('You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
}

var teacherInfo;


const UserCardModalComponents = React.createClass({
  getInitialState() {
    teacherInfo = this;
    return {
        ident: this.props.userid || sessionStorage.getItem("ident"),
      loading: false,
      visible: false,
      userName:'',
      userHeadIcon:'',
      courseName:'',
      schoolName:'',
      schoolAddress:'',
        imageUrl:''
    };
  },
  showModal() {
    var ident = sessionStorage.getItem("ident");
    teacherInfo.getTeacherInfo(ident);
    teacherInfo.setState({
      visible: true,
    });
  },


  handleCancel() {
    teacherInfo.setState({ visible: false });
  },

  componentWillMount(){
    var ident = sessionStorage.getItem("ident");
    teacherInfo.getTeacherInfo(ident);
  },

  getTeacherInfo(ident){
    var param = {
      "method":'getTeacherInfo',
      "ident":ident,
    };
    doWebService(JSON.stringify(param), {
      onResponse : function(ret) {
        var response = ret.response;
        if(ret.msg=="调用成功" && response!=null){
          // alert("老师信息获取成功");
          var userName = response.user.userName;//用户名
          var userHeadIcon = response.user.avatar;//头像
          var courseName = response.course.colCourse;//科目
          var schoolName = response.school.name;//学校名称
          var schoolAddress = response.school.address;
            teacherInfo.user = response.user;
          teacherInfo.setState({userName:userName,userHeadIcon:userHeadIcon,courseName:courseName,schoolName:schoolName,schoolAddress:schoolAddress});
        }else{
          // alert("老师信息获取失败");
          message.error("老师信息获取失败");
        }
      },
      onError : function(error) {
        // alert(error);
        message.error(error);
      }
    });
  },

  searchOwnerCourseWare(){
    teacherInfo.props.callbackParent("getCourseWares");
    teacherInfo.setState({ visible: false });
  },

  searchOwnerSubject(){
    teacherInfo.props.callbackParent("getSubjects");
    teacherInfo.setState({ visible: false });
  },
  /**
   * 蚁巢入口
   */
  searchAntNest(){
      // alert("蚁巢入口");
      teacherInfo.props.callbackParent("visitAntNest");
      teacherInfo.setState({ visible: false });
  },

  /**
   * 蚁群入口
   */
  searchAntGroup(){
    teacherInfo.props.callbackParent("visitAntGroup");
    teacherInfo.setState({ visible: false });
  },

    myFavrites(){
        this.props.callbackParent("myFavrites");
        this.setState({ visible: false });
    },
    findStudentPwd(){
        this.props.callbackParent("resetStudentAccountKey");
        this.setState({ visible: false });
    },
    MyFollows(){
        this.props.callbackParent("myFollows");
        this.setState({ visible: false });
    },
    myMTV(){
       this.props.callEvent({resouceType: 'visitAntGroup', ref: 'antGroupTabComponents', methond:'callBackGetLiveInfo', param: teacherInfo.user });
      //  this.props.callbackParent("myMTV");
        this.setState({ visible: false });
    },

    // face change
    changeFace(info){
        var _this=this;
        var param = {
            "method":'upadteAvatar',
            "ident": this.state.ident,
            "avatar": info.response,
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(res) {
               if(res.success){
                   _this.setState({userHeadIcon:param.avatar} );
                   message.info('更换成功！',3)
               }else{
                   message.info('更换失败，请稍候重试！')
               }
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },

  getTitle(){
        let uploadProps={
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            showUploadList : false,
            className : "avatar-uploader",
            name : "avatar",
            beforeUpload (file){
                var fileType = file.type;
                if(fileType.indexOf("image")==-1){
                    message.error('只能上传图片文件，请重新上传',5);
                    return false;
                }
            },
            onChange (info){
                switch (info.file.status) {
                    case "uploading":
                        var percent = info.file.percent;
                        teacherInfo.setState({uploadPercent: percent, progressState: 'block'});
                        break;
                    case "removed":

                        break;
                    case "done":
                        teacherInfo.changeFace(info.file);
                      //  message.success(`${info.file.name} 文件上传成功`, 5);
                        break;
                    case "error":
                        message.error(`${info.file.name} 文件上传失败.`, 5);
                        break;
                }


            }

        };

   return <div>
       <Upload {...uploadProps}>
        {
            this.state.userHeadIcon ?  <img src={this.state.userHeadIcon}   className="img_us" /> :  <Icon type="plus" className="avatar-uploader-trigger" />
        }
      </Upload>
               <br/>
                <span className="date_tr">{this.state.userName} </span>
                { this.state.userHeadIcon ? <img src={this.state.userHeadIcon} className="blur"/> : null }
         </div>;
  },

  render() {

    return (
        <div className="layout_logo">
          <img src={this.state.userHeadIcon}  onClick={this.showModal}/>
          <Modal
              visible={this.state.visible}
              title={<div className="user_cont1">{this.getTitle()} </div>}
              onCancel={teacherInfo.handleCancel}
              className="model_wi"
              transitionName=""
              maskClosable={false} //设置不允许点击蒙层关闭
              footer={[

              ]}
          >
            <p className="user_cont model_to"><span className="name">学校名称：</span><span className="name1">{teacherInfo.state.schoolName}</span></p>
            <p className="user_cont"><span className="name">地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;区：</span><span className="name1">{teacherInfo.state.schoolAddress}</span></p>
            <p className="user_cont"><span className="name">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</span><span className="name1">{teacherInfo.state.userName}</span></p>
            <p className="user_cont"><span className="name">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="name1">{teacherInfo.state.courseName}</span></p>
			<p className="user_cont user_cont_cen">
            <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn add_study add_study-f" onClick={teacherInfo.searchOwnerCourseWare}>
              我的资源
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn ant-btn-f " onClick={teacherInfo.searchOwnerSubject}>
              我的题目
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn ant-btn-f topics_btn_le " onClick={teacherInfo.searchAntGroup}>
                蚁群
            </Button>

              <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn ant-btn-f topics_btn_le " onClick={this.myFavrites}>
                收藏
            </Button>
              <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn ant-btn-g topics_btn_le " onClick={this.findStudentPwd}>
                找回学生密码
              </Button>
              <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn ant-btn-f topics_btn_le " onClick={this.MyFollows}>
              我的关注
              </Button>
                <Button type="primary" htmlType="submit" className="login-form-button class_right user_btn ant-btn-f topics_btn_le " onClick={this.myMTV}>
              我的直播课
              </Button>
			</p>
          </Modal>
        </div>
    );
  },
});
export  default UserCardModalComponents;

