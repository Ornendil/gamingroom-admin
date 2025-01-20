import React, { useState } from 'react';

function EditableTextField({ text, label, className, onSave, onCancel }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableText, setEditableText] = useState(text);

    const handleTextChange = (event) => {
        setEditableText(event.target.value);
    };

    const handleKeyDown = (event) => {
        const keysToPrevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
        
        if (keysToPrevent.includes(event.key)) {
            // event.preventDefault();
            event.stopPropagation();
        } else if (event.key === 'Enter') {
            // onSave(editableText);
            // setIsEditing(false);
        } else if (event.key === 'Escape') {
            onCancel();
            setIsEditing(false);
        }
    };

    const handleDoubleClick = () => {
        setIsEditing(true);
        // this.select();
    };

    const handleBlur = () => {
        onSave(editableText);
        setIsEditing(false);
    }

    return (
        isEditing ? (
            <input
                type="text"
                className={className}
                value={editableText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={(e) => e.target.select()}
                autoFocus
            />
        ) : (
            <span className={className} onClick={handleDoubleClick}>{label}</span>
        )
    );
}

export default EditableTextField;
