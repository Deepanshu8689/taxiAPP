import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/Redux/userSlice";
import "../../styles/auth/signup.css";

export default function Signup() {
    const navigate = useNavigate();
    
    const [userType, setUserType] = useState("user"); // 'user' or 'driver'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        emailId: "",
        confirmPassword: "",
        password: "",
        phoneNumber: "",
        age: "",
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        
        // Validation
        if (!formData.firstName || !formData.lastName || !formData.emailId || !formData.password || !formData.phoneNumber || !formData.confirmPassword || !formData.age) {
            setError("All fields are required");
            return;
        }

        setLoading(true);

        try {
            const body = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    emailId: formData.emailId,
                    password: formData.password,
                    phoneNumber: `+91${formData.phoneNumber}`,
                    confirmPassword: formData.confirmPassword,
                    age: Number(formData.age),
                    role: userType
                }

            const res = await fetch(`http://localhost:3000/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(body)
            });

            const data = await res.json();
            
            if (!res.ok) {
                alert(data.message || "Signup failed");
                throw error
            }
            
            alert(`Signup successful! 
                Now Login and Enjoy!!`);
            
            navigate('/login')

        } catch (error) {
            console.error("Signup error:", error);
            setError(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <div className="logo-small">
                            <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                                <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19" 
                                    stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/>
                                <circle cx="7" cy="17" r="2" stroke="#ffc107" strokeWidth="2"/>
                                <circle cx="17" cy="17" r="2" stroke="#ffc107" strokeWidth="2"/>
                            </svg>
                        </div>
                        <h2>Create Account</h2>
                        <p className="subtitle">Join us and start your journey</p>
                    </div>

                    {/* User Type Selection */}
                    <div className="user-type-selector">
                        <button
                            type="button"
                            className={`type-btn ${userType === "user" ? "active" : ""}`}
                            onClick={() => setUserType("user")}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            Rider
                        </button>
                        <button
                            type="button"
                            className={`type-btn ${userType === "driver" ? "active" : ""}`}
                            onClick={() => setUserType("driver")}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 17h-.8C3.5 17 3 16.5 3 15.8V13c0-.6.4-1 1-1h1V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v5h1c.6 0 1 .4 1 1v2.8c0 .7-.5 1.2-1.2 1.2H19"/>
                                <circle cx="7" cy="17" r="2"/>
                                <circle cx="17" cy="17" r="2"/>
                            </svg>
                            Driver
                        </button>
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

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    id="firstName"
                                    type="text"
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    id="lastName"
                                    type="text"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="emailId">EmailId</label>
                            <input
                                id="emailId"
                                type="email"
                                name="emailId"
                                placeholder="john.doe@example.com"
                                value={formData.emailId}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input
                                id="phoneNumber"
                                type="text"
                                name="phoneNumber"
                                placeholder="xxxxx xxxxx"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
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
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="Enter your password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="age">Age</label>
                            <input
                                id="age"
                                type="number"
                                name="age"
                                placeholder="Enter your age"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button type="submit" className="signup-btn" disabled={loading}>
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p>
                            Already have an account?{" "}
                            <span onClick={() => navigate("/login")} className="link">
                                Login
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