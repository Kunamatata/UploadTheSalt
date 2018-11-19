import React, { Component } from 'react';
import LazyLoad from 'react-lazyload';

import pluralize from './helpers/pluralize';
import './App.css';
import saltImage from './images/Salty-Salt.png'

class App extends Component {
  constructor() {
    super();
    this.state = { files: [] };
    this.uploadImage = this.uploadImage.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  componentDidMount() {
    this.getImages();
  }

  getImages(){
    fetch('/api/images').then(response => {
      return response.json();
    }).then(data => {
      this.setState(data);
    }).catch(e => {
      console.log(e)
    })
  }

  handleImageChange(e) {
    e.preventDefault();
    this.setState({
      filePreview: URL.createObjectURL(e.target.files[0]),
      fileToUpload: e.target.files[0]
    })
  }

  handlePaste(e){
    const file = e.clipboardData.items[0].getAsFile();
    this.setState({fileToUpload: file, filePreview: URL.createObjectURL(file  )})
  }

  uploadImage(e) {
    e.preventDefault();
    let formData = new FormData();

    formData.append('image', this.state.fileToUpload);
    fetch('/api/image', {
      method: 'POST',
      body: formData
    }).then(response => {
      if (response.status === 200) {
        this.setState({ message: "Image was successfully uploaded..." })
        setTimeout(() => {
          this.setState({ message: null })
        }, 3000);
      }
      else {
        response.json().then(({ message }) => {
          this.setState({ error: `Error! ${message}` });
          setTimeout(() => {
            this.setState({ error: null })
          }, 3000)
        })

      }
    });
  }

  render() {
    const {numberOfPendingFiles} = this.state;
    return (
      <div className="App">
      <div className="pending-images">{numberOfPendingFiles} {pluralize('image', numberOfPendingFiles)} pending verification.</div>
      <div className="title">
        <img src={saltImage} className="salt-image"/> <span>UPLOAD THE SALT</span>
      </div>
        {this.state.message ? <div className="success-message">{this.state.message} </div> : <div></div> }
        {this.state.error ? <div className="error-message">{this.state.error} </div> : <div></div> }
        <form className="image-form" onSubmit={this.uploadImage} encType="multipart/form-data">
        <span>You can also paste your screenshot in the box underneath</span>
      <div className="paste-area" onPaste={this.handlePaste}><img className="image" src={this.state.filePreview}/></div>
            <input type="file" onChange={this.handleImageChange} name="image" />
            <input type="submit" className="submit" value="Upload"/>
        </form>
        <div className="image-container">
          {this.state.files.map(file => {
              return (<LazyLoad height={200} offset={100} once><a href={"/uploads/" + file} > <img className="image" src={"/uploads/" + file} /></a></LazyLoad>)
            })}
        </div>
      </div>
    );
  }
}

export default App;
