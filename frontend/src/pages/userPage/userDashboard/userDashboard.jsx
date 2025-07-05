import React from "react";
import "./userDashboard.scss";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/user";
import { useNavigate } from "react-router-dom";

function userDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const { getAllUsers } = useUserStore();

  useEffect(() => {
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    const fetchUsers = async () => {
      try {
        const { success, message, data } = await getAllUsers(token);
        if (success) {
          setUsers(data);
        } else {
          console.error("Failed to fetch users:", message);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchUsers();
  }, [token, navigate]);

  return (
    <div className="userDashboard">
      hello
      {users.map((user) => {
        <p>{user.name}</p>;
      })}
    </div>
  );
}

export default userDashboard;
