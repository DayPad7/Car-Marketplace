import { useNavigate, useLocation } from "react-router-dom";
import OfferIcon from "../assets/svg/localOfferIcon.svg?react";
import ExploreIcon from "../assets/svg/exploreIcon.svg?react";
import PersonOutlineIcon from "../assets/svg/PersonOutlineIcon.svg?react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathMatchRoute = (route) => {
    if (route === location.pathname) {
      return true;
    }
  };
  return (
    <footer className="navbar">
      <nav className="navbarNav">
        <ul className="navbarListItems">
          <li className="navbarListItem" onClick={() => navigate("/")}>
            <ExploreIcon
              fill={pathMatchRoute("/") ? "rgb(240, 83, 252)" : "#8f8f8f"}
              width="36px"
              height="36px"
            />
            <p
              className={
                pathMatchRoute("/")
                  ? "navbarListItemNameActive"
                  : "navbarListItemName"
              }
            >
              Explore
            </p>
          </li>
          <li className="navbarListItem" onClick={() => navigate("/offers")}>
            <OfferIcon
              fill={pathMatchRoute("/offers") ? "rgb(240, 83, 252)" : "#8f8f8f"}
              width="36px"
              height="36px"
            />
            <p
              className={
                pathMatchRoute("/offers")
                  ? "navbarListItemNameActive"
                  : "navbarListItemName"
              }
            >
              Offers
            </p>
          </li>
          <li className="navbarListItem" onClick={() => navigate("/profile")}>
            <PersonOutlineIcon
              fill={
                pathMatchRoute("/profile") ? "rgb(240, 83, 252)" : "#8f8f8f"
              }
              width="36px"
              height="36px"
            />
            <p
              className={
                pathMatchRoute("/profile")
                  ? "navbarListItemNameActive"
                  : "navbarListItemName"
              }
            >
              {" "}
              Profile
            </p>
          </li>
        </ul>
      </nav>
    </footer>
  );
}

export default Navbar;