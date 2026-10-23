import AuthArt from "./AuthArt";

export default function AuthLayout({ children }) {
  return (
    <main className="authPage">
      <div className="authFrame">
        <div className="authArt">
          <AuthArt />
        </div>

        <div className="authCard">
          <div className="authLogo">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
            </svg>
            <span>Tidy</span>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}