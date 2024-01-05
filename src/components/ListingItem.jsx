import { Link } from "react-router-dom";
import DeleteIcon from "../assets/svg/deleteIcon.svg?react";
import EditIcon from "../assets/svg/editIcon.svg?react";
import SeatIcon from "../assets/svg/CarSeats.svg";
import DoorIcon from "../assets/svg/DoorIcon.svg";
import YearIcon from "../assets/svg/YearIcon.svg";

function ListingItem({ listing, id, onDelete, onEdit }) {
  return (
    <li className="categoryListing">
      <Link
        to={`/category/${listing.type}/${id}`}
        className="categoryListingLink"
      >
        <img
          src={listing.imgUrls[0]}
          alt={listing.name}
          className="categoryListingImg"
        />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation"> {listing.location}</p>
          <p className="categoryListingName"> {listing.name}</p>
          <p className="categoryListingPrice">
            $
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            {listing.type === "rent" && "  / Day"}
          </p>
          <div className="categoryListingInfoDiv">
            <div className="divIconInfo">
              <img src={SeatIcon} alt="seats" />{" "}
              <p className="categoryListingInfoText">
                {listing.seats > 1 ? `${listing.seats} Seats` : "1 seat"}{" "}
                {/* cambiar esto con una condicional booleana sobre A/C o family car algo asi  */}
              </p>
            </div>
            <div className="divIconInfo">
              <img src={DoorIcon} alt="doors" />
              <p className="categoryListingInfoText">
                {listing.doors > 1 ? `${listing.doors} doors` : "1 door"}{" "}
                {/* cambiar esto con una condicional booleana sobre A/C o family car algo asi  */}
              </p>
            </div>
            <div className="divIconInfo">
              <img src={YearIcon} alt="Year" />{" "}
              <p className="categoryListingInfoText"> {listing.year}</p>
            </div>
          </div>
        </div>
      </Link>
      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231,76,60)"
          onClick={() => onDelete(listing.id, listing.name)}
        />
      )}
      {onEdit && <EditIcon className="editIcon" onClick={() => onEdit(id)} />}
    </li>
  );
}

export default ListingItem;
