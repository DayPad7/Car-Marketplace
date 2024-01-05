import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../Firebase.config";
import { toast } from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Category = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] = useState(null);

  const params = useParams();
  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference
        const listingRef = collection(db, "listing");
        // creating a query
        const queryListing = query(
          listingRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        //execute query
        const querySnap = await getDocs(queryListing);
        //variable to get more listing to show -pagination
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchedListing(lastVisible);
        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        console.log("listings: ", listings);
        setLoading(false);
      } catch (error) {
        toast.error("cloud not fetch listings");
      }
    };
    fetchListings();
  }, [params.categoryName]);

  //pagination /load more

  const fetchMoreListings = async () => {
    try {
      // get reference
      const listingRef = collection(db, "listing");
      // creating a query
      const queryListing = query(
        listingRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        //difference/ same function that the lastone in the useEffect
        startAfter(lastFetchedListing),
        limit(10)
      );
      //execute query
      const querySnap = await getDocs(queryListing);
      //variable to get more listing to show -pagination
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchedListing(lastVisible);
      const listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //difference/if we keeped like the original one it would replace the listing
      //with the new one and we jus want to get added to the prev listing
      setListings((prevState) => [...prevState, ...listings]);
      console.log("listings: ", listings);
      setLoading(false);
    } catch (error) {
      toast.error("cloud not fetch listings");
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === "rent" ? "Cars for rent" : "Cars for sale"}
        </p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  listing={listing.data}
                  id={listing.id}
                  key={listing.id}
                />
              ))}
            </ul>
          </main>
          <br />

          {lastFetchedListing && listings.length > 10 && (
            <p className="loadMore" onClick={fetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>No Listings for {params.categoryName}</p>
      )}
    </div>
  );
};

export default Category;
