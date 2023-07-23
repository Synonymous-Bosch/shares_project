import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import key from "./api_auth";
import styled from "styled-components";
import { Chart } from "react-google-charts";
const finnhub = require("finnhub");

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  margin-top: 90px;
`;

const TopRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50%;

  p {
    background-color: black;
    height: 35px;
    border-radius: 40px;
    justify-content: center;
    align-items: center;
    display: flex;
    color: white;
    width: 400px;
  }

  h1 {
    font-size: 25px;
    margin-top: 0%;
    margin-bottom: 0%;
  }

  h4 {
    margin-top: 0%;
    font-size: 20px;
  }
`;

const Logo = styled.div`
  margin-bottom: 40px;
`;

const RowContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.input`
  width: 130px;
  border-radius: 50px;
  text-align: center;
  margin-right: 10px;
  border-width: 2px;
  transition: all 0.5s;

  &:hover {
    transform: scale(1.1);
  }
`;

const Button = styled.input`
  border-radius: 50px;
  border-style: none;
  background-color: #000;
  color: white;
  transition: all 0.5s;

  &:hover {
    transform: scale(1.2);
  }
`;

const CompanyLogo = styled.img`
  width: 100px;
`;

const ChartDiv = styled.div`
  width: 50%;
  text-align: center;

  select {
    margin-top: 20px;
    border-style: none;
    border-radius: 50px;
    border-width: 2px;
    width: 300px;
    text-align: center;
    background-color: black;
    color: white;
    font-stretch: expanded;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.5s;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

const Popup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const PopupContent = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  width: 600px;
  text-align: center;
  border-radius: 80px;
`;

const PopupMessage = styled.p`
  font-size: 18px;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background-color: #000;
  border-radius: 30px;
  color: #fff;
  border: none;
  padding: 8px 16px;
  font-family: "Proxima Nova", Arial, Helvetica, sans-serif;
  cursor: pointer;
  transition: all 0.5s;

  &:hover {
    background-color: grey;
    transform: scale(1.2);
    color: black;
    font-weight: bold;
  }
`;

const TextItems = styled.div `
  margin-top: 40px;
`

const ShareDetails = ({ handlePortfolioSubmit }) => {
  const api_auth = finnhub.ApiClient.instance.authentications["api_key"];
  api_auth.apiKey = key;
  const finnhubClient = new finnhub.DefaultApi();

  const [timeFrom, setTimeFrom] = useState(0);
  const [stockDetails, setStockDetails] = useState({});
  const [symbol, setSymbol] = useState("");
  const [companyProfile, setCompanyProfile] = useState([]);
  const [numberOfShares, setNumberOfShares] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const { id } = useParams();
  const timeNow = Math.floor(new Date().getTime() / 1000).toFixed(0);

  useEffect(() => {
    getCandles(timeNow - 604800);
  }, []);

  useEffect(() => {
    finnhubClient.companyProfile2({ symbol: id }, (error, data, response) => {
      console.log(data);
      setCompanyProfile(data);
    });
  }, []);

  const getCandles = (timeFrom) =>
    finnhubClient.stockCandles(
      id,
      "D",
      timeFrom,
      timeNow,
      (error, data, response) => {
        console.log(data);
        const days = data.t;
        const daysFormatted = days.map((day) => {
          const dayFormatted = new Date(day * 1000);
          return dayFormatted.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
        });
        const highs = data.h;
        const lows = data.l;
        let chartTemp = daysFormatted.map((x, index) => [
          x,
          highs[index],
          lows[index],
        ]);
        chartTemp.unshift(["Date", "High", "Low"]);
        console.log(chartTemp);
        setChartData(chartTemp);
      }
    );

  const handleSelect = (event) => {
    if (event.target.value === "week") {
      getCandles(timeNow - 604800);
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

  useEffect(() => {
    if (stockDetails.length > 0) {
      let chartTemp = stockDetails.t.map((x, index) => [
        x,
        stockDetails.h[index],
      ]);
      console.log(chartTemp);
    }
  }, [stockDetails]);

  const date = new Date(companyProfile.ipo);
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleChange = (event) => {
    const numberOfShares = event.target.value;
    console.log(numberOfShares);
    setNumberOfShares(numberOfShares);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowPopup(true);

    handlePortfolioSubmit({
      symbol: id,
      name: companyProfile.name,
      numberOfShares: numberOfShares,
    });
  };

  const options = { hAxis: { ticks: [30, 60, 90, 120, 150] } };

  const handleClosePopup = () => {
    setShowPopup(false);
    window.location.replace("http://localhost:3000/portfolio");
  };

  return (
    <ContentContainer>
      <TopRowContainer>
        <h1>{companyProfile.name}</h1>
        <h4>({companyProfile.ticker})</h4>
        <Logo>
          <CompanyLogo src={companyProfile.logo} alt="Company Logo" />
        </Logo>
        <RowContainer>
          <form onChange={handleChange} onSubmit={handleSubmit}>
            <Label type="number" placeholder="No. of Shares" />
            <Button type="submit" value="Buy" />
          </form>
        </RowContainer>
        <TextItems>
          <p>IPO: {formattedDate}</p>
          <p>Market Capitalisation: {companyProfile.marketCapitalization}</p>
          <p>Outstanding share: {companyProfile.shareOutstanding}</p>
        </TextItems>
      </TopRowContainer>

      <ChartDiv>
        <select onChange={handleSelect} defaultValue="week">
          <option value="week">1 Week</option>
          <option value="month">1 Month</option>
          <option value="3month">3 Months</option>
          <option value="6month">6 Months</option>
          <option value="year">1 Year</option>
        </select>
        {chartData.length > 0 ? (
          <Chart
            chartType="LineChart"
            width="100%"
            height="400px"
            options={options}
            data={chartData}
          />
        ) : null}
      </ChartDiv>
      {showPopup && (
        <Popup>
          <PopupContent>
            <PopupMessage>
              Congratulations, you have successfully bought {numberOfShares}{" "}
               shares from {companyProfile.name}
            </PopupMessage>
            <CloseButton onClick={handleClosePopup}>Close</CloseButton>
          </PopupContent>
        </Popup>
      )}
    </ContentContainer>
  );
};

export default ShareDetails;
