import "./ImportData.css";
import React, { Component } from "react";
import { Card, Spin, Button, Tag, Table, Alert } from "antd";
import { withRouter } from "react-router-dom";
import { UploadOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import Papa from 'papaparse'
import AuthService from "../../services/api";
import { StepBackwardOutlined } from "@ant-design/icons";

class ImportData extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();

        //state initialization
        this.state = {
            data: [],
            pagination: {
                current: 1,
                pagesize: 5,
            },
            filedata: [],
            fileheaders: '',
            columns: [],
            showpreview: false,
            filename: '',
            warning: '',
            pageData : this.props.pageData,
        };
    }
    handleStandardTableChanges = (paginationProps) => {
        let { pagination } = this.state;
        pagination.pagesize = paginationProps.pagesize;
        pagination.current = paginationProps.current;
    };
    handleOnFileLoad = (data) => {
        const files = data.target.files;
        this.removemessage();
        if (files) {
            Papa.parse(files[0], {
                header: true,
                dynamicTyping: true,
                comments: "#",
                transformHeader: header => header.toLowerCase().replace(/\W/g, "_"),
                complete: (results) => {
                    this.setState({
                        filedata: results.data,
                        fileheaders: results.meta.fields,
                        filename: files[0].name
                    });
                    if (results.data.length === 0) {
                        this.setState({
                            warning : {message: 'No Data',type:'warning'}
                        });
                    }
                }
            }
            )
        }
    }

    handleRemoveFile = () => {
        this.setState({ showpreview: false, filedata: [], fileheaders: [], filename: '' });
        this.removemessage();
    }
    preview() {
        if (this.state.fileheaders) {
            const col = [];
            this.state.fileheaders.forEach((dat, index) => {
                col.push({
                    key: index,
                    title: dat,
                    dataIndex: dat,
                })
            })
            this.setState({ columns: col, showpreview: true });
        }
    }
    removemessage(){
        this.setState({
            warning: ''
        })
    }

  handleBackButtonClick = () => {
    window.history.back();
   };
    upload() {
        console.log(this.state.filedata);
            if (document.getElementById("csv-upload-spin") !== null)
          document.getElementById("csv-upload-spin").style.display = "block";
          document.getElementById("submit-signature").setAttribute("disabled","disabled");
          this.removemessage();
        if(this.state.filedata.length > 0){
        AuthService.requestWithPost(this.state.pageData.endpoint,this.state.filedata)
          .then((response) => {
            if (document.getElementById("csv-upload-spin") !== null)
              document.getElementById("csv-upload-spin").style.display = "none";
            document.getElementById("submit-signature").removeAttribute("disabled");

            if (response && response.data) {
              //removing unwanted keys from api
              if (response.data.success === 1){
                this.setState({
                    warning : {message: 'Upload Success',type:'success'}
                })
              }
            }
          })
          .catch((error) => {
            if (document.getElementById("csv-upload-spin") !== null){
                document.getElementById("csv-upload-spin").style.display = "none";
                document.getElementById("submit-signature").removeAttribute("disabled");
            }
            this.setState({
                warning : {message: 'Upload Failed',type:'error'}
            })
            console.log(error);
          });
        }
    }
    render() {
        const { pagination, filedata, columns, filename, showpreview, warning,pageData } = this.state;
        return (
            <>
                <div className="signature-container">
                    <Card className="settings-header">{pageData.title}</Card>
                    <div className="settings-vertical" />
                    <div className="sign-conatiner">
                    <Button size={"medium"} id="back-button" className="back-button-import"
                                onClick={this.handleBackButtonClick}
                                style={{ backgroundColor: "#ff8c59", color: "#fff" }}
                            >
                                <StepBackwardOutlined />
                                Back
                            </Button>
                        <div className="signature-sub-container">
                            <span className="signature-header">{pageData.subhead}</span>

                            <div className="settings-radio-container">
                                <div>

                                    <div
                                        style={{ marginTop: 10, textAlign: "start", width: 500 }}
                                    >
                                        <Tag>
                                            Accepted Filetype: CSV
                                        </Tag>
                                        <Tag style={{ float:'right', backgroundColor:'#4ecab8',color:'white',borderColor:'transparent'}}>
                                        <a href={pageData.sampleLink} download><span style={{color:'white'}}>Download Sample File</span></a>
                                        </Tag>
                                        <div
                                            className="upload-signature"
                                            style={{ marginBottom: 10 }}
                                        >
                                            {filedata && filedata[0] ? (
                                                <Button disabled >
                                                    <label htmlFor="upload"><input
                                                        type="file" id="upload1"
                                                        accept=".csv" hidden
                                                        onChange={this.handleOnFileLoad} /><UploadOutlined />&nbsp;Choose File</label>
                                                </Button>
                                            ) : (
                                                <label htmlFor="upload" className="csv-upload-button"><input
                                                    type="file" id="upload"
                                                    accept=".csv" hidden
                                                    onClick={(event) => {
                                                        event.target.value = null
                                                    }}
                                                    onChange={this.handleOnFileLoad} /><UploadOutlined />&nbsp;Choose File</label>
                                            )}

                                            {filedata && filedata[0] ? (
                                                <div className="csv-upload-preview">
                                                    <FileOutlined style={{ fontSize: '26px', color: '#08c' }} />
                                                    <span style={{ paddingLeft: '30px' }}>{filename}</span>
                                                    <DeleteOutlined style={{ marginLeft: 'auto', color: 'rgba(0, 0, 0, 0.45)' }} onClick={this.handleRemoveFile} />
                                                </div>
                                            ) : null}
                                        </div>
                                        {warning && warning.message ? (<Alert isAlertVisible={warning.message} showIcon type={warning.type} message={warning.message} closable></Alert>) : null}
                                    </div>

                                    <div
                                        style={{
                                            borderTop: "1px solid #d3d3d3",
                                            marginTop: 20,
                                        }}
                                    >
                                        <Button
                                            className="submit-preview"
                                            onClick={this.preview.bind(this)}
                                            disabled={filedata.length > 0 ? false : true}
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            className="submit-signature"
                                            id="submit-signature"
                                            onClick={this.upload.bind(this)}
                                            disabled={filedata.length > 0 ? false : true}
                                        >
                                            Upload
                                        </Button>

                                    </div>
                                    <div
                                        id="csv-upload-spin"
                                        style={{ display: "none", position: "relative" }}><Spin style={{ marginTop: '1rem' }} size="large" /></div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
                <div className="settings-container">
                    {showpreview ?
                        <Table rowClassName={(record, index) =>
                            index % 2 === 0 ? "table-row-light" : "table-row-dark"
                        }
                            scroll={{ x: 'max-content' }}
                            columns={columns}
                            dataSource={filedata}
                            pagination={pagination}
                            rowKey = 'id'
                            pagesize={pagination.pagesize}
                            onChange={this.handleStandardTableChanges} />
                        : null}
                </div>
            </>
        )
    }
}
export default withRouter(inject("dataStore")(observer(ImportData)));
