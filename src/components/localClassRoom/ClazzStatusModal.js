/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal, Row, Col} from 'antd';

/**
 * 本地课堂本节统计的modal
 */
class ClazzStatusModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            clazzStatusUrl:''
        };
        this.ClazzStatusModalHandleCancel = this.ClazzStatusModalHandleCancel.bind(this);
        this.subjectModalHandleOk = this.subjectModalHandleOk.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        var rd = Math.random()*10000;
        var rdInt = Math.round(rd);
        if(isShow==true){
            var vid = _this.props.vid;
            var userId = this.state.loginUser.colUid;
            var clazzStatusUrl = "https://www.maaee.com/ant_service/edu/subject_result_web?uid="+userId+"&vid="+vid+"&version="+rdInt;
            // http://192.168.50.139:8091/#/classPractice?userId=3568&vid=35153
            // var clazzStatusUrl = "http://192.168.50.139:8091/#/classPractice?userId="+userId+"&vid="+vid+"&version="+rdInt;
            var ifr = <iframe src={clazzStatusUrl}></iframe>;
            this.setState({isShow,vid,clazzStatusUrl,ifr});
            /*if(typeof($("#clazzStatusFrame").contentWindow)!='undefined' ){
                $("#clazzStatusFrame").contentWindow.location.reload();
            }*/
            this.setState({isShow});
        }
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        var rd = Math.random()*10000;
        var rdInt = Math.round(rd);
        if(isShow == true){
            var vid = this.props.vid;
            var userId = this.state.loginUser.colUid;
            var clazzStatusUrl = "https://www.maaee.com/ant_service/edu/subject_result_web?uid="+userId+"&vid="+vid+"&version="+rdInt;
            // var clazzStatusUrl = "http://192.168.50.139:8091/#/classPractice?userId="+userId+"&vid="+vid+"&version="+rdInt;
            var ifr = <iframe src={clazzStatusUrl}></iframe>;
            this.setState({isShow,vid,clazzStatusUrl,ifr});
            // $("#clazzStatusFrame")[0].window.location.reload();
            /*if(typeof($("#clazzStatusFrame").contentWindow)!='undefined' ){
                $("#clazzStatusFrame").contentWindow.location.reload();
            }*/
        }
        this.setState({isShow});
    }

    ClazzStatusModalHandleCancel() {
        this.setState({"isShow": false,ifr:''});
        this.props.onCancel();
    }

    /**
     * 选择题目后的确定操作
     */
    subjectModalHandleOk(){
        this.ClazzStatusModalHandleCancel();
    }

    render() {
        return (
            <Modal title="本节统计" className="calmEnterClass modal_classroom modal_iframe_wrap" visible={this.state.isShow}
                   onCancel={this.ClazzStatusModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   maskClosable={false} //设置不允许点击蒙层关闭
                   width={500}
                   footer={null}
            >
                <Row className="modal_flex">
                        <div className="modal_iframe_cont">{this.state.ifr}</div>
                </Row>
            </Modal>
        );
    }

}

export default ClazzStatusModal;
