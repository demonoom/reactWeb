import React, { PropTypes } from 'react';
import { Menu } from 'antd';

var divStyle = {
      width:'150px',
      height:'1200px',
      background:'#999999',
      position:'absolute',
      left:'-150px',
      zIndex:'999',
};

var spanStyle = {
      width:'20px',
      height:'70px',
      lineHeight:'23px',
      background:'#09C',
      position:'absolute',
      right:'-20px',
      top:'400px',
      float:'right',
};

var timer=null;
const SideMenu = React.createClass({
  getInitialState() {
    return {
      current: '6',
    };
  },

  startmove:function (target,speed) {
      var odiv = this.refs.div1;
      clearInterval(timer);
      timer=setInterval(function (){

        if(odiv.offsetLeft==target)
        {
          clearInterval(timer);
        }
        else
        {
          odiv.style.left=odiv.offsetLeft+speed+'px';
        }

      },30)
  },

  openDiv:function (e) {
    this.startmove(0,10);
  },

  closeDiv:function (e) {
    this.startmove(-150,-10);
  },

  render() {
    return (
      <div ref="div1" style={divStyle}  onMouseLeave={this.closeDiv}>
        <ul>
            <li><a href="#">Menu1</a></li>
            <li><a href="#">Menu2</a></li>
            <li><a href="#">Menu3</a></li>
            <li><a href="#">Menu4</a></li>
            <li><a href="#">Menu5</a></li>
        </ul>
        <span onClick={this.openDiv} style={spanStyle}>侧边栏</span>
      </div>
    );
  },
});
export default SideMenu;
