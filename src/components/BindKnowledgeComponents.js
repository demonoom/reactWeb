import React, {PropTypes} from 'react';
import {Table, Modal, Button, message, Transfer} from 'antd';
import {Menu, Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox} from 'antd';
import {doWebService} from '../WebServiceHelper';

var bindKnowledge;
var createExamPager = [];
const columns = [{
    title: '科目',
    dataIndex: 'label',
    footer: '',
}];


const BindKnowledgeComponents = React.createClass({

    getInitialState() {
        bindKnowledge = this;
        return {
            visible: false,
            selectedKnowledge: '',
            defaultSelected: [],
            mockData: [],
            targetKeys: [],
            lessonMenu: [],
        };
    },
    componentDidMount(){
    },

    componentWillMount(){
        this.getLessonMenu();
        this.getUserRalatedPoints();
    },

    // 用户已经选中的知识点
    getUserRalatedPoints(){
        var param = {
            "method": 'getUserRalatedPoints',
            "userId": sessionStorage.getItem("ident"),
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var ref = [];
                for (let i = 0; i < ret.response.length; i++) {
                    ref.push(ret.response[i].id)
                }
                bindKnowledge.setState({'targetKeys': ref});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },
//管理您的知识点
    // 绑定知识点
    // 获取科目
    getLessonMenu(){
        var param = {
            "method": 'getAllKnowledgePoints',
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var optionContent;
                var lessonMenu = [];
                ret.response.forEach(function (e) {
                    optionContent = {key: e.id, label: e.content};
                    var childrendArray = new Array();
                    for (var i = 0; i < e.children.length; i++) {
                        var child = e.children[i];
                        var childrenContent = {value: child.id, label: child.content}
                        childrendArray.push(childrenContent);
                    }
                    optionContent.content = childrendArray;
                    lessonMenu.push(optionContent);
                });
                bindKnowledge.setState({'lessonMenu': lessonMenu});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //修改，保存知识点
    bindPointForTeacher(){

        let pointIds = bindKnowledge.state.targetKeys.join(',');
        if (!pointIds || ',' == pointIds) {
            message.warning("请选择具体的知识点完成绑定");
            bindKnowledge.props.callbackParent();
            bindKnowledge.setState({visible: false});
        } else {
            var param = {
                // batchBindPointForTeacher
                "method": 'updateTeacherBindedPoints',
                "userId": sessionStorage.getItem("ident"),
                "pointIds": pointIds,
            };

            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {

                    if (ret.msg == "调用成功" && ret.response == true) {
                        message.success("知识点绑定成功");
                    } else {
                        message.error("知识点绑定失败");
                    }
                    bindKnowledge.props.callbackParent();
                    bindKnowledge.setState({visible: false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },

// 选中的科目
    selecdRow(record, index){


        const mockData = [];
        for (let i = 0; i < record.content.length; i++) {
            let refData = record.content[i];
            let filterDate = ['小学', '初中', '高中', '书法', '茶艺', '拓片', '初一', '初二', '初三'];
            let isBlack = false;
            for (let j = 0; j < filterDate.length; j++) {
                if (filterDate[j] == refData.label) {
                    isBlack = true;
                }
            }
            if (isBlack) continue;
            const data = {
                key: refData.value,
                title: refData.label,
                description: refData.label,
            };
            mockData.push(data);
        }
        this.setState({mockData});
    },


    showModal() {

        bindKnowledge.setState({visible: true, defaultSelected: []});
    },

    handleCallbackParent: function (val) {
        bindKnowledge.props.callbackParent();
        bindKnowledge.setState({visible: false});
    },

    handleCancel(e) {
        bindKnowledge.setState({visible: false, defaultSelected: []});
    },
    /**
     * 获取穿梭框中左侧的备选数据
     */
    getMock(pointsArrayWithSelected) {
        const targetKeys = pointsArrayWithSelected;
        const mockData = [];

        var param = {
            "method": 'getUserRalatedPoints',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret.msg);
                ret.response.forEach(function (e) {
                    var currentContent = e.content;
                    var currentId = e.id;
                    var childrenArray = e.children;
                    childrenArray.forEach(function (e) {
                        var childrenId = e.id;
                        var childrenContent = e.content;
                        const data = {
                            key: childrenId,
                            title: currentContent,
                            description: childrenContent
                        };
                        mockData.push(data);
                    });


                });
                createExamPager.setState({mockData, targetKeys});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //穿梭框内容改变的响应函数
    transferHandleChange(targetKeys, b, c){
        bindKnowledge.setState({targetKeys});
    },


    cascaderOnChange(value, selectedOptions) {
        console.log("value:" + value, selectedOptions);
        bindKnowledge.setState({defaultSelected: value});
        if (value.length >= 2) {
            bindKnowledge.setState({selectedKnowledge: value[1]});
        } else {
            bindKnowledge.setState({selectedKnowledge: value[0]});
        }
    },


    render() {
        return (
            <Modal
                visible={bindKnowledge.state.visible}
                title="知识点"
                onCancel={bindKnowledge.handleCancel}
                className="modol_width"
                transitionName=""  //禁用modal的动画效果
                footer={[
                    <Button type="primary" htmlType="submit" className="login-form-button"
                            onClick={bindKnowledge.bindPointForTeacher}>确定</Button>,
                    <Button type="ghost" htmlType="reset" className="login-form-button"
                            onClick={bindKnowledge.handleCancel}>取消</Button>
                ]}
            >

                <Row>
                    <Col span={4}>
                        <Table columns={columns} onRowClick={bindKnowledge.selecdRow}
                               dataSource={bindKnowledge.state.lessonMenu} scroll={{y: 240}}/>
                    </Col>
                    <Col span={20}>
                        <Transfer
                            dataSource={bindKnowledge.state.mockData}
                            showSearch
                            listStyle={{
                                width: 268,
                                height: 320,
                            }}
                            titles={['待选', '已选']}
                            operations={['', '']}
                            targetKeys={bindKnowledge.state.targetKeys}
                            onChange={bindKnowledge.transferHandleChange}
                            render={item => `${item.description}`}
                        />
                    </Col>
                </Row>
            </Modal>
        );
    },
});
export  default BindKnowledgeComponents;

