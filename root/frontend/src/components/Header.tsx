import { Link } from "react-router-dom";
import {Nav, Container, Navbar} from 'react-bootstrap';

interface HeaderProps {
  user: { userFirstName: string } | null; 
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, logout }) => {

    return (
        <Navbar>
            <Container>
                {user ? (
                    <Nav>
                        <p>Welcome, {user.userFirstName}</p>
                        <button onClick={logout}>Logout</button>
                    </Nav>
                ) : (
                    <Link to="/login">Login</Link>
                )}
            </Container>
        </Navbar>
    )
}

export default Header