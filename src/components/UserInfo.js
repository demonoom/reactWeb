import React, {PropTypes} from 'react';
import {message, Modal, Button, Upload, Icon, Input} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {SMALL_IMG, MIDDLE_IMG, LARGE_IMG} from '../utils/Const';

const {TextArea} = Input;

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
            imageUrl: '',
            introduction: '',
            editupdate: false,
            editTextarea: ''
        };
        this.changeFace = this.changeFace.bind(this);
    },

    componentWillMount() {
        this.getTeacherInfo(this.state.ident);
    },

    getTeacherInfo(ident) {

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
                    if (userInfo.user.colUtype == "TEAC") {
                        courseName = userInfo.course;//科目
                    }
                    var schoolName = userInfo.school;//学校名称
                    var introduction = userInfo.introduction;//个人介绍
                    var grade = userInfo.grade;
                    _this.user = userInfo.user;
                    _this.setState({
                        userName: userName,
                        userHeadIcon: userHeadIcon,
                        userType: userInfo.user.colUtype,
                        courseName: courseName,
                        schoolName: schoolName,
                        grade: grade,
                        introduction: introduction
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
    changeFace(info) {
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

    getTitle() {
        let _this = this;
        let uploadProps = {
            action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
            showUploadList: false,
            className: "avatar-uploader",
            name: "avatar",
            beforeUpload(file) {
                var fileType = file.type;
                if (fileType.indexOf("image") == -1) {
                    message.error('只能上传图片文件，请重新上传', 5);
                    return false;
                }
            },
            onChange(info) {
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
                    this.state.userHeadIcon ? <img src={this.state.userHeadIcon + '?' + SMALL_IMG}
                                                   className="userinfo_name userinfo_face user_with_border4 affix_bottom_tc"/> :
                        <Icon type="plus" className="avatar-uploader-trigger"/>
                }
            </Upload>
            <br/>
            <span className="white_16 date_tr">{this.state.userName} </span>
            {/*{ this.state.userHeadIcon ? <img src={this.state.userHeadIcon} className="blur"/> : null }*/}
        </div>;
    },

    //model设置个人信息
    showModal() {
        this.setState({
            editupdate: true,
        });
    },
    closeEditModalHandleCancel() {
        this.setState({
            editupdate: false,
        });
    },
    sendIntro() {
        var str = this.state.editTextarea;
        //将新的数据插入数据库（正常）
        var _this = this;
        var param = {
            "method": 'updateUserIntroducation',
            "userId": _this.state.ident,
            "introduction": str,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (res) {
                if (res.success) {
                    message.success('修改成功');
                    _this.setState({
                        editupdate: false,
                        introduction: str
                    });
                } else {
                    message.error(res.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    // editTextArea(e) {
    //
    //     // this.setState({editTextarea: e.target.value});
    //
    // },



    editTextArea(e) {
        //限制字数
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var repeatMes = target.value;
        if (repeatMes.length > 200) {
            repeatMes = repeatMes.substr(0, 200);
            message.error('已经达到最大字数限制');
        }
        this.setState({editTextarea:repeatMes});
    },

    render() {

        var courseOrGrade;
        if (this.state.userType == "TEAC") {
            courseOrGrade = <p className="user_cont"><span className="user_til_name">科目：</span><span
                className="black_person">{this.state.courseName}</span></p>;
        } else {
            courseOrGrade = <p className="user_cont"><span className="user_til_name">年级：</span><span
                className="black_person">{this.state.grade}</span></p>;
        }

        return (
            <div className="userinfo_bg">
                <div className="">
                    {this.getTitle()}
                    <div className="userinfo_top upexam_float">
                        <p className="user_cont"><span className="user_til_name">学校名称：</span><span
                            className="black_person">{this.state.schoolName}</span></p>
                        <p className="user_cont"><span className="user_til_name">姓名：</span><span
                            className="black_person">{this.state.userName}</span></p>
                        {courseOrGrade}
                        <p className="user_introduction"><span className="user_til_name_int">个人介绍：</span><span
                            className="black_person_introduction">{this.state.introduction}</span>
                            <Button float='left' type="primary" onClick={this.showModal}>编辑</Button>
                        </p>
                    </div>
                </div>
                <Modal title="编辑"
                       visible={this.state.editupdate}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={this.closeEditModalHandleCancel}
                       className="footer_user_introduction"
                       footer={[
                           <div>
                               <Input type="textarea" id="" rows={4} value={this.state.editTextarea}
                                      onChange={this.editTextArea}
                               />
                               <Button type="primary" htmlType="submit" className="login-form-button"
                                       onClick={this.sendIntro}>
                                   确认修改
                               </Button>
                           </div>
                       ]}
                >
                </Modal>
            </div>
        );
    },
});
export default UserInfo;

