import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AdminLogin from "./components/shared/Admin.jsx";
import Dashboard from "./components/Dashboard";
import Products from "./components/Products";
import Login from "../src/profile/login/login.jsx";
import NewForm from "./components/NewForm";
import Status from "./components/status";
import ProfileCard from "./profile/ProfileCard.jsx";
import Users from './profile/users/users.jsx'

import { GreyYarnDelivery, GreyYarnPo, GreyYarnBill, DyedYarnPo, DyedYarnDelivery, DyedYarnBill, GreyFabricPo, GreyFabricDelivery, GreyFabricBill, DyedFabricPo, DyedFabricDelivery, DyedFabricBill, AccessoriesPo, AccessoriesDelivery, AccessoriesBill } from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path="home" element={<AdminLogin />} >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="newForm" element={<NewForm />} />
          <Route path="status" element={<Status />} />
          <Route path="profileCard" element={<ProfileCard />} />
          <Route path="users" element={<Users />} />
          <Route path="greyYarnPo" element={<GreyYarnPo />} />
          <Route path="greyYarnDelivery" element={<GreyYarnDelivery />} />
          <Route path='greyYarnBill' element={<GreyYarnBill />} />
          <Route path="dyedYarnPo" element={<DyedYarnPo />} />
          <Route path="dyedYarnDelivery" element={<DyedYarnDelivery />} />
          <Route path="dyedYarnBill" element={<DyedYarnBill />} />
          <Route path="greyFabricPo" element={<GreyFabricPo />} />
          <Route path="greyFabricDelivery" element={<GreyFabricDelivery />} />
          <Route path="greyFabricBill" element={<GreyFabricBill />} />
          <Route path="dyedFabricPo" element={<DyedFabricPo />} />
          <Route path="dyedFabricDelivery" element={<DyedFabricDelivery />} />
          <Route path="dyedFabricBill" element={<DyedFabricBill />} />
          <Route path="accessoriesPo" element={<AccessoriesPo />} />
          <Route path="accessoriesDelivery" element={<AccessoriesDelivery />} />
          <Route path="accessoriesBill" element={<AccessoriesBill />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
