import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Table, Icon, Button, Breadcrumb, message, Modal, Checkbox, Col, Tag, Input} from 'antd';
import AddRoleMemberModal from './AddRoleMemberModal';
import EditRoleModal from './EditRoleModal'
import ConfirmModal from '../ConfirmModal'
import {doWebService} from '../../WebServiceHelper';

const confirm = Modal.confirm;
var selectArr = [];

const Role = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            addRoleModalIsShow: false,
            editRoleModalIsShow: false,
            disabled: true,
            selectedRowKeys: [],
            gradeArray: [],
            userNameFromOri: '',
            inputVisible: false,
            tags: [],  //标签显示
        };
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        if (isEmpty(nextProps.roleGroupClick) == false) {
            var selectedMessage = nextProps.roleGroupClick;
            var arr = selectedMessage.split(',');
            this.setState({roleId: arr[0], roleName: arr[1], roleArr: arr});
            this.ajaxData(arr[0]);
            if (arr[2] != 0) {
                this.setState({disabled: true})
            } else {
                this.setState({disabled: false})
            }
        } else {
            if (isEmpty(nextProps.sendDefaultSelected) == false) {
                var sendDefaultSelected = nextProps.sendDefaultSelected;
                var arr = sendDefaultSelected.split('#');
                this.setState({roleId: arr[0], roleName: arr[1]});
                this.ajaxData(arr[0]);
            }
        }
        if (isEmpty(nextProps.RoleGroupName) == false) {
            var arr = nextProps.RoleGroupName.split('#');
            this.setState({papaName: arr[1]});
        }
        // if(isEmpty(selectedMessage)==false){
        //     if(selectedMessage.indexOf(',') !== -1){
        //         var arr = selectedMessage.split(',');
        //         this.setState({roleId: arr[0]});
        //         this.setState({roleName: arr[1]});
        //         this.ajaxData(arr[0]);
        //     }else {
        //         this.ajaxData(selectedMessage);
        //     }
        // }
        // var papaKey = nextProps.papaKey;
        // var papaArr = [];
        // if(isEmpty(papaKey)==false){
        //     papaArr = papaKey.split('#');
        //     this.setState({papaName:papaArr[1]});
        //     var selectedPapa = papaArr[0];
        //     this.state.defaultId.forEach(function (v,i) {
        //         if(v == selectedPapa) {
        //             _this.setState({disabled:true});
        //         } else{
        //             _this.setState({disabled:false});
        //         }
        //     })
        // };
    },

    ajaxData(roleId) {
        let _this = this;
        var param = {
            "method": 'getUsersByStructrureRoleId',
            "operateUid": this.state.loginUser.colUid,
            "pageNo": -1,
            "roleId": roleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var data = ret.response;
                    _this.drawTable(data);
                } else {

                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 为班主任增加所属班级
     */
    addClazzToTer(item) {
        this.setState({ClazzModalVisible: true, ClazzModalTitle: '增加所属班级', gradeItem: item, createType: 6})
    },

    /**
     * 年级checkbox点击的回调
     * @param v
     * @param e
     */
    gradeCheckboxOnChange(v, e) {
        var arr = this.state.gradeArray;
        if (e.target.checked) {
            arr.push(v.id)
        } else {
            arr.forEach(function (item, index) {
                if (item == v.id) {
                    arr.splice(index, 1);
                }
            })
        }
        this.setState({gradeArray: arr});
    },

    /**
     * 为班级主任修改所属班级
     * @param item
     */
    updateClazzToTer(item) {
        var defaultArr = [];
        var defaultSelectArr = [];
        item.clazzes.forEach(function (clazzesItem) {
            defaultArr.push(clazzesItem.id)
            defaultSelectArr.push({
                key: clazzesItem.id,
                userId: clazzesItem.id,
                userName: clazzesItem.name,
            })
        })

        this.setState({
            ClazzModalVisible: true,
            gradeItem: item,
            createType: 6,
            ClazzModalTitle: '修改所属班级',
            tags: defaultSelectArr,
            selectedRowKeys: defaultArr
        })
        selectArr = defaultSelectArr;
    },

    /**
     * 为年级主任修改所属年级
     * @param item
     */
    updateGradeToTer(item) {
        var defaultArr = [];
        item.grades.forEach(function (gradesItem) {
            defaultArr.push(gradesItem.id)
        })
        this.setState({gradeArray: defaultArr})

        var _this = this;
        var param = {
            "method": 'getGradesBySchoolId',
            "schoolId": this.state.loginUser.schoolId,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                var arr = []
                var checkBoxItem;
                if (isEmpty(data) == false) {
                    data.forEach(function (v, i) {
                        var checkBoxItem = <Checkbox
                            defaultChecked={false}
                            onChange={_this.gradeCheckboxOnChange.bind(this, v)}
                        >{v.name}</Checkbox>
                        item.grades.forEach(function (k, j) {
                            if (v.id == k.id) {
                                checkBoxItem = <Checkbox
                                    defaultChecked={true}
                                    onChange={_this.gradeCheckboxOnChange.bind(this, v)}
                                >{v.name}</Checkbox>
                            }
                        })
                        arr.push(checkBoxItem)
                    })
                }
                _this.setState({
                    GradeModalVisible: true,
                    gradeArr: arr,
                    gradeItem: item,
                    createType: 5,
                    GradeModalTitle: '修改所属年级'
                })
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 为年级主任增加所属年级
     */
    addGradeToTer(item) {
        var _this = this;
        var param = {
            "method": 'getGradesBySchoolId',
            "schoolId": this.state.loginUser.schoolId,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                var arr = []
                if (isEmpty(data) == false) {
                    data.forEach(function (v, i) {
                        arr.push(
                            <Checkbox
                                defaultChecked={false}
                                onChange={_this.gradeCheckboxOnChange.bind(this, v)}
                            >{v.name}</Checkbox>
                        )
                    })
                }
                _this.setState({
                    GradeModalVisible: true,
                    gradeArr: arr,
                    gradeItem: item,
                    createType: 5,
                    GradeModalTitle: '添加所属年级'
                })
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    drawTable(data) {
        var roleArr = this.state.roleArr;
        var mermberNum = data.length;
        var _this = this;
        _this.setState({deleteData: data});
        _this.setState({mermberNum: mermberNum});
        var mesData = [];

        if (isEmpty(roleArr) == false) {
            if (roleArr[2] != 0 && roleArr[1] == '班主任') {
                data.forEach(function (v, i) {
                    if (isEmpty(v.clazzes)) {
                        var person = {
                            key: v.colUid,
                            name: v.userName,
                            // group: v.schoolName,
                            phone: v.phoneNumber,
                            clazz: <a href="javascript:;" onClick={_this.addClazzToTer.bind(this, v)}>添加</a>
                        }
                        mesData.push(person);
                    } else {
                        var clazzStr = '';
                        v.clazzes.forEach(function (v, i) {
                            clazzStr += v.name + ','
                        });
                        var person = {
                            key: v.colUid,
                            name: v.userName,
                            // group: v.schoolName,
                            phone: v.phoneNumber,
                            clazz: <span className="role_gradeAlter"><span
                                className="focus_3">{clazzStr.substr(0, clazzStr.length - 1)}</span><a
                                href="javascript:;"
                                onClick={_this.updateClazzToTer.bind(this, v)}>修改</a></span>
                        }
                        mesData.push(person);
                    }
                });

            } else if (roleArr[2] != 0 && roleArr[1] == '年级主任') {
                data.forEach(function (v, i) {
                    if (isEmpty(v.grades)) {
                        var person = {
                            key: v.colUid,
                            name: v.userName,
                            // group: v.schoolName,
                            phone: v.phoneNumber,
                            grade: <a href="javascript:;" onClick={_this.addGradeToTer.bind(this, v)}>添加</a>
                        }
                        mesData.push(person);
                    } else {
                        var gradeStr = '';
                        v.grades.forEach(function (v, i) {
                            gradeStr += v.name + ','
                        });
                        var person = {
                            key: v.colUid,
                            name: v.userName,
                            // group: v.schoolName,
                            phone: v.phoneNumber,
                            grade: <span className="role_gradeAlter"><span
                                className="focus_3">{gradeStr.substr(0, gradeStr.length - 1)}</span><a
                                href="javascript:;"
                                onClick={_this.updateGradeToTer.bind(this, v)}>修改</a></span>
                        }
                        mesData.push(person);
                    }
                });
            }
        } else {
            data.forEach(function (v, i) {
                var person = {
                    key: v.colUid,
                    name: v.userName,
                    // group: v.schoolName,
                    phone: v.phoneNumber,
                }
                mesData.push(person);
            });
        }

        _this.setState({mesData, selectedRowKeys: []});
    },

    addRoleMember() {
        this.setState({addRoleModalIsShow: true});
    },

    /**
     * 添加成员的回调
     */
    addRoleComplete() {
        this.ajaxData(this.state.roleId);
        this.setState({"addRoleModalIsShow": false});
    },
    /**
     * 添加成员时取消和关闭的回调
     */
    closeAddModel() {
        this.setState({"addRoleModalIsShow": false});
    },

    editRole() {
        this.setState({editRoleModalIsShow: true});
    },

    /**
     * 编辑角色时取消和关闭时候的回调
     */
    closeModel() {
        this.setState({"editRoleModalIsShow": false});
    },

    closeConfirmModal() {
        this.setState({changeConfirmModalVisible: false})
    },

    closeGradeModal() {
        this.setState({GradeModalVisible: false, gradeArr: []})
    },

    closeClazzModal() {
        this.setState({ClazzModalVisible: false, userNameFromOri: '', searchUserFromOri: [], tags: []})
        selectArr = []
    },

    addClazzModal() {

        var memberTargetkeys = this.state.selectedRowKeys;
        if (memberTargetkeys.length == 0) {
            message.error('请选择班级', 2)
            return
        }

        var _this = this;
        var obj = {
            datas: this.state.selectedRowKeys,
            roleUserId: this.state.gradeItem.roleUserId,
            createType: this.state.createType
        }

        var param = {
            "method": 'addStrcutreRoleUsersExtend',
            "jsonData": JSON.stringify(obj),
        };

        if (this.state.ClazzModalTitle == '修改所属班级') {
            param = {
                "method": 'updateStrcutreRoleUsersExtend',
                "jsonData": JSON.stringify(obj),
            };
        }
        console.log(param);

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功") {
                    message.success("添加成功");
                    _this.setState({
                        ClazzModalVisible: false,
                        selectedRowKeys: [],
                        userNameFromOri: '',
                        searchUserFromOri: [],
                        tags: []
                    });
                    selectArr = []
                    _this.ajaxData(_this.state.roleId);

                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 给此角色添加系统用户所对应的年级和班级
     */
    addGradeModal() {
        var _this = this;
        var obj = {
            datas: this.state.gradeArray,
            roleUserId: this.state.gradeItem.roleUserId,
            createType: this.state.createType
        }

        var param = {
            "method": 'addStrcutreRoleUsersExtend',
            "jsonData": JSON.stringify(obj),
        };

        if (this.state.GradeModalTitle == '修改所属年级') {
            param = {
                "method": 'updateStrcutreRoleUsersExtend',
                "jsonData": JSON.stringify(obj),
            };
        }

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功") {
                    message.success("添加成功");
                    _this.setState({GradeModalVisible: false, gradeArr: [], gradeArray: []});
                    _this.ajaxData(_this.state.roleId);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    deleteModal() {
        this.setState({changeConfirmModalVisible: false});
        var _this = this;
        var selectedMem = _this.state.selectedRowKeys;
        var userIds = '';
        selectedMem.forEach(function (v, i) {
            userIds += v + ',';
        })

        var param = {
            "method": 'deleteStructureRoleUsers',
            "operateUid": _this.state.loginUser.colUid,
            "roleId": _this.state.roleId,
            "userIds": userIds.substr(0, userIds.length - 1)
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功") {
                    message.success("删除成功");
                    _this.ajaxData(_this.state.roleId);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 编辑角色名称完成后的回调操作
     * @param roleId 角色的id
     * @param roleName 角色的名称
     */
    editRoleComplete(roleId, roleName, refresh) {
        //将编辑后的名字同步至左侧
        this.props.onEditComplete(roleName, roleId);
        //设置编辑角色Modal的显示状态为false，不再显示
        this.setState({"roleName": roleName, "editRoleModalIsShow": false});
    },

    /**
     * 删除角色成功的回调
     * @param roleId
     * @param roleName
     */
    onDelComplete(roleId, roleName) {
        this.props.onDelComplete(roleId, roleName);
    },

    /**
     * 员工选中响应函数
     * @param selectedRowKeys
     */
    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    showConfirm() {
        this.setState({changeConfirmModalVisible: true})
    },

    /**
     * 请输入要搜索的班级
     * @param e
     */
    onChangeUserNameFromOri(e) {
        this.state.searchUserFromOri = [];
        if (e.target.value.length != 0) {
            this.searchUserFromOri(e.target.value);
        }
        this.setState({userNameFromOri: e.target.value});
    },

    /**
     * 搜索班级
     * @param str
     */
    searchUserFromOri(str) {
        var _this = this;
        var param = {
            "method": 'searchClazz',
            "aid": sessionStorage.getItem("ident"),
            "keyWord": str,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    var response = ret.response;
                    if (isEmpty(response) == false) {
                        _this.showSearchUserFromOri(response)
                    } else {
                        //显示没有结果
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 构建搜索出来的班级表格
     * @param data
     */
    showSearchUserFromOri(data) {
        var arr = [];
        data.forEach(function (v) {
            arr.push({
                key: v.id,
                userId: v.id,
                userName: v.name,
            });
        });
        this.setState({searchUserFromOri: arr});
    },

    /**
     * 表格选中响应函数
     * @param selectedRowKeys
     */
    onSelectChangeClazz(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    /**
     * 同步table与tags
     * @param record
     * @param selected
     */
    onRowSelectedClazz(record, selected) {
        if (selected) {
            selectArr.push(record);
        } else {
            var key = record.key;
            for (var i = 0; i < selectArr.length; i++) {
                if (selectArr[i].key == key) {
                    selectArr.splice(i, 1);
                }
            }
        }
        this.setState({tags: selectArr});
    },

    /**
     * 用户手动选择/取消选择所有列的回调
     */
    onSelectAllClazz(selected, selectedRows, changeRows) {
        var arr = this.state.tags;
        var array;
        //此处应该是连接数组或者是取消数组
        // 第一个参数布尔值true表示钩中，false表示取消，第三个参数表示钩中的人的数组
        if (selected) {
            //数组合并
            array = arr.concat(changeRows);
        } else {
            //在原数组中去除这个数组的项
            changeRows.forEach(function (data, index) {
                arr.forEach(function (v, i) {
                    if (v.key == data.key) {
                        arr.splice(i, 1);
                    }
                })
            })
            array = arr;
        }
        this.setState({tags: array});
        selectArr = array;
    },

    /*标签关闭的回调*/
    handleClose(removedTag) {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        var arr = [];
        this.setState({tags});
        //设置勾选状态   selectedRowKeys
        for (var i = 0; i < tags.length; i++) {
            arr.push(tags[i].key);
        }
        this.state.selectedRowKeys = arr;
        //在这里把点击的这一项从selectArr中删除  selectArr全局函数
        for (var i = 0; i < selectArr.length; i++) {
            if (selectArr[i].key == removedTag.key) {
                selectArr.splice(i, 1);
            }
        }
    },

    handleInputChange(e) {
        this.setState({inputValue: e.target.value});
    },

    handleInputConfirm() {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const rowSelectionClazz = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChangeClazz,
            onSelect: this.onRowSelectedClazz,
            onSelectAll: this.onSelectAllClazz
        };

        const {tags, inputVisible, inputValue} = this.state;

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = this.state.selectedRowKeys.length > 0;

        const memberColumns = [{
            title: '班级',
            dataIndex: 'userName',
            key: 'userName',
            width: 160,
            className: 'dold_text departmental_officer'
        }];

        var columns = [{
            title: '姓名',
            dataIndex: 'name',
            className: 'dold_text neme_u'
        }, {
            title: '手机号',
            dataIndex: 'phone',
            className: "phone2"
        }];

        var roleArr = this.state.roleArr;
        if (isEmpty(roleArr) == false) {
            if (roleArr[2] != 0 && roleArr[1] == '班主任') {
                columns = [{
                    title: '姓名',
                    dataIndex: 'name',
                    className: 'dold_text neme_u'
                }, {
                    title: '手机号',
                    dataIndex: 'phone',
                    className: 'phone'
                }, {
                    title: '所属班级',
                    dataIndex: 'clazz',
                    className: 'class'
                }];
            } else if (roleArr[2] != 0 && roleArr[1] == '年级主任') {
                columns = [{
                    title: '姓名',
                    dataIndex: 'name',
                    className: 'dold_text neme_u'
                }, {
                    title: '手机号',
                    dataIndex: 'phone',
                    className: 'phone'
                }, {
                    title: '所属年级',
                    dataIndex: 'grade',
                    className: 'class'
                }];
            }
        }

        return (
            <div className="schoolgroup">
                <div className="schoolgroup_title">
                    <span className="name_max4 dold_text">{this.state.roleName}</span>
                    <span className="schoolgroup_people modal_course">(<span>{this.state.mermberNum}</span>人)</span>
                    <span>
                        <Button className="schoolgroup_btn_gray_6 schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.editRole} disabled={this.state.disabled}>编辑</Button>
                    </span>
                </div>

                <div className="framework_r_height">
                    <div className="framework_btn_bg">
                        <span>
                            <Button className="schoolgroup_btn_blue schoolgroup_btn"
                                    onClick={this.addRoleMember}>添加成员</Button>
                        </span>
                        <Button disabled={!hasSelected}
                                className="calmBorderRadius schoolgroup_btn_red schoolgroup_btn_left schoolgroup_btn"
                                onClick={this.showConfirm}>批量删除</Button>
                        <span className="password_ts" style={{marginLeft: 8}}>
                            {hasSelected ? `选中 ${this.state.selectedRowKeys.length} 条记录` : ''}</span>
                    </div>
                    <Table className="framework_user" rowSelection={rowSelection} columns={columns} scroll={{y: 240}}
                           dataSource={this.state.mesData}
                           pagination={false}
                    />
                </div>

                <AddRoleMemberModal isShow={this.state.addRoleModalIsShow} parentRole={this.state.parentRole}
                                    callbackParent={this.listStructures}
                                    roleId={this.state.roleId}
                                    addRoleComplete={this.addRoleComplete}
                                    closeAddModel={this.closeAddModel}
                                    addedMemberData={this.state.mesData}
                ></AddRoleMemberModal>

                <EditRoleModal isShow={this.state.editRoleModalIsShow} roleId={this.state.roleId}
                               roleName={this.state.roleName}
                               onEditComplete={this.editRoleComplete}
                               onDelComplete={this.onDelComplete}
                               closeModel={this.closeModel}
                               papaName={this.state.papaName}
                />

                <Modal
                    className="calmModal"
                    visible={this.state.changeConfirmModalVisible}
                    title="提示"
                    onCancel={this.closeConfirmModal}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue calmSure"
                                onClick={this.deleteModal}>确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                onClick={this.closeConfirmModal}>取消</button>
                    ]}
                >
                    <div className="isDel">
                        <img className="sadFeel" src={require("../../../dist/jquery-photo-gallery/icon/sad.png")}/>
                        确定删除?
                    </div>
                </Modal>

                <Modal
                    className="role_grade"
                    visible={this.state.GradeModalVisible}
                    title={this.state.GradeModalTitle}
                    onCancel={this.closeGradeModal}
                    maskClosable={false} //设置不允许点击蒙层关闭
                    transitionName=""  //禁用modal的动画效果
                    footer={[
                        <button type="primary" className="login-form-button examination_btn_blue calmSure"
                                onClick={this.addGradeModal}>确定</button>,
                        <button type="ghost" className="login-form-button examination_btn_white calmCancle"
                                onClick={this.closeGradeModal}>取消</button>
                    ]}
                >
                    <div className="isDel">
                        {this.state.gradeArr}
                    </div>
                </Modal>

                <Modal
                    visible={this.state.ClazzModalVisible}
                    title={this.state.ClazzModalTitle}
                    onCancel={this.closeClazzModal}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    className="add_member"
                    footer={[

                        <button type="ghost" htmlType="reset"
                                className="ant-btn ant-btn-ghost login-form-button"
                                onClick={this.closeClazzModal}>取消</button>,
                        <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg"
                                onClick={this.addClazzModal}>确定</button>
                    ]}
                    width={692}
                >

                    <div id="inPut100" className={this.state.inputClassName}>
                        <Col span={24} className="right_ri">
                            <div className="ant-form-item">
                                <Input
                                    placeholder="请输入要搜索的班级"
                                    value={this.state.userNameFromOri}
                                    onChange={this.onChangeUserNameFromOri}
                                    ref={node => this.userNameInput = node}
                                />
                            </div>
                            <div className="gray_6_12 ant-form-item flex" style={{height: '24px'}}>
                                <span className="upexam_float " style={{lineHeight: '24px'}}>已选择：</span>
                                <div className="add_member_tags_wrap">
                                    <div className="add_member_tags upexam_float">
                                        {tags.map((tag, index) => {
                                            const isLongTag = tag.length > 20;
                                            const tagElem = (
                                                <Tag key={tag.key} closable={index !== -1}
                                                     afterClose={() => this.handleClose(tag)}>
                                                    {isLongTag ? `${tag.userName.slice(0, 20)}...` : tag.userName}
                                                </Tag>
                                            );
                                            return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                        })}
                                        {inputVisible && (
                                            <Input
                                                type="text" size="small"
                                                style={{width: 78}}
                                                value={inputValue}
                                                onChange={this.handleInputChange}
                                                onBlur={this.handleInputConfirm}
                                                onPressEnter={this.handleInputConfirm}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="add_member_wrap" style={{height: '338px'}}>
                                <Table columns={memberColumns}
                                       pagination={false} dataSource={this.state.searchUserFromOri}
                                       className="schoolgroup_table1 schoolgroup_table_department"
                                       scroll={{y: 240}}
                                       rowSelection={rowSelectionClazz}
                                />
                            </div>
                        </Col>
                    </div>
                </Modal>
            </div>
        );
    }
});

export default Role;
