import React, { useState, useEffect } from "react";
import AgeVerificationService from "../services/ageVerificationService";

interface AgeGateProps {
  onAccessGranted: () => void;
  onAccessDenied: () => void;
}

const AgeGate: React.FC<AgeGateProps> = ({
  onAccessGranted,
  onAccessDenied,
}) => {
  const [step, setStep] = useState<"age" | "pin" | "setup">("age");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const ageService = AgeVerificationService.getInstance();

  useEffect(() => {
    const sessionInfo = ageService.getSessionInfo();

    if (sessionInfo.hasCompletedSetup) {
      onAccessGranted();
    } else if (sessionInfo.hasPin) {
      setStep("pin");
    } else {
      setStep("setup");
    }
  }, []);

  const handleAgeConfirmation = () => {
    setStep(ageService.hasCustomPin() ? "pin" : "setup");
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isValid = ageService.verifyPin(pin);

      if (isValid) {
        ageService.verifyAge();
        onAccessGranted();
      } else {
        setError("رمز PIN غير صحيح. حاول مرة أخرى.");
        setPin("");
      }
    } catch (err) {
      setError("خطأ في التحقق. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (pin.length < 4) {
      setError("يجب أن يكون الرمز السري 4 أرقام على الأقل");
      setLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      setError("الرمز السري غير متطابق");
      setLoading(false);
      return;
    }

    try {
      const success = ageService.setCustomPin(pin);

      if (success) {
        ageService.verifyAge();
        onAccessGranted();
      } else {
        setError("فشل في إعداد الرمز السري");
      }
    } catch (err) {
      setError("خطأ في إعداد الرمز السري");
    } finally {
      setLoading(false);
    }
  };

  if (step === "age") {
    return (
      <div className="age-gate-overlay">
        <div className="age-gate-modal">
          <div className="age-gate-header">
            <div className="warning-icon">⛔</div>
            <h1>محتوى للبالغين فقط</h1>
            <h2>+18 Content – تأكيد الوصول</h2>
          </div>

          <div className="age-gate-content">
            <p className="warning-text">
              هذا القسم مخصص للمستخدمين البالغين فوق 18 سنة فقط.
            </p>
            <p className="warning-text-en">
              This section is for adult users over 18 years old only.
            </p>

            <div className="age-gate-actions">
              <button className="btn-confirm" onClick={handleAgeConfirmation}>
                ✅ أنا فوق 18 سنة
              </button>
              <button className="btn-deny" onClick={onAccessDenied}>
                ❌ إلغاء
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .age-gate-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
          }

          .age-gate-modal {
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border: 2px solid #ff6b6b;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(255, 107, 107, 0.3);
            animation: slideUp 0.5s ease-out;
          }

          .age-gate-header {
            margin-bottom: 30px;
          }

          .warning-icon {
            font-size: 60px;
            margin-bottom: 20px;
            animation: pulse 2s infinite;
          }

          .age-gate-header h1 {
            color: #ff6b6b;
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
            text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
          }

          .age-gate-header h2 {
            color: #ffffff;
            font-size: 18px;
            font-weight: normal;
            opacity: 0.9;
          }

          .warning-text {
            color: #ffffff;
            font-size: 16px;
            margin: 15px 0;
            line-height: 1.6;
          }

          .warning-text-en {
            color: #cccccc;
            font-size: 14px;
            margin: 10px 0 30px 0;
            font-style: italic;
          }

          .age-gate-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
          }

          .btn-confirm,
          .btn-deny {
            padding: 15px 30px;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 160px;
          }

          .btn-confirm {
            background: linear-gradient(145deg, #4ecdc4, #44a08d);
            color: white;
            box-shadow: 0 8px 25px rgba(78, 205, 196, 0.3);
          }

          .btn-confirm:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(78, 205, 196, 0.4);
          }

          .btn-deny {
            background: linear-gradient(145deg, #ff6b6b, #ee5a52);
            color: white;
            box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
          }

          .btn-deny:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 35px rgba(255, 107, 107, 0.4);
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}</style>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <div className="age-gate-overlay">
        <div className="age-gate-modal">
          <div className="age-gate-header">
            <div className="lock-icon">🔐</div>
            <h1>أدخل الرمز السري</h1>
            <h2>Enter PIN Code</h2>
          </div>

          <form onSubmit={handlePinSubmit} className="pin-form">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="أدخل الرمز السري"
              className="pin-input"
              maxLength={10}
              autoFocus
            />

            {error && <div className="error-message">{error}</div>}

            <div className="pin-actions">
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || pin.length < 4}
              >
                {loading ? "⏳ جاري التحقق..." : "🔓 تأكيد الدخول"}
              </button>
              <button
                type="button"
                className="btn-back"
                onClick={onAccessDenied}
              >
                ↩️ رجوع
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .age-gate-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-out;
          }

          .age-gate-modal {
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border: 2px solid #4ecdc4;
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(78, 205, 196, 0.3);
            animation: slideUp 0.5s ease-out;
          }

          .lock-icon {
            font-size: 50px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }

          .pin-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .pin-input {
            padding: 15px;
            font-size: 18px;
            text-align: center;
            border: 2px solid #4ecdc4;
            border-radius: 12px;
            background: rgba(78, 205, 196, 0.1);
            color: white;
            letter-spacing: 3px;
          }

          .pin-input:focus {
            outline: none;
            border-color: #44a08d;
            box-shadow: 0 0 20px rgba(78, 205, 196, 0.3);
          }

          .error-message {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #ff6b6b;
          }

          .pin-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
          }

          .btn-submit,
          .btn-back {
            padding: 12px 25px;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-submit {
            background: linear-gradient(145deg, #4ecdc4, #44a08d);
            color: white;
            flex: 1;
          }

          .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-back {
            background: linear-gradient(145deg, #666, #555);
            color: white;
          }

          @keyframes bounce {
            0%,
            20%,
            50%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
        `}</style>
      </div>
    );
  }

  if (step === "setup") {
    return (
      <div className="age-gate-overlay">
        <div className="age-gate-modal">
          <div className="age-gate-header">
            <div className="setup-icon">⚙️</div>
            <h1>إعداد الرمز السري</h1>
            <h2>Setup PIN Code</h2>
          </div>

          <form onSubmit={handlePinSetup} className="setup-form">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="أدخل رمز سري (4 أرقام على الأقل)"
              className="pin-input"
              maxLength={10}
              autoFocus
            />

            <input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder="تأكيد الرمز السري"
              className="pin-input"
              maxLength={10}
            />

            {error && <div className="error-message">{error}</div>}

            <div className="setup-info">
              <p>
                سيتم استخدام هذا الرمز للوصول إلى المحتوى المحظور في المستقبل
              </p>
            </div>

            <div className="setup-actions">
              <button
                type="submit"
                className="btn-create"
                disabled={loading || pin.length < 4 || confirmPin.length < 4}
              >
                {loading ? "⏳ جاري الإعداد..." : "✅ إنشاء الرمز"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={onAccessDenied}
              >
                ❌ إلغاء
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .setup-form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }

          .setup-info {
            background: rgba(78, 205, 196, 0.1);
            padding: 15px;
            border-radius: 10px;
            border: 1px solid #4ecdc4;
          }

          .setup-info p {
            color: #4ecdc4;
            font-size: 14px;
            margin: 0;
            line-height: 1.4;
          }

          .setup-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
          }

          .btn-create,
          .btn-cancel {
            padding: 12px 25px;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            flex: 1;
          }

          .btn-create {
            background: linear-gradient(145deg, #4ecdc4, #44a08d);
            color: white;
          }

          .btn-create:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .btn-cancel {
            background: linear-gradient(145deg, #ff6b6b, #ee5a52);
            color: white;
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default AgeGate;
