import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import key from "./api_auth";
import styled from "styled-components";
const finnhub = require("finnhub");


const ContentContainer = styled.div`
  flex: 1;
  padding: 10px;
  margin-left: 30px;
`;

const ShareDetails = ({ handlePortfolioSubmit}) => {
  const api_auth = finnhub.ApiClient.instance.authentications["api_key"];
  api_auth.apiKey = key;
  const finnhubClient = new finnhub.DefaultApi();

  const [timeFrom, setTimeFrom] = useState(0);
  const [stockDetails, setStockDetails] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [companyProfile, setCompanyProfile] = useState([]);
  const [numberOfShares, setNumberOfShares] = useState(0)

  const { id } = useParams();
  const timeNow = Math.floor(new Date().getTime() / 1000).toFixed(0);

  useEffect(() => {
    finnhubClient.companyProfile2(
      { symbol: id},
      (error, data, response) => {
        console.log(data);
        setCompanyProfile(data);
      }
    );
  }, []);

  const getCandles = (timeFrom) => finnhubClient.stockCandles(
    id,
    "D",
    timeFrom,
    timeNow,
    (error, data, response) => {
      console.log(data)
      setStockDetails(data)
    }
  );

  const handleSelect = (event) => {
    if (event.target.value === "week") {
      getCandles(timeNow-604800)
    }
    if (event.target.value === "month") {
      getCandles(timeNow - 2628000);
    } else if (event.target.value === "3month") {
      getCandles(timeNow - 7884000);
    } else if (event.target.value === "6month") {
      getCandles(timeNow - 15768000);
    } else if (event.target.value === "year") {
      getCandles(timeNow - 31536000);
    }
  };

  const date = new Date("2020-07-22T13:22:10.2566789+00:00");
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleChange = (event) => {
    const numberOfShares = event.target.value
    console.log(numberOfShares)
    setNumberOfShares(numberOfShares)
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    handlePortfolioSubmit({"symbol": id, "name": companyProfile.name, "numberOfShares": numberOfShares})
  }

  return (
    <ContentContainer>
      <p>ShareDetails</p>
      <select onChange={handleSelect}>
        <option value="week">1 Week</option>
        <option value="month">1 Month </option>
        <option value="3month">3 Months</option>
        <option value="6month">6 Months</option>
        <option value="year">1 Year</option>
      </select>
      <hr />
      <div>
        <img src={companyProfile.logo} />
        <h1>{companyProfile.name}</h1>
        <p>{companyProfile.ticker}</p>
        <form onChange={handleChange} onSubmit={handleSubmit}>
          <input type="number" placeholder="Number of Shares" />
          <input type="submit" value="Buy Shares"></input>
        </form>
        <p>IPO: {formattedDate}</p>
        <p>Market Capitalisation: {companyProfile.marketCapitalization}</p>
        <p>Outstanding share: {companyProfile.shareOutstanding}</p>
      </div>
    </ContentContainer>
  );
};

export default ShareDetails;
