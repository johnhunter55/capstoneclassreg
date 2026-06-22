import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";

opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretKey: process.env.JWT_SECRET,
};

export const applyPassportStrategy = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        // jwt_payload contains the user data we encrypted inside the token (like id)
        const user = await User.findById(jwt_payload.id);

        if (user) {
          return done(null, user); // Success! Passport attaches this user to req.user
        }
        return done(null, false); // User not found in DB
      } catch (error) {
        return done(error, false); // Error occurred
      }
    }),
  );
};
