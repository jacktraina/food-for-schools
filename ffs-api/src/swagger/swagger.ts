import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import fs from "fs";

// const swaggerOptions: swaggerJSDoc.Options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Your API",
//       version: "1.0.0",
//       description: "API documentation",
//     },
//     servers: [
//       {
//         url: `http://localhost:${config.port}`, // change port/path as needed
//       },
//     ],
//   },
//   apis: [path.join(__dirname, './interfaces/controllers/*.js')], // when running from dist/
// };

// const swaggerSpec = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app: Express) {
  const swaggerPath = path.join(__dirname, "swagger.json");
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
