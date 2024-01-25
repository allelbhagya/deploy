import React, { useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated before making the request
    if (userInfo && location.pathname !== "/") {
      fetch("http://localhost:4000/profile", {
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            const contentType = response.headers.get("content-type");
  
            if (contentType && contentType.includes("application/json")) {
              return response.json();
            } else {
              console.error("Unexpected response content type:", contentType);
              return {};
            }
          } else {
            console.error("Error fetching user profile:", response.statusText);
            throw new Error("Error fetching user profile");
          }
        })
        .then((fetchedUserInfo) => {
          setUserInfo(fetchedUserInfo);
        })
        .catch((error) => {
          console.error("Network error during profile fetch:", error);
        });
    }
  }, []); // Empty dependency array means this effect will run once on component mount
  

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Logout failed:", response.statusText);
          throw new Error("Logout failed");
        }
        // Clear user info immediately
        setUserInfo(null);
        // Navigate to home
        navigate("/");
      })
      .catch((error) => {
        console.error("Network error during logout:", error);
      });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to={userInfo ? "/logs" : "/"} className="logo">
        cobble logs
      </Link>
      {userInfo && location.pathname !== "/" && location.pathname!=="/register"? ( // Check if user is logged in and not on "/"
        <nav>
          <>
            <h2>Hi! {username}</h2>
            <Link to="/analysis" className="nav-button">
              Analysis
            </Link>
            <Link to="/create" className="nav-button">
              Create new log
            </Link>
            <Link onClick={logout} className="nav-button">
              Logout
            </Link>
          </>
        </nav>
      ) : null}
    </header>
  );
}
