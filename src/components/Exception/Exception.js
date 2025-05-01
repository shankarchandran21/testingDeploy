import "./Exception.css";

import ExceptionImg from "../../assets/404.png";
import React from "react";

class Exception extends React.Component {
  constructor() {
    super();
    this.state = {
      errorCode: null,
      errorMsg: "",
    };
  }

  componentDidMount() {
    let code = 404;
    let msg = "Sorry, the page you visited does not exist";

    if (this.props.location.pathname.split("/")[1] === "exception") {
      code = this.props.location.pathname.split("/")[2];
      msg = "Sorry, the server is reporting an error";
    }
    this.setState({
      errorCode: code,
      errorMsg: msg,
    });
  }

  render() {
    const { errorCode, errorMsg } = this.state;
    return (
      <div className="page-not-found-container">
        <div className="main">
          <div className="left">
            <img src={ExceptionImg} alt="logo" className="logo"/>
          </div>
          <div className="right">
            <h1>{errorCode}</h1>

            <div className="not-found-subtext">{errorMsg}</div>

            <button type="submit" className="not-found-button">
              <div className="link">
                <a href="/" className="back-to-home">Back to home</a>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Exception;
