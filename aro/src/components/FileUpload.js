import React, { useState } from "react";
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState();

  function handleChange(event) {
    setFile(event.target.files[0])
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    axios.post("http://localhost:8000/uploadFile", formData).then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>React File Upload</h1>
        <input type="file" onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default FileUpload;
