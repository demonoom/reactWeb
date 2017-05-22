import React, {PropTypes} from 'react';
import {message, Upload, Icon} from 'antd';
import {doWebService} from '../WebServiceHelper';


const UserInfo = React.createClass({
    getInitialState() {
        return {
            ident: this.props.userid || sessionStorage.getItem("ident"),
            loading: false,
            userName: '',
            userHeadIcon: '',
            courseName: '',
            schoolName: '',
            schoolAddress: '',
            imageUrl: ''
        };
        this.changeFace = this.changeFace.bind(this);
    },

    componentWillMount(){
        this.getTeacherInfo(this.state.ident);
    },

    getTeacherInfo(ident){

        let _this = this;
        var param = {
            "method": 'getPersonalCenterData',
            "userId": ident,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                // var response = ret.response;
                var userInfo = ret.response;
                if (userInfo) {
                    var userName = userInfo.user.userName;//用户名
                    var userHeadIcon = userInfo.user.avatar;//头像
                    var courseName;
                    if(userInfo.user.colUtype=="TEAC"){
                        courseName = userInfo.course;//科目
                    }
                    var schoolName = userInfo.school;//学校名称
                    var grade = userInfo.grade;
                    _this.user = userInfo.user;
                    _this.setState({
                        userName: userName,
                        userHeadIcon: userHeadIcon,
                        userType:userInfo.user.colUtype,
                        courseName: courseName,
                        schoolName: schoolName,
                        grade: grade
                    });
                } else {
                    message.error("个人信息获取失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },


    // face change
    changeFace(info){
        var _this = this;
        var param = {
            "method": 'upadteAvatar',
            "ident": this.state.ident,
            "avatar": info.response,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    message.info('更换成功！', 3)
                    _this.setState({userHeadIcon: param.avatar});
                } else {
                    message.info('更换失败，请稍候重试！')
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getTitle(){
        let _this=this;
        let uploadProps = {
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            showUploadList: false,
            className: "avatar-uploader",
            name: "avatar",
            beforeUpload (file){
                var fileType = file.type;
                if (fileType.indexOf("image") == -1) {
                    message.error('只能上传图片文件，请重新上传', 5);
                    return false;
                }
            },
            onChange (info){
                switch (info.file.status) {
                    case "uploading":
                        var percent = info.file.percent;
                        _this.setState({uploadPercent: percent, progressState: 'block'});
                        break;
                    case "removed":

                        break;
                    case "done":
                        _this.changeFace(info.file);
                        break;
                    case "error":
                        message.error(`${info.file.name} 文件上传失败.`, 5);
                        break;
                }


            }

        };

        return <div className="gary_person">
            <Upload {...uploadProps}>
                {
                    this.state.userHeadIcon ? <img src={this.state.userHeadIcon} className="userinfo_name userinfo_face user_with_border4 affix_bottom_tc"/> :
                        <Icon type="plus" className="avatar-uploader-trigger"/>
                }
            </Upload>
            <br/>
            <span className="font_gray_33 date_tr">{this.state.userName} </span>
            {/*{ this.state.userHeadIcon ? <img src={this.state.userHeadIcon} className="blur"/> : null }*/}
        </div>;
    },


    render() {

        var courseOrGrade;
        if(this.state.userType=="TEAC"){
            courseOrGrade = <p className="user_cont"><span className="name">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                目：</span><span
                className="name1">{this.state.courseName}</span></p>;
        }else{
            courseOrGrade = <p className="user_cont"><span className="name">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                级：</span><span
                className="name1">{this.state.grade}</span></p>;
        }

        return (
			<div className="userinfo_bg">
            <div className="">
                {this.getTitle()}
				<div className="userinfo_top">
					<p className="user_cont"><span className="name ant-col-3">学校名称：</span><span
                    className="name1">{this.state.schoolName}</span></p>
                <p className="user_cont"><span className="name">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    名：</span><span
                    className="name1">{this.state.userName}</span></p>
                {courseOrGrade}
				</div>
                

            </div>
			</div>
        );
    },
});
export  default UserInfo;

