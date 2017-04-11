import React from 'react';
// import { connect } from 'react-redux';
import ImageGallery from 'react-image-gallery';

export default class CarouselView extends React.Component {
  constructor() {
    super()

    this.handleImageLoad = this.handleImageLoad.bind(this)
  }

  handleImageLoad(event) {
    console.log('Image loaded ', event.target)
  }

  render() {

    const images = [
      {
        original: 'http://lorempixel.com/1000/600/nature/1/',
        thumbnail: 'http://lorempixel.com/250/150/nature/1/',
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/2/',
        thumbnail: 'http://lorempixel.com/250/150/nature/2/'
      },
      {
        original: 'http://lorempixel.com/1000/600/nature/3/',
        thumbnail: 'http://lorempixel.com/250/150/nature/3/'
      }
    ]


    return (
      <div>
        <ImageGallery
          items={images}
          slideInterval={2000}
          onImageLoad={this.handleImageLoad}
        />
      </div>
    );
  }
}