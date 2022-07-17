import React  from 'react';
import { connect } from 'react-redux' 
import cognitoUtils from "../../../lib/cognitoUtils";

const MapStateToProps = (state) => {
  return {
      cfg: state
  }
}

const MapDispatchTpProps = (dispatch) => {
  return {
      config: (cfg)=>dispatch({type: 'config',data: cfg}),
  }
}


class  SignOut extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  componentWillMount(){
  }

  async componentDidMount(){
    await cognitoUtils.signOutCognito();
    window.location.href = '/'
  }

  componentWillUnmount(){

  }

  render(){
    return(
      <div />
    )
  }
}

export default connect(MapStateToProps, MapDispatchTpProps)(SignOut);

