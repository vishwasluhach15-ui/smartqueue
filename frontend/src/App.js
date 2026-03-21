import "./index.css";

function App() {
  return (
    <div>
      {/* Navbar */}
      <header className="navbar">
        <h1>Vishu</h1>
        <nav>
          <a href="#home">Home</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <h2>Hi, I'm <span>Vishu</span></h2>
        <p>Frontend Developer | Cyber Security Enthusiast</p>
        <button>Explore</button>
      </section>

      {/* Projects */}
      <section id="projects" className="section">
        <h2>Projects</h2>
        <div className="cards">
          <div className="card">Project 1</div>
          <div className="card">Project 2</div>
          <div className="card">Project 3</div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section">
        <h2>Contact</h2>
        <p>Email: your@email.com</p>
      </section>
    </div>
  );
}

export default App;