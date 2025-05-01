import "./DoughnutChart.css";

import React, { Component } from "react";
import { Table, Spin } from "antd";
import { capitalizingFirstLetter } from "../../utils/general";

class DashboardTable extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      data: [],
      pagination: {
        current: 1,
        pagesize: 5,
      },
    };
  }

  handleStandardTableChanges = (paginationProps) => {
    let { pagination } = this.state;
    pagination.pagesize = paginationProps.pagesize;
    pagination.current = paginationProps.current;
  };

  handleTitle = () => {
    if (this.props.id === "campus")
      return <div className="table-header">Campus Data</div>;
    else return <div className="table-header">Course Data</div>;
  };

  render() {
    const { pagination } = this.state;
    const { data, id } = this.props;

    //columns
    let columns = [];

    if (data && data.length > 0) {
      columns = Object.keys(data[0]).map((key) => {
        return {
          title: capitalizingFirstLetter(key.replace(/\_[^.]+$/, "")),
          dataIndex: key,
          key: key,
        };
      });
    }

    return (
      <div
        className="dashboard-table-container"
        style={{ marginRight: id === "campus" ? 10 : null }}
      >
        <Table
          title={columns.length > 0 ? null : this.handleTitle}
          showHeader={columns.length > 0 ? null : false}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          columns={columns}
          dataSource={data}
          className="dashboard-table-table"
          scroll={{ x: "max-content", y: 263 }}
          pagination={pagination}
          pagesize={pagination.pagesize}
          onChange={this.handleStandardTableChanges}
        />
      </div>
    );
  }
}
export default DashboardTable;
