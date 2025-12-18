import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'influencer',
    // Common fields
    name: '',
    contactEmail: '',
    // Influencer fields
    bio: '',
    platform: 'instagram',
    followersCount: '',
    category: 'fashion',
    audienceGender: 'mixed',
    audienceAgeRange: '',
    audienceCountry: '',
    // Social Media URLs
    instagramUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    // Company fields
    companyName: '',
    industry: '',
    description: '',
    contactPerson: '',
    website: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const isInfluencer = formData.role === 'influencer';

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '40px auto' }}>
      <div className="card">
        <h2 className="text-center">Create Your Account</h2>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I am a:</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="influencer">Influencer</option>
              <option value="company">Company/Brand</option>
            </select>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          {isInfluencer ? (
            <>
              <h3 style={{ margin: '30px 0 20px 0', paddingBottom: '10px', borderBottom: '2px solid #007bff' }}>
                Influencer Information
              </h3>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Primary Platform *</label>
                  <select
                    name="platform"
                    className="form-select"
                    value={formData.platform}
                    onChange={handleChange}
                    required
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Bio/Description</label>
                <textarea
                  name="bio"
                  className="form-control"
                  rows="3"
                  placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-3">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="fashion">Fashion</option>
                    <option value="fitness">Fitness</option>
                    <option value="tech">Tech</option>
                    <option value="travel">Travel</option>
                    <option value="gaming">Gaming</option>
                    <option value="food">Food</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="beauty">Beauty</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Followers Count *</label>
                  <input
                    type="number"
                    name="followersCount"
                    className="form-control"
                    placeholder="50000"
                    value={formData.followersCount}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-control"
                    placeholder="for collaboration inquiries"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h4 style={{ margin: '25px 0 15px 0' }}>Audience Demographics</h4>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Primary Audience Gender</label>
                  <select
                    name="audienceGender"
                    className="form-select"
                    value={formData.audienceGender}
                    onChange={handleChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Audience Age Range</label>
                  <input
                    type="text"
                    name="audienceAgeRange"
                    className="form-control"
                    placeholder="18-35"
                    value={formData.audienceAgeRange}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Primary Audience Country</label>
                  <input
                    type="text"
                    name="audienceCountry"
                    className="form-control"
                    placeholder="USA, India, etc."
                    value={formData.audienceCountry}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <h4 style={{ margin: '25px 0 15px 0' }}>Social Media Profiles</h4>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    name="instagramUrl"
                    className="form-control"
                    placeholder="https://instagram.com/yourusername"
                    value={formData.instagramUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>YouTube URL</label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    className="form-control"
                    placeholder="https://youtube.com/c/yourchannel"
                    value={formData.youtubeUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>TikTok URL</label>
                  <input
                    type="url"
                    name="tiktokUrl"
                    className="form-control"
                    placeholder="https://tiktok.com/@yourusername"
                    value={formData.tiktokUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Twitter URL</label>
                  <input
                    type="url"
                    name="twitterUrl"
                    className="form-control"
                    placeholder="https://twitter.com/yourusername"
                    value={formData.twitterUrl}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>LinkedIn URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    className="form-control"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ margin: '30px 0 20px 0', paddingBottom: '10px', borderBottom: '2px solid #007bff' }}>
                Company Information
              </h3>

              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-control"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    name="industry"
                    className="form-control"
                    placeholder="Fashion, Tech, Food, etc."
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    className="form-control"
                    placeholder="https://yourcompany.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows="3"
                  placeholder="Tell influencers about your brand, products, and collaboration opportunities..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    className="form-control"
                    placeholder="Name of the person to contact"
                    value={formData.contactPerson}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-control"
                    placeholder="for influencer inquiries"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '20px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-2">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;