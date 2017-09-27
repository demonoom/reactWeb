import React, { PropTypes } from 'react';
import { Input } from 'antd';

var EmotionInputComponents = React.createClass({
  componentDidMount(){
    window.emojiPicker = new EmojiPicker({
      emojiable_selector: '[data-emojiable=true]',
      assetsPath: '../../emojiPicker/lib/img/',
      popupButtonClasses: 'fa'
    });
    window.emojiPicker.discover();

    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-49610253-3', 'auto');
    ga('send', 'pageview');
  },


  render : function(){
    return (
      <div className="group_send_talk_div">
        <Input type="textarea" id="emotionInput" rows={4} data-emojiable="true" onChange={this.inputChange}/>
      </div>
    )
  }
})
export default EmotionInputComponents;
