import React from 'react';
import { Stage, Layer, Image, Rect, Text } from 'react-konva';

const uuid = require('uuid');

class URLImage extends React.Component {
    state = {
        image: null,
        width: 0,
        height: 0
    };

    componentDidMount() {
        this.loadImage();
    }
  
    componentDidUpdate(oldProps) {
        if (oldProps.src !== this.props.src) {
            this.loadImage();
        }
    }
  
    componentWillUnmount() {
        this.image.removeEventListener('load', this.handleLoad);
    }
  
    loadImage() {
        this.image = new window.Image();
        this.image.src = this.props.src;
        this.image.addEventListener('load', this.handleLoad);
    }
  
    handleLoad = () => {
        this.setState({
          image: this.image, 
          width: this.image.width, 
          height: this.image.height
        });
    };
  
    render() {
      if(this.props.bbox.length === 0)
            return (
                <Stage width={this.state.width} height={this.state.height}>
                  <Layer>
                    <Image
                      x={this.props.x}
                      y={this.props.y}
                      image={this.state.image}
                      ref={node => {
                        this.imageNode = node;
                      }}
                    />
                  </Layer>
                </Stage>
            );
        else {
            return (
              <Stage width={this.state.width + 500} height={this.state.height}>
                <Layer>
                  <Image
                      x = {this.props.x}
                      y = {this.props.y}
                      image = {this.state.image}
                      ref={node => {
                          this.imageNode = node;
                      }}
                  />
                  {                    
                    this.props.bbox.map((bbox, index) => (
                        <Rect 
                            key = {uuid.v4()}
                            x = {Math.floor((bbox[0] - bbox[2] / 2) * this.state.width)}
                            y = {Math.floor((bbox[1] - bbox[3] / 2) * this.state.height)}
                            width = {Math.floor(bbox[2] * this.state.width)}
                            height = {Math.floor(bbox[3] * this.state.height)}
                            stroke = {this.props.colors[this.props.id[index]]}
                        />
                      )
                    )
                  }
                  {
                    this.props.bbox.map((bbox, index) => (
                        <Rect
                            x = {this.state.width + 60}
                            y = {index * 20 + 5}
                            width = {30}
                            height = {10}
                            fill = {this.props.colors[this.props.id[index] % this.props.colors.length]}
                        />
                      )
                    )
                  }
                  {
                    this.props.bbox.map((bbox, index) => (
                        <Text
                            text = {this.props.labels[this.props.id[index]]}
                            x = {this.state.width + 100}
                            y = {index * 20}
                            fontFamily='Times New Roman'
                            fontSize={18}
                        />
                      )
                    )
                  }
                </Layer>
              </Stage>
            );
        }
    }
}

export default URLImage;