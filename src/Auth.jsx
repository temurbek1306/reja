import React, { useState } from 'react';

export default function Auth({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    // SHA-256 hash of '6005'
    const PASSWORD_HASH = '65bf34b1e572ae42dfd62ca7f830c86fd996ee44880dfd967b7fba6a94d23b34';

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        const enteredHash = await sha256(password);

        if (enteredHash === PASSWORD_HASH) {
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
                        placeholder="Parolni kiriting..."
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
