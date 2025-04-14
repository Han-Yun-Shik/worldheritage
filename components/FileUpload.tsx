import React, { useState } from "react";
import "@/styles/file-upload.css"; // CSS 파일 import

const FileUpload = ({ handleChange }: { handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [fileName, setFileName] = useState<string>("파일을 선택하세요");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
    handleChange(e);
  };

  return (
    <div className="file-upload">
      <label htmlFor="addfile1" className="file-upload-label">
        파일 선택
      </label>
      <input type="file" name="addfile1" id="addfile1" onChange={onFileChange} />
      <p className="file-upload-text">{fileName}</p>
    </div>
  );
};

export default FileUpload;
