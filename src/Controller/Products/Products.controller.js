



import { Server_500, OK_200, NotFound_404, Found_422, Unauthorized_401, Forbiden_403, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { searchProducts, Middle_DeleteProducts } from "./Middleware.product.js";
import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp'
import { AuthVerifyAdmin } from "../../Middleware/verifyToken.js";


const All_Products = async (req, res) => {

     try {
          const size = 20;
          const { page } = req.query;
          if (isNaN(page)) {
               return Unauthorized_401(res, 'Please input page number')
          }
          const offset = (page - 1) * size;

          const totalProducts = await query.Products.count();
          const totalPages = Math.ceil(totalProducts / size)

          const data = await query.Products.findAll({
               limit: size,
               offset: offset,
          })
          if (data.length === 0) return NotFound_404(res, 'Product not found')

          const results = {
               totalProducts,
               totalPages,
               currentPage: +page,
               products: data
          }
          return OK_200(res, results, `Current Page: ${page}`)

     } catch (error) {
          Server_500(res, error)
     }
}


const get_Products_byID = async (req, res) => {
     try {
          const { id } = req.query;
          if (!id) return Response_General(res, 400, 'Product ID must required')

          const results = await query.Products.findOne({
               where: { product_id: id }
          })
          if (!results) return NotFound_404(res, 'Product not found')
          return OK_200(res, results, `Product: ${results.product_name}`)
     } catch (error) {
          return Server_500(res, error)
     }
}


const getProductsByCategory = async (req, res) => {
     try {
          const { categories_ID } = req.query;
          if (!categories_ID) return Response_General(res, 400, 'Category must required')

          const checkCategory = await query.Categories.findOne({
               where: { category_id: categories_ID }
          })
          if (!checkCategory) return NotFound_404(res, 'Category not found')

          const results = await query.Products.findAll({
               where: { category_id: categories_ID }
          })
          if (!results) return NotFound_404(res, 'Product not found')
          return OK_200(res, results, `Get success`)
     } catch (error) {
          return Server_500(res, error)
     }
}

const search_Products = async (req, res) => {

     try {
          const { name, searchBy, fromPrice, toPrice } = req.query;
          if (!name) {
               return Response_General(res, 400, "Search is required")
          }

          const results = await searchProducts(name, searchBy, fromPrice, toPrice)
          if (results.length > 0) {
               return OK_200(res, results, 'Search success !!!')
          }
          return NotFound_404(res, "Product not found")

     } catch (error) {
          Server_500(res, error)
     }

}


const del_Products = async (req, res) => {

     try {
          const { id } = req.query;
          if (!id) return Response_General(res, 400, 'Product ID must required')

          const checkProduct = await query.Products.findOne({ where: { product_id: id } })
          if (!checkProduct) return NotFound_404(res, 'Product not found')

          await Middle_DeleteProducts(id)
          return Response_General(res, 200, `Delete Success Products: ${checkProduct.product_name}`)

     } catch (error) {
          Server_500(res, error)
     }

}


const add_Products = async (req, res) => {

     try {
          const file = req.file;
          const { product_name, desc, price, quality_stock, categories_ID } = req.body;
          if (!product_name || !desc || !price || !quality_stock || !categories_ID) return Response_General(res, 400, 'Please fill all fields')
          const checkCategory = await query.Categories.findOne({
               where: { category_id: categories_ID }
          })
          if (!checkCategory) return NotFound_404(res, 'Category not found')

          if (!file) return Response_General(res, 400, 'Please select an image')
          if (file.size > 1024 * 1024 * 7) return Found_422(res, 'Image size too large. Please select an image less than 7MB')
          if (!file.mimetype.startsWith("image/")) return Found_422(res, 'Just allow upload image file')
          if (file.length > 1) return Found_422(res, 'Just allow upload 1 image file')

          const { mimetype, buffer } = file
          const imageSharp = await sharp(buffer)
               .jpeg({ quality: 75 })
               .toBuffer()
          // Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
          const s3Client = new S3Client({
               endpoint: "https://sgp1.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
               forcePathStyle: false, // Configures to use subdomain/virtual calling format.
               region: "sgp1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
               credentials: {
                    accessKeyId: "DO00Q9V7XF9KWJLL3EM2", // Access key pair. You can create access key pairs using the control panel or API.
                    secretAccessKey: process.env.SPACES_SECRET // Secret access key defined through an environment variable.
               }
          });

          // Step 3: Define the parameters for the object you want to upload.
          const params = {
               Bucket: "ecommerces", // The path to the directory you want to upload the object to, starting with your Space name.
               Key: "img/" + new Date().getTime() + mimetype.substring(mimetype.lastIndexOf("/")).replace("/", "."), // Object key, referenced whenever you want to access this file later.
               Body: imageSharp, // The object's contents. This variable is an object, not a string.
               ACL: "public-read-write", // Defines ACL permissions, such as private or public.
               ContentType: mimetype
          };

          const { data } = req.user;
          const { user_id } = data

          const dataSpaces = new PutObjectCommand(params);
          await s3Client.send(dataSpaces)
          const downloadURL = "https://ecommerces.sgp1.digitaloceanspaces.com" + params.Key;

          const checkAdmin = await query.USER.findOne({ where: { user_id } })
          if (!checkAdmin) return NotFound_404(res, 'Admin not found')

          const addProduct = await query.Products.create({
               product_name,
               desc,
               price,
               quality_stock,
               category_id: checkCategory.category_id,
               img: downloadURL,
               addByUser: checkAdmin.user_id
          })

          return OK_200(res, addProduct, `Add success Product: ${product_name}`)

     } catch (error) {
          Server_500(res, error)
     }
}


const edit_Products = async (req, res) => {

     try {
          const { data } = req.user;
          const { user_id } = data

          const { id } = req.query
          const { product_name, price, desc, quality_stock, category_id } = req.body
          if (!id) return Response_General(res, 400, 'Product ID must required')
          if (category_id) {
               const checkCategory = await query.Categories.findOne({ where: { category_id: category_id } })
               if (!checkCategory) return NotFound_404(res, 'Categories ID not found')
          }

          if (!product_name && !price && !desc && !quality_stock && !category_id) return Response_General(res, 400, 'At least one field must required')

          const file = req.file;
          const updateData = {
               product_name,
               price,
               desc,
               quality_stock,
               category_id,
               addByUser: user_id
          }
          if (!file || file.length === 0) {
               const updateProduct = await query.Products.update({
                    ...updateData
               }, { where: { product_id: id } })
               return OK_200(res, updateProduct, "Update success")
          }

          const { mimetype, buffer } = file
          const imageSharp = await sharp(buffer)
               .jpeg({ quality: 75 })
               .toBuffer()
          // Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
          const s3Client = new S3Client({
               endpoint: "https://sgp1.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
               forcePathStyle: false, // Configures to use subdomain/virtual calling format.
               region: "sgp1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
               credentials: {
                    accessKeyId: "DO00Q9V7XF9KWJLL3EM2", // Access key pair. You can create access key pairs using the control panel or API.
                    secretAccessKey: process.env.SPACES_SECRET // Secret access key defined through an environment variable.
               }
          });

          // Step 3: Define the parameters for the object you want to upload.
          const params = {
               Bucket: "ecommerces", // The path to the directory you want to upload the object to, starting with your Space name.
               Key: "img/" + new Date().getTime() + mimetype.substring(mimetype.lastIndexOf("/")).replace("/", "."), // Object key, referenced whenever you want to access this file later.
               Body: imageSharp, // The object's contents. This variable is an object, not a string.
               ACL: "public-read-write", // Defines ACL permissions, such as private or public.
               ContentType: mimetype
          };
          const existingProduct = await query.Products.findOne({
               where: { product_id: id }
          })
          if (existingProduct.img) {
               const oldImageKey = existingProduct.img.substring(existingProduct.img.lastIndexOf("/")).replace("/", "");
               const deleteParams = {
                    Bucket: "ecommerces",
                    Key: "img/" + oldImageKey
               };
               await s3Client.send(new DeleteObjectCommand(deleteParams));
          }
          const dataSpaces = new PutObjectCommand(params);
          await s3Client.send(dataSpaces)
          const downloadURL = "https://ecommerces.sgp1.digitaloceanspaces.com" + params.Key;

          const updateProduct = await query.Products.update({ ...updateData, img: downloadURL }, {
               where: { product_id: id }
          });
          return OK_200(res, updateProduct, 'Update full success')


     } catch (error) {
          Server_500(res, error)
     }
}


export {
     All_Products,
     search_Products,
     edit_Products,
     del_Products,
     add_Products,
     get_Products_byID,
     getProductsByCategory,

}