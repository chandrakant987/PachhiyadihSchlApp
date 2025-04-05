import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: "du2ex4iuk", // Replace with your Cloudinary cloud name
  }
});

export default cld;
