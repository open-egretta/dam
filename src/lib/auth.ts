import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/lib/db";

export const auth = betterAuth({
  //...your config
  database: db,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [tanstackStartCookies()], // make sure this is the last plugin in the array
});
