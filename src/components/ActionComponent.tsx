import React, { Fragment, useState } from 'react';
// import { useDispatch } from 'react-redux';
// import allActions from '../actions/allActions';
import { saveAs } from 'file-saver';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

const ActionComponent: any = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choisissez votre fichier :) ');
  const [uploadedFile, setUploadedFile] = useState({ name: "", id: "", folder: false });
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);


  const onChange = (e: any) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total).toString()
            )
          );

          // Clear percentage
          setTimeout(() => setUploadPercentage(0), 10000);
        }
      });

      const { name, id, folder } = res.data.items[0];

      setUploadedFile({ name, id, folder });

      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.desc);
      }
    }
  };

  const createFolder = async (e: any) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/items', { name: e.target.name.value, folder: true }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(res.data.items[0])
      const { name, id, folder } = res.data.items[0];
      setUploadedFile({ name, id, folder });

      setMessage('Folder Created');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.desc);
      }
    }
  };
  const downloadFile = async (e: any) => {
    e.preventDefault();

    try {
      // const res = await axios.get(`/api/items/${uploadedFile.id}`, {
      //   responseType: 'arraybuffer'
      // });
      saveAs(`/api/items/${uploadedFile.id}`);
      setMessage('Folder Downlowded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.desc);
      }
    }

  }

  return (
    <Fragment>
      {message ? <Message msg={message} /> : null}


      <form onSubmit={createFolder} style={{ marginBottom: "25px" }}>
        <div className='custom-file mb-4'>
          <input
            type='text'
            className='form-control'
            id='name'
            name="name"
            placeholder="Nouveau répertoire"
          />
          <input

            type='submit'
            value='Creez un nouveau répertoire'
            className='btn btn-primary btn-block mt-4'
          />
        </div>
      </form>

      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='customFile'
            onChange={onChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />

        <input
          type='submit'
          value='Chargez le fichier'
          className='btn btn-primary btn-block mt-4'
        />
      </form>
      <div className='column mt-5'>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="#">Home</a></li>
            {uploadedFile && uploadedFile.id !== "" && uploadedFile.folder ? (<div>
              <li className="breadcrumb-item"><a href="#">{uploadedFile.name}</a></li>
            </div>) : <li className="breadcrumb-item"><a href="#"> </a></li>}


          </ol>
        </nav>
      </div>
      {uploadedFile && uploadedFile.id !== "" ? (

        <div className="card-group">
          <div className="card">
            <img style={{ width: '100%' }} src={`/api/items/${uploadedFile.id}`} alt='' />

            <div className="card-footer">
              <h3 className='text-center'>{uploadedFile.name}</h3>

              <button type="button" className="btn btn-info btn-block" onClick={downloadFile} >Téléchargez</button>
            </div>
          </div>
        </div>

      ) : null
      }
    </Fragment>
  );
}

export default ActionComponent;