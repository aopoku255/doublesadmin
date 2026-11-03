import React, { useEffect, useRef, useState } from "react";
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";
import { Input } from "reactstrap";
import { google } from "../../config";

const LIBRARIES = ["places"];

// People can still type a place Google doesn't know, so the box never blocks saving.
const LocationInput = ({ value, onChange }) => {
  const searchBox = useRef(null);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: google.API_KEY,
    libraries: LIBRARIES,
  });

  const [rejected, setRejected] = useState(false);

  // Google disables the box when it refuses the key, which would block typing too.
  useEffect(() => {
    window.gm_authFailure = () => setRejected(true);
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  const handlePlaceChosen = () => {
    const place = searchBox.current?.getPlaces()?.[0];
    if (!place) return;

    const { name, formatted_address: address } = place;
    // Address strings often already start with the place name.
    onChange(address?.startsWith(name) ? address : [name, address].filter(Boolean).join(", "));
  };

  const input = (
    <Input
      placeholder="Search for the event location"
      name="location"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  if (!isLoaded || rejected) return input;

  return (
    <StandaloneSearchBox
      onLoad={(box) => {
        searchBox.current = box;
      }}
      onPlacesChanged={handlePlaceChosen}
    >
      {input}
    </StandaloneSearchBox>
  );
};

export default LocationInput;
