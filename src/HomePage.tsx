import React, { useState } from "react";
import {
  Button,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div className="w-64" onClick={handleDrawerToggle}>
      <List>
        <ListItem component={Link} to="/login">
          <ListItemText primary="Login" />
        </ListItem>
        <ListItem component={Link} to="/main">
          <ListItemText primary="Admin" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <AppBar position="static" className="bg-blue-700 shadow-md">
        <Toolbar className="flex justify-between">
          <Typography variant="h6" className="font-bold">
            Guaranteed Auto Protection
          </Typography>

          {/* 桌面端按钮 */}
          <div className="hidden md:flex gap-4">
            <Button component={Link} to="/login" variant="contained" color="secondary">
              Login
            </Button>
            <Button component={Link} to="/main" variant="outlined" color="inherit">
              Admin
            </Button>
          </div>

          {/* 移动端汉堡按钮 */}
          <div className="md:hidden">
            <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      {/* 移动端抽屉菜单 */}
      <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
        {drawer}
      </Drawer>

      {/* 主视觉区 */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center text-center px-6 py-20 text-white"
      >
        {/* 背景图片 */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        {/* 遮罩层 */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* 内容 */}
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Guaranteed Auto Protection
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Protect your vehicle with reliable insurance plans. Drive worry-free with our guaranteed coverage.
          </p>
          <Button component={Link} to="/login" variant="contained" color="secondary" size="large">
            Get Started
          </Button>
        </div>
      </section>

      {/* 特色介绍区 */}
      <Container className="py-16 grid md:grid-cols-3 gap-8">
        {[
          { title: "Affordable Plans", desc: "Choose the right insurance at the best price." },
          { title: "24/7 Support", desc: "We’re here whenever you need us." },
          { title: "Trusted Coverage", desc: "Peace of mind with guaranteed protection." },
        ].map((item, idx) => (
          <Card key={idx} className="rounded-2xl shadow-lg">
            <CardContent className="text-center p-6">
              <Typography variant="h6" className="font-bold mb-4">
                {item.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {item.desc}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Container>

      {/* 底部 */}
      <footer className="bg-blue-800 text-white py-6 text-center mt-auto">
        <p>© {new Date().getFullYear()} Guaranteed Auto Protection. All rights reserved.</p>
      </footer>
    </div>
  );
}
