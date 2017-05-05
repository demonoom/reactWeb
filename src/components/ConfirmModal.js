/**
 * Created by devnote on 17-4-17.
 */
import React, { PropTypes } from 'react';
import { Modal,Icon } from 'antd';

class ConfirmModal extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            isShow: false,
            content:this.props.title, //窗口中的提示内容
        };
        this.changeConfirmModalVisible = this.changeConfirmModalVisible.bind(this);
    }

    /**
     * 设置窗口的显示和关闭
     * @param isShow
     * @param content
     */
    changeConfirmModalVisible(isShow){
        this.setState({isShow});
    }

    render(){
        return(
            <Modal
                visible={this.state.isShow}
                width={440}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onOk={this.props.onConfirmModalOK}
                onCancel={this.props.onConfirmModalCancel}>
                <div className="class_right">
                    <Icon type="question-circle" className="icon_Alert icon_orange" />
                    <span style={{fontSize:'14px'}}>{this.state.content}</span>
                </div>
            </Modal>
        );
    }

}

export default ConfirmModal;