import { useState, useEffect } from "react";
import { BsFillPencilFill, BsFillXCircleFill } from "react-icons/bs";

export function Modal({ onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [userId, setUserId] = useState(""); // <-- ADDED: Track user ID for DB queries
  const [errorMsg, setErrorMsg] = useState(""); // State for error messages

  const [userData, setUserData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
  });

  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    const storedUserString = localStorage.getItem("user");

    if (storedUserString && storedUserString !== "undefined") {
      try {
        const storedUser = JSON.parse(storedUserString);

        setUserId(storedUser.id || ""); // <-- ADDED: Extract and save the user ID
        setUserData({
          username: storedUser.username || "",
          name: storedUser.name || "",
          email: storedUser.email || "",
          phone: storedUser.phoneNumber || "",
        });

        if (storedUser.address) {
          setAddressData({
            street: storedUser.address.street || "",
            city: storedUser.address.city || "",
            state: storedUser.address.state || "",
            zipCode: storedUser.address.zipCode || "",
          });
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData((prev) => ({ ...prev, [name]: value }));
  };

  const getFormattedAddress = () => {
    const { street, city, state, zipCode } = addressData;
    if (!street && !city) return "Add";
    return `${street}, ${city}, ${state} ${zipCode}`.trim();
  };

  // FIXED: Turned into an async function that communicates with MongoDB
  const handleSaveChanges = async () => {
    setErrorMsg("");

    const payload = {
      // userId parameter has been safely removed from client-side visibility!
      username: userData.username,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: {
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zipCode: addressData.zipCode,
      },
    };

    try {
      const response = await fetch("http://localhost:3002/api/auth/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // <-- FIXED: Automatically forwards login cookie back to system
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Overwrite localStorage with the clean, verified data back from MongoDB
        localStorage.setItem("user", JSON.stringify(data.user));

        // 2. Close the editor panel
        setIsEditing(false);

        // 3. Inform the rest of the application (like the Header component) to re-render
        window.dispatchEvent(new Event("storage"));

        // alert("Profile saved to database successfully!"); // Optional: Can be removed for a smoother UX
      } else {
        setErrorMsg(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMsg("Could not connect to the server.");
    }
  };

  return (
    <>
      {/* SIDE VIEW CARD */}
      <div className="absolute w-96 bg-rose-900 p-4 rounded-2xl shadow-lg flex gap-2 flex-col mt-2 ml-2 z-40">
        <div className="flex items-center w-full pb-2 border-b border-rose-700">
          <h1 className="text-2xl text-white font-mono">Profile info</h1>
          <div className="flex gap-4 justify-end grow">
            <BsFillPencilFill
              onClick={() => setIsEditing(true)}
              className="text-white text-xl cursor-pointer hover:text-rose-300 transition-colors"
            />
            <BsFillXCircleFill
              onClick={onClose}
              className="text-white text-xl cursor-pointer hover:text-gray-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-2 text-white">
          <p className="text-lg font-thin">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Name:
            </span>{" "}
            {userData.name || "Add"}
          </p>
          <p className="text-lg font-thin">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Email:
            </span>{" "}
            {userData.email || "Add"}
          </p>
          <p className="text-lg font-thin">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Phone:
            </span>{" "}
            {userData.phone || "Add"}
          </p>
          <p className="text-lg font-thin truncate">
            <span className="font-semibold text-sm uppercase w-24 inline-block text-rose-100">
              Address:
            </span>{" "}
            {getFormattedAddress()}
          </p>
        </div>
      </div>

      {/* CENTERED EDIT MODAL POP-UP OVERLAY */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-rose-900 p-6 rounded-2xl shadow-2xl border border-rose-700 w-full max-w-lg flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-rose-800 pb-3">
              <h2 className="text-2xl text-white font-mono font-bold">
                Edit Profile Dashboard
              </h2>
              <BsFillXCircleFill
                onClick={() => setIsEditing(false)}
                className="text-white text-xl cursor-pointer hover:text-gray-300"
              />
            </div>

            {/* Display Error Message */}
            {errorMsg && (
              <p className="text-red-400 bg-red-950/50 p-3 rounded-lg text-center -mb-1">
                {errorMsg}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={userData.username}
                    onChange={handleUserChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    Full Name
                  </label>
                  <input
                    name="name"
                    value={userData.name}
                    onChange={handleUserChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    Email Address
                  </label>
                  <input
                    name="email"
                    value={userData.email}
                    onChange={handleUserChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    value={userData.phone}
                    onChange={handleUserChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="tel"
                  />
                </div>
              </div>

              <hr className="border-rose-800/60 my-1" />

              <h3 className="text-md font-mono font-semibold text-rose-200 -mb-1">
                Mailing Address Object
              </h3>

              <div>
                <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                  Street Location
                </label>
                <input
                  name="street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                  className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                  type="text"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1.5">
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    State
                  </label>
                  <input
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="text"
                    placeholder="UT"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-300 tracking-wider uppercase block mb-1">
                    Zip Code
                  </label>
                  <input
                    name="zipCode"
                    value={addressData.zipCode}
                    onChange={handleAddressChange}
                    className="w-full rounded-xl bg-rose-950/60 p-2 text-white outline-none focus:ring-2 focus:ring-rose-400"
                    type="text"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-4 pt-3 border-t border-rose-800">
              <button
                onClick={() => setIsEditing(false)}
                type="button"
                className="px-4 py-2 rounded-xl text-rose-200 hover:bg-rose-950/40 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                type="button"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
