import { useState, useEffect, useRef } from "react";
import {
  getAuth,
  linkWithPhoneNumber,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase.config";
import { v4 as uuidv4 } from "uuid";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { snapshotEqual } from "firebase/firestore";

function CreateListing() {
  const [loading, setLoading] = useState(false);
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    BackUpCamera: false,
    Bluetooth: false,
    carPlay: false,
    reverseSensor: false,
    touchScreen: false,
    offer: false,
    Radio: false,
    doors: 0,
    seats: 0,
    type: "rent",
    year: 0,
    airbags: false,
    brand: "",
    color: "",
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    aC: false,
    images: {},
  });
  const {
    name,
    address,
    offer,
    seats,
    type,
    year,
    airbags,
    brand,
    color,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
    doors,
    reverseSensor,
    BackUpCamera,
    touchScreen,
    Radio,
    carPlay,
    aC,
    Bluetooth,
  } = formData;
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/sign-in");
        }
      });
    }
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price needs to be less than regular price");
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error("Max 6 images");
      return;
    }
    let geolocation = {};
    let location;
    if (geolocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${
          import.meta.env.VITE_REACT_APP_GEOCODE_API_KEY
        }`
      );
      const data = await response.json();
      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === "ZERO_RESULTS"
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes("undefined")) {
        setLoading(false);
        toast.error("please enter a correct address");
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      location = address;
    }
    // how to storage image in firebase

    const storeImage = async (image) => {
      console.log("storing image");
      console.log(image);
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, "images/" + fileName);

        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            console.log("image promise fullfilled");
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded");
      return;
    });
    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };
    delete formDataCopy.images;
    delete formDataCopy.address;
    location && (formDataCopy.location = location);
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    const docRef = await addDoc(collection(db, "listing"), formDataCopy);

    setLoading(false);
    toast.success("Listing saved");
    console.log("done 23");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };
  const onMutate = (e) => {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    // text,booleans, numbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };
  if (loading) {
    return <Spinner />;
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader"> Create a Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel"> Sale or Rent </label>
          <div className="formButtons">
            <button
              type="button"
              className={type === "sale" ? "formButtonActive" : "formButton"}
              id="type"
              value="sale"
              onClick={onMutate}
            >
              sale
            </button>
            <button
              type="button"
              className={type === "rent" ? "formButtonActive" : "formButton"}
              id="type"
              value="rent"
              onClick={onMutate}
            >
              rent
            </button>
          </div>
          <label className="formLabel">Description</label>
          <input
            className="formInputName"
            type="text"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength="32"
            minLength="10"
            required
          />
          <label className="formLabel">Car Model</label>
          <input
            className="formInputName"
            type="text"
            id="brand"
            value={brand}
            onChange={onMutate}
            maxLength="20"
            minLength="8"
            required
          />
          <label className="formLabel">Color</label>
          <input
            className="formInputName"
            type="text"
            id="color"
            value={color}
            onChange={onMutate}
            maxLength="10"
            minLength="3"
            required
          />
          <div>
            <label className="formLabel"> Year </label>{" "}
            <p className="imagesInfo"> (min 2010). </p>
            {/* INVESTIGAR COMO HACER UN LABEL QUE HAGA UN DROPLIST DE AÑO EN REACT */}
            <input
              className="formInputSmall"
              type="number"
              id="year"
              value={year}
              onChange={onMutate}
              min="2010"
              required
            />
          </div>
          <label className="formLabel"> A/C</label>
          <div className="formButtons">
            <button
              className={aC ? "formButtonActive" : "formButton"}
              type="button"
              id="aC"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={!aC && aC !== null ? "formButtonActive" : "formButton"}
              type="button"
              id="aC"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <div className="formRooms flex">
            {" "}
            {/* Cambiar nombre de classname en css y aca  */}
            <div>
              <label className="formLabel"> seats</label>
              <input
                className="formInputSmall"
                type="number"
                id="seats"
                value={seats}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
            <div>
              <label className="formLabel"> doors</label>{" "}
              <input
                className="formInputSmall"
                type="number"
                id="doors"
                value={doors}
                onChange={onMutate}
                min="1"
                max="50"
                required
              />
            </div>
          </div>

          <label className="formLabel"> Air bags</label>
          <div className="formButtons">
            <button
              className={airbags ? "formButtonActive" : "formButton"}
              type="button"
              id="airbags"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !airbags && airbags !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="airbags"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel"> Reverse Sensor</label>
          <div className="formButtons">
            <button
              className={reverseSensor ? "formButtonActive" : "formButton"}
              type="button"
              id="reverseSensor"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !reverseSensor && reverseSensor !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="reverseSensor"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel"> Back Up Camera</label>
          <div className="formButtons">
            <button
              className={BackUpCamera ? "formButtonActive" : "formButton"}
              type="button"
              id="BackUpCamera"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !BackUpCamera && BackUpCamera !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="BackUpCamera"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <h4> Media / Audio</h4>

          <label className="formLabel"> Bluetooth</label>
          <div className="formButtons">
            <button
              className={Bluetooth ? "formButtonActive" : "formButton"}
              type="button"
              id="Bluetooth"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !Bluetooth && Bluetooth !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="Bluetooth"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel"> Touch Screen</label>
          <div className="formButtons">
            <button
              className={touchScreen ? "formButtonActive" : "formButton"}
              type="button"
              id="touchScreen"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !touchScreen && touchScreen !== null
                  ? "formButtonActive"
                  : "formButton"
              }
              type="button"
              id="touchScreen"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel"> Radio</label>
          <div className="formButtons">
            <button
              className={Radio ? "formButtonActive" : "formButton"}
              type="button"
              id="Radio"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !Radio && Radio !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="Radio"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel"> Car Play</label>
          <div className="formButtons">
            <button
              className={carPlay ? "formButtonActive" : "formButton"}
              type="button"
              id="carPlay"
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !carPlay && carPlay !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="carPlay"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel"> Address</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="address"
            value={address}
            onChange={onMutate}
            required
          />

          {!geolocationEnabled && (
            <div className="formLatLng flex">
              <div>
                <label className="formLabel"> Latitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="latitude"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel"> Longitude</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="longitude"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel"> Offer</label>
          <div className="formButtons">
            <button
              className={offer ? "formButtonActive" : "formButton"}
              type="button"
              id="offer"
              value={true}
              onClick={onMutate}
              min="1"
              max="50"
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? "formButtonActive" : "formButton"
              }
              type="button"
              id="offer"
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className="formLabel"> Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="75000000"
              required
            />
            {type === "rent" && <p className="formPriceText">$ / Day </p>}
          </div>

          {offer && (
            <>
              <label className="formLabel"> Discounted price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="1"
                max="75000000"
                required={offer}
              />
            </>
          )}
          <label className="formLabel"> Images</label>
          <p className="imagesInfo">
            {" "}
            The firs image will be the cover (max 6).{" "}
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg, .png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            {" "}
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
