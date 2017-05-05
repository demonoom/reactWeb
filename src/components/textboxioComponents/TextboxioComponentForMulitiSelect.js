import React from 'react';

var TextboxioComponentForMulitiSelect = React.createClass({
  componentDidMount(){
    mytextareaMulitiEditor = textboxio.replace('#myMulitiTextarea',defaultConfig);

    mytextareaMulitiEditor.events.focus.addListener(function () {
      if(mytextareaMulitiEditor.mode.get()=="code"){
        mytextareaMulitiEditor.mode.set("design");
      }
    });
  },
  componentDidUpdate(){
    if(mytextareaMulitiEditor==null || typeof(mytextareaMulitiEditor)=="undefined" ){
      mytextareaMulitiEditor = textboxio.replace('#myMulitiTextarea',defaultConfig);
    }
    var activeEditor = textboxio.getActiveEditor();
    if(mytextareaMulitiEditor != null && typeof(mytextareaMulitiEditor)!="undefined" && activeEditor==mytextareaMulitiEditor) {
      mytextareaMulitiEditor.mode.set("code");
      mytextareaMulitiEditor.mode.set("design");
    }
  },
  render : function(){
    return (
      <div>
        <div id="myMulitiTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForMulitiSelect;
