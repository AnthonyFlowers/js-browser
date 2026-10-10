import React from "react";
import "./preview.css";

interface PreviewProps {
  code: string;
  bundlingStatus: string;
}

const html = `
<html>
  <head>
  <style>
  html {
    background-color: white;
  }
  body {
    overflow-wrap: break-word;
  }
  img, video, canvas, svg {
    max-width: 100%;
  }
  pre {
    white-space: pre-wrap;
  }
  </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      const handleError = (err) => {
        const root = document.querySelector("#root");
        root.innerHTML = "<div style='color: red;'><h4>Runtime Error</h4>" + err + "</div>";
      }
      window.addEventListener("error", (event) => {
        event.preventDefault();
        handleError(event.error);
      });
      window.addEventListener("message", (event) => {
        try {
          eval(event.data);
        } catch (err) {
          handleError(err);
        }
      }, false);
    </script>
  </body>
</html>
`;

const Preview: React.FC<PreviewProps> = ({ code, bundlingStatus }) => {
  return (
    <div className="preview-wrapper">
      <iframe
        key={code}
        title="code-executor"
        sandbox="allow-scripts"
        srcDoc={html}
        onLoad={(event) =>
          event.currentTarget.contentWindow?.postMessage(code, "*")
        }
      />
      {bundlingStatus ? (
        <div className="preview-error">{bundlingStatus}</div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Preview;
