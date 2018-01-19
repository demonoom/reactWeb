import React from 'react';
import {isEmpty} from "../../utils/Const";

var SubjectAnalysisContent = React.createClass({
    componentDidMount() {
        subjectAnalysisContentEditor = textboxio.replace('#subjectAnalysis', defaultConfig);

        subjectAnalysisContentEditor.events.focus.addListener(function () {
            if (subjectAnalysisContentEditor.mode.get() == "code") {
                subjectAnalysisContentEditor.mode.set("design");
            }
            var newContent = "<span></span>";
            subjectAnalysisContentEditor.content.insertHtmlAtCursor(newContent);
        });
        var analysisContent = this.props.analysisContent;
        if(isEmpty(analysisContent)==false){
            subjectAnalysisContentEditor.content.set(analysisContent);
        }
    },
    componentDidUpdate() {
        if (subjectAnalysisContentEditor == null || typeof(subjectAnalysisContentEditor) == "undefined") {
            subjectAnalysisContentEditor = textboxio.replace('#subjectAnalysis', defaultConfig);
        }
        var activeEditor = textboxio.getActiveEditor();
        if (subjectAnalysisContentEditor != null && typeof(subjectAnalysisContentEditor) != "undefined" && activeEditor == subjectAnalysisContentEditor) {
            subjectAnalysisContentEditor.mode.set("code");
            subjectAnalysisContentEditor.mode.set("design");
        }
    },

    componentWillReceiveProps(nextProps){
        var analysisContent = nextProps.analysisContent;
        if(isEmpty(analysisContent)==false){
            subjectAnalysisContentEditor.content.set(analysisContent);
        }
    },

    /**
     * 获取题目的题干
     */
    getSubjectAnalysisContent() {
        return subjectAnalysisContentEditor.content.get();
    },

    /**
     * 获取题目的题干
     */
    setSubjectAnalysisContent(content) {
        subjectAnalysisContentEditor.content.set(content);
    },

    render: function () {
        return (
            <div>
                <textarea id="subjectAnalysis" style={{width: '100%', height: '300px'}}></textarea>
            </div>
        )
    }
})
export default SubjectAnalysisContent;
