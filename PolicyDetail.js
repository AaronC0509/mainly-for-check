import React, { useState, useEffect } from "react";
import axios from "axios";
import QueryTypeView from "./QueryTypeView";
import AdjustmentView from "./AdjustmentView";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
import paginationFactory from "react-bootstrap-table2-paginator";
import BootstrapTable from "react-bootstrap-table-next";
import Spinner from "react-bootstrap/Spinner";

require("dotenv").config();

const PolicyDetails = () => {
  const initialValue = {
    component_code: "",
    product_name: "",
    contractStatus: "",
    premiumStatus: "",
    inceptionDate: "",
    participatingSumAssured: "",
    policyTerm: "",
    premiumTerm: "",
    premiumAmount: "",
    premiumFrequency: "",
    paidToDate: "",
    ageAtInception: "",
    gender: "",
    smoking_status: "",
    premiumCessDate: "",
  };
  const pagination = paginationFactory({
    page: 2,
    sizePerPage: 5,
    lastPageText: ">>",
    firstPageText: "<<",
    nextPageText: ">",
    prePageText: "<",
    showTotal: true,
    alwaysShowAllBtns: true,
    onPageChange: function (page, sizePerPage) {
      console.log("page", page);
      console.log("sizePerPage", sizePerPage);
    },
    onSizePerPageChange: function (page, sizePerPage) {
      console.log("page", page);
      console.log("sizePerPage", sizePerPage);
    },
  });
  const columns = [
    { dataField: "serialNo", text: "S/N" },
    {
      dataField: "informationQueried",
      text: "Information Queried",
      sort: true,
    },
    { dataField: "valuationDate", text: "Valuation Date", sort: true },
    { dataField: "dateOfQuery", text: "Date of Query", sort: true },
    {
      dataField: "screenCapture",
      text: "ScreenCap Generated",
      sort: true,
    },
  ];

  const defaultSorted = [
    {
      dataField: "id",
      order: "asc",
    },
  ];

  const [jsonData, setJsonData] = useState(initialValue);
  const [intermediateData, setIntermediateData] = useState([]);
  const [queryhistoryData, setQueryhistoryData] = useState([]);
  const [apiErrors, setApiErrors] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [atYear, setAtYear] = useState('');

  const [policyId, setPolicyId] = useState("");
  function getPolicyId(event) {
    setPolicyId("");
    const id = event.target.value;
    setPolicyId(id);
  }

  function clearValues(){
        setJsonData(initialValue);
        setIntermediateData([]);
        setQueryhistoryData([]);
        localStorage.removeItem('queryTypeData');
        localStorage.removeItem('adjustTypeData');
  }

  function filterPolicyNumber(event) {
    event.preventDefault();
    var error = document.getElementById("error");
    error.textContent = "";
    if (document.getElementById("policy_number").value === "") {
      // Changing content and color of content
      error.textContent = "Please enter a policy number";
      error.style.color = "red";
      return;
    } else if (isNaN(document.getElementById("policy_number").value)) {
      // Changing content and color of content
      error.textContent = "Please enter a valid policy number";
      error.style.color = "red";
      return;
    } else if (document.getElementById("policy_number").value.length < 8) {
      // Changing content and color of content
      error.textContent = "Policy Number must be 8 digits";
      error.style.color = "red";
      return;
    } else if (document.getElementById("policy_number").value.length > 8) {
      // Changing content and color of content
      error.textContent = "Policy Number must be 8 digits";
      error.style.color = "red";
      return;
    } else if (apiErrors === "Internal Server Error") {
      // Changing content and color of content
      error.textContent = "No data found!";
      error.style.color = "red";
      return;
    } 
    const baseURL = window["envConfig"]
      ? window["envConfig"].REACT_APP_BASE_URL
      : process.env.REACT_APP_BASE_URL;

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    };

    const dataOne = {
      policyNo: policyId,
    };

    const resApi = new URL('/api/policy-enq', baseURL);
    const qhApi = new URL('/api/get/query-histories', baseURL);

    const res = axios.post(resApi.toString(), dataOne, headers);
    const qh = axios.post(
      qhApi.toString(),
      dataOne,
      headers
    );
    setLoading(true);
    axios
      .all([res,qh])
      .then(
        axios.spread((...responses) => {
          const Data = responses[0].data;
          if (Data.status.statusCode===200 && Data.policyDetails.policyNo === policyId) {
            const component_code = Data.policyDetails.compCode;
            const product_name = Data.policyDetails.productName;
            const contractStatus = Data.policyDetails.contractStatus;

            const premiumStatus = Data.policyDetails.premiumStatus;
            const inceptionDate = Data.policyDetails.inceptionDate;
            const participatingSumAssured =
              Data.policyDetails.participatingSumAssured;
            const policyTerm = Data.policyDetails.policyTerm;
            const premiumTerm = Data.policyDetails.premiumTerm;
            const premiumAmount = Data.policyDetails.premiumAmount;
            const premiumFrequency = Data.policyDetails.premiumFrequency;
            const paidToDate = Data.policyDetails.paidToDate;
            const ageAtInception = Data.policyDetails.ageAtInception;
            let gender = Data.policyDetails.gender;
//            if (gender == "Female") {
//              gender = "F";
//            } else {
//              gender = "M";
//            }
            const smoking_status = Data.policyDetails.smokingStatus;
            const premiumCessDate = Data.policyDetails.premiumCessDate;

            const policyData = {
              component_code,
              product_name,
              contractStatus,
              premiumStatus,
              inceptionDate,
              participatingSumAssured,
              policyTerm,
              premiumTerm,
              premiumAmount,
              premiumFrequency,
              paidToDate,
              ageAtInception,
              gender,
              smoking_status,
              premiumCessDate,
            };
            setJsonData(policyData);
            setQueryhistoryData(responses[1].data.queryHistoryList);
            setIntermediateData([]);
          } else {
            clearValues();
            setApiErrors(Data.status.message);
          }
        })
      )
      .catch(function (error) {
        setApiErrors(error.message);
        clearValues();
      })
      .finally(() => {
        setLoading(false);
      });
  }



  function submitButton(event) {
    event.preventDefault();

    if (typeof Storage !== "undefined") {
      let getInputQuery = localStorage.getItem("queryTypeData");
      const InputQueryTypeData = JSON.parse(getInputQuery);
      let getAdjustment = localStorage.getItem("adjustTypeData");
      const InputAdjustmentData = JSON.parse(getAdjustment);

      const apiBalanceEnq = window["envConfig"]
        ? window["envConfig"].REACT_APP_BASE_URL
        : process.env.REACT_APP_BASE_URL;

      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      };

      const Year = InputQueryTypeData[0].valuation_date;

      const month = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const selectedMonth = new Date(Year);
      let name = month[selectedMonth.getMonth()];

      const current_year = new Date(Year).getFullYear();

      let YearInput = current_year;

      if (name === "January" || name === "February" || name === "March") {
        YearInput = current_year - 2;
      } else {
        YearInput = current_year - 1;
      }

      setLoading(true);

      const policy = {
        policyNo: policyId,
      };
      let participatingSumAssured = jsonData.participatingSumAssured;
      participatingSumAssured = participatingSumAssured.replace(/,/g, "");

      let premiumAmount = jsonData.premiumAmount;
      premiumAmount = premiumAmount.replace(/,/g, "");

      const A_T_Year = YearInput;
      setAtYear(A_T_Year);

      const policyData = {
        policyDetails: {
          policyNo: policyId,
          compCode: jsonData.component_code,
          productName: jsonData.product_name,
          contractStatus: jsonData.contractStatus,
          premiumStatus: jsonData.premiumStatus,
          inceptionDate: jsonData.inceptionDate,
          participatingSumAssured: participatingSumAssured,
          policyTerm: jsonData.policyTerm,
          premiumTerm: jsonData.premiumTerm,
          premiumAmount: premiumAmount,
          premiumFrequency: jsonData.premiumFrequency,
          paidToDate: jsonData.paidToDate,
          ageAtInception: jsonData.ageAtInception,
          gender: jsonData.gender,
          smokingStatus: jsonData.smoking_status,
          premiumCessDate: jsonData.premiumCessDate,
          //A_T_Year: YearInput,
        },
        adjustments: [],
        queries: [],
      };

      const q = [];
      const adjust = [];

      for (let x = 0; x < InputQueryTypeData.length; x++) {
        const query = {
          type: InputQueryTypeData[x].query_type,
          valuationDate: InputQueryTypeData[x].valuation_date,
          amount: InputQueryTypeData[x].amount,
          cbAccumulationOption: InputQueryTypeData[x].cb_accumulation_option,
          aplOption: InputQueryTypeData[x].apl_option,
          year:A_T_Year
        };
        q.push(query);
      }

      if (InputAdjustmentData && InputAdjustmentData.length) {
        for (let y = 0; y < InputAdjustmentData.length; y++) {
          const adjustmentData = {
            adjustmentType: InputAdjustmentData[y].adjustmentType,
            value: InputAdjustmentData[y].value,
          };
          adjust.push(adjustmentData);
        }
      }

      policyData.queries = q;
      policyData.adjustments = adjust;
      // policyData.adjustments = adjust.length > 0 ? adjust : [];

      const resApi = new URL('/api/balance-enq', apiBalanceEnq);
      const qhApi = new URL('/api/get/query-histories', apiBalanceEnq);

      const res = axios.post(
        resApi.toString(),
        policyData,
        headers
      );

      const qh = axios.post(
        qhApi.toString(),
        policy,
        headers
      );

      axios
        .all([res,qh])
        .then(
          axios.spread((...responses) => {
            const currentPaidToDate = responses[0].data.balanceEnqList[0].updatedPaidToDate;
            const [year, month, day] = currentPaidToDate.split('-');
            const newPaidToDate = day + "." + month + "." + year;
            responses[0].data.balanceEnqList[0].fieldPaidToDate = newPaidToDate;
            setIntermediateData(responses[0].data.balanceEnqList);
            console.log("Successfully generated");
            setQueryhistoryData(responses[1].data.queryHistoryList);
            console.table(queryhistoryData);
          })
        )
        .catch(function (error) {
          console.log(error);
        }).finally(() => {
          setLoading(false);
        });
    }
  }

  useEffect(() => {}, [intermediateData]);

  function handleCallback(childData) {
    this.setState({ data: childData });
  }

  function adjustmentHandleCallback(childData) {
    this.setState({ data: childData });
  }

  function saveButton(event) {
    event.preventDefault();

    if (typeof Storage !== "undefined") {
      let getInputQuery = localStorage.getItem("queryTypeData");
      const InputQueryTypeData = JSON.parse(getInputQuery);

      let getAdjustment = localStorage.getItem("adjustTypeData");

      const InputAdjustmentData = JSON.parse(getAdjustment);

      const baseURL = window["envConfig"]
        ? window["envConfig"].REACT_APP_BASE_URL
        : process.env.REACT_APP_BASE_URL;

      const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      };

      const policy = {
        policyNo: policyId,
      };

      const policyDataSave = {
        policyDetails: {
          policyNo: policyId,
          compCode: jsonData.component_code,
          productName: jsonData.product_name,
          contractStatus: jsonData.contractStatus,
          premiumStatus: jsonData.premiumStatus,
          inceptionDate: jsonData.inceptionDate,
          participatingSumAssured: jsonData.participatingSumAssured,
          policyTerm: jsonData.policyTerm,
          premiumTerm: jsonData.premiumTerm,
          premiumAmount: jsonData.premiumAmount,
          premiumFrequency: jsonData.premiumFrequency,
          paidToDate: jsonData.paidToDate,
          ageAtInception: jsonData.ageAtInception,
          gender: jsonData.gender,
          smokingStatus: jsonData.smoking_status,
          premiumCessDate: jsonData.premiumCessDate,
        },
        adjustments: [],
        queries: [],
      };

      setLoading(true);

      const q = [];
      const adjust = [];

      for (let x = 0; x < InputQueryTypeData.length; x++) {
        const query = {
          type: InputQueryTypeData[x].query_type,
          valuationDate: InputQueryTypeData[x].valuation_date,
          amount: InputQueryTypeData[x].amount,
          cbAccumulationOption: InputQueryTypeData[x].cb_accumulation_option,
          aplOption: InputQueryTypeData[x].apl_option,
          year:atYear
        };
        q.push(query);
      }
      if(InputAdjustmentData !== null) {
        for (let y = 0; y < InputAdjustmentData.length; y++) {
          const adjustmentData = {
            adjustmentType: InputAdjustmentData[y].adjustmentType,
            value: InputAdjustmentData[y].value,
          };
          adjust.push(adjustmentData);
        }
      }
      
      policyDataSave.queries = q;
      policyDataSave.adjustments = adjust;
      
      const resTwoApi = new URL('/api/query-details', baseURL);
      const resApi = new URL('/api/get/query-histories', baseURL);

      const res = axios.post(
        resApi.toString(),
        policy,
        headers
      );
      const resTwo = axios.post(
        resTwoApi.toString(),
        policyDataSave,
        headers
      );

      axios
        .all([res, resTwo])
        .then(
          axios.spread((...responses) => {
            const DataTwo = responses[1];
            console.log(DataTwo, "Successfully Saved");
            setQueryhistoryData(responses[0].data.queryHistoryList);
          })
        )
        .catch(function (error) {
          console.log(error);
        }).finally(() => {
          setLoading(false);
        });
    }
  }
  useEffect(() => {}, [queryhistoryData]);

  return (
    <div className="container">
      { isLoading && (
        <div style={{ position: 'fixed', width: "100%", height: "100%", top: "0", left: "0", 
        right: "0", bottom: "0", backgroundColor: "rgb(255 255 255 / 50%)", zIndex: "2", cursor: "pointer" }}>
          <div style={{ width: "50px", margin: "auto", marginTop: "23%" }}>
            <Spinner animation="border" variant="danger"/>
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-6 mrgnbtm">
          <h4>Policy Details</h4>
          <hr></hr>
          <br></br>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Policy Number </label>
            </div>
            <div className="form-group col-md-5">
              <input
                type="text"
                required
                // pattern="\d{8}"
                className="form-control"
                name="policy_number"
                maxLength={8}
                value={policyId}
                onChange={getPolicyId}
                id="policy_number"
              />
              <span id="error" style={{color:"red"}}>{apiErrors}</span>
              
            </div>
            <div className="form-group col-md-2">
              <button
                type="button"
                onClick={filterPolicyNumber}
                className="btn btn-warning"
              >
                Find
              </button>
            </div>

            <div className="form-group col-md-1">
              <i
                className="fa fa-info-circle"
                data-toggle="tooltip"
                title="Enter policy number to extract information"
                aria-hidden="true"
              ></i>
            </div>
          </div>
          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Component Code </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.component_code}
                className="form-control"
                name="contractRiskStatus"
                id="contractRiskStatus"
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Product Name </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.product_name}
                className="form-control"
                name="product_name"
                id="product_name"
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Contract Status </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.contractStatus}
                className="form-control"
                name="contract_status"
                id="contract_status"
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Premium Status </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.premiumStatus}
                className="form-control"
                name="premium_status"
                id="premium_status"
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Inception Date </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.inceptionDate}
                className="form-control"
                name="inceptionDate"
                id="inceptionDate"
                readOnly={true}
              />
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">
                Participating Sum Assured
              </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.participatingSumAssured}
                className="form-control"
                name="participating_sum_assured"
                id="participating_sum_assured"
                readOnly={true}
              />
            </div>
            <div className="form-group col-md-1">
              <i
                className="fa fa-info-circle"
                data-toggle="tooltip"
                title="Basic Sum Assured"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Policy Term</label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.policyTerm}
                className="form-control"
                name="maturityTerm"
                id="maturityTerm"
                readOnly={true}
              />
            </div>
            <div className="form-group col-md-1">
              <i
                className="fa fa-info-circle"
                data-toggle="tooltip"
                title="Number of Years the policy is covered"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Premium Term</label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.premiumTerm}
                className="form-control"
                name="premiumCessationTerm"
                id="premiumCessationTerm"
                readOnly={true}
              />
            </div>
            <div className="form-group col-md-1">
              <i
                className="fa fa-info-circle"
                data-toggle="tooltip"
                title=" Number of Years premiums are to paid"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Premium Amount</label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.premiumAmount}
                className="form-control"
                name="nextBillingAmount"
                id="nextBillingAmount"
                readOnly={true}
              />
            </div>
            <div className="form-group col-md-1">
              <i
                className="fa fa-info-circle"
                data-toggle="tooltip"
                title=" Premium amount at premium frequency"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">Premium Frequency</label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.premiumFrequency}
                className="form-control"
                name="paymentFrequency"
                id="paymentFrequency"
                readOnly={true}
              />
            </div>
            <div className="form-group col-md-1">
              <i
                className="fa fa-info-circle"
                data-toggle="tooltip"
                title="1-Annual,2-Half-Yearly,4-Quarterly,12-Monthly"
                aria-hidden="true"
              ></i>
            </div>
          </div>

          <div className="row">
            <div className="form-group col-md-4">
              <label htmlFor="exampleInputEmail1">
                Paid-to-Date(based on LifeAsia)
              </label>
            </div>
            <div className="form-group col-md-7">
              <input
                type="text"
                value={jsonData.paidToDate}
                className="form-control"
                name="paidToDate"
                id="paidToDate"
                readOnly={true}
              />
            </div>
            <div className="form-group col-md-1">
              <i className="fa fa-info-circle" aria-hidden="true"></i>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="container">
            <div className="row">
              <div className="col-md-12 mrgnbtm">
                <h4>LifeAssuredDetails</h4>
                <hr></hr>
                <br></br>
                <div className="row">
                  <div className="form-group col-md-4">
                    <label htmlFor="exampleInputEmail1">Age at Inception</label>
                  </div>
                  <div className="form-group col-md-7">
                    <input
                      type="text"
                      value={jsonData.ageAtInception}
                      className="form-control"
                      name="age_at_inception"
                      id="age_at_inception"
                      readOnly={true}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-md-4">
                    <label htmlFor="exampleInputEmail1">Gender</label>
                  </div>
                  <div className="form-group col-md-7">
                    <input
                      type="text"
                      value={jsonData.gender}
                      className="form-control"
                      name="gender"
                      id="gender"
                      readOnly={true}
                    />
                  </div>
                  <div className="form-group col-md-1">
                    <i
                      className="fa fa-info-circle"
                      data-toggle="tooltip"
                      title="M-male,F-female"
                      aria-hidden="true"
                    ></i>
                  </div>
                </div>
                <div className="row">
                  <div className="form-group col-md-4">
                    <label htmlFor="exampleInputEmail1">Smoking Status</label>
                  </div>
                  <div className="form-group col-md-7">
                    <input
                      type="text"
                      value={jsonData.smoking_status}
                      className="form-control"
                      name="smoking_status"
                      id="smoking_status"
                      readOnly={true}
                    />
                  </div>
                  <div className="form-group col-md-1">
                    <i
                      className="fa fa-info-circle"
                      data-toggle="tooltip"
                      title="S-smoker,N-non-smoker"
                      aria-hidden="true"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <QueryTypeView parentCallback={handleCallback} />
        </div>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <div className="row">
        <div className="col-md-12">
          <AdjustmentView parentCallback={adjustmentHandleCallback} />
          <button
            type="button"
            className="btn btn-warning"
            onClick={submitButton}
          >
            Generate Information
          </button>
          <br></br>
          <br></br>
          <button
            type="button"
            className="btn btn-warning"
            onClick={saveButton}
          >
            Save Output
          </button>
        </div>

        <div className="col-md-6"></div>
      </div>

      <div className="container">
        <br></br>

        <div className="row">
          <div className="col-md-12 mrgnbtm">
            <h5>INTERMEDIATE DATA</h5>
            <br></br>
          </div>

          {intermediateData.length > 0 &&
            intermediateData.map((data, index) => (
              <>
                <div className="col-md-12 mrgnbtm">
                  <h6>
                    Paid To Date (Based on valuation date input) :{" "}
                    {data.updatedPaidToDate}
                  </h6>
                  <br></br>
                </div>

                <div className="col-md-6 mrgnbtm">
                  {data.reversionaryBonusBalance.balance !== 0 && (
                    <div>
                      <div className="row">
                        <div className="form-group col-md-4">
                          <label htmlFor="exampleInputEmail1">
                            Reversionary Bonus Balance
                          </label>
                        </div>
                        <div className="form-group col-md-7">
                          <input
                            type="text"
                            className="form-control"
                            name="reversionary_bonus_balance"
                            id="reversionary_bonus_balance"
                            value={data.reversionaryBonusBalance.balance}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of RB declared up to last declaration date"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Last Declaration Date
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="last_declaration_date"
                            id="last_declaration_date"
                            value={
                              data.reversionaryBonusBalance.lastDeclarationDate
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Date of last RB declared"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                      <br></br>
                    </div>
                  )}
                  {data.cashbackBalance.principalAmount !== 0 && (
                    <div>
                      <div className="row">
                        <div className="form-group col-md-4">
                          <label htmlFor="exampleInputEmail1">
                            Cashback Balance
                          </label>
                        </div>
                        <div className="form-group col-md-7">
                          <input
                            type="text"
                            className="form-control"
                            name="cashback__balance"
                            id="cashback__balance"
                            value={
                              data.cashbackBalance.cashbackBalance +
                              " " +
                              " Up to " +
                              data.cashbackBalance.upToDate
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of 3 items below"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">Principal</label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="cb_principal"
                            id="cb_principal"
                            value={data.cashbackBalance.principalAmount}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of CB principal (xx xx)"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Interest Up to Last Policy Anniversary
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="cb_interest_up_to_last_policy_anniversary"
                            id="cb_interest_up_to_last_policy_anniversary"
                            value={
                              data.cashbackBalance
                                .interestUpToLastPolicyAnniversary
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Capitalized Ints"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Uncapitalized Interests
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="cb_uncapitalized_interests"
                            id="cb_uncapitalized_interests"
                            value={data.cashbackBalance.uncapitalizedInterest}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Uncapitalized Ints"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Total Withdrawal
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="cb_total_withdrawal"
                            id="cb_total_withdrawal"
                            value={data.cashbackBalance.totalWithdrawal}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of withdrawals"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Last Policy Anniversary
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="last_policy_anniversary"
                            id="last_policy_anniversary"
                            value={data.cashbackBalance.lastPolicyAnniversary}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Date of last capitalization"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-md-6 mrgnbtm">
                  { data.policyLoan.principalAmount !== 0 && (
                    <div>
                      <div className="row">
                        <div className="form-group col-md-4">
                          <label htmlFor="exampleInputEmail1">
                            Policy Loan Balance
                          </label>
                        </div>
                        <div className="form-group col-md-7">
                          <input
                            type="text"
                            className="form-control"
                            name="policy_loan_balance"
                            id="policy_loan_balance"
                            value={
                              data.policyLoan.policyLoanBalance +
                              " " +
                              " Up to " +
                              data.policyLoan.upToDate
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of 3 items below"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>

                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">Principal</label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="principal"
                            id="principal"
                            value={data.policyLoan.principalAmount}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of PL principals(xx xx)"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Interest Up to Last Policy Anniversary
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="interest_up_to_last_policy_anniversary"
                            id="interest_up_to_last_policy_anniversary"
                            value={
                              data.policyLoan.interestUpToLastPolicyAnniversary
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Capitalized Ints"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Uncapitalized Interests
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="uncapitalized_interests"
                            id="uncapitalized_interests"
                            value={data.policyLoan.uncapitalizedInterest}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Uncapitalized Ints"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Total Repayment
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="uncapitalized_interests"
                            id="uncapitalized_interests"
                            value={data.policyLoan.totalRepayment}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Repayment"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Last Policy Anniversary
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="last_policy_anniversary"
                            id="last_policy_anniversary"
                            value={data.policyLoan.lastPolicyAnniversary}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Date of last capitalization"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <br></br>
                    </div>
                  )}
                  {data.aplBalance.principalAmount !== 0 && (
                    <div>
                      <div className="row">
                        <div className="form-group col-md-4">
                          <label htmlFor="exampleInputEmail1">
                            APL Balance
                          </label>
                        </div>
                        <div className="form-group col-md-7">
                          <input
                            type="text"
                            className="form-control"
                            name="apl_balance"
                            id="apl_balance"
                            value={
                              data.aplBalance.aplLoanBalance +
                              " " +
                              " Up to " +
                              data.aplBalance.upToDate
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of 3 items below"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">Principal</label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="apl_principal"
                            id="apl_principal"
                            value={data.aplBalance.principalAmount}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of APL principals(xx xx)"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Interest Up to Last Policy Anniversary
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="interest_up_to_last_policy_anniversary"
                            id="interest_up_to_last_policy_anniversary"
                            value={
                              data.aplBalance.interestUpToLastPolicyAnniversary
                            }
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Capitalized Ints"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Uncapitalized Interests
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="apl_uncapitalized_interests"
                            id="apl_uncapitalized_interests"
                            value={data.aplBalance.uncapitalizedInterest}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Uncapitalized Ints"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Total Repayment
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="apl_total_repayment"
                            id="apl_total_repayment"
                            value={data.aplBalance.totalRepayment}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Sum of Repayment"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                      <div className="row">
                        <div className="form-group col-md-7">
                          <label htmlFor="exampleInputEmail1">
                            Last Policy Anniversary
                          </label>
                        </div>
                        <div className="form-group col-md-4">
                          <input
                            type="text"
                            className="form-control"
                            name="last_policy_anniversary"
                            id="last_policy_anniversary"
                            value={data.aplBalance.lastPolicyAnniversary}
                            readOnly={true}
                          />
                        </div>
                        <div className="form-group col-md-1">
                          <i
                            className="fa fa-info-circle"
                            data-toggle="tooltip"
                            title="Date of last capitalization"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ))}
        </div>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <div className="row">
        <div className="container">
          <br></br>
          <div className="row">
            <div className="col-md-12 mrgnbtm">
              <h5>OUTPUT</h5>
              <br></br>
            </div>
            {intermediateData.length > 0 &&
              intermediateData.map((data, index) => (
                <>
                  <div className="col-md-6 mrgnbtm">
                    {data.queryType === "surrender_value" && (
                      <>
                        <div>
                          <div className="row">
                            <div>
                              <h5>For SV Queries</h5>
                            </div>
                          </div>
                          <br></br>
                          <div className="row">
                            <div className="form-group col-md-4">
                              <label htmlFor="exampleInputEmail1">
                                Projected Surrender Value
                              </label>
                            </div>
                            <div className="form-group col-md-7">
                              <input
                                type="text"
                                className="form-control"
                                name="projected_surrender_value"
                                id="projected_surrender_value"
                                value={data.output.P_Projected_Surrender_Value["="]}
                                readOnly={true}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="form-group col-md-4">
                              <label htmlFor="exampleInputEmail1">
                                SV of Sum Assured
                              </label>
                            </div>
                            <div className="form-group col-md-7">
                              <input
                                type="text"
                                className="form-control"
                                name="sv_of_sum_assured"
                                id="sv_of_sum_assured"
                                value={data.output.P_Surrender_Value_Sum_Insured["="]}
                                // value={data.output.P_Death_Benefit_Sum_Insured['=']}
                                readOnly={true}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="form-group col-md-4">
                              <label htmlFor="exampleInputEmail1">
                                SV of Accum RB
                              </label>
                            </div>
                            <div className="form-group col-md-7">
                              <input
                                type="text"
                                className="form-control"
                                name="sv_of_accum_rb"
                                id="sv_of_accum_rb"
                                value={(parseFloat(data.output.P_Surrender_Value_Reversionary_Bonus["="]) + 
                                parseFloat(data.output.P_Surrender_Value_Interim_Bonus["="])).toFixed(2)}
                                readOnly={true}
                              />
                            </div>
                          </div>
                          <div className="row">
                            <div className="form-group col-md-4">
                              <label htmlFor="exampleInputEmail1">
                                SV of Terminal Bonus
                              </label>
                            </div>
                            <div className="form-group col-md-7">
                              <input
                                type="text"
                                className="form-control"
                                name="sv_of_terminal_bonus"
                                id="sv_of_terminal_bonus"
                                readOnly={true}
                                value={data.output.P_Surrender_Value_Performance_Bonus["="]}
                              />
                            </div>
                          </div>
                          <br></br>
                          <br></br>
                        </div>
                      </>
                    )}
                    {data.queryType === "maturity_value" && (
                      <>
                        <div className="row">
                          <div>
                            <h5>For MV Queries</h5>
                          </div>
                        </div>
                        <br></br>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Maturity Value
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_maturity_value"
                              id="projected_maturity_value"
                              value={data.output.P_Maturity_Value["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Sum Assured
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="sum_assured"
                              id="sum_assured"
                              value={
                                data.output.P_Maturity_Value_Sum_Insured["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Accum RB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_accum_rb"
                              id="projected_accum_rb"
                              value={
                                (parseFloat(data.output.P_Maturity_Value_Reversionary_Bonus["="])+parseFloat(data.output.P_Maturity_Value_Interim_Bonus["="])).toFixed(2)
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected PB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_pb"
                              id="projected_pb"
                              value={
                                data.output.P_Maturity_Value_Performance_Bonus[
                                  "="
                                ]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected MB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_mb"
                              id="projected_mb"
                              value={data.output.P_Maturity_Value_MB["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                      </>
                    )}
                    {data.queryType === "claims" && (
                      <>
                        <div className="row">
                          <div>
                            <h5>For Claims Queries</h5>
                          </div>
                        </div>
                        <br></br>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Total Benefits
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="total_benefits"
                              id="total_benefits"
                              value={data.output.P_Total_Benefit["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Sum Assured
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="sum_assured"
                              id="sum_assured"
                              value={
                                data.output.P_Death_Benefit_Sum_Insured["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Accumulated RB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="accumulated_rb"
                              id="accumulated_rb"
                              value={
                                (parseFloat(data.output.P_Death_Benefit_Reversionary_Bonus["="]) + parseFloat(data.output.P_Death_Benefit_Interim_Bonus["="])).toFixed(2)
                              }
                              readOnly={true}
                            />
                          
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Terminal Bonus
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="terminal_bonus"
                              id="terminal_bonus"
                              value={
                                data.output.P_Death_Benefit_Performance_Bonus["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Surrender Value
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="surrender_value"
                              id="surrender_value"
                              readOnly={true}
                              value={

                              data.output.P_Projected_Surrender_Value["="]

                              }
                            />
                          </div>
                        </div>

                        <br></br>
                        <br></br>
                      </>
                    )}
                    {data.queryType === "partial_withdrawal" && (
                      <>
                        <div className="row">
                          <div>
                            <h5>For Partial Withdrawal Queries</h5>
                          </div>
                        </div>
                        <br></br>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Maturity Value
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_maturity_value"
                              id="projected_maturity_value"
                              value={data.output.P_Maturity_Value["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Sum Assured
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="sum_assured"
                              id="sum_assured"
                              value={
                                data.output.P_Maturity_Value_Sum_Insured["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Accum RB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_accum_rb"
                              id="projected_accum_rb"
                              value={
                                data.output.P_Maturity_Value_Reversionary_Bonus[
                                  "="
                                ]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected PB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_pb"
                              id="projected_pb"
                              value={
                                data.output.P_Maturity_Value_Performance_Bonus[
                                  "="
                                ]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected MB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_mb"
                              id="projected_mb"
                              value={data.output.P_Maturity_Value_MB["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected YTM
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_ytm"
                              id="projected_ytm"
                              value={
                                data.output.P_Running_Yield_To_Maturity["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <br></br>
                        <br></br>
                      </>
                    )}
                    {data.queryType === "reduction_in_sa" && (
                      <>
                        <div className="row">
                          <div>
                            <h5>For Reduced SA Queries</h5>
                          </div>
                        </div>
                        <br></br>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Maturity Value
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_maturity_value"
                              id="projected_maturity_value"
                              value={data.output.P_Maturity_Value["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Sum Assured
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="sum_assured"
                              id="sum_assured"
                              value={
                                data.output.P_Maturity_Value_Sum_Insured["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Accum RB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_accum_rb"
                              id="projected_accum_rb"
                              value={
                                data.output.P_Maturity_Value_Reversionary_Bonus["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected PB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_pb"
                              id="projected_pb"
                              value={
                                data.output.P_Maturity_Value_Performance_Bonus[
                                  "="
                                ]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected MB
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_mb"
                              id="projected_mb"
                              value={data.output.P_Maturity_Value_MB["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected YTM
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_ytm"
                              id="projected_ytm"
                              value={
                                data.output.P_Running_Yield_To_Maturity["="]
                              }
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Surrender Value
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_surrender_value"
                              id="projected_surrender_value"
                              readOnly={true}
                              value={data.output.P_Projected_Surrender_Value["="]}
                            />
                          </div>
                        </div>

                        <br></br>
                        <br></br>
                      </>
                    )}

                    {data.queryType === "annuity_payment" && (
                      <>
                        <div className="row">
                          <div>
                            <h5>For Annuity Queries</h5>
                          </div>
                        </div>
                        <br></br>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Annuity Payment
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_annuity_payment"
                              id="projected_annuity_payment"
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected Surrender Value
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_surrender_value"
                              id="projected_surrender_value"
                              value={data.output.P_Projected_Surrender_Value['=']}
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                      </>
                    )}

                    {data.queryType === "additional" && (
                      <>
                        <div className="row">
                          <div>
                            <h5>Additional Information</h5>
                          </div>
                        </div>
                        <br></br>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Cashback Balance
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="cashback_balance"
                              id="cashback_balance"
                              readOnly={true}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Policy Loan Balance
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="policy_loan_balance"
                              id="policy_loan_balance"
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              APL Balance
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="apl_balance"
                              id="apl_balance"
                              readOnly={true}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="col-md-6 mrgnbtm">
                    {data.queryType === "surrender_value" && (
                      <>
                        <br></br>
                        <br></br>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              As at Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="date"
                              id="date"
                              readOnly={true}
                              value={data.vpmsInput.A_Valuation_Date}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                      </>
                    )}
                    {data.queryType === "maturity_value" && (
                      <>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Projected YTM
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="projected_ytm"
                              id="projected_ytm"
                              value={data.output.P_Yield_To_Maturity["="]}
                              readOnly={true}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                      </>
                    )}
                    {data.queryType === "claims" && (
                      <>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              As at Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="date"
                              id="date"
                              readOnly={true}
                              value={data.vpmsInput.A_Valuation_Date}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              Paid-to-Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="paid_to_date"
                              id="paid_to_date"
                              readOnly={true}
                              value={data.fieldPaidToDate}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                      </>
                    )}

                    {data.queryType === "partial_withdrawal" && (
                      <>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              As at Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="date"
                              id="date"
                              readOnly={true}
                              value={data.vpmsInput.A_Valuation_Date}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                      </>
                    )}
                    {data.queryType === "reduction_in_sa" && (
                      <>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              As at Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="date"
                              id="date"
                              readOnly={true}
                              value={data.vpmsInput.A_Valuation_Date}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                      </>
                    )}

                    {data.queryType === "annuity_payment" && (
                      <>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              As at Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="date"
                              id="date"
                              readOnly={true}
                              value={data.vpmsInput.A_Valuation_Date}
                            />
                          </div>
                        </div>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                        <br></br>
                      </>
                    )}

                    {data.queryType === "additional" && (
                      <>
                        <div className="row">
                          <div className="form-group col-md-4">
                            <label htmlFor="exampleInputEmail1">
                              As at Date
                            </label>
                          </div>
                          <div className="form-group col-md-7">
                            <input
                              type="text"
                              className="form-control"
                              name="date"
                              id="date"
                              readOnly={true}
                              value={data.vpmsInput.A_Valuation_Date}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ))}
          </div>
        </div>
      </div>
      <br></br>
      <br></br>
      <br></br>
      <div className="row">
        <div className="container">
          <br></br>
          <div className="row">
            <div className="col-md-12 mrgnbtm">
              <h5>QUERY HISTORY</h5>
              <br></br>
              <BootstrapTable
                keyField="id"
                data={queryhistoryData}
                columns={columns}
                defaultSorted={defaultSorted}
                pagination={pagination}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetails;
