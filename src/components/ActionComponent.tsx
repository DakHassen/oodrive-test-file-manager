import React, { Fragment, useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import allActions from '../actions/allActions';
import { saveAs } from 'file-saver';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

type ItemType = {
  creation: string,
  folder: boolean
  id: string
  modification: string
  name: string
  _links:
  {
    children: { href: string, type: string },
    delete: { href: string, type: string }
    update: { href: string, type: string }
    upload: { href: string, type: string }
  }
}

type AllItemsType = {
  items: ItemType[], _links: {
    '@create': { href: string, type: string },
    '@upload': { href: string, type: string }
  }

}

const ActionComponent: any = () => {
  const [file, setFile] = useState('');
  const [filename, setFilename] = useState('Choisissez votre fichier :) ');
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [currentParentID, setcurrentParentID] = useState("");
  const [breadcrumb, setbreadcrumb] = useState(["Home"]);
  const [allItems, setAllItems] = useState<AllItemsType>(
    {
      items: [{
        creation: "",
        folder: false,
        id: "",
        modification: "",
        name: "",
        _links:
        {
          children: { href: "", type: "" },
          delete: { href: "", type: "" },
          update: { href: "", type: "" },
          upload: { href: "", type: "" },
        }
      }], _links: {
        '@create': { href: "", type: "" },
        '@upload': { href: "", type: "" }
      }
    }
  );



  useEffect(() => {

    axios.get("/api/items").then((res) => {
      setAllItems(res.data)
    })

  }, []);

  const onChange = (e: any) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`/api/items?parentId=${currentParentID}`, formData, {
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
      let temp = allItems;
      res.data.items.forEach((element: ItemType) => {
        return temp.items.push(element);
      }

      );

      setAllItems(temp);
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
    await axios.post(`/api/items?parentId=${currentParentID}`, { name: e.target.name.value, folder: true }).then((res) => {
  
      let temp = allItems;
      temp.items.push(res.data);
      setAllItems(temp);
      setMessage('Folder Created');
    }
    ).catch(err => {
      console.log(err.response)
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.desc);
      }
    })
  };

  const accesTofolder = async (e: any, childrenHref: string, name: string, id: string) => {
    e.preventDefault();
    let temp = breadcrumb;
    temp.push(name)
    setbreadcrumb(temp);
    setcurrentParentID(id)
    await axios.get(childrenHref).then((res) => {
      console.log(res.data)
      setAllItems(res.data)
    }
    ).catch(err => {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.desc);
      }
    })
  };
  const downloadFile = async (e: any, id: string) => {
    e.preventDefault();
    saveAs(`/api/items/${id}`);
    setMessage('Folder Downlowded');
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
        <div className="card text-center">
          <div className="card-header">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                {breadcrumb.map((br, i) => {

                  return <li key={i} className="breadcrumb-item"><a href="#">{br}</a></li>
                })}

              </ol>
            </nav>
          </div>
          <div className="card-body">
            <div className="container-fluid content-row">
              <div className="row">
                {allItems.items.map((item, i) => {
                  return <div className="col-sm-4 col-lg-2"> <div key={i} className="card h-100">

                    {item.folder ? <i className="fa fa-folder fa-5x" aria-hidden="true"></i>
                      : <img className="card-img-top" src={`/api/items/${item.id}`} alt='' />}

                    <div className="card-body">
                      <h6 className='text-center'>{item.name}</h6>
                    </div>
                    <div className="card-footer">
                      {item.folder ? <button type="button" className="btn btn-info btn-block" onClick={() => accesTofolder(event, item._links.children.href, item.name, item.id)} >Ouvrir</button> : <button type="button" className="btn btn-info btn-block" onClick={() => downloadFile(event, item.id)} >Téléchargez</button>}

                    </div>
                  </div></div>
                })}
              </div>


            </div>
          </div>
          <div className="card-footer text-muted">
            2 days ago
  </div></div>


      </div>

    </Fragment>
  );
}

export default ActionComponent;