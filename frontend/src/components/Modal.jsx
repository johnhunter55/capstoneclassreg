import { useState, useEffect } from "react";
import { BsFillPencilFill, BsFillXCircleFill } from "react-icons/bs";

const ProfileField = ({
  label,
  name,
  value,
  edit,
  onChange,
  type = "text",
}) => (
  <div className="flex items-center mt-2">
    <h1 className="text-xl text-white w-28 shrink-0">{label}:</h1>
    {edit ? (
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className="ml-2 rounded bg-rose-900/50 p-1 text-white font-thin text-lg w-full focus:outline-none focus:ring-2 focus:ring-rose-400"
      />
    ) : (
      <p className="text-xl pl-2 text-white font-thin">{value || "Add"}</p>
    )}
  </div>
);

export function Modal({ onClose }) {
  const [edit, setEdit] = useState(false);

  // Start with empty strings to prevent errors before the data loads
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Pull the data from localStorage when the modal opens
  // Pull the data from localStorage when the modal opens
  useEffect(() => {
    const storedUserString = localStorage.getItem("user");

    // Check that it exists AND is not the literal string "undefined"
    if (storedUserString && storedUserString !== "undefined") {
      try {
        const storedUser = JSON.parse(storedUserString);

        // Format the address object into a readable string if it exists
        let formattedAddress = "";
        if (storedUser.address && storedUser.address.street) {
          formattedAddress = `${storedUser.address.street}, ${storedUser.address.city}, ${storedUser.address.state} ${storedUser.address.zipCode || ""}`;
        }

        setUserData({
          name: storedUser.name || "",
          email: storedUser.email || "",
          phone: storedUser.phoneNumber || "",
          address: formattedAddress,
        });
      } catch (error) {
        // If the JSON is broken, log the error and clear the bad data so it doesn't crash again
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="absolute w-96 bg-rose-800 p-4 rounded-2xl shadow-lg flex gap-2 flex-col mt-2 ml-2 z-50">
      <div className="flex items-center w-full pb-2">
        <h1 className="text-2xl text-white font-mono">Profile info</h1>
        <div className="flex gap-4 justify-end grow">
          <BsFillPencilFill
            onClick={() => setEdit(!edit)}
            className="text-white text-xl cursor-pointer hover:text-gray-200"
          />
          <BsFillXCircleFill
            onClick={onClose}
            className="text-white text-xl cursor-pointer hover:text-gray-200"
          />
        </div>
      </div>

      {/* Updated to match your database schema */}
      <ProfileField
        label="Name"
        name="name"
        value={userData.name}
        edit={edit}
        onChange={handleChange}
      />
      <ProfileField
        label="Email"
        name="email"
        value={userData.email}
        edit={edit}
        onChange={handleChange}
        type="email"
      />
      <ProfileField
        label="Phone"
        name="phone"
        value={userData.phone}
        edit={edit}
        onChange={handleChange}
        type="tel"
      />
      <ProfileField
        label="Address"
        name="address"
        value={userData.address}
        edit={edit}
        onChange={handleChange}
      />
    </div>
  );
}
