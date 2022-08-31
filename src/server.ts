import express from 'express';
import bodyParser from 'body-parser';
import multer from "multer";
import path from "path";
import {
  deleteLocalFiles,
  fileFilter,
  filterImageFromURL,
  getTempFiles,
  imageExists,
  isRealFileExt,
  storage,
} from "./util/util";

const appRoot = require("app-root-path");

const upload = multer({ storage, fileFilter });

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

    /* Get public image, filter, store locally */
    app.get("/filteredimage", async (req, res) => {
      let isImage;
      let filteredImagePath;
      try {
        isImage = await imageExists(req.query.image_url);
  
        if (isImage) {
          filteredImagePath = await filterImageFromURL(req.query.image_url);
          res.status(200).sendFile(filteredImagePath);
        } else {
          return res.status(415).send(" Unsupported Media/Image Type. Try again with suppoted image");
        }
      } catch (e) {
        res.status(400).send(e);
      }
    });
  
    // upload validated image files
    app.post("/filter-image", upload.single("file"), async (req, res) => {
      if (!req.file || !isRealFileExt(path.extname(req.file.originalname))) {
        return res
          .status(422)
          .contentType("text/plain")
          .end("This image is not supported. Could not process your request try again");
      }
  
      const filteredImagePath = await filterImageFromURL(
        path.join(appRoot.path, req.file.path)
      );
      res.status(200).sendFile(filteredImagePath);
    });
  
    // Delete stores image files on the server
    app.post("/delete-files", async (request, res) => {
      deleteLocalFiles(getTempFiles());
      res.status(200).send("All stored files have been deleted successfully");
    });

    /* How to use end point. */
  app.get("/", async (req, res) => {
    res.send(
      "To filter a public image, add the following to your URL with the image url: /filteredimage?image_url={{}}"
    );
  });


  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();