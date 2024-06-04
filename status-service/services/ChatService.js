import { statusModal } from "../db/models/StatusSchema.js"

export const updateStatus = async (authName,flag) => {
  try{
    const status = await statusModal.findOne({username: authName});
    if(status){
      status.status = flag;
      await status.save()
    }else{
      await statusModal.create({username: authName, status: flag})
    }
    return true
  }catch(e){
    console.log(e)
    return false
  }
}