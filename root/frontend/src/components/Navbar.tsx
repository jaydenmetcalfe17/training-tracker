
interface NavbarProps {
  user: { userFirstName: string } | null; 
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, logout }) => {
  

    return (
        <nav>
            {user ? (
                <>
                    <span>Welcome, {user.userFirstName}</span>
                    <button onClick={logout}>Logout</button>
                </>
            ) : (
                <a href="/login">Login</a>
            )}
        </nav>
    )
}

export default Navbar