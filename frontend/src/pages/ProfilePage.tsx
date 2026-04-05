import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        
        <h1>My Profile</h1>

        {user && (
          <>
            {/* Avatar */}
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {/* Profile Info */}
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
                  <p>{formatDate(user.createdAt)}</p>
                </div>
              )}

            </div>

            {/* Actions */}
            <div className="profile-actions">
              <button className="btn-edit-profile">
                Edit Profile
              </button>

              <button className="btn-logout">
                Logout
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;