import { Link } from "react-router-dom";
import rentCategoryImage from "../assets/jpg/CarForSale.webp";
import sellCategoryImage from "../assets/jpg/CarRental.webp";
import HomeSlider from "../components/HomeSlider";

function explore() {
  return (
    <div className="explore">
      <header>
        <p className="pageHeader"> Explore</p>
      </header>

      <main>
        <p className="exploreCategoryHeading"> Categories</p>
        <div className="exploreCategories">
          <Link to="/category/rent">
            <img
              src={rentCategoryImage}
              alt="Rent Category"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Cars for rent</p>
          </Link>{" "}
          <Link to="/category/sale">
            <img
              src={sellCategoryImage}
              alt="Rent Category"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Cars For Sale</p>
          </Link>{" "}
        </div>

        <HomeSlider />
      </main>
    </div>
  );
}

export default explore;
