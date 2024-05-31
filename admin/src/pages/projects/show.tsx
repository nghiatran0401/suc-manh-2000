import React from "react";
import { IResourceComponentsProps, useShow, useTranslate } from "@refinedev/core";
import { Show, TextField, ImageField, DateField, MarkdownField } from "@refinedev/antd";
import { Col, Row, Typography } from "antd";
import GaleryUploader from "../../components/galery-uploader";
import LoadingScreen from "../components/LoadingScreen";
import { useLocation, useNavigate } from "react-router-dom";

const { Title } = Typography;

export const ProjectShow: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  console.log("pathname", pathname);

  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;
  if (isLoading) return <LoadingScreen />;
  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{translate("projects.fields.slug")}</Title>
      <TextField value={record?.slug} />
      <Title level={5}>{translate("projects.fields.name")}</Title>
      <TextField value={record?.name} />
      <Title level={5}>{translate("projects.fields.description")}</Title>
      <TextField value={record?.description} />
      <Title level={5}>{translate("projects.fields.category")}</Title>
      <TextField value={record?.category} />
      <Title level={5}>{translate("projects.fields.publish_date")}</Title>
      <DateField value={record?.publish_date} />
      <Title level={5}>{translate("projects.fields.donor")}</Title>
      <TextField value={record?.donor?.description} />
      <div>
        {record?.donor?.logos?.map((logo: any, index: any) => (
          <ImageField key={index} value={logo} style={{ maxWidth: 50 }} />
        ))}
      </div>
      <Title level={5}>{translate("projects.fields.progress")}</Title>
      <div>
        {record?.progress.map((progress: any, index: any) => (
          <div key={index}>
            <Title level={5}>{progress.title}</Title>
            <TextField value={progress.description} />
            <Row gutter={16}>
              {progress.images.map((img: any, i: any) => (
                <Col key={i} span={8}>
                  <ImageField value={img} />
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </div>
      <Title level={5}>{translate("projects.fields.thumbnailUrl")}</Title>
      <ImageField style={{ maxWidth: 200 }} value={"https://placehold.co/200x200/yellow/blue"} />
      <Title level={5}>{translate("projects.fields.body")}</Title>
      <div>
        {record?.body?.tabs?.map((tab: any, index: any) => (
          <div key={index}>
            <Title level={5}>{tab.name}</Title>
            <MarkdownField value={tab.content.description} />
            <br />
            <MarkdownField value={tab.content.htmlContent} />
            <br />
            <MarkdownField value={tab.content.embeded_url} />
          </div>
        ))}
      </div>
    </Show>
  );
};
