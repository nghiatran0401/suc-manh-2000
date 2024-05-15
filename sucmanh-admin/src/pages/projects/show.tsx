import React from "react";
import {
  IResourceComponentsProps,
  useShow,
  useTranslate,
} from "@refinedev/core";
import { Show, TextField, ImageField } from "@refinedev/antd";
import { Col, Row, Typography } from "antd";
import GaleryUploader from "../../components/galery-uploader";
import LoadingScreen from "../state/loading";
import { categoryOptions, styleOptions } from "../../constants/options";
import Link from "antd/lib/typography/Link";

const { Title } = Typography;

export const ProjectShow: React.FC<IResourceComponentsProps> = () => {
  const translate = useTranslate();
  const { queryResult } = useShow<Sucmanh2000.Project>();
  const { data, isLoading } = queryResult;

  const record = data?.data;
  if (isLoading) return <LoadingScreen />;
  return (
    <Row>

      <Col  span={12} >
        <Show isLoading={isLoading}>
          <Link target="_blank" href={`https://Sucmanh2000-interior.com/du-an/${record?.id}`} >Mở trang</Link>
          <Title level={5}>{translate("projects.fields.id")}</Title>
          <TextField value={record?.id} />
          <Title level={5}>{translate("projects.fields.name")}</Title>
          <TextField value={record?.name} />
          <Title level={5}>{translate("projects.fields.category")}</Title>
          <TextField
            value={
              categoryOptions.find((item) => item.value === record?.category)
                ?.label ?? ""
            }
          />
          <Title level={5}>{translate("projects.fields.style")}</Title>
          <TextField
            value={
              styleOptions.find((item) => item.value === record?.style)
                ?.label ?? ""
            }
          />

          <Title level={5}>{translate("projects.fields.time")}</Title>
          <TextField value={record?.time} />
          <Title level={5}>{translate("projects.fields.description")}</Title>
          <TextField value={record?.description} />
          <Title level={5}>{translate("projects.fields.thumbnailUrl")}</Title>
          <ImageField style={{ maxWidth: 200 }} value={record?.thumbnailUrl} />
          <Title level={5}>{translate("projects.fields.imgUrls")}</Title>
          <GaleryUploader
            collection="projects"
            docId={record?.id ?? ""}
            imgUrls={record?.imgUrls ?? []}
          />
        </Show>
      </Col>
      <Col span={1} ></Col>
      <Col span={11} >
        <iframe
        style={{
          width: '100%',
          height: '100%'
        }}
          src={`https://Sucmanh2000-interior.com/du-an/${record?.id}`}
        ></iframe>
      </Col>
    </Row>
  );
};
