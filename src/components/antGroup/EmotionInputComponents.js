import React, { PropTypes } from 'react';
import { Input } from 'antd';

var EmotionInputComponents = React.createClass({
    componentDidMount(){
        window.emojiPicker = new EmojiPicker({
            emojiable_selector: '[data-emojiable=true]',
            assetsPath: '../../emojiPicker/lib/img/',
            popupButtonClasses: 'fa',
        });
        window.emojiPicker.discover();

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-49610253-3', 'auto');
        ga('send', 'pageview');
        $("#emotionInput").bind("keydown",this.sendMessage);
        $(".emoji-wysiwyg-editor").bind("keydown",this.sendMessage);
    },
    po_Last_Div(obj) {
        if (window.getSelection) {//ie11 10 9 ff safari
            obj.focus(); //解决ff不获取焦点无法定位问题
            var range = window.getSelection();//创建range
            range.selectAllChildren(obj);//range 选择obj下所有子内容  这里要改动obj==》？？ 0
            range.collapseToEnd();//光标移至最后
        }
        else if (document.selection) {//ie10 9 8 7 6 5
            var range = document.selection.createRange();//创建选择对象
            //var range = document.body.createTextRange();
            range.moveToElementText(obj[0]);//range定位到obj
            range.collapse(false);//光标移至最后
            range.select();
        }
    },
    sendMessage(e){
        // if(e.ctrlKey && e.keyCode==13){
        //   this.props.onKeyDown();
        //
        // }else if(){
        //     this.props.onKeyDown();
        // }
        if(event.keyCode == 13 && event.ctrlKey)
        {
            // var selectText = document.selection.createRange();
            var t = $(".emoji-wysiwyg-editor")[0];
            var selectText = t.innerHTML;
            console.log(t);
            console.log(selectText);
            if(selectText)
            {
                if(selectText.length > 0)
                    selectText += "<br/>";
                else{
                    // selectText.select();
                    selectText += "<br/>";
                }
            }
            t.innerHTML = selectText;
            console.log(selectText);
            this.po_Last_Div(t);
        }
        else if(event.keyCode == 13&& !event.ctrlKey)
        {
            this.props.onKeyDown();// 往服务器发送信息代码
            return false;
        }
    },


    render : function(){
        return (
            <div className="group_send_talk_div group_send_talk_div_84">
              <Input type="textarea" id="emotionInput" rows={4} data-emojiable="true" onChange={this.inputChange}/>
            </div>
        )
    }
})
export default EmotionInputComponents;
