import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  FileAddOutlined,
  LaptopOutlined,
  NotificationOutlined,
  PythonOutlined,
  CustomerServiceOutlined,
  QuestionOutlined,
  CiOutlined,
  ManOutlined,
  BookOutlined,
  ProfileOutlined,
  MenuOutlined,
  SyncOutlined,
  GroupOutlined,
  TeamOutlined,
  UserAddOutlined,
  ClusterOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  SignatureOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import sidebarcontent from './SidebarContent.js';

const { Sider } = Layout;
const { SubMenu } = Menu;

const AppSidebar = ({role}) => {
  const menuItems = sidebarcontent[role];
  const[collapsed, setCollapsed] = useState(false);
  return (
    <Sider width={300} className="site-layout-background" collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['0']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
      >
         {menuItems.map((section, index) => (
        <SubMenu key={index} icon={<section.icon />} title={section.title}>
          {section.content.map((item, subIndex) => (
            <Menu.Item key={`${index}-${subIndex}`} icon={<item.icon />}>
              <Link to={item.link}>{item.name}</Link>
              {/* <a href={item.link}>{item.name}</a> */}
            </Menu.Item>
          ))}
        </SubMenu>
      ))}

        {/* <SubMenu key="sub1" icon={<UserOutlined />} title="Admin">
          <Menu.Item key="1" icon={<UsergroupAddOutlined/>}>
            <Link to="/groups">Groups</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<GroupOutlined/>}>
            <Link to="/batches">Batches</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<ClusterOutlined/>}>
            <Link to="/departments">Departments</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" icon={<BookOutlined />} title="Training Management">
          <Menu.Item key="/trainings" icon={<SafetyCertificateOutlined />}>
          <Link to="/trainings">Training Program</Link>
            </Menu.Item>
            <Menu.Item key="/view-trainingassignments" icon={<TeamOutlined />}>
          <Link to="/view-trainingassignments"> Program Assignment</Link></Menu.Item>
          <Menu.Item key="4" icon={<SafetyCertificateOutlined />}>
            <Link to="training-tracker">Training Program Tracker</Link>
          </Menu.Item>
          <Menu.Item key="6" icon={<FileAddOutlined/>}><Link to="/materialsUpload">Upload training material</Link></Menu.Item>
          <Menu.Item key="7" icon={<SignatureOutlined/>}><Link to="/feedback">Feedbacks</Link></Menu.Item>
        </SubMenu>
        <SubMenu key="sub3" icon={<QuestionOutlined />} title="Assessments Management">
          <Menu.Item key="8" icon={<LaptopOutlined />}><Link to="/conductAssessment">Manage Assessments</Link></Menu.Item>
          <Menu.Item key="9" icon = {<ProfileOutlined/>}><Link to="/manage-datasets">Q&A Datasets</Link></Menu.Item>
          <Menu.Item key="10" > <Link to="/assessmentReport">Assessment Reports</Link></Menu.Item>
          <Menu.Item key="11">Assessment Metrics</Menu.Item>
          <Menu.Item key="12" > <Link to="/assessment-list">Assessments List</Link></Menu.Item>
        </SubMenu> */}
      </Menu>
    </Sider>
  );
};

export default AppSidebar;
