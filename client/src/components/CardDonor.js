import React, { useState } from "react";
import { useMediaQuery, useTheme, Box, Card, CardContent, Grid, Dialog, DialogTitle, DialogContent, Typography, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import EmailIcon from "@mui/icons-material/Email";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/Twitter";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SM2000 from "../assets/companions/SM2000.svg";
import DefaultCharity from "../assets/companions/Default_charity.svg";
import Carousel from "react-material-ui-carousel";
import "./config/styles.css";

const CardDonor = ({ donors }) => {
  const [open, setOpen] = useState(Array(donors.length).fill(false));
  const [dialogContent, setDialogContent] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickOpen = (index, donorObj) => {
    setDialogContent(donorObj);
    setOpen((prev) => {
      const newOpenDialogs = [...prev];
      newOpenDialogs[index] = true;
      return newOpenDialogs;
    });
  };

  const handleClose = (index) => {
    setOpen((prev) => {
      const newOpenDialogs = [...prev];
      newOpenDialogs[index] = false;
      return newOpenDialogs;
    });
  };

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
            <Grid container spacing={2} alignItems="center" minHeight={"200px"}>
              <Grid item xs={12} md={2}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 120,
                  }}
                >
                  <img src={donor.logo ? donor.logo : DefaultCharity} alt="Donor logo" style={{ maxWidth: "80%" }} />
                </Box>
              </Grid>

              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight="bold">
                  {donor.name ? donor.name : "Đang cập nhật"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {donor.type ? donor.type : "Đang cập nhật"}
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

                {!isMobile && (
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <IconButton color="primary">
                      <FacebookIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <TwitterIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <EmailIcon />
                    </IconButton>
                  </Box>
                )}
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

        <Carousel indicators={true} navButtonsAlwaysInvisible={true} sx={{ height: "fit-content" }}>
          {chunkedDonors.map((chunk, index) => (
            <Grid container spacing={4} justifyContent="center" key={index}>
              {chunk.map((donorObj) => (
                <Grid item xs={12} sm={6} md={6} key={donorObj.donor.id}>
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
                    <Grid item xs={3} md={3} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: 120,
                        }}
                      >
                        <img src={donorObj.donor.logo ? donorObj.donor.logo : DefaultCharity} alt="Donor logo" style={{ maxWidth: "80%" }} />
                      </Box>
                    </Grid>

                    <Grid item xs={9} md={7}>
                      <Typography variant="h6" fontWeight="bold">
                        {donorObj.donor.name ? donorObj.donor.name : "Đang cập nhật"}
                      </Typography>
                      <Typography variant="h6" color="error" fontWeight="bold">
                        {Number(donorObj.donation.amount).toLocaleString()} VNĐ
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Xin chân thành cảm ơn các cá nhân, đơn vị đã chung tay ủng hộ!
                      </Typography>
                    </Grid>

                    <Grid item xs={0} md={2} position="relative">
                      {!isMobile && (
                        <>
                          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              <IconButton color="primary" sx={{ p: "4px" }}>
                                <FacebookIcon />
                              </IconButton>
                              <IconButton color="primary" sx={{ p: "4px" }}>
                                <LinkedInIcon />
                              </IconButton>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                              <IconButton color="primary" sx={{ p: "4px" }}>
                                <TwitterIcon />
                              </IconButton>
                              <IconButton color="primary" sx={{ p: "4px" }}>
                                <EmailIcon />
                              </IconButton>
                            </Box>
                          </Box>
                          <IconButton color="primary" sx={{ p: "4px", position: "absolute", bottom: "0", right: "10px" }} onClick={() => handleClickOpen(index, donorObj)}>
                            <MoreHorizIcon />
                          </IconButton>
                        </>
                      )}

                      <Dialog
                        open={open[index]}
                        onClose={() => handleClose(index)}
                        sx={{
                          "& .MuiDialog-paper": {
                            minWidth: "200px",
                            minHeight: "200px",
                            padding: "16px",
                          },
                        }}
                      >
                        <DialogTitle>
                          <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Thông tin <span style={{ color: "#d32f2f", fontWeight: "bold" }}>nhà tài trợ</span>
                          </Typography>
                        </DialogTitle>
                        <DialogContent>
                          <Typography variant="h6">
                            <strong>Tên:</strong> {dialogContent?.donor?.name}
                          </Typography>
                          <Typography variant="h6">
                            <strong>Kinh phí tài trợ:</strong> {Number(donorObj.donation.amount).toLocaleString()} VNĐ
                          </Typography>
                          {donorObj?.donor?.type && (
                            <Typography variant="h6">
                              <strong>Phân loại:</strong> {donorObj?.donor?.type}
                            </Typography>
                          )}
                          {dialogContent?.donor?.intro && (
                            <Typography variant="h6" sx={{ mt: 1, whiteSpace: "pre-line" }}>
                              <strong>Miêu tả công ty:</strong> {dialogContent?.donor?.intro}
                            </Typography>
                          )}
                        </DialogContent>
                      </Dialog>
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
