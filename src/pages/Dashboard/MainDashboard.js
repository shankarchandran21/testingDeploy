import "./MainDashboard.css";
import React, { Component } from "react";
import DoughnutChart from "../../components/Chart/DoughnutChart";
import DashboardTable from "../../components/Chart/DashboardTable";
import DashboardBanner from "../../components/Chart/DashboardBanner";
import DashboardSection from "../../components/Chart/DashboardSection";
import AuthService from "../../services/api";
import { Spin } from "antd";

//Main Dashboard, from here it is redirected to the listing page and profile page.
class MainDashboard extends Component {
  constructor() {
    super();
    this.state = {
      graphData: {},
      dashboardData: [],
      tableData: [],
      campusData: [],
    };
  }

  //api call
  componentDidMount() {
    this.fetchGraphData();
  }

  fetchGraphData = () => {
    AuthService.requestMethod("/graphDetails")
      .then((response) => {
        if (response && response.data) {
          this.setState({
            graphData: this.getChartData(response.data),
            dashboardData: response.data,
            tableData: response.data.course_details,
          });
        }
      })
      .then((error) => {
        console.log(error);
      });
  };

  getChartData = (response) => {
    let data = {
      maintainAspectRatio: false,
      responsive: false,
      labels: response.labels,
      datasets: [
        {
          data: response.data,
          backgroundColor: [
            "rgba(72,194,220,1)",
            "rgba(90,75,179,1)",
            "rgba(90,75,179,0.4)",
          ],
          hoverBackgroundColor: "#01cab8",
        },
      ],
      options: {
        responsive: true,
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    };
    return data;
  };

  render() {
    const { graphData, dashboardData, tableData } = this.state;
    return (
      <>
        <div className="main-dashboard-container">
          <DashboardSection />
          <div className="second-section">
          <div className="current-month">CURRENT MONTH</div>
          <div className="doughnut-container">
            <DoughnutChart id="content1" data={graphData} />
            <DashboardTable id="content2" data={tableData} />
          </div>
          </div>
         

          <DashboardBanner data={dashboardData} />
        </div>
      </>
    );
  }
}

export default MainDashboard;
