import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useState } from "react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies([]);
  const [users, setUsers] = useState([]);
  const [checkVerify, setCheckVerify] = useState(true);
  const [checkedAll, setCheckedAll] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const data = await axios.get("http://localhost:4000");
      setUsers(data.data.data.users);
    };
    getData();
  }, [checkVerify, checkedAll]);

  useEffect(() => {
    const verifyUser = async () => {
      if (!cookies.jwt) {
        navigate("/login");
      } else {
        const { data } = await axios.post(
          "http://localhost:4000",
          {},
          {
            withCredentials: true,
          }
        );
        if (!data.status) {
          removeCookie("jwt");
          navigate("/login");
        }
      }
    };
    verifyUser();
  }, [cookies, navigate, removeCookie, checkVerify]);

  const logOut = () => {
    removeCookie("jwt");
    navigate("/login");
  };
  const deleteUser = (id) => {
    const remove = async () => {
      await axios
        .delete(`http://localhost:4000/users/${id}`, {})
        .then(() => {});
      await axios.put("http://localhost:4000/users", {
        id: users.length,
        changeId: id,
      });
    };
    remove();

    checkVerify ? setCheckVerify(false) : setCheckVerify(true);
  };
  const blockUnblockUser = async (id, isActive) => {
    await axios.put("http://localhost:4000/users", {
      id: id,
      active: isActive,
    });
    checkVerify ? setCheckVerify(false) : setCheckVerify(true);
  };
  const checkAll = (event) => {
    setCheckedAll(event.target.checked);
  };
  return (
    <>
      <div className="private">
        <div className="head_table d-flex justify-content-between">
          <i className="bi bi-trash3-fill text-danger"></i>
          <button className="btn btn-warning" onClick={logOut}>
            Log Out
          </button>
        </div>
        <div className="users_table">
          <table className=" table table-hover">
            <thead>
              <tr>
                <th>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value=""
                    id="flexCheckDefault"
                    onClick={(e) => {
                      checkAll(e);
                    }}
                  />
                </th>
                <th scope="col">id</th>
                <th scope="col">Username</th>
                <th scope="col">Email</th>
                <th scope="col">Last login time</th>
                <th scope="col">Registr time</th>
                <th scope="col">Status</th>
                <th scope="col">Event</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                return (
                  <tr key={user.id}>
                    <td>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value=""
                        id="flexCheckDefault"
                        defaultChecked={checkedAll ? "checked" : false}
                      />
                    </td>
                    <th scope="row">{user.id}</th>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>29.09.2022</td>
                    <td>{user.registerDate}</td>
                    <td
                      className={`${
                        user.active === "active"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {user.active === "active" ? "Active" : "Blocked"}
                    </td>
                    <td className="d-flex gap-3">
                      <i
                        className="bi bi-trash3-fill text-danger"
                        onClick={() => {
                          deleteUser(user.id);
                        }}
                      ></i>
                      {user.active === "active" ? (
                        <i
                          className="bi bi-lock-fill"
                          onClick={() => {
                            blockUnblockUser(user.id, "block");
                          }}
                        ></i>
                      ) : (
                        <i
                          className="bi bi-unlock-fill"
                          onClick={() => {
                            blockUnblockUser(user.id, "active");
                          }}
                        ></i>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
