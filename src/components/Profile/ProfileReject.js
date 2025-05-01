import "./Profile.css";
import { PROFILE_URL } from "../../config";
import React, { Component } from "react";
import { Modal, Input, message, Spin, Radio } from "antd";
import { inject, observer } from "mobx-react";
import AuthService from "../../services/api";
import { setCertificateSignDetails,
  certificateStorageDetails
 } from "../../utils/general";

const { TextArea } = Input;
let certificateDetails;
class ProfileReject extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      comment: "",
      approveComment:"",
      userId: null,
      from: "",
      body: null,
      isButtonClicked: false,
      feesDue: null,
      showFeePopUp : false,
      fileName: "file.pdf",
      enrolment_detail_id:"",
    };
  }
  componentDidMount(){
    this.fetchFeeSettings();  
    const { isFromLocalStorage } = this.props.dataStore.header;
    certificateDetails = certificateStorageDetails(isFromLocalStorage);
    let id = "";
   if (certificateDetails && certificateDetails.certificate_id) {
      id = certificateDetails.certificate_id;
    }
    this.fetchStudentDetails(id);
  }
  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(
    modalVisiblity,
    isFromOkClick,
    userId,
    from,
    body,
    fileName, download=false
  ) {
    const { isButtonClicked } = this.state;
    const { isFromLocalStorage } = this.props.dataStore.header;
    const { handleClick, handleSignNavigation, handleIssueNavigation } =
      this.props;
    // if checkbox is selected , so when clicked ok then api should be called
    if (isFromOkClick) {
      if (isButtonClicked) return;
      this.setState({
        isButtonClicked: true,
      });

      if (this.state.from === "requested-list-reject") {
        message.destroy();
        let body = {};
        if (!this.state.comment) {
          message.error("Please add comment");
          this.setState({
            isButtonClicked: false,
          });
          return;
        }

        body._method = "PUT";
        body.rejection_comment = this.state.comment;

        this.handleCommentSection("/requestedCertificateReject/", body);
        this.setState({
          isModalVisible: modalVisiblity,
        });
      } else if (this.state.from === "requested-list-approve") {
        const { userId, feesDue } = this.state;
        message.destroy();

        if (this.state.showFeePopUp &&(feesDue === null || feesDue === undefined)) {
          message.error("Please select an option");
          this.setState({
            isButtonClicked: false,
          });
          return;
        }

        if (!this.state.approveComment) {
          message.error("Please add comment");
          this.setState({
            isButtonClicked: false,
          });
          return;
        }

        

        let body = {};
        body.certificate_id = userId;
        body.fee_due = feesDue;
        body.approve_comment = this.state.approveComment;
        AuthService.requestWithPost(`/requestedCertificateApprove`, body)
          .then((response) => {
            if (response && response.data) {
              if (response.data.success === 0 && response.data.message) {
                message.error(response.data.message);
              } else {
                //display the success message and go back to the certificate request listing page.
                message.success(response.data.message);
                setCertificateSignDetails(
                  isFromLocalStorage,
                  this.state.userId
                );
                handleClick();
              }
              this.setState({
                isButtonClicked: false,
              });
            }
          })
          .catch((error) => {
            // if (document.getElementById("profile-spin") !== null)
            //   document.getElementById("profile-spin").style.display = "none";
            console.log(error);
            this.setState({
              isButtonClicked: false,
            });
          });
      } else if (this.state.from === "to-be-signed-list") {
        handleSignNavigation();
        this.setState({
          isModalVisible: modalVisiblity,
          body: body,
          isButtonClicked: false,
        });
      } else if (this.state.from === "issue-certificate") {
        AuthService.requestMethod(`/certificate-issue/${this.state.userId}`)
          .then((response) => {
            if (!response && !response.data) return;
            if (response.data.success === 1 && response.data.message) {
              message.success(response.data.message);
              setCertificateSignDetails(isFromLocalStorage, this.state.userId);
              handleIssueNavigation();
            } else {
              message.error(response.data.message);
              handleIssueNavigation();
            }
            this.setState({
              isButtonClicked: false,
            });
          })
          .catch((error) => {
            console.log(error);
            this.setState({
              isButtonClicked: false,
            });
          });
      } else if (this.state.from === "/printCertificate") {
        this.handlePrintAndReprintApi(
          "/printCertificate",
          this.state.body,
          modalVisiblity,
          this.state.fileName
        );
      } else if (this.state.from === "/printCertificate_list") {
        this.handlePrintAndReprintApi(
          "/printCertificate",
          this.state.body,
          modalVisiblity,
          this.state.fileName
        );
        // this.setState({
        //   isModalVisible: modalVisiblity,
        // });
      } else if (this.state.from === "/reprintCertificate") {
        this.handlePrintAndReprintApi(
          "/reprintCertificate",
          this.state.body,
          modalVisiblity,
          this.state.fileName
        );
        // window.history.back();
      } else if (this.state.from === "/reprintCertificate_list") {
        this.handlePrintAndReprintApi(
          "/reprintCertificate",
          this.state.body,
          modalVisiblity,
          this.state.fileName
        );
        // this.setState({
        //   isModalVisible: modalVisiblity,
        // });
      } else if (this.state.from === "/reprintCertificateRequest") {
        message.destroy();
        let body = {};
        if (!this.state.comment) {
          message.error("Please add comment");
          this.setState({
            isButtonClicked: false,
          });
          return;
        }
        body.reprint_comment = this.state.comment;
        body.student_certificate_id = this.state.userId;

        this.handleReprintRequestApi("/reprintCertificateRequest", body);
      } else if (this.state.from === "/reprintCertificateAccept") {
        this.handleReprintRequestApi(
          "/reprintCertificateAccept",
          this.state.body
        );
      }
    } else {
      this.setState({
        isModalVisible: modalVisiblity,
        comment: "",
        userId: userId,
        from: from,
        body: body,
        feesDue: null,
        approveComment:"",
        fileName:fileName,
        download :download
      });
    }
  }

  handleCommentSection = (endpoint, body) => {
    const { isFromLocalStorage } = this.props.dataStore.header;
    AuthService.requestMethodForPut(`${endpoint}${this.state.userId}`, body)
      .then((response) => {
        if (response && response.data) {
          //display the success message and go back to the certificate request listing page.
          if (response.data.status === "success" && response.data.message) {
            message.success(response.data.message);
            this.setState({
              comment: "",
            });

            setCertificateSignDetails(isFromLocalStorage, this.state.userId);

            this.props.handleClick();
          } else {
            message.error(response.data.message);
          }
          this.setState({
            isButtonClicked: false,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        this.setState({
          isButtonClicked: false,
        });
      });
  };

  fetchFeeSettings = () => {
    AuthService.requestMethod("/configFeePaidConfirmation")
      .then((response) => {
        if (response && response.data) {
          this.setState({
            showFeePopUp: response.data == 'Yes'?true:false
          });
        }
      })
  };
  fetchStudentDetails = (id) => {   
    AuthService.requestMethod(`/getEnrolmentDetailId/${id}`)
      .then((response) => {        
        if(response.data.certificate_data)
        this.setState({
          enrolment_detail_id: response.data.certificate_data.enrolment_detail_id,
        });
      })
      .catch((error) => {
        console.log(this.state.enrolment_detail_id);
      });
      console.log('www');
  };
  handleReprintRequestApi = (endPoint, body) => {
    const { handleClick } = this.props;

    AuthService.requestWithPost(endPoint, body)
      .then((response) => {
        if (document.getElementById("profile-spin-popup") !== null)
          document.getElementById("profile-spin-popup").style.display = "none";

        if (response && response.data) {
          if (response.data.success === 0 && response.data.message) {
            message.error(response.data.message);
          } else {
            //display the success message and go back to the certificate request listing page.
            message.success(response.data.message);
            if (handleClick) handleClick();
          }
        }
        this.setState({
          isButtonClicked: false,
        });
      })
      .then((error) => {
        if (document.getElementById("profile-spin-popup") !== null)
          document.getElementById("profile-spin-popup").style.display = "none";
        console.log(error);
        this.setState({
          isButtonClicked: false,
        });
      });
  };

  handlePrintAndReprintApi = (endPoint, body, modalVisiblity, fileName) => {
    if (document.getElementById("profile-spin-popup") !== null)
      document.getElementById("profile-spin-popup").style.display = "block";
    const { handleClick } = this.props;
    AuthService.requestForDownload(endPoint, body)
      .then((response) => {
        this.setState({
          isButtonClicked: false,
          isModalVisible: modalVisiblity,
        });

        if (response && response.data) {
          if (document.getElementById("profile-spin-popup") !== null)
            document.getElementById("profile-spin-popup").style.display =
              "none";

          const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    //       //Open the URL on new Window
          if (this.state.from == '/reprintCertificate_list' || this.state.from == '/printCertificate_list' || 
              (this.state.from == '/reprintCertificate' && !this.state.download) || (this.state.from == '/printCertificate' && !this.state.download)) {
            // const pdfWindow = window.open(url);
            // pdfWindow.print();
            var iframe = document.createElement('iframe');
            iframe.style.display = "none";
            iframe.src = url;
            iframe.id="myFrame";
            document.body.appendChild(iframe);
            var objFra = document.getElementById('myFrame');
            objFra.contentWindow.focus();
            objFra.contentWindow.print();
          } else {
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute('target', '_blank');
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
          }
          if (handleClick) handleClick();
        }
      })
      .catch((error) => {
        this.setState({
          isButtonClicked: false,
        });
        if (document.getElementById("profile-spin-popup") !== null)
          document.getElementById("profile-spin-popup").style.display = "none";
        console.log(error);
      });
  };

  handleInputChange = (event) => {
    this.setState({
      comment: event.target.value,
    });
  };

  handleApproveInputChange = (event) => {
    this.setState({
      approveComment: event.target.value,
    });
  };

  handleOnChange = (e) => {
    this.setState({
      feesDue: e.target.value,
    });
  };

  contentForRequestedList = () => {
    const { feesDue } = this.state;
    const assessmentReportsPath = `${PROFILE_URL}academic/students/assessment_reports_redirect/${this.state.enrolment_detail_id}`;
    return (
      <div className="fees-due-radio-group-container">
        <div>
      <p className="click-to-view">Click the link to view assessment report: <a target="_blank" href={assessmentReportsPath}> Assessment Reports</a></p> 
    </div>
        <div>
        Course fee paid in full?
        </div>
        <Radio.Group
          className="fees-due-radio-group"
          onChange={this.handleOnChange}
          value={feesDue}
        >
          <Radio value={0}>Paid</Radio>
          <Radio value={1}>Not Paid</Radio>
        </Radio.Group>
       
        <div className="mt-10">
        <div>Comments</div>
            <TextArea rows={4} onChange={this.handleApproveInputChange} />
            </div>
      </div>
    );
  };

  findContent = (content) => {
    const { body,showFeePopUp } = this.state;

    switch (content) {
      case "requested-list-approve":
        return showFeePopUp ? this.contentForRequestedList() :'Do you want to approve the certificate?';
      case "to-be-signed-list":
        let content = body
          ? "Do you want to sign the certificate?"
          : "Please save your Signature";
        return content;
      case "issue-certificate":
        return "Do you want to issue the certificate?";
      case "/printCertificate":
        return "Do you want to print the certificate?";
      case "/printCertificate_list":
        return "Do you want to print the certificate?";
      case "/reprintCertificate":
        return "Do you want to reprint the certificate?";
      case "/reprintCertificate_list":
        return "Do you want to reprint the certificate?";
      case "/reprintCertificateRequest":
        return "Do you want to request for reprinting the certificate?";
      case "/reprintCertificateAccept":
        return "Do you want to approve the reprint request?";
    }
  };

  findText = (content) => {
    switch (content) {
      case "requested-list-approve":
        return "Certificate Approval";
      case "requested-list-reject":
        return "Certificate Rejection";
      case "to-be-signed-list":
        return "Certificate Sign";
      case "issue-certificate":
        return "Issue Certificate";
      case "/printCertificate":
        return "Print Certificate";
      case "/printCertificate_list":
        return "Print Certificate";
      case "/reprintCertificate":
        return "Reprint Certificate";
      case "/reprintCertificate_list":
        return "Reprint Certificate";
      case "/reprintCertificateRequest":
        return "Reprint Certificate Request";
      case "/reprintCertificateAccept":
        return "Reprint Request Approval";
    }
  };

  render() {
    const { isModalVisible, from } = this.state;
    return (
      <Modal
        className="assign-roles-modal"
        title={this.findText(from)}
        centered
        visible={isModalVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div
          id="profile-spin-popup"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>

        {from === "requested-list-reject" ||
        from === "/reprintCertificateRequest" ? (
          <>
            {" "}
            <div>Reason</div>
            <TextArea rows={4} onChange={this.handleInputChange} />
          </>
        ) : (
          <>{this.findContent(from)}</>
        )}
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(ProfileReject));
