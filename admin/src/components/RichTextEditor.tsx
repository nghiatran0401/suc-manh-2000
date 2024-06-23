import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";

const RichTextEditor = (props: { initialContent?: string; hideButtonList?: boolean; onChange: (content: string) => void }) => {
  return (
    <div style={{ fontFamily: "inherit !important" }}>
      <SunEditor
        width="100%"
        height="250px"
        setOptions={{
          defaultStyle: "font-family: Arial; font-size: 14px",
          buttonList: props.hideButtonList
            ? []
            : [
                ["undo", "redo"],
                ["font"],
                ["formatBlock"],
                ["fontSize"],
                ["bold", "underline", "italic", "strike"],
                ["fontColor", "hiliteColor", "outdent", "indent", "align", "horizontalRule", "list"],
                ["link", "video"],
                // ["table", "image"],
                // ["codeView", "preview"],
                // ["fullScreen"],
              ],
        }}
        setContents={props.initialContent}
        onChange={props.onChange}
      />
    </div>
  );
};
export default RichTextEditor;
