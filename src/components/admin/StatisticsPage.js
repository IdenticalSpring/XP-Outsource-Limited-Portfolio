"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, message, Form, Modal, DatePicker, InputNumber, Tabs, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styles from "./StatisticsManagement.module.css";
import DataTable from "./Datatable";
import FormModal from "./FormModal";
import {
  fetchStatistics,
  fetchStatisticsByRange,
  fetchStatisticsById,
  createStatistics,
  updateStatistics,
  deleteStatistics,
  logoutAdmin,
} from "@/src/lib/api";

const { TabPane } = Tabs;

export default function StatisticsManagement() {
  // State và hooks - giữ nguyên
  const locale = useLocale();
  const t = useTranslations("StatisticsManagement");
  const router = useRouter();
  const [statisticsForm] = Form.useForm();
  const [statistics, setStatistics] = useState([]);
  const [allStatistics, setAllStatistics] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [yearlyStats, setYearlyStats] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStatistics, setEditingStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [activeTab, setActiveTab] = useState("daily");
  const [dailyPagination, setDailyPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [monthlyPagination, setMonthlyPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [yearlyPagination, setYearlyPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Các helper functions - giữ nguyên
  const handleUnauthorized = useCallback(() => {
    logoutAdmin();
    message.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    router.push(`/${locale}/admin/login`);
  }, [locale, router]);

  const groupByMonth = useCallback((data) => {
    const monthlyData = {};
    data.forEach((stat) => {
      const monthKey = dayjs(stat.date).format("YYYY-MM");
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, totalAccess: 0 };
      }
      monthlyData[monthKey].totalAccess += stat.totalAccessDate || 0;
    });
    return Object.values(monthlyData);
  }, []);

  const groupByYear = useCallback((data) => {
    const yearlyData = {};
    data.forEach((stat) => {
      const yearKey = dayjs(stat.date).format("YYYY");
      if (!yearlyData[yearKey]) {
        yearlyData[yearKey] = { year: yearKey, totalAccess: 0 };
      }
      yearlyData[yearKey].totalAccess += stat.totalAccessDate || 0;
    });
    return Object.values(yearlyData);
  }, []);

  // Thêm hàm log để debug phân trang
  useEffect(() => {
    console.log("Current pagination:", {
      daily: dailyPagination,
      monthly: monthlyPagination,
      yearly: yearlyPagination
    });
  }, [dailyPagination, monthlyPagination, yearlyPagination]);

  // Sửa hàm loadStatistics để cải thiện xử lý phân trang
  const loadStatistics = useCallback(
    async (page = 1, pageSize = 10, start = null, end = null) => {
      setLoading(true);
      try {
        console.log("Calling loadStatistics with:", { page, pageSize, start, end });
        
        let result;
        if (start && end) {
          setIsFiltered(true);
          const data = await fetchStatisticsByRange(locale, start, end);
          console.log("Filter response:", data);
          
          if (!Array.isArray(data)) {
            throw new Error("Dữ liệu trả về không phải mảng");
          }

          setAllStatistics(data);
          const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);
          setStatistics(paginatedData);
          setDailyPagination({
            current: page,
            pageSize,
            total: data.length,
          });

          const monthlyData = groupByMonth(data);
          const yearlyData = groupByYear(data);
          setMonthlyStats(monthlyData.slice(0, monthlyPagination.pageSize));
          setYearlyStats(yearlyData.slice(0, yearlyPagination.pageSize));
          setMonthlyPagination((prev) => ({ ...prev, current: 1, total: monthlyData.length }));
          setYearlyPagination((prev) => ({ ...prev, current: 1, total: yearlyData.length }));
        } else {
          setIsFiltered(false);
          result = await fetchStatistics(locale, page, pageSize);
          console.log("API response:", result);
          
          if (!result || !Array.isArray(result.data)) {
            throw new Error("Định dạng phản hồi không hợp lệ");
          }

          setStatistics(result.data);
          setAllStatistics(result.data);
          
          // Cập nhật pagination từ API response
          setDailyPagination({
            current: parseInt(result.page) || page,
            pageSize: parseInt(result.limit) || pageSize,
            total: parseInt(result.total) || 0,
          });

          const monthlyData = groupByMonth(result.data);
          const yearlyData = groupByYear(result.data);
          setMonthlyStats(monthlyData.slice(0, monthlyPagination.pageSize));
          setYearlyStats(yearlyData.slice(0, yearlyPagination.pageSize));
          setMonthlyPagination((prev) => ({ ...prev, current: 1, total: monthlyData.length }));
          setYearlyPagination((prev) => ({ ...prev, current: 1, total: yearlyData.length }));
        }
      } catch (error) {
        console.error("Lỗi khi tải thống kê:", error);
        message.error(`Không thể tải danh sách thống kê: ${error.message}`);
        if (error.message.includes("401")) {
          handleUnauthorized();
        }
      } finally {
        setLoading(false);
      }
    },
    [locale, monthlyPagination.pageSize, yearlyPagination.pageSize, groupByMonth, groupByYear, handleUnauthorized]
  );

  // Các hàm callback - giữ nguyên
  useEffect(() => {
    loadStatistics(1, 10);
  }, [loadStatistics]);

  const handleFilterByDateRange = useCallback(() => {
    if (!startDate || !endDate) {
      message.error("Vui lòng chọn khoảng thời gian để lọc");
      return;
    }
    const start = dayjs(startDate).format("YYYY-MM-DD");
    const end = dayjs(endDate).format("YYYY-MM-DD");
    loadStatistics(1, dailyPagination.pageSize, start, end);
  }, [startDate, endDate, dailyPagination.pageSize, loadStatistics]);

  const handleClearFilter = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setIsFiltered(false);
    loadStatistics(1, dailyPagination.pageSize);
  }, [dailyPagination.pageSize, loadStatistics]);

  const handleAddStatistics = useCallback(() => {
    setEditingStatistics(null);
    statisticsForm.resetFields();
    setIsModalVisible(true);
  }, [statisticsForm]);

  const handleEditStatistics = useCallback(
    async (record) => {
      try {
        const statistics = await fetchStatisticsById(locale, record.id);
        setEditingStatistics(statistics);
        statisticsForm.setFieldsValue({
          date: dayjs(statistics.date),
          totalAccessDate: statistics.totalAccessDate,
        });
        setIsModalVisible(true);
      } catch (error) {
        message.error("Không thể tải dữ liệu thống kê để chỉnh sửa");
      }
    },
    [locale, statisticsForm]
  );

  const handleDeleteStatistics = useCallback(
    (id) => {
      Modal.confirm({
        title: "Xác nhận xóa",
        content: "Bạn có chắc chắn muốn xóa bản ghi thống kê này?",
        onOk: async () => {
          try {
            await deleteStatistics(locale, id);
            const updatedStats = allStatistics.filter((stat) => stat.id !== id);
            setAllStatistics(updatedStats);
            setStatistics(updatedStats.slice(
              (dailyPagination.current - 1) * dailyPagination.pageSize, 
              dailyPagination.current * dailyPagination.pageSize
            ));
            setMonthlyStats(groupByMonth(updatedStats));
            setYearlyStats(groupByYear(updatedStats));
            setDailyPagination((prev) => ({
              ...prev,
              total: prev.total - 1,
            }));
            if (!isFiltered) {
              loadStatistics(dailyPagination.current, dailyPagination.pageSize);
            }
            message.success("Xóa thống kê thành công");
          } catch (error) {
            console.error("Error deleting statistics:", error);
            message.error(`Không thể xóa thống kê: ${error.message}`);
            if (error.message.includes("401")) {
              handleUnauthorized();
            }
          }
        },
      });
    },
    [locale, allStatistics, dailyPagination, isFiltered, groupByMonth, groupByYear, loadStatistics, handleUnauthorized]
  );

  const handleModalOk = useCallback(
    async () => {
      try {
        const values = await statisticsForm.validateFields();
        setLoading(true);

        const statisticsData = {
          date: values.date.format("YYYY-MM-DD"),
          totalAccessDate: values.totalAccessDate,
        };

        let updatedStats;
        if (editingStatistics) {
          const updatedStatistics = await updateStatistics(locale, editingStatistics.id, statisticsData);
          updatedStats = allStatistics.map((stat) =>
            stat.id === editingStatistics.id ? updatedStatistics : stat
          );
          message.success("Cập nhật thống kê thành công");
        } else {
          const newStatistics = await createStatistics(locale, statisticsData);
          updatedStats = [...allStatistics, newStatistics];
          setDailyPagination((prev) => ({
            ...prev,
            total: prev.total + 1,
          }));
          message.success("Thêm thống kê thành công");
        }

        setAllStatistics(updatedStats);
        setStatistics(updatedStats.slice(
          (dailyPagination.current - 1) * dailyPagination.pageSize, 
          dailyPagination.current * dailyPagination.pageSize
        ));
        setMonthlyStats(groupByMonth(updatedStats));
        setYearlyStats(groupByYear(updatedStats));
        
        if (!isFiltered) {
          loadStatistics(dailyPagination.current, dailyPagination.pageSize);
        }
        
        setIsModalVisible(false);
        statisticsForm.resetFields();
      } catch (error) {
        console.error("Error saving statistics:", error);
        message.error(`Lưu thống kê thất bại: ${error.message}`);
        if (error.message.includes("401")) {
          handleUnauthorized();
        }
      } finally {
        setLoading(false);
      }
    },
    [locale, editingStatistics, allStatistics, dailyPagination, isFiltered, statisticsForm, groupByMonth, groupByYear, loadStatistics, handleUnauthorized]
  );

  // Sửa hàm xử lý phân trang
  const handleDailyTableChange = useCallback(
    (pagination, filters, sorter) => {
      console.log("Table change event:", { pagination, filters, sorter });
      
      const { current, pageSize } = pagination;
      if (!current || !pageSize) {
        console.error("Invalid pagination data:", pagination);
        return;
      }

      // Lưu trữ các thông số phân trang
      setDailyPagination({
        ...dailyPagination,
        current,
        pageSize,
      });

      if (isFiltered) {
        // Phân trang client-side khi đã lọc
        const startIndex = (current - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = allStatistics.slice(startIndex, endIndex);
        setStatistics(paginatedData);
      } else {
        // Tải lại dữ liệu từ server khi chưa lọc
        loadStatistics(current, pageSize);
      }
    },
    [isFiltered, allStatistics, dailyPagination, loadStatistics]
  );

  const handleMonthlyTableChange = useCallback(
    (pagination) => {
      const { current, pageSize } = pagination;
      if (!current || !pageSize) {
        console.error("Invalid pagination data:", pagination);
        return;
      }

      setMonthlyPagination({
        ...monthlyPagination,
        current,
        pageSize,
      });

      const monthlyData = groupByMonth(allStatistics);
      const startIndex = (current - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setMonthlyStats(monthlyData.slice(startIndex, endIndex));
    },
    [allStatistics, groupByMonth, monthlyPagination]
  );

  const handleYearlyTableChange = useCallback(
    (pagination) => {
      const { current, pageSize } = pagination;
      if (!current || !pageSize) {
        console.error("Invalid pagination data:", pagination);
        return;
      }

      setYearlyPagination({
        ...yearlyPagination,
        current,
        pageSize,
      });

      const yearlyData = groupByYear(allStatistics);
      const startIndex = (current - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      setYearlyStats(yearlyData.slice(startIndex, endIndex));
    },
    [allStatistics, groupByYear, yearlyPagination]
  );

  // Các định nghĩa cột - giữ nguyên
  const dailyColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("YYYY-MM-DD"),
    },
    { title: "Tổng truy cập ngày", dataIndex: "totalAccessDate", key: "totalAccessDate" },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEditStatistics(record)}>
            Sửa
          </Button>
          <Button type="link" danger onClick={() => handleDeleteStatistics(record.id)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  const monthlyColumns = [
    { title: "Tháng", dataIndex: "month", key: "month" },
    { title: "Tổng truy cập", dataIndex: "totalAccess", key: "totalAccess" },
  ];

  const yearlyColumns = [
    { title: "Năm", dataIndex: "year", key: "year" },
    { title: "Tổng truy cập", dataIndex: "totalAccess", key: "totalAccess" },
  ];

  const statisticsFields = [
    {
      name: "date",
      label: "Ngày",
      rules: [{ required: true, message: "Vui lòng chọn ngày" }],
      component: <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />,
    },
    {
      name: "totalAccessDate",
      label: "Tổng truy cập ngày",
      rules: [{ required: true, message: "Vui lòng nhập tổng truy cập ngày" }],
      component: <InputNumber min={0} style={{ width: "100%" }} />,
    },
  ];

  // Chuẩn bị dữ liệu cho biểu đồ
  const dailyChartData = {
    labels: statistics.map(stat => dayjs(stat.date).format("YYYY-MM-DD")),
    datasets: [{
      label: "Tổng truy cập ngày",
      data: statistics.map(stat => stat.totalAccessDate),
      borderColor: "#1890ff",
      backgroundColor: "rgba(24, 144, 255, 0.2)",
      fill: true,
      tension: 0.3
    }]
  };

  const monthlyChartData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [{
      label: "Tổng truy cập tháng",
      data: monthlyStats.map(stat => stat.totalAccess),
      backgroundColor: "#52c41a",
      borderColor: "#52c41a",
      borderWidth: 1
    }]
  };

  const yearlyChartData = {
    labels: yearlyStats.map(stat => stat.year),
    datasets: [{
      label: "Tổng truy cập năm",
      data: yearlyStats.map(stat => stat.totalAccess),
      backgroundColor: "#fa8c16", 
      borderColor: "#fa8c16",
      borderWidth: 1
    }]
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.tableHeader}>
          <h2>Quản lý thống kê</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <DatePicker
              placeholder="Từ ngày"
              format="YYYY-MM-DD"
              onChange={(date) => setStartDate(date)}
              className={styles.datePicker}
              value={startDate}
            />
            <DatePicker
              placeholder="Đến ngày"
              format="YYYY-MM-DD"
              onChange={(date) => setEndDate(date)}
              className={styles.datePicker}
              value={endDate}
            />
            <Button type="primary" onClick={handleFilterByDateRange}>
              Lọc
            </Button>
            {isFiltered && (
              <Button onClick={handleClearFilter}>
                Xóa bộ lọc
              </Button>
            )}
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddStatistics}>
              Thêm thống kê
            </Button>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} className={styles.tabs}>
          <TabPane tab="Theo ngày" key="daily">
            <div style={{ marginBottom: "20px" }}>
              <h3>Biểu đồ truy cập theo ngày</h3>
              {statistics.length > 0 ? (
                <div>
                  {/* Vị trí của biểu đồ - cần được thay thế bằng thư viện Chart.js */}
                  <div className={styles.chartPlaceholder}>
                    {/* Biểu đồ sẽ được hiển thị ở đây với Chart.js */}
                    <p style={{ textAlign: 'center' }}>Biểu đồ thống kê sẽ hiển thị ở đây</p>
                  </div>
                </div>
              ) : (
                <p>Không có dữ liệu để hiển thị biểu đồ</p>
              )}
            </div>
            <DataTable
              dataSource={statistics}
              columns={dailyColumns}
              rowKey="id"
              loading={loading}
              pagination={{
                current: dailyPagination.current,
                pageSize: dailyPagination.pageSize,
                total: dailyPagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }}
              onChange={handleDailyTableChange}
            />
          </TabPane>
          
          <TabPane tab="Theo tháng" key="monthly">
            <div style={{ marginBottom: "20px" }}>
              <h3>Biểu đồ truy cập theo tháng</h3>
              {monthlyStats.length > 0 ? (
                <div>
                  {/* Vị trí của biểu đồ - cần được thay thế bằng thư viện Chart.js */}
                  <div className={styles.chartPlaceholder}>
                    {/* Biểu đồ sẽ được hiển thị ở đây với Chart.js */}
                    <p style={{ textAlign: 'center' }}>Biểu đồ thống kê sẽ hiển thị ở đây</p>
                  </div>
                </div>
              ) : (
                <p>Không có dữ liệu để hiển thị biểu đồ</p>
              )}
            </div>
            <DataTable
              dataSource={monthlyStats}
              columns={monthlyColumns}
              rowKey="month"
              loading={loading}
              pagination={{
                current: monthlyPagination.current,
                pageSize: monthlyPagination.pageSize,
                total: monthlyPagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }}
              onChange={handleMonthlyTableChange}
            />
          </TabPane>
          
          <TabPane tab="Theo năm" key="yearly">
            <div style={{ marginBottom: "20px" }}>
              <h3>Biểu đồ truy cập theo năm</h3>
              {yearlyStats.length > 0 ? (
                <div>
                  {/* Vị trí của biểu đồ - cần được thay thế bằng thư viện Chart.js */}
                  <div className={styles.chartPlaceholder}>
                    {/* Biểu đồ sẽ được hiển thị ở đây với Chart.js */}
                    <p style={{ textAlign: 'center' }}>Biểu đồ thống kê sẽ hiển thị ở đây</p>
                  </div>
                </div>
              ) : (
                <p>Không có dữ liệu để hiển thị biểu đồ</p>
              )}
            </div>
            <DataTable
              dataSource={yearlyStats}
              columns={yearlyColumns}
              rowKey="year"
              loading={loading}
              pagination={{
                current: yearlyPagination.current,
                pageSize: yearlyPagination.pageSize,
                total: yearlyPagination.total,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total) => `Tổng ${total} bản ghi`,
              }}
              onChange={handleYearlyTableChange}
            />
          </TabPane>
        </Tabs>

        <FormModal
          visible={isModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setIsModalVisible(false);
            statisticsForm.resetFields();
          }}
          form={statisticsForm}
          title={editingStatistics ? "Sửa thống kê" : "Thêm thống kê"}
          fields={statisticsFields}
        />
      </Card>
    </div>
  );
}