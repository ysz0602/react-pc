import img404 from "@/assets/error.png";
import "./index.scss";
import { Link, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import {
  Card,
  Breadcrumb,
  Form,
  Button,
  Radio,
  DatePicker,
  Select,
  Table,
  Space,
  Tag,
} from "antd";
import "moment/locale/zh-cn";
import locale from "antd/es/date-picker/locale/zh_CN";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useEffect } from "react";
import { http } from "@/utils";
import { useStore } from '@/store';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Article = () => {
  const { channelStore } = useStore()
  // 频道列表管理
  // const [channelList, setChannelList] = useState([]);
  // const loadChannelList = async () => {
  //   const res = await http.get("/channels");
  //   setChannelList(res.data.channels);
  // };
  // useEffect(() => {
  //   loadChannelList();
  // }, []);
  // 文章列表管理
  const [articleData, setArticleData] = useState({
    list: [],
    count: 0,
  });
  // 文章参数管理
  const [params, setParams] = useState({
    page: 1,
    per_page: 10,
  });
  useEffect(() => {
    const loadList = async () => {
      const res = await http.get("/mp/articles", { params });
      const { results, total_count } = res.data;
      setArticleData({
        list: results,
        count: total_count,
      });
    };
    loadList();
  }, [params]);

  const onFinish = (values) => {
    console.log(values);
    const { channel_id, date, status } = values;
    // 数据处理
    const _params = {};
    if (status !== -1) {
      _params.status = status;
    }
    if (channel_id) {
      _params.channel_id = channel_id;
    }
    if (date) {
      _params.begin_pubdate = date[0].format("YYYY-MM-DD");
      _params.end_pubdate = date[1].format("YYYY-MM-DD");
    }
    setParams({
      ...params,
      ..._params,
    });
  };

  const formatStatus = (type) => {
    const TYPES = {
      1: <Tag color="red">审核失败</Tag>,
      2: <Tag color="green">审核成功</Tag>,
    };
    return TYPES[type];
  };

  const pageChange = (page, pageSize) => {
    setParams({
      ...params,
      page,
      per_page: pageSize,
    });
  };

  // 删除
  const delArticle = async (data) => {
    console.log(data);
    await http.delete(`/mp/articles/${data.id}`);
    // 刷新列表
    setParams({
      ...params,
      page: 1,
    });
  };

  // 编辑
  const navigate = useNavigate();
  const goPublish = (data) => {
    navigate(`/publish?id=${data.id}`);
  };
  
  const columns = [
    {
      title: "封面",
      dataIndex: "cover",
      width: 120,
      render: (cover) => {
        return (
          <img src={cover.images[0] || img404} width={80} height={60} alt="" />
        );
      },
    },
    {
      title: "标题",
      dataIndex: "title",
      width: 220,
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (data) => formatStatus(data),
    },
    {
      title: "发布时间",
      dataIndex: "pubdate",
    },
    {
      title: "阅读数",
      dataIndex: "read_count",
    },
    {
      title: "评论数",
      dataIndex: "comment_count",
    },
    {
      title: "点赞数",
      dataIndex: "like_count",
    },
    {
      title: "操作",
      render: (data) => {
        return (
          <Space size="middle">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => goPublish(data)}
            />
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => delArticle(data)}
            />
          </Space>
        );
      },
      fixed: "right",
    },
  ];
  return (
    <div>
      <Card
        title={
          <Breadcrumb separator=">">
            <Breadcrumb.Item>
              <Link to="/">首页</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>内容管理</Breadcrumb.Item>
          </Breadcrumb>
        }
        style={{ marginBottom: 20 }}
      >
        <Form onFinish={onFinish} initialValues={{ status: -1 }}>
          <Form.Item label="状态" name="status">
            <Radio.Group>
              <Radio value={-1}>全部</Radio>
              <Radio value={0}>草稿</Radio>
              <Radio value={1}>待审核</Radio>
              <Radio value={2}>审核通过</Radio>
              <Radio value={3}>审核失败</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="频道" name="channel_id">
            <Select placeholder="请选择文章频道" style={{ width: 120 }}>
              {channelStore.channelList.map((channel) => (
                <Option key={channel.id} value={channel.id}>
                  {channel.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="日期" name="date">
            <RangePicker locale={locale}></RangePicker>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 80 }}>
              筛选
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Card title={`根据筛选条件共查询到 ${articleData.count} 条结果：`}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={articleData.list}
          pagination={{
            pageSize: params.per_page,
            total: articleData.count,
            onChange: pageChange,
          }}
        />
      </Card>
    </div>
  );
};

export default observer(Article);
