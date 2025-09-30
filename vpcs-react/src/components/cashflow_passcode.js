import React, { useState, useEffect, useRef } from 'react';
import './cashflow_passcode.css';

const Passcode = ({ onCorrectPasscode }) => {
    const [passcode, setPasscode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    const CORRECT_PASSCODE = '123123';

    useEffect(() => {
        inputRefs.current[0].focus();
    }, []);

    // Auto-verify when all 6 digits are entered
    useEffect(() => {
        const enteredPasscode = passcode.join('');
        if (enteredPasscode.length === 6) {
            if (enteredPasscode === CORRECT_PASSCODE) {
                onCorrectPasscode();
            } else {
                setError('Incorrect passcode. Please try again.');
                setTimeout(() => {
                    setPasscode(['', '', '', '', '', '']);
                    setError('');
                    inputRefs.current[0].focus();
                }, 1500);
            }
        }
    }, [passcode, onCorrectPasscode]);

    const handleInputChange = (index, value) => {
        if (error) setError('');

        if (value && !/^\d$/.test(value)) return;

        const newPasscode = [...passcode];
        newPasscode[index] = value;
        setPasscode(newPasscode);

        if (value && index < passcode.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !passcode[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
        const newPasscode = [...passcode];
        for (let i = 0; i < pastedData.length; i++) {
            if (i < newPasscode.length) {
                newPasscode[i] = pastedData[i];
            }
        }
        setPasscode(newPasscode);
        const lastIndex = Math.min(pastedData.length - 1, newPasscode.length - 1);
        inputRefs.current[lastIndex].focus();
    };

    return (
        <div className="passcode-container">
            <div className="passcode-card">
                <h2 className="passcode-title">Enter Passcode</h2>
                <div className="passcode-input-container">
                    {passcode.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className={`passcode-input ${error ? 'error' : ''}`}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            maxLength={1}
                        />
                    ))}
                </div>
                {error && <span className="passcode-error">{error}</span>}
            </div>
        </div>
    );
};

export default Passcode;