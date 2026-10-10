import { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

    const [loginUser, setLoginUser] = useState({
        email: "",
        password: ""
    });

    const navigate = useNavigate();

    function a(e) {
        setLoginUser({
            ...loginUser,
            [e.target.name]: e.target.value
        });
    }

    async function submit() {

        try {

            const response = await axios.post(
                "http://localhost:8081/users/login",
                loginUser
            );

            console.log("Login Response:", response.data);

            const loggedInUser = response.data;

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(loggedInUser)
            );

            localStorage.setItem(
                "userId",
                loggedInUser.id
            );

            alert("Login Successful!");

            navigate("/dashboard");

        } catch (err) {

            console.log("Login Error:", err);

            if (err.response) {

                if (typeof err.response.data === "string") {
                    alert(err.response.data);
                } else {
                    alert("Invalid email or password");
                }

            } else {
                alert("Cannot connect to Spring Boot");
            }
        }
    }

    return (
        <div className="Third-div">

            <h1>Login Page</h1>

            <h2>Email</h2>

            <input
                type="text"
                name="email"
                value={loginUser.email}
                onChange={a}
            />

            <h2>Password</h2>

            <input
                type="password"
                name="password"
                value={loginUser.password}
                onChange={a}
            />

            <br />

            <button onClick={submit}>
                Login
            </button>

            <br />

            <a href="/">
                New Register An Account?
            </a>

        </div>
    );
}

export default Login;