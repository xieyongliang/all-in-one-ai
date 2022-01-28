import React from 'react';
import { Stage, Layer, Image, Rect, Text } from 'react-konva';
import Popover from 'aws-northstar/components/Popover';

const uuid = require('uuid');

class URLImage extends React.Component {
    state = {
        image: null,
        width: 0,
        height: 0,
        label: '',
        popx: 0,
        popy: 0
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
      if(this.props.label.length === 0)
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
        else
            return (
              <Stage width={this.state.width} height={this.state.height}>
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
                    this.props.bbox.map((bbox) => (
                        <Rect 
                            key = {uuid.v4()}
                            x = {Math.floor((parseFloat(bbox[0]) - parseFloat(bbox[2]) / 2) * this.state.width)}
                            y = {Math.floor((parseFloat(bbox[1]) - parseFloat(bbox[3]) / 2) * this.state.height)}
                            width = {Math.floor( parseFloat(bbox[2]) * this.state.width)}
                            height = {Math.floor( parseFloat(bbox[3]) * this.state.height)}
                            stroke = '#00A3AA'
                        />
                      )
                    )
                  }
                </Layer>
              </Stage>
          );
    }
}

export default URLImage;