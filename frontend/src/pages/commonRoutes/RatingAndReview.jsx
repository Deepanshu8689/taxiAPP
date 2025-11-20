import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import '../../styles/common/ratingAndReview.css';
import { toast } from 'react-toastify';

const RatingAndReview = () => {
    const { rideId } = useParams();
    const navigate = useNavigate();
    const user = useSelector((store) => store.user);
    const isDriver = user?.role === 'driver';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [rideData, setRideData] = useState(null);
    const [error, setError] = useState('');

    // Rating states
    const [overallRating, setOverallRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [categoryRatings, setCategoryRatings] = useState({
        cleanliness: 0,
        communication: 0,
        punctuality: 0,
        safety: 0
    });
    const [review, setReview] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Tags based on user type
    const riderTags = [
        '🎯 Professional',
        '💬 Great Communication',
        '⏰ On Time',
        '🚗 Clean Vehicle',
        '🛣️ Smooth Ride',
        '😊 Friendly',
        '🎵 Good Music',
        '💰 Fair Pricing'
    ];

    const driverTags = [
        '😊 Friendly',
        '💬 Good Communication',
        '⏰ Punctual',
        '🎯 Respectful',
        '💰 Tipped Well',
        '📍 Clear Directions',
        '🧳 Light Luggage',
        '⭐ Great Rider'
    ];

    const tags = isDriver ? driverTags : riderTags;

    useEffect(() => {
        fetchRideData();
    }, [rideId]);

    const fetchRideData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/ride/getRide/${rideId}`, {
                credentials: 'include'
            });
            const data = await response.json();
            console.log("ride details: ", data)

            if (response.ok) {
                setRideData(data);

                // Check if rating already exists
                const ratingResponse = await fetch(
                    `http://localhost:3000/ratings/exists/${rideId}?type=${isDriver ? 'driver-to-rider' : 'rider-to-driver'}`,
                    { credentials: 'include' }
                );
                const ratingData = await ratingResponse.json();
                console.log("ratingData: ", ratingData)

                if (ratingData.exists) {
                    setError('You have already rated this ride');
                }
            } else {
                setError('Ride not found');
            }
        } catch (err) {
            setError('Failed to load ride data');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryRating = (category, value) => {
        setCategoryRatings(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        if (overallRating === 0) {
            setError('Please provide an overall rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/ratings/createRating', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    rideId,
                    ratingType: isDriver ? 'driver-to-rider' : 'rider-to-driver',
                    overallRating,
                    cleanlinessRating: categoryRatings.cleanliness || undefined,
                    communicationRating: categoryRatings.communication || undefined,
                    punctualityRating: categoryRatings.punctuality || undefined,
                    safetyRating: categoryRatings.safety || undefined,
                    review: review.trim() || undefined,
                    tags: selectedTags,
                    isAnonymous
                })
            });

            if (response.ok) {
                // Navigate back to history
                toast.success('Rating submitted successfully!')
                navigate(isDriver ? '/driver/history' : '/rider/history', {
                    state: { message: 'Thank you for your feedback!' }
                });
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to submit rating');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="rating-container">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading ride details...</p>
                </div>
            </div>
        );
    }

    if (error && !rideData) {
        return (
            <div className="rating-container">
                <div className="error-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h3>{error}</h3>
                    <button onClick={() => navigate(-1)} className="back-button">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const otherPerson = isDriver ? rideData?.rider : rideData?.driver;

    return (
        <div className="rating-container">
            <div className="rating-card">
                {/* Header */}
                <div className="rating-header">
                    <button onClick={() => navigate(-1)} className="back-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1>Rate Your Experience</h1>
                </div>

                {/* Person Info */}
                <div className="person-info">
                    <div className="person-avatar">
                        {otherPerson?.firstName?.charAt(0)}{otherPerson?.lastName?.charAt(0)}
                    </div>
                    <div className="person-details">
                        <h2>{otherPerson?.firstName} {otherPerson?.lastName}</h2>
                        <p className="person-role">{isDriver ? 'Rider' : 'Driver'}</p>
                        {!isDriver && rideData?.vehicle && (
                            <p className="vehicle-info">
                                {rideData?.vehicle?.vehicleName} {rideData?.vehicle?.vehicleModel} • {rideData?.vehicle.vehicleNumber}
                            </p>
                        )}
                    </div>
                </div>

                {/* Ride Summary */}
                <div className="ride-summary">
                    <div className="summary-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="10" r="3" />
                            <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z" />
                        </svg>
                        <div>
                            <p className="label">Route</p>
                            <p className="value">{rideData?.pickupLocation} → {rideData?.dropLocation}</p>
                        </div>
                    </div>
                    <div className="summary-row">
                        <div className="summary-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <div>
                                <p className="label">Date</p>
                                <p className="value">{new Date(rideData?.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="summary-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            <div>
                                <p className="label">Fare</p>
                                <p className="value">₹{rideData?.actualFare}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Overall Rating */}
                <div className="rating-section">
                    <h3>Overall Rating</h3>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className={`star ${star <= (hoverRating || overallRating) ? 'active' : ''}`}
                                onClick={() => setOverallRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </button>
                        ))}
                    </div>
                    {overallRating > 0 && (
                        <p className="rating-text">
                            {overallRating === 5 && '⭐ Excellent!'}
                            {overallRating === 4 && '😊 Very Good'}
                            {overallRating === 3 && '👍 Good'}
                            {overallRating === 2 && '😐 Fair'}
                            {overallRating === 1 && '😞 Poor'}
                        </p>
                    )}
                </div>

                {/* Category Ratings */}
                <div className="rating-section">
                    <h3>Rate Specific Aspects</h3>
                    <div className="category-ratings">
                        {Object.entries({
                            cleanliness: { icon: '✨', label: 'Cleanliness' },
                            communication: { icon: '💬', label: 'Communication' },
                            punctuality: { icon: '⏰', label: 'Punctuality' },
                            safety: { icon: '🛡️', label: 'Safety' }
                        }).map(([key, { icon, label }]) => (
                            <div key={key} className="category-item">
                                <div className="category-header">
                                    <span className="category-icon">{icon}</span>
                                    <span className="category-label">{label}</span>
                                </div>
                                <div className="category-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            className={`star-small ${star <= categoryRatings[key] ? 'active' : ''}`}
                                            onClick={() => handleCategoryRating(key, star)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="rating-section">
                    <h3>Add Tags (Optional)</h3>
                    <div className="tags-container">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                className={`tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                                onClick={() => toggleTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Written Review */}
                <div className="rating-section">
                    <h3>Write a Review (Optional)</h3>
                    <textarea
                        className="review-textarea"
                        placeholder={`Share your experience with ${otherPerson?.firstName}...`}
                        value={review}
                        onChange={(e) => setReview(e.target.value.slice(0, 500))}
                        rows="4"
                    />
                    <p className="char-count">{review.length}/500 characters</p>
                </div>

                {/* Anonymous Option */}
                <div className="rating-section">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <span>Post this review anonymously</span>
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={submitting || overallRating === 0}
                >
                    {submitting ? (
                        <>
                            <span className="spinner-small"></span>
                            Submitting...
                        </>
                    ) : (
                        'Submit Rating'
                    )}
                </button>
            </div>
        </div>
    );
};

export default RatingAndReview;