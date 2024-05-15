import React, { useEffect, useRef, useState } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

const SuneditorComponent = (props: {
  initialContent?: string;
  title?: string;
  hideButtonList?: boolean;
  onChange: (content: string) => void;
}) => {
  return (
    <div
      style={{
        fontFamily: "inherit !important",
      }}
    >
      <SunEditor
        autoFocus={true}
        width="100%"
        height="390px"
        setOptions={{
          buttonList: props.hideButtonList
            ? []
            : [
                ["undo", "redo"],
                ["formatBlock"],
                [
                  "bold",
                  "underline",
                  "italic",
                  "strike",
                  "subscript",
                  "superscript",
                  "removeFormat",
                ],
                [
                  "fontColor",
                  "hiliteColor",
                  "outdent",
                  "indent",
                  "align",
                  "horizontalRule",
                  "list",
                  "table",
                ],
                ["table", "link", "image"],
                ["codeView", "preview"],
                ["fullScreen"],
              ],
        }}
        setContents={props.initialContent}
        onChange={props.onChange}
      />
    </div>
  );
};
export default SuneditorComponent;
