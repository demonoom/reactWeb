import React from 'react';

var TextboxioComponentForSingle = React.createClass({
  componentDidMount(){
    mytextareaSingleEditor = textboxio.replace('#mytextarea',defaultConfig);
    mytextareaSingleEditor.events.dirty.addListener(function () {
      mytextareaSingleEditor.mode.set("code");
      // console.log('editor content is now dirty', mytextareaSingleEditor.element());
      mytextareaSingleEditor.mode.set("design");
      // console.log('mytextareaSingleEditor.mode.get()====>', mytextareaSingleEditor.mode.get())
    });
    mytextareaSingleEditor.events.focus.addListener(function () {
      if(mytextareaSingleEditor.mode.get()=="code"){
        mytextareaSingleEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    mytextareaSingleEditor.mode.set("code");
    mytextareaSingleEditor.mode.set("design");
  },
  render : function(){
    return (
      <div>
        <textarea  id="mytextarea" style={{width:'100%',height:'300px'}}></textarea>
      </div>
    )
  }
})
export default TextboxioComponentForSingle;
