import React, { useState, useEffect } from "react";
import api from "../config/axios";
import AdminSidebar from "./AdminSidebar";

interface Employee {
  _id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  employeeId: string;
  phone?: string;
  position?: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/users/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Employee Management</h1>

        <div className="card">
          <div className="card-header">
            <h2>All Employees</h2>
          </div>
          {employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Employee ID</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>{employee.name}</td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>
                      <td>{employee.role}</td>
                      <td>{employee.employeeId}</td>
                      <td>{employee.phone || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;

