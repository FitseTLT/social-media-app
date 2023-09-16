import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import ssl from "@vitejs/plugin-basic-ssl";

// https://vitejs.dev/config/
// export default defineConfig({
//     plugins: [react()],
//     server: {
//         proxy: {
//             "/api/login": {
//                 target: "http://localhost:4000",
//                 changeOrigin: true,
//             },
//             "/api/signup": {
//                 target: "http://localhost:4000",
//                 changeOrigin: true,
//             },
//             "/graphql": {
//                 target: "http://localhost:4000",
//                 changeOrigin: true,
//             },
//             "/api/logout": {
//                 target: "http://localhost:4000",
//                 changeOrigin: true,
//             },
//         },
//     },
// });

export default defineConfig({
  plugins: [react()],
  server: {
    // https: true,
    // https: https.createServer({
    //     key: fs.readFileSync("./key.pem"),
    //     cert: fs.readFileSync("./cert.pem"),
    // }),
    proxy: {
      "/api/login": {
        target: "http://localhost:4000",
      },
      "/api/signup": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/graphql": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api/logout": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
