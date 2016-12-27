import React, { PropTypes } from 'react';
import {Button} from 'antd';


// TodoList 组件是一个整体的组件，最终的React渲染也将只渲染这一个组件
// 该组件用于将『新增』和『列表』两个组件集成起来，并且存储 todolist 的数据
var KnowledgeComponents = React.createClass({
  // 初始化数据
  getInitialState: function () {
    return {
      todolist: ['数学','语文']
    };
  },
  // 接收一个传入的数据，并将它实时更新到组件的 state 中，以便组件根据数据重新render
  // 只要改变了 state ，react自动执行 reader 计算
  handleChange: function (rows) {
    this.setState({
      todolist: rows
    });
  },
  render: function () {
    return (
      <div>
        {/*
         集成 TypeNews 组件，传入两个属性 onAdd 和 todo
         todo - 将todolist的数据传入到组件，当新增时，更新todolist数据
         onAdd -  将 handleChange 函数传入到组件，新增时，用它来处理最新的todolist数据
         */}
        {/*
         集成 ListTodo 组件，传入两个属性 onDel 和 todo
         todo - 将todolist的数据传入到组件，当删除时，更新todolist数据
         onDel - 将 handleChange 函数传入到组件，删除时，用它来处理最新的todolist数据
         */}
        <ListTodo onDel={this.handleChange} todo={this.state.todolist} />
      </div>
    );
  }
});

// ListTodo 组件用于展示列表，并可以删除某一项内容，它有 noDel todo 两个属性，上文已经提到过
// 它的基本逻辑是：遍历 todo 的内容，生成数据列表和删除按钮
// 对某一项执行删除时，想将 todo 中的数据删除，
// 然后通过 onDel 事件调用 TodoList 的 handleChange 来更新state，然后react自动render
var ListTodo = React.createClass({
  handleDel: function (e) {
    var delIndex = e.target.getAttribute('data-key');
    // 更新数据，并使用 onDel 更新到 TodoList 的 state 中，以便 React自动render
    //this.props.todo.push("1231");
    this.props.todo.splice(0,this.props.todo.length);
    var newList = ['小学','初中','高中'];
    for(var i=0;i<newList.length;i++){
      this.props.todo.push(newList[i]);
    }
    this.props.onDel(this.props.todo);
  },
  render: function () {
    return (
      <div>
        <a href="#">知识点</a>
        <hr/>
        <ul id="todo-list">
          {
            // {/* 遍历数据 */}
            this.props.todo.map(function (item, i) {
              return (
                <li>
                  <label onClick={this.handleDel} data-key={item}>{item}</label>
                </li>
              );
            }.bind(this)) // {/* 绑定函数的执行this - 以便 this.handleDel */}
          }
        </ul>
      </div>
    );
  }
});
export default KnowledgeComponents;
