import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBoxes, FaCalendarCheck, FaUserShield } from 'react-icons/fa';

const Home = () => {
  const { user, isAdmin } = useAuth();

  return (
    <>
      <div className="hero-section text-white text-center py-5">
        <Container>
          <h1 className="display-4 fw-bold">Event Equipment Rental System</h1>
          <p className="lead mt-3">
            Rent professional equipment for your events — speakers, lighting, furniture, and more.
          </p>
          {!user ? (
            <div className="mt-4">
              <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
                Get Started
              </Button>
              <Button as={Link} to="/login" variant="outline-light" size="lg">
                Login
              </Button>
            </div>
          ) : (
            <div className="mt-4">
              <Button
                as={Link}
                to={isAdmin ? '/admin/dashboard' : '/equipment'}
                variant="light"
                size="lg"
              >
                Go to {isAdmin ? 'Dashboard' : 'Equipment'}
              </Button>
            </div>
          )}
        </Container>
      </div>

      <Container className="py-5">
        <h2 className="text-center mb-4">What We Offer</h2>
        <Row className="g-4">
          <Col xs={12} md={4}>
            <Card className="h-100 text-center shadow-sm hover-card">
              <Card.Body>
                <FaBoxes size={48} className="text-primary mb-3" />
                <Card.Title>Browse Equipment</Card.Title>
                <Card.Text>
                  Explore our wide range of event equipment across audio, lighting, furniture,
                  structures, visual, and decor categories.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="h-100 text-center shadow-sm hover-card">
              <Card.Body>
                <FaCalendarCheck size={48} className="text-success mb-3" />
                <Card.Title>Easy Booking</Card.Title>
                <Card.Text>
                  Book equipment in just a few clicks. Choose your dates, quantity, and submit your
                  rental request instantly.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card className="h-100 text-center shadow-sm hover-card">
              <Card.Body>
                <FaUserShield size={48} className="text-info mb-3" />
                <Card.Title>Manage Events</Card.Title>
                <Card.Text>
                  Track your rental history, view statuses, and manage all your event equipment
                  needs from one place.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
