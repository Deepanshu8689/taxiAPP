import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth/login.css";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/Redux/userSlice";

export default function Login() {
    // const navigate = useNavigate();
    // const dispatch = useDispatch()
    // const [emailId, setEmailId] = useState("")
    // const [password, setPassword] = useState("")
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        if (!emailId || !password) {
            setError("All fields are required");
            return;
        }

        setLoading(true);
        try {
            

            const res = await fetch("http://localhost:3000/auth/login", {
                method: "Post",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ emailId, password })
            })
            const data = await res.json()
            
            if (data.statusCode === 500 || !res.ok) {
                throw new Error(data.message || "Login failed");
            }
            
            dispatch(addUser(data.user))

            if(data.user.role === 'driver'){
                navigate('/driver/home')
            }
            else if(data.user.role === 'user'){
                navigate('/ride-request')
            }
            else{
                navigate('/admin-dashboard')
            }

            // navigate('/')
        } catch (error) {
            console.error("Error in Login:", error);
            setError(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-small">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19" 
                                    stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="7" cy="17" r="2" stroke="#ffc107" strokeWidth="2"/>
                                <circle cx="17" cy="17" r="2" stroke="#ffc107" strokeWidth="2"/>
                            </svg>
                        </div>
                        <h2>Welcome Back</h2>
                        <p className="subtitle">Login to continue your journey</p>
                    </div>

                    {error && (
                        <div className="error-message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">EmailId</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={emailId}
                                onChange={(e) => setEmailId(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            Don't have an account?{" "}
                            <span onClick={() => navigate("/signup")} className="link">
                                Sign Up
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="decorative-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
            </div>
        </div>
    );
}
