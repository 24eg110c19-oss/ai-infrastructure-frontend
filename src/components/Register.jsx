
import { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import API_URL from "../api";

function Register() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    }

    async function submit(e) {
        e.preventDefault();

        if (!user.name.trim() || !user.email.trim() || !user.password) {
            alert("Please fill in all fields.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/users/register`,
                {
                    name: user.name.trim(),
                    email: user.email.trim(),
                    password: user.password
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    timeout: 60000
                }
            );

            console.log("Registration successful:", response.data);
            alert("Registration successful! Please log in.");
            navigate("/login");
        } catch (err) {
            console.error(
                "Registration error:",
                err.response?.data || err.message
            );

            if (!err.response) {
                alert(
                    "Cannot connect to the backend. Check the backend URL, CORS configuration, and Render logs."
                );
            } else if (err.response.status === 409) {
                alert("This email is already registered.");
            } else if (err.response.status === 400) {
                alert("Invalid registration details. Please check your inputs.");
            } else {
                alert(
                    err.response.data?.message ||
                    err.response.data?.error ||
                    `Registration failed (HTTP ${err.response.status}).`
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="Third-div">
            <h1>Create Account</h1>

            <form onSubmit={submit}>
                <h3>Name</h3>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={user.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                />

                <h3>Email</h3>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={user.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                />

                <h3>Password</h3>
                <input
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={user.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                />

                <br />

                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <br />

            <Link to="/login">
                Already have an account? Login
            </Link>
        </div>
    );
}

export default Register;
