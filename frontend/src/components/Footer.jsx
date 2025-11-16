import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>© {new Date().getFullYear()} My Blog • Built with React + Vite</p>
      </div>
    </footer>
  );
}

export default Footer;
