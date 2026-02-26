import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000", // The base URL of your auth server
});

// export const authClient = {
//   signIn: {
//     email: async ({ email, password }: { email: string; password: string }) => {
//       if (email === 'admin@example.com' && password === 'password') {
//         return { data: { user: { email, name: 'Admin' } }, error: null }
//       }
//       return { data: null, error: { message: 'Invalid credentials' } }
//     },
//   },
// }
