import React, { useState } from 'react';

export default function Auth({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === '6005') {
            onLogin();
        } else {
            setError("Noto'g'ri parol! Iltimos, qaytadan urinib ko'ring.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            setPassword('');
        }
    };

    return (
        <div className="auth-container">
            <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
                <div className="auth-header">
                    <span className="auth-logo">✨</span>
                    <h1>Reja</h1>
                </div>
                <h2>Xush kelibsiz!</h2>
                <p>Ilovaga kirish uchun parolni kiriting.</p>

                <form onSubmit={handleLogin} className="auth-form">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Parol (7777)"
                        autoFocus
                        className="auth-input"
                    />
                    <div className="auth-error-wrap">
                        {error && <p className="auth-error">{error}</p>}
                    </div>
                    <button type="submit" className="auth-submit-btn">
                        Kirish
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Pro Pro +++++ Edition</span>
                </div>
            </div>
        </div>
    );
}
