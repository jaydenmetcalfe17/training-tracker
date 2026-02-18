import "./Header.scss";
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
                        <div className="header-box">
                            <h1>TRAINING TRACKER</h1>
                            <button className="main-button" id="logout-button" onClick={logout}>Logout</button>
                        </div>
                    </Nav>
                ) : (
                    <button className="main-button" id="login-button"><Link to="/login">Login</Link></button>
                )}
            </Container>
        </Navbar>
    )
}

export default Header