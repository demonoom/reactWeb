import React from 'react';

var TextboxioComponentForSimpleAnswer = React.createClass({
  componentDidMount(){
    mytextareaSimpleAnswerEditor = textboxio.replace('#mySimpleAnswerTextarea',defaultConfig);
  },
  render : function(){
    return (
      <div>
        <div id="mySimpleAnswerTextarea" style={{width:'100%',height:'300px'}}></div>
      </div>
    )
  }
})
export default TextboxioComponentForSimpleAnswer;
