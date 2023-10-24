



import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";


const create_categories = async (req, res) => {

     try {
          const { name } = req.body;
          if (!name) return NotFound_404(res, 'Please input a category product')
          const checkCategories = await query.Categories.findOne({
               where: { category_name: name }
          })
          if (checkCategories)
               return Found_422(res, 'Category already exists !!!')
          const create = await query.Categories.create({
               category_name: name,
          })
          return OK_200(res, create, 'Create success')

     } catch (error) {
          return Server_500(res, error.messsage)
     }
}

const get_categoriesID = async (req, res) => {

     try {
          const { id } = req.query;
          if (!id) return Response_General(res, 401, "Categories ID must include")
          const checkCategoires = await query.Categories.findOne({
               where: { category_id: id },
               // include: [
               //      {
               //           model: query.Products,
               //           as: "Products"
               //      }
               // ]
          })
          if (!checkCategoires) return NotFound_404(res, "Categories not found")
          return OK_200(res, checkCategoires, `Success: ${checkCategoires.category_name}`)

     } catch (error) {
          return Server_500(res, error.messsage)
     }

}


const edit_Categories = async (req, res) => {

     try {
          const { id } = req.query;
          const { name } = req.body;
          if (!id) return Response_General(res, 401, 'Categories ID must required')
          const checkCate = await query.Categories.findOne({
               where: { category_id: id }
          })
          const checkCateName = await query.Categories.findOne({
               where: { category_name: name }
          })
          if (!checkCate) return NotFound_404(res, 'Categories not found')
          if (name === checkCateName?.category_name) return Forbiden_403(res, 'Categories already exists !!!')
          await checkCate.update({
               category_name: name,
          })
          return OK_200(res, "Update success")

     } catch (error) {
          return Server_500(res, error)
     }
}


const All_categories = async (req, res) => {

     try {
          const All_categories = await query.Categories.findAll({
               // include: [
               //      {
               //           model: query.Products,
               //           as: "Products"
               //      }
               // ]
          })
          if (All_categories.length === 0) return NotFound_404(res, 'Categories not found')
          return OK_200(res, All_categories, 'Categories List')
     } catch (error) {
          return Server_500(res, error)
     }

}


const Del_categories = async (req, res) => {

     try {
          const { id } = req.query;
          if (!id) return Response_General(res, 400, 'ID must required')
          const checkCate = await query.Categories.findOne({
               where: { category_id: id }
          })
          if (!checkCate) return NotFound_404(res, 'Categories not found')
          const checkProduct = await query.Products.findAll({
               where: { category_id: id }
          })
          if (checkProduct.length > 0) {
               for (const product of checkProduct) {
                    await product.update({
                         category_id: null
                    })
               }
          }
          await checkCate.destroy()
          return Response_General(res, 200, "Delete success")

     } catch (error) {
          Server_500(res, error)
     }

}


export {
     create_categories,
     edit_Categories,
     All_categories,
     Del_categories,
     get_categoriesID
}