import { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({ name, email });
      // Persist the updated user in localStorage and refresh the context so the
      // navbar reflects the change immediately.
      localStorage.setItem('user', JSON.stringify(res.data));
      await refreshUser();
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="mt-4" style={{ maxWidth: 640 }}>
      <h2 className="mb-3">My Profile</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col xs={6}>
              <div className="text-muted small">Role</div>
              <Badge bg={user?.role === 'admin' ? 'danger' : 'primary'}>{user?.role}</Badge>
            </Col>
            <Col xs={6}>
              <div className="text-muted small">Account ID</div>
              <code className="small">{user?._id}</code>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h5 className="mb-3">Edit details</h5>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Spinner size="sm" animation="border" /> : 'Save changes'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;
