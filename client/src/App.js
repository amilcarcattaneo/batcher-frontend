import React, { useState } from "react";

const App = () => {
  const [status, setStatus] = useState("Drop Here");
  const [preview, setPreview] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [enableDragDrop, setEnableDragDrop] = useState(true);
  const [stateXhr, setStateXhr] = useState(null);

  const doNothing = event => event.preventDefault();
  const onDragEnter = event => {
    if (enableDragDrop) {
      setStatus("File Detected");
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragOver = event => {
    if (enableDragDrop) {
      setStatus("Drop");
    }
    event.preventDefault();
  };

  const onDrop = event => {
    // csv
    const supportedFilesTypes = ["image/png", "application/pdf", "text/csv"];
    const { type } = event.dataTransfer.files[0];
    if (supportedFilesTypes.indexOf(type) > -1 && enableDragDrop) {
      // reads file
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(event.dataTransfer.files[0]);

      // uploads
      const payload = new FormData();
      payload.append("file", event.dataTransfer.files[0]);
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = e => {
        const done = e.position || e.loaded;
        const total = e.totalSize || e.total;
        const perc = Math.floor((done / total) * 1000) / 10;
        if (perc >= 100) {
          setTimeout(() => {
            setPreview(null);
            setStatus("Drop Here");
            setPercentage(0);
            setEnableDragDrop(true);
          }, 2550);
        } else {
          setStatus(`${perc}%`);
        }
        setPercentage(perc);
      };

      xhr.open("POST", "http://localhost:80/upload");
      // xhr.setRequestHeader()
      xhr.send(payload);
      setStateXhr(xhr);
      setEnableDragDrop(false);
    }
    event.preventDefault();
  };

  const onDragLeave = event => {
    if (enableDragDrop) {
      setStatus("Drop Here");
    }
    event.preventDefault();
  };

  const onAbortClick = () => {
    stateXhr.abort();
    setPreview(null);
    setStatus("Drop Here");
    setPercentage(0);
    setEnableDragDrop(true);
  };

  return (
    <div
      className="App"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={doNothing}
      onDrop={onDragLeave}
    >
      <div
        className={`DropArea ${status === "Drop" ? "Over" : ""} ${
          status.indexOf("%") > -1 || status === "Done" ? "Uploading" : ""
        }`}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragLeave={onDragEnter}
      >
        <div
          className={`Status ${
            status.indexOf("%") > -1 || status === "Done" ? "Uploading" : ""
          }`}
        >
          {status}
        </div>

        {status.indexOf("%") > -1 && (
          <div className="Abort" onClick={onAbortClick}>
            <span>&times;</span>
          </div>
        )}

        <div className={`ImageProgress ${preview ? "Show" : ""}`}>
          <div
            className="ImageProgressImage"
            style={{
              backgroundImage: `url(${preview})`,
              clipPath: `inset(${100 - Number(percentage)}% 0 0 0)`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default App;
