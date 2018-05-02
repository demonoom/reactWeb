import React from 'react';
import {Modal, message, Row, Col, Button, Tabs, Input, Icon} from 'antd';
import LocalClassesMessage from '../components/localClassRoom/LocalClassesMessage'
import {isEmpty} from "../utils/Const";
import SelectSubjectModal from '../components/localClassRoom/SelectSubjectModal';
import SelectAntCloudMaterialsModal from '../components/localClassRoom/SelectAntCloudMaterialsModal';
import SelectScheduleMaterialsModal from '../components/localClassRoom/SelectScheduleMaterialsModal';
import SelectAntCloudSubjectsModal from '../components/localClassRoom/SelectAntCloudSubjectsModal';
import ClazzStatusModal from '../components/localClassRoom/ClazzStatusModal';
import ConfirmModal from '../components/ConfirmModal';
import GuideModal from '../components/localClassRoom/GuideModal';
import SubjectGuideModal from '../components/localClassRoom/SubjectGuideModal';
import SendPicModel from '../components/antGroup/SendPicModel'
import {doWebService} from '../WebServiceHelper';

var connection = null;
var ms = null;
const LocalClassRoom = React.createClass({
    getInitialState() {
        ms = opener.ms;
        return {
            vid: '',
            account: '',
            classRoomUrl: '',
            messageTagArray: [],
            subjectModalIsShow: false,
            subjectInLibModalIsShow: false,
            antCloudMaterialsModalIsShow: false,
            closeScheduleMaterialsModal: false,
            sendPicModel: false,
            errorVisible: false,
            closeIconType: 'double-right',
            closeOrOpen: 'open',
            isClassStatusShow: false,
            /*  maskWrap : [],
              classRoomUrlDiscuss: []*/

        };
    },

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var userId = searchArray[0].split('=')[1];
        var account = searchArray[1].split('=')[1];
        var classCode = searchArray[2].split('=')[1];
        var classType = searchArray[3].split('=')[1];
        document.title = "本地课堂";   //设置title
        sessionStorage.setItem("userId", userId);
        /*if(isEmpty(sessionStorage.getItem("userId"))==true){

        }else{
            this.connectClazz(userId, classCode, classType, account);
        }*/
        // this.getDisconnectedClass();
        this.connectClazz(userId, classCode, classType, account);
        this.setState({userId, account, classCode, classType});
    },

    componentDidMount() {
        window.__noomSelectPic__ = this.noomSelectPic;
    },

    componentDidUpdate() {
        var _this = this;
        if (isEmpty(this.state.currentPage) == false) {
            setTimeout(function () {
                window.ppt_frame_localClass.window.pptCheckPage(_this.state.currentPage);
                _this.setState({currentPage:''});
            },1000);
        }
    },

    noomSelectPic(src, obj) {
        this.setState({sendPicModel: true, pinSrc: src, picFile: obj});
    },

    closeSendPicModel() {
        this.setState({sendPicModel: false});
    },

    sendPicToOthers(url) {
        this.refs.localClassesMessage.sendPicToOthers(url);
    },

    connectClazz(userId, classCode, classType, account) {
        var _this = this;
        connection = new ClazzConnection();
        connection.clazzWsListener = {

            onError: function (errorMsg) {
                //强制退出课堂
                // message.error(errorMsg);
                // window.close();
                _this.setState({errorVisible: true, errorMsg: errorMsg});
            },

            onWarn: function (warnMsg) {
                message.warn(warnMsg);
            },
            // 显示消息
            onMessage: function (info) {
                var data = info.data;
                console.log("=============================================>" + info);
                switch (info.command) {
                    case "teacherLogin":
                        //老师登入课堂成功后，返回新建课堂的vid，以此vid进入课堂
                        var account = data.account;
                        var vid = data.vid;
                        sessionStorage.setItem("vid", vid);
                        // var vid = sessionStorage.getItem('vid')
                        _this.getVclassPPTOpenInfo(vid);
                        _this.setState({vid});
                        break;
                    case'simpleClassDanmu': // 弹幕
                        var message = info.data.message;
                        break;

                    case 'classDanmu':
                        var message = info.data.message;
                        break;
                }
            }
        };
        //构建登录课堂的协议信息
        var loginPro = {
            "command": "teacherLogin",
            "data": {
                "password": sessionStorage.getItem("pd"),
                "account": account,
                "classType": classType,
                "classCode": classCode,
                "userId": userId
            }
        };
        //连接登入课堂
        connection.connect(loginPro);
        /*var htmlPath = sessionStorage.getItem("htmlPath");
        if (isEmpty(htmlPath) == false) {
            this.pushMaterialsToClass(htmlPath, 'currentPage');
        }*/
    },

    /**
     * 获取课件，打开ppt，接口
     */
    getVclassPPTOpenInfo(vid) {
        var _this = this;
        var param = {
            "method": 'getVclassPPTOpenInfo',
            "vid": vid + ""
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                var response = ret.response;
                if (isEmpty(response) == false) {
                    var url = response.pptUrl.replace("httpss", 'https');
                    _this.pushMaterialsToClass(url, response.currentPage);
                }
            },
            onError: function (error) {
                //  alert(error);
            }
        })


    },


    /**
     * 获取课件，打开ppt，完成推ppt的操作
     */
    getPPT() {
        //this.refs.guideModal.changeGuideModalVisible(true);
        this.setState({antCloudMaterialsModalIsShow: true});
    },

    /**
     * 设置不同的操作指向，用来根据不同的数据源，分别从备课计划和蚁盘中获取文件
     * @param guideType
     */
    setGuideType(guideType) {
        console.log(guideType);
        if (guideType.key == "schedule") {
            this.setState({schduleMaterialsModalIsShow: true});
        } else {
            this.setState({antCloudMaterialsModalIsShow: true});
        }
        this.refs.guideModal.changeGuideModalVisible(false);
    },

    /**
     * 设置不同的操作指向，用来根据不同的数据源，分别从题库和蚁盘中获取题目
     * @param guideType
     */
    setSubjectGuideType(guideType) {
        if (guideType.key == "subjectLib") {
            this.setState({subjectInLibModalIsShow: true});
        } else {
            this.setState({subjectModalIsShow: true});
        }
        this.refs.subjectGuideModal.changeGuideModalVisible(false);
    },
    /**
     * 打开选择题目的modal
     */
    getSubject() {
        this.refs.subjectGuideModal.changeGuideModalVisible(true);
        //this.setState({subjectModalIsShow:true});
    },

    /**
     * 关闭选择题目的modal
     */
    closeSubjectModal() {
        this.setState({subjectModalIsShow: false});
    },

    /**
     * 关闭从资源库选择题目的modal
     */
    closeSubjectInLibModal() {
        this.setState({subjectInLibModalIsShow: false});
    },

    pushSubjectToClass(subjectIdsArray) {
        // var protocal = eval('(' + "{'command':'pushSubjecShowContentUrl','data':{'sids':'"+sids+"'}}" + ')');
        var sids = subjectIdsArray.join(",");
        var pushSubjectProtocal = {
            'command': 'pushSubjecShowContentUrl',
            'data': {'sids': sids}
        };
        connection.send(pushSubjectProtocal);
        message.success("推送成功!");
    },

    closeAntCloudMaterialsModal() {
        this.setState({antCloudMaterialsModalIsShow: false});
    },

    closeScheduleMaterialsModal() {
        this.setState({schduleMaterialsModalIsShow: false});
    },

    //推送
    pushMaterialsToClass(htmlPath, currentPage) {
        // var htmlPath = materials.htmlPath;
        if (isEmpty(htmlPath) == false) {
            sessionStorage.setItem("htmlPath", htmlPath);
            var pptURL = htmlPath.replace("60.205.111.227", "www.maaee.com");
            pptURL = pptURL.replace("60.205.86.217", "www.maaee.com");
            if (pptURL.indexOf("https") == -1 && pptURL.indexOf("http") != -1) {
                pptURL = pptURL.replace("http", "https");
            }
            var vid = this.state.vid;
            var userId = this.state.userId;
            var classRoomUrl = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + pptURL;
            var protocal = eval('(' + "{'command':'class_ppt','data':{'control':1,'html':'" + pptURL + "'}}" + ')');
            connection.send(protocal);

            //让新版的学生端显示ppt
            var p1 = eval('(' + "{'command':'class_ppt','data':{'control':9}}" + ')');
            connection.send(p1);

            pptURL = pptURL.replace("www.maaee.com", "192.168.50.29:8090/proxy");
            pptURL = pptURL.replace("https", "http");
            classRoomUrl = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + pptURL;
            this.setState({classRoomUrl, currentPage});
            //this.getVclassPPTOpenInfo (vid);
        } else {
            message.error("该文件暂时无法完成推送");
        }
    },

    /**
     * 从备课计划里使用此材料
     */
    useMaterialInClass(materialId) {
        var _this = this;
        var vclassId = this.state.vid;
        var param = {
            "method": 'useMaterialInClass',
            "vclassId": vclassId, //虚拟课堂id
            "materialId": materialId, //材料id
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                // pushMaterialsToClass(ret);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 从蚁盘文件里使用此材料
     */
    useCloudFileInClass(cid) {
        var _this = this;
        var vclassId = this.state.vid;
        var param = {
            "method": 'useCloudFileInClass',
            "vclassId": vclassId, //虚拟课堂id
            "cid": cid, //材料id
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 下课，断开与课堂的连接
     */
    disConnectClassRoom() {
        var classOverProtocal = {
            'command': 'classOver'
        };
        connection.send(classOverProtocal);
        this.closeConfirmModal();
        window.close();
    },

    showConfirmModal(e) {
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal() {
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 关闭/打开聊天讨论区
     */
    closeOrOpenMessageDiv() {
        if (this.state.closeOrOpen == "open") {
            $("#messageDiv").fadeOut(500);
            $("#closeITag").removeClass('shrinkage');
            $("#closeITag").addClass('shrinkage1');
            this.setState({'closeOrOpen': 'close'});
        } else {
            $("#messageDiv").fadeIn(500);
            $("#closeITag").removeClass('shrinkage1');
            $("#closeITag").addClass('shrinkage');
            this.setState({'closeOrOpen': 'open'});
        }
    },

    /**
     * 获取本节课堂统计
     */
    getClazzStatus() {
        this.setState({clazzStatusModalIsShow: true});
    },

    /**
     * 关闭课堂统计的modal
     */
    closeClazzModal() {
        this.setState({clazzStatusModalIsShow: false});
    },


    /*    /!**
         * 发送讨论图片到蒙层
         *!/
        sendDiscussImgArr(imgArrAll,address){
            console.log(imgArrAll);
            console.log(address);
            var _this= this;

            var imgId = address;
            var currentImgIndex = imgArrAll.indexOf(imgId); //获取当前图片的下标
            imgArrAll.splice(currentImgIndex, 1); //删除当前数组中的当前图片地址
            imgArrAll.unshift(imgId);  //插入当前的图片地址在数组的最前面


            var discussImgArr = imgArrAll.join(",");


            var url = discussImgArr;
            //保存到课堂回顾的蚁盘文件id
            var imgURL = url.replace("60.205.86.217", "www.maaee.com");
            imgURL = imgURL.replace("http", "https");
            var imgsUrl = imgURL.substr(0, imgURL.length );

            var vid = this.state.vid;
            var userId = this.state.userId;
            var classRoomUrlDiscuss = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + imgsUrl;
            //var classRoomUrl = "http://192.168.50.15:8080/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + imgsUrl;

            var protocal = eval('(' + "{'command':'class_ppt','data':{'control':1,'html':'" + imgsUrl + "'}}" + ')');
            connection.send(protocal);

            //让新版的学生端显示ppt
            var p1 = eval('(' + "{'command':'class_ppt','data':{'control':9}}" + ')');
            connection.send(p1);

            /!*var protocal = eval('(' + "{'command':'handwriting_synchronization','data':{'type':0,'html':'" + imgsUrl + "'}}" + ')');
            connection.send(protocal);

            //让新版的学生端显示ppt
            var p1 = eval('(' + "{'command':'handwriting_synchronization','data':{'type':0}}" + ')');
            connection.send(p1);*!/
            //将当前推送的图片保存到课堂的资源回顾中
            //_this.useCloudFileInClass(discussImgArr);
            _this.state.classRoomUrlDiscuss = classRoomUrlDiscuss;
            //this.closeAntCloudMaterialsModal();

            var maskWrap = <div className="maskWrap">
                <span onClick={this.closeMaskCourse} className="closeMaskCourse">X</span>
                <div className="classroom_draw" >
                    <iframe name="ppt_frame_mask" src={this.state.classRoomUrlDiscuss} style={{width: '100%', height: '100%'}}></iframe>
                </div>
            </div>
            _this.state.maskWrap = maskWrap
        },

        /!**
         * 关闭蒙层
         *!/
        closeMaskCourse(){
            var _this =this;
            window.ppt_frame_mask.window.clearScreen();
            _this.setState({maskWrap: []});
        },*/


    /**
     * 发送过滤图片到本地客堂
     */
    sendFilterCloudFile(selectArr) {
        var cidArray = [];
        if (isEmpty(selectArr)) {
            message.error('请选择图片;')
            return
        }
        var url = '';
        selectArr.forEach(function (v, i) {
            url += v.path + ',';
            cidArray.push(v.id);
        });
        console.log(url)
        //保存到课堂回顾的蚁盘文件id
        var cid = cidArray.join(",");
        var imgURL = url.replace("60.205.86.217", "www.maaee.com");
        imgURL = imgURL.replace("http", "https");
        var imgsUrl = imgURL.substr(0, imgURL.length - 1);

        var vid = this.state.vid;
        var userId = this.state.userId;
        var classRoomUrl = "https://www.maaee.com/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + imgsUrl;
        //var classRoomUrl = "http://192.168.50.15:8080/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + imgsUrl;

        var protocal = eval('(' + "{'command':'class_ppt','data':{'control':1,'html':'" + imgsUrl + "'}}" + ')');
        connection.send(protocal);

        //让新版的学生端显示ppt
        var p1 = eval('(' + "{'command':'class_ppt','data':{'control':9}}" + ')');
        connection.send(p1);
        //将当前推送的图片保存到课堂的资源回顾中
        this.useCloudFileInClass(cid);
        this.setState({classRoomUrl});
        this.closeAntCloudMaterialsModal();
    },

    /**
     * 获取当前未关闭的课堂(本地课堂)
     */
    getDisconnectedClass() {
        var _this = this;
        var param = {
            "method": 'getDisconnectedClass',
            "userId": sessionStorage.getItem("userId")
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                var response = ret.response;
                if (isEmpty(response) == false) {
                    var vid = response.vid;
                    _this.setState({isClassStatusShow: true, vid});
                } else {
                    _this.enterDisconnectionClass();
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关闭未断开的课堂
     */
    closeDisconnectionClass() {
        var _this = this;
        var param = {
            "method": 'closeVirtureClass',
            "userId": sessionStorage.getItem("userId"),
            "vid": _this.state.vid,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                _this.setState({isClassStatusShow: false});
                window.close();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 进入课堂
     */
    enterDisconnectionClass() {
        this.connectClazz(this.state.userId, this.state.classCode, this.state.classType, this.state.account);
        this.setState({isClassStatusShow: false});
    },

    errorHandleOk() {
        window.close();
    },

    render() {

        var classIfream = null;
        if (isEmpty(this.state.classRoomUrl) == false) {

            var src = '/proxy' + this.state.classRoomUrl.substr(this.state.classRoomUrl.indexOf('www.maaee.com') + 13, this.state.classRoomUrl.length - 1);
            classIfream = <div className="classroom_draw">
                {/*var classRoomUrl = "/proxy/Excoord_For_Education/drawboard/main.html?vid=" + vid + "&userId=" + userId + "&role=manager&ppt=" + pptURL;*/}
                <iframe name="ppt_frame_localClass" id="ppt_frame_localClass" src={src}
                        style={{width: '100%', height: '100%'}}></iframe>
            </div>;
        } else {
            classIfream = <div className="classroom_welcome">
                <video width="954" height="584" autoPlay="autoPlay" className="center_all">
                    <source src="https://www.maaee.com/upload2/common/board_welcome2.mp4" type="video/mp4"/>
                </video>
            </div>
        }
        return (
            <div className="local_class flex">
                {this.state.maskWrap}
                <div className="flex_auto classroom_left">

                    {classIfream}
                    <div className="classroom_btn">
                        <Button className="classroom_btn_b classroom_btn_courseware" onClick={this.getPPT}>
                            <i><img src={require('../components/images/classroome_courseware.png')}/></i>
                            <div>课件</div>
                        </Button>
                        <Button className="classroom_btn_b classroom_btn_subject  add_out" onClick={this.getSubject}>
                            <i><img src={require('../components/images/classroom_subject.png')}/></i>
                            <div>题目</div>
                        </Button>
                        <Button className="classroom_btn_b classroom_btn_statistics add_out"
                                onClick={this.getClazzStatus}>
                            <i><img src={require('../components/images/classroom_statistics.png')}/></i>
                            <div>统计</div>
                        </Button>
                    </div>
                    <div className="classroom_btn_finish">
                        <Button className="classroom_btn_b classroom_btn_finish add_out"
                                onClick={this.showConfirmModal}>
                            <i><img src={require('../components/images/classroom_finish.png')}/></i>
                            <div>下课</div>
                        </Button>
                    </div>
                    <div><i className="shrinkage" id="closeITag" onClick={this.closeOrOpenMessageDiv}></i></div>
                </div>
                <div className="local_class_right" id="messageDiv">
                    <LocalClassesMessage id="localClassMessageObj" ref="localClassesMessage" ms={ms}
                                         classCode={this.state.classCode}
                                         classType={this.state.classType}
                                         sendDiscussImgArr={this.sendDiscussImgArr}
                    ></LocalClassesMessage>
                </div>
                <SelectSubjectModal isShow={this.state.subjectInLibModalIsShow} onCancel={this.closeSubjectInLibModal}
                                    pushSubjectToClass={this.pushSubjectToClass}></SelectSubjectModal>
                <ClazzStatusModal isShow={this.state.clazzStatusModalIsShow} onCancel={this.closeClazzModal}
                                  vid={this.state.vid}></ClazzStatusModal>
                <SelectAntCloudMaterialsModal sendFilterCloudFile={this.sendFilterCloudFile}
                                              isShow={this.state.antCloudMaterialsModalIsShow}
                                              onCancel={this.closeAntCloudMaterialsModal}
                                              useCloudFileInClass={this.useCloudFileInClass}
                                              pushMaterialsToClass={this.pushMaterialsToClass}></SelectAntCloudMaterialsModal>
                <SelectScheduleMaterialsModal isShow={this.state.schduleMaterialsModalIsShow}
                                              onCancel={this.closeScheduleMaterialsModal}
                                              pushMaterialsToClass={this.pushMaterialsToClass}
                                              useMaterialInClass={this.useMaterialInClass}></SelectScheduleMaterialsModal>
                <SelectAntCloudSubjectsModal isShow={this.state.subjectModalIsShow} onCancel={this.closeSubjectModal}
                                             pushSubjectToClass={this.pushSubjectToClass}></SelectAntCloudSubjectsModal>
                <ConfirmModal ref="confirmModal"
                              title="确定要下课吗?"
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.disConnectClassRoom}
                ></ConfirmModal>

                <Modal
                    visible={this.state.errorVisible}
                    width={300}
                    title={"提示"}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[]}
                    className="new_add_ding calmNewClass"
                >
                    <div className="noomUpLoadFile_wrap">
                        <div>{this.state.errorMsg}</div>
                        <div className="class_right"><Button className="noomUpLoadFile_btn" type="primary"
                                                             onClick={this.errorHandleOk}>确定</Button></div>
                    </div>
                </Modal>


                <GuideModal ref="guideModal" setGuideType={this.setGuideType}></GuideModal>
                <SubjectGuideModal ref="subjectGuideModal" setGuideType={this.setSubjectGuideType}></SubjectGuideModal>
                <SendPicModel
                    isShow={this.state.sendPicModel}
                    closeModel={this.closeSendPicModel}
                    pinSrc={this.state.pinSrc}
                    picFile={this.state.picFile}
                    sendPicToOthers={this.sendPicToOthers}
                />
                <Modal
                    visible={this.state.isClassStatusShow}
                    width={440}
                    transitionName=""  //禁用modal的动画效果
                    closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <Button key="back" size="large" onClick={this.closeDisconnectionClass}>关闭课堂</Button>,
                        <Button key="submit" type="primary" size="large" onClick={this.enterDisconnectionClass}>
                            进入课堂
                        </Button>,
                    ]}
                >
                    <div className="class_right">
                        <Icon type="question-circle" className="icon_Alert icon_orange"/>
                        <span style={{fontSize: '14px'}}>存在未断开的课堂,请选择关闭/进入课堂?</span>
                    </div>
                </Modal>
            </div>
        );
    },

});

export default LocalClassRoom;
