

import { NotFound_404 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { Op } from "sequelize";

const searchProducts = async (search, searchBy, from, to) => {

     const sortMapping = {
          toLow: "DESC",
          toHigh: "ASC",
          toAlpha: "ASC"
     }
     let sortField = "price";
     if (searchBy === "toAlpha") {
          sortField = "product_name"
     }

     let orderBy = searchBy && sortMapping[searchBy]
          ? [[sortField, sortMapping[searchBy]]]
          : null;



     let FilterPrice = {};
     if (from && to) {
          FilterPrice = {
               price: {
                    [Op.between]: [Number(from), Number(to)],
               },
          }
     }
     if (from && !to) {
          FilterPrice = {
               price: {
                    [Op.gt]: Number(from) - 1,
               },
          }
     }
     if (!from && to) {
          FilterPrice = {
               price: {
                    [Op.lt]: Number(to) + 1,
               },
          }
     }
     if (to > from) {
          FilterPrice = {
               price: {
                    [Op.between]: [Number(from), Number(to)],
               },
          }
     }

     const searchProduct = await query.Products.findAll({
          where: {
               product_name: {
                    [Op.like]: `%${search}%`
               },
               ...FilterPrice
          },
          order: orderBy
     })
     return searchProduct

}

const Middle_DeleteProducts = async (id) => {

     const deleteProducts = await query.Products.destroy({
          where: { product_id: id }
     })
     return deleteProducts
}


export {
     searchProducts,
     Middle_DeleteProducts
}