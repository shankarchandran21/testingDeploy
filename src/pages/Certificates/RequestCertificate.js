import "./RequestCertificate.css"
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { StepBackwardOutlined } from "@ant-design/icons";
import { autorun } from "mobx";
import { Card, Table, message, Spin, Form, Input, Button, Space, Select, DatePicker,Alert } from "antd";
import { FormInstance } from 'antd/es/form';
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
    certificateTypeDropDown,
    certificateStatus,
} from "../../utils/constants";
import AuthService from "../../services/api";
const { Option } = Select;

class RequestCertificate extends Component {
    formRef = React.createRef();
    unitForm = React.createRef();
    constructor(props) {
        super(props);
        this.state = {
            dateFormat: props.dataStore.settings.dateFormat,
            courseDetailsDropDown: [],
            campusDetailsDropDown: [],
            studentDetailsDropDown: [],
            warning: '',
            prop_student_id : props.match.params.id ? parseInt(props.match.params.id):null,
            default_student:'',
        }
    }
    componentDidMount() {
        this.fetchbasicData();
    }
    formatCourse = (list) => {
        return list.map(({ course_name: label, id: value, ...rest }) => ({
            label,
            value,
            ...rest,
        }));
    }
    formatStudent = (list) => {
        return list.map(({ student_name: label, id: value, ...rest }) => ({
            label,
            value,
            ...rest,
        }));
    }
    formatCampus = (list) => {
        return list.map(({ campus_name: label, id: value, ...rest }) => ({
            label,
            value,
            ...rest,
        }));
    }
    onChange = name => value => {
        const fields = this.formRef.current.getFieldsValue();
        if (value && value.target) {
            value = value.target.value
        }
        const setString = { [name]: value };
        this.formRef.current.setFieldsValue(setString);
    }
    onUnitChange = (from, row, dateString, key) => {
        let units = this.unitForm.current.getFieldsValue().units.filter(item => item);
        const current = units[row] ? units[row] : {};
        console.log('current',current);
        if(current){
            Object.assign(current, { unit_start_date: key });
        }
        units[row] = current;
        this.unitForm.current.setFieldsValue({ units: units });
        console.log('cccc',this.unitForm.current.getFieldsValue().units)
    }
    datePickerChange = (from, date, dateString) => {
        const setString = { credential_date: dateString }
        this.formRef.current.setFieldsValue(setString);
    };

    fetchbasicData = () => {
        if (document.getElementById("requested-list-spin") !== null)
            document.getElementById("requested-list-spin").style.display = "block";
        AuthService.requestMethod("/requisitionerCourseDetails")
            .then((response) => {
                if (response && response.data) {
                    const data = response.data;
                    this.setState({
                        courseDetailsDropDown: this.formatCourse(data.course_details),
                        studentDetailsDropDown: this.formatStudent(data.student_details),
                        campusDetailsDropDown: this.formatCampus(data.campus_details),
                    });
                    if(this.state.prop_student_id){
                        const aa = this.state.studentDetailsDropDown.filter(obj => {
                            return obj.value === this.state.prop_student_id
                          })
                        this.setState({
                            default_student : aa[0]
                        })
                    }
                    if (document.getElementById("requested-list-spin") !== null)
                        document.getElementById("requested-list-spin").style.display = "none";
                }

            })
            .catch((error) => {
                if (document.getElementById("requested-list-spin") !== null)
                    document.getElementById("requested-list-spin").style.display = "none";
                console.log(error);
            });

    };

