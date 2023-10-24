



import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422, Response_General } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { AuthVerifyUser } from "../../Middleware/verifyToken.js";




const add_Methods = async (req, res) => {

     try {
          const { payment_name, desc } = req.body;
          if (!payment_name) {
               return NotFound_404(res, "Payment name must include!!!")
          }

          const checkName = await query.payment_methods.findOne({
               where: { payment_name }
          })

          if (checkName) {
               return Found_422(res, "Methods exist !!!")
          }
          const data = await query.payment_methods.create({
               payment_name,
               desc
          })
          OK_200(res, data, `Add success methods: ${payment_name}`)

     } catch (error) {
          Server_500(res, error)
     }
}

const All_Methods = async (req, res) => {

     try {
          const allMethods = await query.payment_methods.findAll()
          if (!allMethods) return NotFound_404(res, "Not found methods")
          return OK_200(res, allMethods, "List payment methods")
     } catch (error) {
          Server_500(res, error)
     }

}

const get_Methods = async (req, res) => {
     try {
          const { id } = req.query;
          if (!id) return Response_General(res, 400, "ID must includes to get")
          const checkMethods = await query.payment_methods.findByPk(id)
          if (!checkMethods) return NotFound_404(res, "Not found methods")
          return OK_200(res, checkMethods, "Get success methods")

     } catch (error) {
          Server_500(res, error)
     }
}

const edit_Methods = async (req, res) => {

     try {
          const { methodsID } = req.query;
          const { payment_name, desc } = req.body
          if (!methodsID) {
               return NotFound_404(res, "ID must includes to Edit")
          }

          const checkMethods = await query.payment_methods.findByPk(methodsID)
          if (!checkMethods) {
               return NotFound_404(res, "Not found methods")
          }
          const updateMethods = checkMethods.update({
               payment_name,
               desc
          })
          OK_200(res, "Update success Methods")

     } catch (error) {
          Server_500(res, error)
     }
}

const del_Methods = async (req, res) => {

     try {
          const { methodsID } = req.query;
          const { payment_name, desc } = req.body
          if (!methodsID) {
               return NotFound_404(res, "ID must includes to Edit")
          }

          const checkMethods = await query.payment_methods.findByPk(methodsID)
          if (!checkMethods) {
               return NotFound_404(res, "Not found methods")
          }
          checkMethods.destroy()
          OK_200(res, "Delete success Methods")

     } catch (error) {
          Server_500(res, error)
     }

}
export {
     add_Methods,
     All_Methods,
     edit_Methods,
     del_Methods,
     get_Methods
}