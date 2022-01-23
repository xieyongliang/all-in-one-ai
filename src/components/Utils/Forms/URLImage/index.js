import React from 'react';
import { Stage, Layer, Image, Rect, Text } from 'react-konva';

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
        if(this.props.name === '')
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
                      x={this.props.x}
                      y={this.props.y}
                      image={this.state.image}
                      ref={node => {
                          this.imageNode = node;
                      }}
                  />
                  <Rect
                      x={this.props.x}
                      y={this.props.y}
                      width={this.state.width}
                      height={this.state.height}
                      stroke="blue"
                      shadowBlur={10}
                    />
                  <Text
                      text = "abc"
                      x = {20}
                      y = {20}
                  />
                </Layer>
              </Stage>
          );
    }
}

export default URLImage;