    onFinish = fieldsValue => {
        this.formRef.current.submit();
        this.formRef.current
            .validateFields()
            .then((res) => {
                const userData = res;
                userData['units'] = fieldsValue.units;
                console.log('submit the form', userData);
                this.submitFormData(userData);
            })
            .catch((err) => {
                console.log('err', err);
            });
    };
    handleBackButtonClick = () => {
        window.history.back();
       };
    submitFormData(data) {
        console.log('final submitting data',data)
        if (document.getElementById("requested-list-spin") !== null)
            document.getElementById("requested-list-spin").style.display = "block";
        document.getElementById("submit-data").setAttribute("disabled", "disabled");
        this.removemessage();
        message.destroy();
        if (data) {
            AuthService.requestWithPost('/saveCertificate', data)
                .then((response) => {
                    if (document.getElementById("requested-list-spin") !== null)
                        document.getElementById("requested-list-spin").style.display = "none";
                    document.getElementById("submit-data").removeAttribute("disabled");

                    if (response && response.data) {
                        //removing unwanted keys from api
                        if (response.data.certificate && response.data.certificate.success === 1) {
                            this.setState({
                                warning: {
                                    ...this.state.warning,
                                    message: response.data.certificate.message,
                                    type: 'success'
                              }
                            })
                            message.success(response.data.certificate.message);
                        }
                    }
                })
                .catch((error) => {
                    if (document.getElementById("requested-list-spin") !== null) {
                        document.getElementById("requested-list-spin").style.display = "none";
                        document.getElementById("submit-data").removeAttribute("disabled");
                    }
                    this.setState({
                        warning: {
                            ...this.state.warning,
                            message: 'Upload Failed',
                            type: 'error'
                      }
                    })
                    message.error('Upload Failed');
                    console.log(error);
                });
        }
    }
    removemessage(){
        this.setState({
            warning: ''
        })
    }
      updateStudentselected(student){
        console.log('selected student',student)
        const aa = this.state.studentDetailsDropDown.filter(obj => {
            return obj.value === student
          })
        this.setState({
            default_student : aa[0]
        })
      }
    render() {
        const { courseDetailsDropDown, campusDetailsDropDown, studentDetailsDropDown, dateFormat,warning,default_student } = this.state;
        return (
            <>
                <div className="requested-list-container">
                    <div
                        id="requested-list-spin"
                        style={{ display: "none", position: "relative" }}
                    >
                        <Spin className="spin-user" size="large" />
                    </div>
                    <Card className="requested-list-header">
                        Request Certificate
                    </Card>
                    <div className="requested-list-vertical" />
                    <div style={{ paddingBottom: '4rem' }}>
                        <Form
                            className={`dashboard-search-container`}
                            autoComplete="false"
                            ref={this.formRef} style={{ 'height': 'unset' }}
                            fields={[
                                {
                                  name: ["student_name"],
                                  value: default_student.value,
                                },
                              ]}
                        >
                            <Form.Item
                                name="student_name"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter student name",
                                    },
                                ]}
                            >
                                <div className={`dashboard-search course`}>
                                    <span className={`dashboard-text course`}>Student Name</span>
                                   
                                    <Select
                                        showSearch
                                        // style={{ width: 250 }}
                                        placeholder="Student Name"
                                        optionFilterProp="children"
                                        onChange={this.onChange('student_name')}
                                        value= {default_student.value}
                                        onSelect={this.updateStudentselected.bind(this)}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {studentDetailsDropDown
                                            ? studentDetailsDropDown.map((course) => (
                                                <Option
                                                    value={course.value}
                                                    key={course.value}
                                                    style={{
                                                        color: course.index % 2 === 0 ? "grey" : "black",
                                                    }}
                                                >
                                                    {course.label}
                                                </Option>
                                            ))
                                            : null}
                                    </Select>
                                </div>
                            </Form.Item>
                            <Form.Item
                                name="course"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select course",
                                    },
                                ]}
                            >
                                <div className={`dashboard-search course`}>
                                    <span className={`dashboard-text course`}>Course</span>
                                    <Select
                                        showSearch
                                        placeholder="Select Course"
                                        optionFilterProp="children"
                                        onChange={this.onChange('course')}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {courseDetailsDropDown
                                            ? courseDetailsDropDown.map((course) => (
                                                <Option
                                                    value={course.value}
                                                    key={course.value}
                                                    style={{
                                                        color: course.index % 2 === 0 ? "grey" : "black",
                                                    }}
                                                >
                                                    {course.label}
                                                </Option>
                                            ))
                                            : null}
                                    </Select>
                                </div>
                            </Form.Item>
                            <Form.Item
                                name="campus"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select campus",
                                    },
                                ]}
                            >
                                <div className={`dashboard-search course`}>
                                    <span className={`dashboard-text course`}>Campus</span>
                                    <Select
                                        showSearch
                                        placeholder="Select Campus"
                                        optionFilterProp="children"
                                        onChange={this.onChange('campus')}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {campusDetailsDropDown
                                            ? campusDetailsDropDown.map((course) => (
                                                <Option
                                                    value={course.value}
                                                    key={course.value}
                                                    style={{
                                                        color: course.index % 2 === 0 ? "grey" : "black",
                                                    }}
                                                >
                                                    {course.label}
                                                </Option>
                                            ))
                                            : null}
                                    </Select>
                                </div>
                            </Form.Item>
                            <Form.Item
                                name="certification_type"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select certification type",
                                    },
                                ]}
                            >
                                <div className={`dashboard-search course`}>
                                    <span className={`dashboard-text course`}>Certificate Type</span>
                                    <Select
                                        showSearch
                                        placeholder="Select Certificate Type"
                                        optionFilterProp="children"
                                        onChange={this.onChange('certification_type')}
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                    >
                                        {certificateTypeDropDown
                                            ? certificateTypeDropDown.map((course) => (
                                                <Option
                                                    value={course.value}
                                                    key={course.value}
                                                    style={{
                                                        color: course.index % 2 === 0 ? "grey" : "black",
                                                    }}
                                                >
                                                    {course.label}
                                                </Option>
                                            ))
                                            : null}
                                    </Select>
                                </div>
                            </Form.Item>
                            <Form.Item
                                name="credential_date"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select credential date",
                                    },
                                ]}
                            >
                                <div className={`dashboard-search name`}>
                                    <span className={`dashboard-text name`}>Credential Date</span>
                                     <DatePicker
                                            format={dateFormat ? dateFormat.toUpperCase() : null}
                                            className={`dashboard-rangepicker`}
                                            onChange={this.datePickerChange.bind(this, false)}
                                        />
                                </div>
                            </Form.Item>
                            <Form.Item
                                name="credential_number"
                                validateTrigger={['onChange', 'onBlur']}
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select credential number",
                                    },
                                ]}
                            >
                                <div className={`dashboard-search name`}>
                                    <span className={`dashboard-text name`}>Credential Number</span>
                                    <Input
                                        className={`dashboard-input name`}
                                        placeholder="Credential Number"
                                        onChange={this.onChange('credential_number')}
                                    />
                                </div>
                            </Form.Item>
                        </Form>

                        <Form className="multi-forms" onFinish={this.onFinish} autoComplete="off" ref={this.unitForm}
                            initialValues={{ units: [""] }}>
                            <Form.List name="units">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                                            <>
                                                <div className={`dashboard-search-container dashboard-search-container-multiform`} style={{ height: 'unset', padding: '15px 0px 0px 0px', margin: '6px 30px 5px 30px' }}>
                                                <Form.Item
                                                        {...restField}
                                                        name={[name, 'unit_start_date']}
                                                        fieldKey={[fieldKey, 'unit_start_date']}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                    >
                                                        <span className={`dashboard-search course dashboard-search-multiform`}>
                                                            <span className={`dashboard-text course`}>Unit Date</span>
                                                            <DatePicker
                                                                format={dateFormat ? dateFormat.toUpperCase() : null}
                                                                className={`dashboard-rangepicker dashboard-rangepicker-multiform`}
                                                                onChange={this.onUnitChange.bind(this, false, name)}
                                                                htmlFor="unit_start_date"
                                                            // onChange={this.onUnitChange('credential_date')}
                                                            />
                                                        </span>
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'unit_code']}
                                                        fieldKey={[fieldKey, 'unit_code']}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                    >
                                                        <div className={`dashboard-search course dashboard-search-multiform`}>
                                                            <span className={`dashboard-text course`}>Unit Code</span>
                                                            <Input className={`dashboard-input name dashboard-input-multiform`} placeholder="Unit Code" />
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'unit_name']}
                                                        fieldKey={[fieldKey, 'unit_name']}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                    >
                                                        <div className={`dashboard-search course dashboard-search-multiform`}>
                                                            <span className={`dashboard-text course`}>Unit Name</span>
                                                            <Input className={`dashboard-input name`} placeholder="Unit Name" />
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'mark']}
                                                        fieldKey={[fieldKey, 'mark']}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                    >
                                                        <div className={`dashboard-search course dashboard-search-multiform`}>
                                                            <span className={`dashboard-text course`}>Mark</span>
                                                            <Input className={`dashboard-input name dashboard-input-multiform`} placeholder="Mark" />
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'outcome_result']}
                                                        fieldKey={[fieldKey, 'outcome_result']}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                    >
                                                        <div className={`dashboard-search course dashboard-search-multiform`}>
                                                            <span className={`dashboard-text course`}>Outcome Result</span>
                                                            <Input className={`dashboard-input name dashboard-input-multiform`} placeholder="Outcome Result" />
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'outcome_grade_short_code']}
                                                        fieldKey={[fieldKey, 'outcome_grade_short_code']}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[{ required: true, message: 'This field is required' }]}
                                                    >
                                                        <div className={`dashboard-search course dashboard-search-multiform`}>
                                                            <span className={`dashboard-text course`}>Grade </span>
                                                            <Input
                                                                className={`dashboard-input name dashboard-input-multiform`}
                                                                placeholder="Outcome Grade Short code"
                                                                htmlFor='outcome_grade_short_code'
                                                            />
                                                        </div>
                                                    </Form.Item>
                                                    <Form.Item className="remove-button">
                                                    <div style={{ width: '100%' }}>
                                                    {(fields.length > 1 && key !==0) ? (
                                                        <Button type="dashed" style={{ width: 'auto' }} onClick={() => remove(name)} block icon={<MinusCircleOutlined />}>
                                                            Remove Unit
                                                        </Button>
                                                    ) : null}
                                                </div>
                                                    </Form.Item>
                                                </div>
                                                
                                            </>
                                        ))}
                                        <div className="wrapper" style={{ paddingTop: '1.5rem' }}>
                                            <Button type="dashed" className="add-unit-btn" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Unit
                                            </Button>
                                            <Button type="primary" className="unit-submit-btn" htmlType="submit" id="submit-data">
                                                Submit
                                            </Button>
                                            <Button size={"medium"} id="back-button" className="add-unit-btn"
                                                onClick={this.handleBackButtonClick}
                                                style={{ backgroundColor: "#ff8c59", color: "#fff" }}
                                            >
                                                <StepBackwardOutlined />
                                                Back
                                            </Button>
                                        </div>
                                        {/* <div className="errordiv">
                                        {warning && warning.message ? (<Alert isAlertVisible={warning.message} showIcon type={warning.type} message={warning.message} closable></Alert>) : null}
                                        </div> */}
                                    </>
                                )}
                            </Form.List>
                        </Form>
                    </div>
                </div>
            </>
        )
    }
}
export default withRouter(inject("dataStore")(observer(RequestCertificate)));
