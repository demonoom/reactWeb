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
    },

    componentWillMount(){
        this.getTeacherInfo(this.state.ident);
    },

    getTeacherInfo(ident){

        let _this = this;
        var param = {
            "method": 'getTeacherInfo',
            "ident": ident,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (response) {
                    var userName = response.user.userName;//用户名
                    var userHeadIcon = response.user.avatar;//头像
                    var courseName = response.course.colCourse;//科目
                    var schoolName = response.school.name;//学校名称
                    var schoolAddress = response.school.address;
                    _this.user = response.user;
                    _this.setState({
                        userName: userName,
                        userHeadIcon: userHeadIcon,
                        courseName: courseName,
                        schoolName: schoolName,
                        schoolAddress: schoolAddress
                    });
                } else {
                    message.error("老师信息获取失败");
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
                        this.setState({uploadPercent: percent, progressState: 'block'});
                        break;
                    case "removed":

                        break;
                    case "done":
                        this.changeFace(info.file);
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
                    this.state.userHeadIcon ? <img src={this.state.userHeadIcon} className="img_us"/> :
                        <Icon type="plus" className="avatar-uploader-trigger"/>
                }
            </Upload>
            <br/>
            <span className="date_tr">{this.state.userName} </span>
            { this.state.userHeadIcon ? <img src={this.state.userHeadIcon} className="blur"/> : null }
        </div>;
    },


    render() {

        return (
            <div  >
                <img src={this.state.userHeadIcon} onClick={this.showModal}/>
                {this.getTitle()}
                <p className="user_cont model_to"><span className="name">学校名称：</span><span
                    className="name1">{this.state.schoolName}</span></p>
                <p className="user_cont"><span className="name">地&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    区：</span><span
                    className="name1">{this.state.schoolAddress}</span></p>
                <p className="user_cont"><span className="name">姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    名：</span><span
                    className="name1">{this.state.userName}</span></p>
                <p className="user_cont"><span className="name">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    目：</span><span
                    className="name1">{this.state.courseName}</span></p>

            </div>
        );
    },
});
export  default UserInfo;

