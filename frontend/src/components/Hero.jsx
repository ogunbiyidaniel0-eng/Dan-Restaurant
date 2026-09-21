import "./Hero.css";
function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-eyebrow">WELCOME TO DAN RESTAURANT</p>

        <h1>
          Good food.
          <br />
          Great moments.
        </h1>

        <p className="hero-description">
          Experience delicious meals crafted with passion at Dan Restaurant.
        </p>

        <button className="hero-button">
          Order Now
        </button>
      </div>
    </section>
  );
}

export default Hero;