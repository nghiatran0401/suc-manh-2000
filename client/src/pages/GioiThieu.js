import React from "react";
import { Box, Typography } from "@mui/material";
import HeaderBar from "../components/Header";
import CarouselMembers from "../components/CarouselMembers";
import Companion from "../components/Companion";
import Footer from "../components/Footer";

export default function GioiThieu() {
  return (
    <Box>
      <HeaderBar />

      <Box maxWidth={"1080px"} m={"auto"} display={"flex"} flexDirection={"column"} gap={"32px"}>
        <Box display={"flex"} flexDirection={"column"} gap={"8px"} m={"24px"}>
          <Typography variant="h6" fontWeight={"bold"}>
            Về “Sức mạnh 2000” – About The Power of VND 2000
          </Typography>

          <Typography variant="body1">
            “Sức mạnh 2000 – Tiền lẻ mỗi ngày Triệu người chung tay Xây nghìn trường mới” phát động ngày 27/02/2020 là chương trình gây quỹ thuộc Dự Án “Ánh sáng núi rừng – Mỗi năm một ngôi trường cho trẻ vùng cao” ra
            đời năm 2009 và nhận được sự bảo trợ của Trung tâm tình nguyện Quốc gia.
            <br />
            <br />
            Xuất phát từ ý tưởng tích tiểu thành đại, chương trình mang trên mình sứ mệnh xoá toàn bộ trường tạm tại Việt Nam, xây hàng trăm cây cầu & hàng chục nghìn nhà nhân ái. Niềm tin của chúng tôi là nếu mỗi người
            tham gia tặng 2,000 VNĐ/ mỗi ngày/ mỗi năm thì với 100 nghìn người tham gia sẽ có 292 điểm trường được khởi công xây dựng.
            <br />
            <br />
            Với 2 triệu người tham gia, sứ mệnh chương trình sẽ được hoàn thành. 2,000 VNĐ nhỏ bé lại có thể tạo ra thay đổi lớn lao đến vậy! Tính tới tháng 3/2020, dự án “Ánh sáng núi rừng” đã xây dựng thành công 35
            điểm trường tại tỉnh Điện Biên và Lai Châu, xuất hiện trên Cà phê sáng VTV3, Việc tử tế VTV1, Thời sự 19h, Forbes Vietnam và nhiều chương trình, ấn phẩm khác.
            <br />
            <br />
            Tham gia chung tay cùng Sức mạnh 2000 (bất kể mệnh giá) tại:
            <br /> <strong>Website:</strong> http://sucmanh2000.com/
            <br /> <strong>Hotline:</strong> Hoàng Hoa Trung 0975302307
            <br /> <strong>Email:</strong> Sucmanh2000.doingoai@gmail.com
            <br />
            <br />
            Tiến độ chương trình và danh sách người tham gia được cập nhật hàng ngày và hiển thị công khai trên website.
          </Typography>
          <Typography variant="h6">-----</Typography>
          <Typography variant="body1">
            “The Power of VND 2000 – A little change every day, A million participants, A thousand new schools” launched on February 27, 2020 is a fundraising program under the project “Light of the mountains – A new
            school for children in the mountainous/ remote areas per year” which was created in 2009 and guarded by the Vietnam National Volunteer Center.
            <br />
            <br />
            Inspired by the idea of “Many a little makes a mickle”, the program aims to replace all temporary dilapidated schools in Vietnam by new solid schools, build hundreds of bridges & thousands of happy houses.
            Our belief is that if each participant donates VND 2,000/ year and 100,000 participants join the program, 292 new schools will be built.
            <br />
            <br />
            With 2 million participants, the mission will be completed. A small VND 2,000 can make such a big change! (VND 2,000 is only less than one tenth of a US $) By March 2020, we have successfully built 35 schools
            in Dien Bien and Lai Chau provinces, appeared on several National Television News (VTV3 Morning Coffee, VTV1 Viec Tu Te, 7pm News, Forbes Vietnam) and many other programs and publications.
            <br />
            <br />
            Donate to The Power of VND 2000 (regardless of value) at:
            <br /> <strong>Website:</strong> http://sucmanh2000.com/
            <br /> <strong>Hotline:</strong> Hoang Hoa Trung +84 975302307
            <br /> <strong>Email:</strong> Sucmanh2000.doingoai@gmail.com
            <br />
            <br />
            Program schedule and participant list are updated daily and displayed publicly on the website.
          </Typography>
          <br />
          <Typography variant="h6" fontWeight={"bold"}>
            Giải thưởng và Ấn phẩm
          </Typography>
          <ol>
            <li>Việc tử tế 11/04/2020</li>
            <li>Thời sự 19h 12/04/2020</li>
            <li>Bản tin Thế hệ số 28/04/2020</li>
          </ol>
        </Box>
      </Box>

      <CarouselMembers />
      <Companion />
      <Footer />
    </Box>
  );
}
