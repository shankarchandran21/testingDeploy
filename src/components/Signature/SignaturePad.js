import "./SignaturePad.css";
import React, { Component } from "react";
import SignaturePadCanvas from "react-signature-canvas";
import { inject, observer } from "mobx-react";

class SignaturePad extends Component {
  constructor(props) {
    super(props);
    this.signPad = React.createRef();
  }

  clear = () => {
    this.signPad.current.clear();
    this.props.dataStore.certificates.signature = "";
  };

  handleHoverOff = () => {
    this.props.dataStore.certificates.signature = this.signPad.current.toDataURL();
  };

  render() {
    return (
      <>
        <div className="signature" onClick={this.handleHoverOff}>
          <SignaturePadCanvas
            ref={this.signPad}
            penColor="black"
            canvasProps={{ width: 500, height: 150, }}
          />
        </div>
      </>
    );
  }
}

export default inject("dataStore")(observer(SignaturePad));
