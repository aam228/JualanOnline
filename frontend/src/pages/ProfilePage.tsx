import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        {user && (
          <div className="profile-info">
            <div className="profile-field">
              <label>Name</label>
              <p>{user.name}</p>
            </div>
            <div className="profile-field">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="profile-field">
              <label>Role</label>
              <p>{user.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            </div>
            {user.createdAt && (
              <div className="profile-field">
                <label>Member Since</label>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
