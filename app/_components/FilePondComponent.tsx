import React, { useState } from 'react';

import { FilePond, registerPlugin } from 'react-filepond';

import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Register the plugins
// registerPlugin(FilePondPluginFileValidateSize, FilePondPluginFileValidateType);

export function FilePondComponent({ userId }: { userId: string }) {
  // State to manage files
  const [files, setFiles] = useState<FilePond.FilePondFile[]>([]);

  const handleProcessFile = (error: any, file: FilePond.FilePondFile) => {
    if (error) {
      console.error('File upload error:', error);
      return;
    }
    console.log('File successfully uploaded:', file);
  };

  const handleProcessFiles = (error: any, files: FilePond.FilePondFile[]) => {
    if (error) {
      console.error('Error processing files:', error);
      return;
    }
    console.log('All files uploaded successfully:', files);
  };

  return (
    <div>
      <FilePond
        files={files}
        onupdatefiles={(fileItems) => setFiles(fileItems)}
        allowMultiple={false}
        maxFiles={1}
        server={{
          url: '/api/upload',
          process: {
            url: '/',
            method: 'POST',

            onload: (response) => {
              return response;
            },
            onerror: (error) => {
              console.error('Upload error:', error);
            },
            ondata: (formData) => {
              formData.append('userId', userId);
              return formData;
            },
          },
        }}
        name="file" // Must match the multer field name
        labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
        onprocessfile={handleProcessFile}
      />
    </div>
  );
}
