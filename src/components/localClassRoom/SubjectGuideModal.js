/**
 * Created by devnote on 17-4-17.
 */
import React, { PropTypes } from 'react';
import { Modal,Table } from 'antd';

class SubjectGuideModal extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            isShow: false,
            content:this.props.title, //窗口中的提示内容
        };
        this.changeGuideModalVisible = this.changeGuideModalVisible.bind(this);
        this.selectGuide = this.selectGuide.bind(this);
        this.onGuideModalCancel = this.onGuideModalCancel.bind(this);
    }

    componentWillReceiveProps(nextProps){
        var title = nextProps.title;
        this.setState({content:title});
        this.changeGuideModalVisible = this.changeGuideModalVisible.bind(this);
    }

    /**
     * 设置窗口的显示和关闭
     * @param isShow
     * @param content
     */
    changeGuideModalVisible(isShow){
        this.setState({isShow});
    }

    /**
     * 选择一个具体的操作指向
     */
    selectGuide(guideRecord){
        this.props.setGuideType(guideRecord);
    }

    onGuideModalCancel(){
        this.setState({isShow:false});
    }

    render(){
        const dataSource = [{
            key: 'subjectLib',
            name: '从题库选择',
        }, {
            key: 'antCloud',
            name: '从蚁盘选择',
        }];

        const columns = [{
            title: '数据源',
            dataIndex: 'name',
            key: 'name',
        }];

        return(
            <Modal
                title="选择题目"
                className="modal_classroom modal_classroom_select"
                visible={this.state.isShow}
                width={300}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                footer={null}
                onCancel={this.onGuideModalCancel}
                >
                <div className="class_right table_classroom">
                    <Table dataSource={dataSource} columns={columns} onRowClick={this.selectGuide} showHeader={false} pagination={false}/>
                </div>
            </Modal>
        );
    }

}

export default SubjectGuideModal;