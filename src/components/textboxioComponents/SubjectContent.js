import React from 'react';

var SubjectContent = React.createClass({
    componentDidMount() {
        subjectContentEditor = textboxio.replace('#mytextarea', defaultConfig);

        subjectContentEditor.events.focus.addListener(function () {
            if (subjectContentEditor.mode.get() == "code") {
                subjectContentEditor.mode.set("design");
            }
            var newContent = "<span></span>";
            subjectContentEditor.content.insertHtmlAtCursor(newContent);
        });
    },
    componentDidUpdate() {
        if (subjectContentEditor == null || typeof(subjectContentEditor) == "undefined") {
            subjectContentEditor = textboxio.replace('#mytextarea', defaultConfig);
        }
        var activeEditor = textboxio.getActiveEditor();
        if (subjectContentEditor != null && typeof(subjectContentEditor) != "undefined" && activeEditor == subjectContentEditor) {
            subjectContentEditor.mode.set("code");
            subjectContentEditor.mode.set("design");
        }
    },
    /**
     * 获取题目的题干
     */
    getSubjectContent() {
        return subjectContentEditor.content.get();
    },

    /**
     * 获取题目的题干
     */
    setSubjectContent(content) {
        subjectContentEditor.content.set(content);
    },

    render: function () {
        return (
            <div>
                <textarea id="mytextarea" style={{width: '100%', height: '300px'}}></textarea>
            </div>
        )
    }
})
export default SubjectContent;
