import React from "react";
import { useMediaQuery, useTheme, Box, Card, CardContent, Grid, Typography } from "@mui/material";
import DefaultCharity from "../assets/companions/Default_charity.svg";
import Carousel from "react-material-ui-carousel";
import "./config/styles.css";

const CardDonor = ({ donors }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (donors.length === 1) {
    const donor = donors[0].donor;
    const donationAmount = donors[0].donation.amount;

    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thông tin <span style={{ color: "#d32f2f", fontWeight: "bold" }}>nhà tài trợ</span>
        </Typography>

        <Card elevation={3}>
          <CardContent>
            <Grid container spacing={2} justifyContent="center" alignItems="center" minHeight={"200px"}>
              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img src={donor.logo ? donor.logo : DefaultCharity} alt="Donor logo" style={{ maxWidth: isMobile ? "50%" : "80%" }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight="bold">
                  {donor.name ? donor.name : "Đang cập nhật"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {donor.type ? donor.type : ""}
                </Typography>

                {donor.intro ? (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                    {donor.intro}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    Xin chân thành cảm ơn các cá nhân, đơn vị đã chung tay ủng hộ!
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} md={3} textAlign="center">
                <Typography variant="body1" color="text.secondary">
                  Kinh phí tài trợ
                </Typography>
                <Typography variant="h6" color="error" fontWeight="bold">
                  {Number(donationAmount).toLocaleString()} VNĐ
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (donors.length > 1) {
    const itemsPerSlide = 4;
    const chunkedDonors = [];
    for (let i = 0; i < donors.length; i += itemsPerSlide) {
      chunkedDonors.push(donors.slice(i, i + itemsPerSlide));
    }

    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Thông tin <span style={{ color: "#d32f2f", fontWeight: "bold" }}>nhà tài trợ</span>
        </Typography>

        <Carousel indicators={true} navButtonsAlwaysInvisible={true}>
          {chunkedDonors.map((chunk, index) => (
            <Grid container spacing={4} justifyContent="center" key={index}>
              {chunk.map((donorObj) => (
                <Grid item xs={12} md={6} key={donorObj.donor.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      display: "flex",
                      padding: "16px",
                      boxShadow: 1,
                      minHeight: "200px",
                      borderRadius: "12px",
                    }}
                  >
                    <Grid item xs={3} md={3} container spacing={2} justifyContent="center" alignItems="center">
                      <img src={donorObj.donor.logo ? donorObj.donor.logo : DefaultCharity} alt="Donor logo" style={{ maxWidth: "80%" }} />
                    </Grid>

                    <Grid item xs={9} md={9}>
                      <Typography variant="h6" fontWeight="bold">
                        {donorObj.donor.name ? donorObj.donor.name : "Đang cập nhật"}
                      </Typography>
                      {/* <Typography variant="body1" color="text.secondary">
                        {donorObj.donor.type ? donorObj.donor.type : ""}
                      </Typography> */}
                      <Typography variant="h6" color="error" fontWeight="bold">
                        {Number(donorObj.donation.amount).toLocaleString()} VNĐ
                      </Typography>
                      {donorObj.donor.intro ? (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                          {donorObj.donor.intro}
                        </Typography>
                      ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                          Xin chân thành cảm ơn các cá nhân, đơn vị đã chung tay ủng hộ!
                        </Typography>
                      )}
                    </Grid>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ))}
        </Carousel>
      </Box>
    );
  }

  return <></>;
};

export default CardDonor;
