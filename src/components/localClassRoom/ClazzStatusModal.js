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
        var vid = _this.props.vid;
        var userId = this.state.loginUser.colUid;
        var clazzStatusUrl = "https://www.maaee.com/ant_service/edu/subject_result_web?uid="+userId+"&vid="+vid;
        this.setState({isShow,vid,clazzStatusUrl});
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        var vid = this.props.vid;
        var userId = this.state.loginUser.colUid;
        var clazzStatusUrl = "https://www.maaee.com/ant_service/edu/subject_result_web?uid="+userId+"&vid="+vid;
        this.setState({isShow,vid,clazzStatusUrl});
    }

    ClazzStatusModalHandleCancel() {
        this.setState({"isShow": false});
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
            <Modal title="本节统计" className="modal_classroom modal_classroom_push" visible={this.state.isShow}
                   onCancel={this.ClazzStatusModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   maskClosable={false} //设置不允许点击蒙层关闭
                   width={400}
                   footer={null}
            >
                <Row className="modal_flex">
                        <div className="modal_iframe_cont"><iframe src={this.state.clazzStatusUrl}></iframe></div>
                </Row>
            </Modal>
        );
    }

}

export default ClazzStatusModal;
