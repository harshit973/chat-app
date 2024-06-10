import http from "@/utils/AxiosInterceptor";

export const syncIncommingRequests = async (authName: string) => {
  return new Promise(async(resolve,reject)=>{
    try{
      const res = await http.get(`/api/conversationRequest?receiver=${authName}`);
      resolve(res.data)
    }catch(e){
      reject(e)
    }
  })
};
export const syncOutgoingRequests = async (authName: string) => {
  return new Promise(async(resolve,reject)=>{
    try{
      const res = await http.get(`/api/conversationRequest?sender=${authName}`);
      resolve(res.data)
    }catch(e){
      reject(e)
    }
  })
};
