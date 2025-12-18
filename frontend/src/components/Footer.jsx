import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '40px 0',
      marginTop: '60px'
    }}>
      <div className="container">
        <div className="grid grid-3">
          <div>
            <h3>InfluencerHub</h3>
            <p>Connecting brands with the right influencers for successful collaborations.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a></li>
              <li><a href="/influencers" style={{ color: 'white', textDecoration: 'none' }}>Find Influencers</a></li>
              <li><a href="/about" style={{ color: 'white', textDecoration: 'none' }}>About Us</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <p>Email: info@influencerhub.com</p>
            <p>Phone: +(91) 1234567890</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #34495e' }}>
          <p>&copy; 2024 InfluencerHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;