import "./DoughnutChart.css";
import React, { Component } from "react";

class DashboardBanner extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      data: [],
    };
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        <div className="banner-wrapper">
          <div className="banner-warpper-card">
            <div className="banner-wrapper-sub-card-header">
              Pending Requests
            </div>
            <div className="banner-wrapper-sub-card">
              <div className="banner-wrapper-sub-card-header-value">
                {data.pending_requests ? data.pending_requests : 0}
              </div>
            </div>
          </div>
          <div className="banner-warpper-card">
            <div className="banner-wrapper-sub-card-header">
              Pending To Be Signed
            </div>
            <div className="banner-wrapper-sub-card">
              <div className="banner-wrapper-sub-card-header-value">
                {data.pending_to_be_signed ? data.pending_to_be_signed : 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default DashboardBanner;
