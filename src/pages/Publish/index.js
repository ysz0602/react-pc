import {
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  Input,
  Upload,
  Space,
  Select,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import "./index.scss";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useStore } from "@/store";
import { useState, useRef, useEffect } from "react";
import { http } from "@/utils";
const { Option } = Select;
const Publish = () => {
  const { channelStore } = useStore();
  // 存放上传图片的列表
  const [fileList, setFileList] = useState([]);
  const cacheImgList = useRef([]);
  const onUploadChange = ({ fileList }) => {
    const formatList = fileList.map((file) => {
      if (file.response) {
        return {
          url: file.response.data.url,
        };
      }
      return file;
    });
    setFileList(formatList);
    // 把图片列表存入仓库一份
    cacheImgList.current = formatList;
  };
  // 切换图片模式
  const [imgCount, setImgCount] = useState(1);
  const radioChange = (e) => {
    const rawValue = e.target.value;
    setImgCount(rawValue);

    if (cacheImgList.current.length === 0) {
      return;
    }

    if (rawValue === 1) {
      const img = cacheImgList.current[0];
      setFileList([img]);
    } else if (rawValue === 3) {
      setFileList(cacheImgList.current);
    }
  };
  // 提交表单
  const navigate = useNavigate();
  const onFinish = async (values) => {
    // 数据的二次处理
    const { channel_id, content, title, type } = values;
    const params = {
      channel_id,
      content,
      title,
      type,
      cover: {
        type,
        images: fileList.map((item) => item.url),
      },
    };
    if (id) {
      await http.put(`/mp/articles/${id}?draft=false`, params);
    } else {
      await http.post("/mp/articles?draft=false", params);
    }
    navigate("/article");
    message.success(`${id ? "更新" : "发布"}成功`);
  };

  //编辑功能
  const [params] = useSearchParams();
  const id = params.get("id");
  const form = useRef(null);
  useEffect(() => {
    const loadDetail = async () => {
      const res = await http.get(`/mp/articles/${id}`);
      const data = res.data;
      // 表单数据回填
      form.current.setFieldsValue({ ...data, type: data.cover.type });
      // 调用setFileList方法回填upload
      const formatImgList = data.cover.images.map((url) => ({ url }));
      setFileList(formatImgList);
      // 缓存列表存一分
      cacheImgList.current = formatImgList;
      // 图片type
      setImgCount(data.cover.type);
    };
    id && loadDetail();
  }, [id]);
  return (
    <div className="publish">
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{id ? "编辑" : "发布"}文章</Breadcrumb.Item>
          </Breadcrumb>
        }
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ type: 1, content: "" }}
          onFinish={onFinish}
          ref={form}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: "请输入文章标题" }]}
          >
            <Input placeholder="请输入文章标题" style={{ width: 400 }} />
          </Form.Item>
          <Form.Item
            label="频道"
            name="channel_id"
            rules={[{ required: true, message: "请选择文章频道" }]}
          >
            <Select placeholder="请选择文章频道" style={{ width: 400 }}>
              {channelStore.channelList.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="封面">
            <Form.Item name="type">
              <Radio.Group onChange={radioChange}>
                <Radio value={1}>单图</Radio>
                <Radio value={3}>三图</Radio>
                <Radio value={0}>无图</Radio>
              </Radio.Group>
            </Form.Item>
            {imgCount > 0 && (
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList
                action="http://geek.itheima.net/v1_0/upload"
                fileList={fileList}
                onChange={onUploadChange}
                multiple={imgCount > 1}
                maxCount={imgCount}
              >
                <div style={{ marginTop: 8 }}>
                  <PlusOutlined />
                </div>
              </Upload>
            )}
          </Form.Item>
          {/* 这里的富文本组件 已经被Form.Item控制 */}
          {/* 它的输入内容 会在onFinished回调中收集起来 */}
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: "请输入文章内容" }]}
          >
            <ReactQuill theme="snow" />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 4 }}>
            <Space>
              <Button size="large" type="primary" htmlType="submit">
                {id ? "更新" : "发布"}文章
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default observer(Publish);
